import { MessageType, WAMessage } from '@adiwajshing/baileys';
import * as ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';
import fetch from 'node-fetch';
import { WITAI_API } from '../config';
import { addCommand } from '../core/events';
import { getString } from '../core/language';

const Lang = getString('voicy');

const recognizeAudio = () => {
  const headers = {
    'Content-Type': 'audio/wav',
    Authorization: `Bearer ${WITAI_API}`,
    'Cache-Control': 'no-cache',
    'Transfer-Encoding': 'chunked',
  };

  const requestBody = {
    method: 'POST',
    body: fs.readFileSync('output.wav'),
    headers: headers,
  };

  return fetch('https://api.wit.ai/speech?v=20200219', requestBody)
    .then((response) => response.json())
    .then((json) => json._text);
};

const convertToWav = (file) => {
  return ffmpeg(file)
    .inputFormat('ogg')
    .audioCodec('pcm_s16le')
    .format('wav')
    .save('output.wav');
};

addCommand(
  { pattern: 'voicy', desc: Lang['USAGE'], fromMe: true },
  async (message) => {
    try {
      if (message.reply_message) {
        if (
          !message.reply_message.text &&
          !message.reply_message.video &&
          !message.reply_message.image
        ) {
          const file = await message.client.downloadAndSaveMediaMessage(
            {
              key: {
                remoteJid: message.reply_message.jid,
                id: message.reply_message.id,
              },
              message: message.reply_message.data.quotedMessage,
            } as WAMessage,
            'output',
          );

          convertToWav(file).on('end', async () => {
            const recognizedText = await recognizeAudio();

            await message.sendMessage(
              message.jid,
              Lang['TEXT'] + '```' + recognizedText + '```',
              MessageType.text,
            );
          });
        } else {
          await message.sendMessage(
            message.jid,
            Lang['ONLY_AUDIO'],
            MessageType.text,
          );
        }
      } else {
        await message.sendMessage(
          message.jid,
          Lang['NEED_REPLY'],
          MessageType.text,
        );
      }
    } catch (err) {
      console.log(err);
    }
  },
);
