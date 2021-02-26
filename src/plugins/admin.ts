import { MessageType } from '@adiwajshing/baileys';
import { addCommand } from '../core/events';
import { getString } from '../core/language';

const Lang = getString('admin');

async function checkImAdmin(message, user = message.client.user.jid) {
  var grup = await message.client.groupMetadata(message.jid);
  var sonuc = grup['participants'].map((member) => {
    if (member.id.split('@')[0] === user.split('@')[0] && member.isAdmin)
      return true;
    else;
    return false;
  });
  return sonuc.includes(true);
}

addCommand(
  {
    pattern: 'ban ?(.*)',
    fromMe: true,
    onlyGroup: true,
    desc: Lang['BAN_DESC'],
  },
  async (message) => {
    if (message.reply_message) {
      await message.client.groupRemove(message.jid, [
        message.reply_message.data.participant as string,
      ]);

      await message.sendMessage(
        message.jid,
        (('@' + message.reply_message.jid.split('@')[0]) as string) +
          '```, ' +
          Lang['BANNED'] +
          '```',
        MessageType.text,
        {
          contextInfo: {
            mentionedJid: [message.reply_message.data.participant as string],
          },
        },
      );
    }

    // if (message.mention) {
    //   let users: string = '';
    //   await message.client.groupRemove(message.jid, message.mention);
    //   message.mention.map(async (user) => {
    //     users += '@' + user.split('@')[0] + ',';
    //   });
    //   await message.sendMessage(
    //     message.jid,
    //     '@' + users + '```, ' + Lang['BANNED'] + '```',
    //     MessageType.text,
    //     {
    //       contextInfo: {
    //         mentionedJid: [message.reply_message.data.participant as string],
    //       },
    //     },
    //   );
    // }
  },
);
