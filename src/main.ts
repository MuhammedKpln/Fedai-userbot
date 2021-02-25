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
    const match: RegExpMatchArray = lastMessage.message.conversation.match(
      command.pattern,
    );

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
    const lastMessage: WAMessage = result.messages
      ? result.messages.all()[0]
      : null;

    commandCatcher(lastMessage);
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
