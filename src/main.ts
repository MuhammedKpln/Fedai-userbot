import { WAChatUpdate, WAMessage } from '@adiwajshing/baileys';
import * as chalk from 'chalk';
import * as fs from 'fs';
import got from 'got';
import * as path from 'path';
import { SESSION } from './config';
import { connect } from './core/connection';
import { database, loadDatabase } from './core/database';
import { loadedCommands } from './core/events';
import { loadLanguage } from './core/language';
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
    console.log('asasasas', plugin.getDataValue('name'));
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
        command.function(client, match);
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

  bot.on('chat-update', (result: WAChatUpdate) => {
    if (result.messages) {
      const lastMessage: WAMessage = result.messages.all()[0];
      commandCatcher(lastMessage);
    }
  });
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
