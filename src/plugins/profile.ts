import { WAMessage } from '@adiwajshing/baileys';
import * as fs from 'fs';
import { addCommand } from '../core/events';
import { errorMessage, infoMessage } from '../core/helpers';
import { getString } from '../core/language';

const Lang = getString('profile');

addCommand(
  {
    pattern: 'kickme',
    fromMe: true,
    desc: Lang['KICKME_DESC'],
    onlyGroup: true,
  },
  async (message) => {
    await message.sendTextMessage(infoMessage(Lang['KICKME']));
    await message.client.groupLeave(message.jid);
  },
);

addCommand(
  { pattern: 'pp', fromMe: true, desc: Lang['PP_DESC'] },
  async (message) => {
    if (!message.reply_message || message.reply_message.image === false)
      return await message.sendTextMessage(errorMessage(Lang['NEED_PHOTO']));

    await message.sendTextMessage(infoMessage(Lang['PPING']));
    var location = await message.client.downloadAndSaveMediaMessage(
      {
        key: {
          remoteJid: message.reply_message.jid,
          id: message.reply_message.id,
        },
        message: message.reply_message.data.quotedMessage,
      } as WAMessage,
      'output',
    );

    await message.client.updateProfilePicture(
      message.client.user.jid,
      fs.readFileSync(location),
    );
    await message.delete();
  },
);
