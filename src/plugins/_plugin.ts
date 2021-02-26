import { MessageType } from '@adiwajshing/baileys';
import * as fs from 'fs';
import got from 'got';
import { addCommand } from '../core/events';
import { errorMessage } from '../core/helpers';
import { getString } from '../core/language';
import { installPlugin } from '../database/plugin';

const Lang = getString('_plugin');

addCommand(
  { pattern: 'install ?(.*)', fromMe: true },
  async (message, match) => {
    if (match && !match[1]) {
      return await message.sendMessage(
        message.jid,
        errorMessage(
          Lang['NEED_URL'] +
            'install https://gist.github.com/phaticusthiccy/4232b1c8c4734e1f06c3d991149c6fbd',
        ),
        MessageType.text,
      );
    }

    try {
      let url: URL = new URL(match ? match[1] : '');

      if (url.host === 'gist.github.com') {
        url.host = 'gist.githubusercontent.com';
        url.pathname = url.pathname + '/raw';
      }

      const response = await got(url);
      if (response.statusCode == 200) {
        // plugin adı
        const plugin = response.body.match(
          /addCommand\({.*pattern: ["'](.*)["'].*}/,
        );
        if (plugin) {
          let pluginName = plugin[1];
          console.log(plugin);

          pluginName =
            '__' + pluginName + Math.random().toString(36).substring(8);

          fs.writeFileSync('./plugins/' + pluginName + '.js', response.body);
          await message.sendMessage(
            message.jid,
            Lang['INSTALLED'],
            MessageType.text,
          );
          require('./' + pluginName);

          await installPlugin(url, pluginName);
        }
      }
    } catch (err) {
      console.log(err);
      return await message.sendMessage(
        message.jid,
        Lang['INVALID_URL'],
        MessageType.text,
      );
    }
  },
);
