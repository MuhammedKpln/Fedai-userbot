import { MessageType } from '@adiwajshing/baileys';
import { addCommand, loadedCommands } from '../core/events';
import { infoMessage } from '../core/helpers';
import { getString } from '../core/language';
import Message from '../types/message';

const Lang = getString('_bot');

addCommand(
  { pattern: 'asena', fromMe: true, dontAddCommandList: true },
  async (client: Message) => {
    const msg = infoMessage(Lang['NEW_COMMAND']);

    await client.sendMessage(client.jid, msg, MessageType.text);
  },
);

addCommand(
  { pattern: 'help', fromMe: true, dontAddCommandList: true },
  async (client: Message) => {
    // const commandForHelp: string = match[1];
    let CMD_HELP: string[] = [];
    loadedCommands.map((command) => {
      // Skip plugins who don't want to show it self in help.
      if (command.dontAddCommandList || command.pattern === undefined) return;
      const match = command.pattern
        .toString()
        .match(/(\W*)([A-Za-zğüşiöç1234567890]*)/);

      if (match) {
        CMD_HELP.push(
          '*🛠 ' +
            Lang['COMMAND'] +
            ':* ```' +
            (match.length >= 3 ? match[2] : command.pattern) +
            (command.desc === '' ? '```\n\n' : '```\n'),
        );
      }

      if (command.desc !== '') {
        CMD_HELP.push(
          '*💬 ' +
            Lang['DESC'] +
            ':* ```' +
            command.desc?.replace('.', '') +
            (command.warn === '' ? '```\n\n' : '```\n'),
        );
      }

      if (command.usage !== '') {
        CMD_HELP.push(
          '*⌨️ ' +
            Lang['EXAMPLE'] +
            ':* ```' +
            command.usage?.replace('.', '') +
            '```\n\n',
        );
      }

      if (command.warn !== '') {
        CMD_HELP.push(
          '*⚠️ ' + Lang['WARN'] + ':* ```' + command.warn + '```\n\n',
        );
      }
    });

    await client.sendMessage(client.jid, CMD_HELP.join(''), MessageType.text);
  },
);
