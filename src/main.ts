import { WAChatUpdate, WAMessage } from '@adiwajshing/baileys';
import * as chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import { SESSION } from './config';
import { connect } from './core/connection';
import { loadedCommands } from './core/events';
import { loadLanguage } from './core/language';
import Message from './types/message';

const bot = connect();

function loadPlugins() {
  fs.readdirSync('./plugins').forEach((plugin) => {
    const pluginExt = path.extname(plugin).toLowerCase();
    if (pluginExt == '.js') {
      require('./plugins/' + plugin);
    }
  });
  console.log(chalk.green.bold('✅ Plugins installed!'));
}

function commandCatcher(lastMessage: WAMessage) {
  loadedCommands.map(async (command) => {
    let match: RegExpMatchArray | null = null;
    if (lastMessage.message?.conversation) {
      match = lastMessage.message.conversation.match(command.pattern);
    }

    if (lastMessage.message?.imageMessage?.caption) {
      match = lastMessage?.message?.imageMessage.caption.match(command.pattern);
    }

    if (match) {
      const client = new Message(bot, lastMessage);

      command.function(client, match);
    }
  });
}

async function init() {
  await bot.connect();
  loadLanguage();
  loadPlugins();

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
