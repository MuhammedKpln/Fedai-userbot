import { MessageType } from '@adiwajshing/baileys';
import axios, { AxiosResponse } from 'axios';
import { addCommand } from '../core/events';
import { errorMessage, infoMessage } from '../core/helpers';
import { getString } from '../core/language';
import { IInstagram } from './types/instagram';
const Lang = getString('instagram');

addCommand(
  {
    pattern: 'insta ?(.*)',
    fromMe: true,
    usage: Lang['USAGE'],
    desc: Lang['DESC'],
  },
  async (message, match) => {
    let userName: string = '';
    if (match) {
      userName = match[1];
    }

    if (!userName) {
      return await message.sendMessage(
        message.jid,
        errorMessage(Lang['NEED_WORD']),
        MessageType.text,
      );
    }

    await message.sendMessage(
      message.jid,
      infoMessage(Lang['LOADING']),
      MessageType.text,
    );

    return await axios
      .get(`https://www.instagram.com/${userName}/?__a=1`)
      .then(async (response: AxiosResponse<IInstagram>) => {
        console.log(response);
        const {
          profile_pic_url_hd,
          username,
          biography,
          edge_followed_by,
          edge_follow,
          full_name,
          is_private,
        } = response.data.graphql.user;

        const profileBuffer: AxiosResponse<ArrayBuffer> = await axios.get(
          profile_pic_url_hd,
          {
            responseType: 'arraybuffer',
          },
        );

        const msg = `
        *${Lang['NAME']}*: ${full_name}
        *${Lang['USERNAME']}*: ${username}
        *${Lang['BIO']}*: ${biography}
        *${Lang['FOLLOWERS']}*: ${edge_followed_by.count}
        *${Lang['FOLLOWS']}*: ${edge_follow.count}
        *${Lang['ACCOUNT']}*: ${is_private ? Lang['HIDDEN'] : Lang['PUBLIC']}`;

        return await message.sendMessage(
          message.jid,
          Buffer.from(profileBuffer.data),
          MessageType.image,
          {
            caption: msg,
          },
        );
      })
      .catch(
        async () =>
          await message.sendMessage(
            message.jid,
            errorMessage(Lang['NOT_FOUND'] + userName),
            MessageType.text,
          ),
      );
  },
);
