import * as Heroku from 'heroku-client';
import simpleGit, { ResetMode } from 'simple-git';
import { HEROKU_API, HEROKU_APP_NAME } from '../config';
import { addCommand } from '../core/events';
import { infoMessage, successfullMessage } from '../core/helpers';
import { getString } from '../core/language';
import { IUpdate } from './types/_updater';

const Lang = getString('_updater');
const heroku = new Heroku({ token: HEROKU_API });
const git = simpleGit();

async function checkForUpdate(): IUpdate {
  await git.fetch();

  const commits = await git.log();

  if (commits.total !== 0) {
    return {
      status: true,
      commits,
    };
  }

  return {
    status: false,
    commits,
  };
}

addCommand({ pattern: 'update$', fromMe: true }, async (message) => {
  let updateText = Lang['NEW_UPDATE'];

  const update = await checkForUpdate();
  if (update) {
    update.commits['all'].map((commit) => {
      updateText +=
        '🔹 [' +
        commit.date.substring(0, 10) +
        ']: ' +
        commit.message +
        ' <' +
        commit.author_name +
        '>\n';
    });

    return await message.sendTextMessage(updateText + '```');
  }

  await message.sendTextMessage(Lang['UPDATE']);
});

addCommand({ pattern: 'update now$', fromMe: true }, async (message) => {
  const update = await checkForUpdate();

  if (!HEROKU_API && !HEROKU_APP_NAME) {
    return await message.sendTextMessage(infoMessage(Lang['INVALID_HEROKU']));
  }

  if (update.status) {
    await message.reply(infoMessage(Lang['UPDATING']));

    try {
      var app = await heroku.get('/apps/' + HEROKU_APP_NAME);
    } catch {
      return await message.sendTextMessage(infoMessage(Lang['INVALID_HEROKU']));
    }

    await git.fetch('upstream', 'master');
    await git.reset(ResetMode.HARD);

    const git_url = app.git_url.replace(
      'https://',
      'https://api:' + HEROKU_API + '@',
    );

    try {
      await git.addRemote('heroku', git_url);
    } catch {
      console.log('heroku remote ekli');
    }

    await git.push('heroku', 'master');

    await message.sendTextMessage(successfullMessage(Lang['UPDATED']));
  }
});
