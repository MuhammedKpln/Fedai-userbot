import { WAMessage } from '@adiwajshing/baileys';
import * as fs from 'fs/promises';
import * as path from 'path';
import { addCommand } from '../core/events';
import { errorMessage, infoMessage, successfullMessage } from '../core/helpers';
import { getString } from '../core/language';
import { deleteAllNotes, getNotes, saveNote } from './sql/notes';

const Lang = getString('notes');

addCommand(
  { pattern: 'notes', fromMe: true, desc: Lang['NOTES_USAGE'] },
  async (message) => {
    const _notes = await getNotes();
    const notes: string[] = [];
    _notes.map((note) => {
      if (!note.getDataValue('note').includes('IMG;;;')) {
        notes.push('📜' + note.getDataValue('note'));
      }
    });

    if (notes.length < 1) {
      return await message.sendTextMessage(infoMessage(Lang['NO_SAVED']));
    }

    await message.sendTextMessage(infoMessage(Lang['SAVED']));

    await message.sendTextMessage(notes.join('\n\n'));
    _notes
      .filter((note) => note.getDataValue('note').includes('IMG;;;'))
      .forEach(async (note) => {
        const imageName = note.getDataValue('note').replace('IMG;;;', '');
        const image = await fs.readFile(path.resolve('media', imageName));
        await message.sendImageMessage(image);
      });
  },
);

addCommand(
  { pattern: 'save ?(.*)', fromMe: true, desc: Lang['SAVE_USAGE'] },
  async (message, match) => {
    if (!match) {
      return;
    }

    const userNote = match[1];

    if (!userNote && !message.reply_message) {
      await message.sendTextMessage(errorMessage(Lang['REPLY']));

      return;
    }

    if (userNote) {
      await saveNote(userNote);
      await message.sendTextMessage(
        successfullMessage(Lang['SUCCESSFULLY_ADDED']),
      );

      return;
    } else if (!userNote && message.reply_message) {
      if (!message.reply_message.video) {
        if (message.reply_message.image) {
          const savedFileName = await message.client.downloadAndSaveMediaMessage(
            {
              key: {
                remoteJid: message.reply_message.jid,
                id: message.reply_message.id,
              },
              message: message.reply_message.data.quotedMessage,
            } as WAMessage,
            'output',
          );

          const randomFileName =
            savedFileName.split('.')[0] +
            Math.floor(Math.random() * 50) +
            path.extname(savedFileName);
          await fs.copyFile(
            savedFileName,
            path.resolve('media', randomFileName),
          );
          await saveNote('IMG;;;' + randomFileName);
          await message.sendTextMessage(
            successfullMessage(Lang['SUCCESSFULLY_ADDED']),
          );
        }

        await saveNote(message.reply_message.text);
        await message.sendTextMessage(
          successfullMessage(Lang['SUCCESSFULLY_ADDED']),
        );

        return;
      }
    } else {
      await message.sendTextMessage(errorMessage(Lang['UNSUCCESSFUL']));

      return;
    }
  },
);

addCommand(
  { pattern: 'deleteNotes', fromMe: true, desc: Lang['DELETE_USAGE'] },
  async (message) => {
    await deleteAllNotes();

    const mediaFolder = await fs.readdir(path.resolve('media'));

    mediaFolder.forEach(async (file) => {
      await fs.unlink(path.resolve('media', file));
    });

    return await message.sendTextMessage(
      successfullMessage(Lang['SUCCESSFULLY_DELETED']),
    );
  },
);
