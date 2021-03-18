import {
  MessageType,
  Presence,
  WAChatUpdate,
  WAMessage,
} from '@adiwajshing/baileys';
import * as chalk from 'chalk';
import * as fs from 'fs';
import got from 'got';
import * as path from 'path';
import { LANG, SESSION } from './config';
import { connect } from './core/connection';
import { database, loadDatabase } from './core/database';
import { loadedCommands } from './core/events';
import { infoMessage } from './core/helpers';
import { getString, loadLanguage } from './core/language';
import { PluginDB } from './database/plugin';
import Message from './types/message';

const bot = connect();

function loadPlugins() {
  fs.readdirSync('./plugins').forEach((plugin) => {
    const pluginExt = path.extname(plugin).toLowerCase();
    if (pluginExt == '.js') {
      require('./plugins/' + plugin);
    }
  });
}

async function loadExternalPlugins() {
  console.log(chalk.blueBright.italic('⬇️ Installing external plugins...'));

  const plugins = await PluginDB.findAll();

  plugins.map(async (plugin) => {
    if (!fs.existsSync('./plugins/' + plugin.getDataValue('name') + '.js')) {
      console.log(plugin.getDataValue('name'));
      var response = await got(plugin.getDataValue('url'));
      if (response.statusCode == 200) {
        fs.writeFileSync(
          './plugins/' + plugin.getDataValue('name') + '.js',
          response.body,
        );
        require('./plugins/' + plugin.getDataValue('name') + '.js');
      }
    }
  });

  console.log(chalk.green.bold('✅ Plugins installed!'));
}

function commandCatcher(lastMessage: WAMessage) {
  loadedCommands.map(async (command) => {
    let message: string = '';

    if (lastMessage.key.remoteJid) {
      await bot.updatePresence(lastMessage.key.remoteJid, Presence.unavailable);
    }

    if (lastMessage.key.fromMe) {
      if (lastMessage.message?.conversation) {
        // If user simply just use the command
        message = lastMessage.message.conversation;
      }
      if (lastMessage.message?.extendedTextMessage) {
        // If user quoted a message
        if (lastMessage.message.extendedTextMessage.text) {
          message = lastMessage.message.extendedTextMessage.text;
        }
      }
      if (lastMessage.message?.imageMessage?.caption) {
        // If replying a image message with command
        message = lastMessage?.message?.imageMessage.caption;
      }
      // Check if message contains any command with help of regex.
      let match: RegExpMatchArray | null = message.match(command.pattern);
      // console.log(match);
      if (match) {
        const client = new Message(bot, lastMessage);
        await client.delete();

        // Message is sent from a group
        if (command.onlyGroup === true && !client.jid.includes('-')) {
          return client.sendTextMessage(
            infoMessage(getString('_bot')['ONLY_GROUPS']),
          );
        }
        // Message is not sent from a group
        if (command.onlyPm === true && client.jid.includes('-')) {
          return client.sendTextMessage(
            infoMessage(getString('_bot')['ONLY_PM']),
          );
        }

        try {
          command.function(client, match);
        } catch (err) {
          await sendLogToUser(err);
        }
      }
    }
  });
}

async function init() {
  database.sync();
  await bot.connect();
  loadLanguage();
  loadDatabase();
  loadPlugins();
  await loadExternalPlugins();
  database.sync();

  bot.on('chat-update', (result: WAChatUpdate) => {
    if (result.messages) {
      const lastMessage: WAMessage = result.messages.all()[0];

      commandCatcher(lastMessage);
    }
  });
}

async function sendLogToUser(err: Error) {
  if (LANG === 'TR') {
    await bot.sendMessage(
      bot.user.jid,
      '*-- HATA RAPORU [FEDAI] --*' +
        '\n*FEDAI bir hata gerçekleşti!*' +
        '\n_Bu hata logunda numaranız veya karşı bir tarafın numarası olabilir. Lütfen buna dikkat edin!_' +
        '\n_Yardım için Telegram grubumuza yazabilirsiniz._' +
        '\n_Bu mesaj sizin numaranıza (kaydedilen mesajlar) gitmiş olmalıdır._' +
        '*Gerçekleşen Hata:* ```' +
        err +
        '```\n\n',
      MessageType.text,
      { detectLinks: false },
    );
  } else if (LANG === 'EN') {
    await bot.sendMessage(
      bot.user.jid,
      '*-- ERROR REPORT [WHATSASENA] --*' +
        '\n*WhatsAsena an error has occurred!*' +
        '\n_This error log may include your number or the number of an opponent. Please be careful with it!_' +
        '\n_You can write to our Telegram group for help._' +
        '\n_This message should have gone to your number (saved messages)._\n\n' +
        '*Error:* ```' +
        err +
        '```\n\n',
      MessageType.text,
      { detectLinks: false },
    );
  }
}

if (!SESSION) {
  console.log(
    chalk.red.bold(
      'We could not found session string, please setup your environment variables.',
    ),
  );
} else {
  init();
}
