import { addCommand } from '../core/events';
import { errorMessage, successfullMessage } from '../core/helpers';
import { getString } from '../core/language';

const Lang = getString('spammer');
let totalMaxSpamCount = 50;

addCommand(
  { pattern: 'spam ?(.*)', fromMe: true, desc: Lang['SPAM_DESC'] },
  async (message, match) => {
    if (!match || match[1] === '') {
      return await message.sendTextMessage(errorMessage(Lang['NEED_WORD']));
    }

    if (totalMaxSpamCount !== 0) {
      for (let index = 0; index < totalMaxSpamCount; index++) {
        await message.sendTextMessage(match[1]);
      }
    }
  },
);

addCommand(
  { pattern: 'killspam', fromMe: true, desc: Lang['STOP_SPAMDESC'] },
  async (message) => {
    totalMaxSpamCount = 0;
    await message.sendTextMessage(successfullMessage(Lang['STOP_SPAM']));
  },
);
