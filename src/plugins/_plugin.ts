import { MessageType } from '@adiwajshing/baileys';
import * as fs from 'fs';
import got from 'got';
import * as path from 'path';
import { addCommand } from '../core/events';
import { errorMessage, infoMessage, successfullMessage } from '../core/helpers';
import { getString } from '../core/language';
import {
  listAllSavedPlugins,
  pluginIsInstalled,
  savePlugin,
  uninstallPlugin,
} from '../database/plugin';
import MediaMessage from '../types/media';
import Message from '../types/message';

const Lang = getString('_plugin');

addCommand(
  { pattern: 'install ?(.*)', fromMe: true, desc: Lang['INSTALL_DESC'] },
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

      got(url).then(async (response) => {
        if (response.statusCode == 200) {
          // plugin adı
          const plugin = response.body.match(
            /addCommand\({.*pattern: ["'](.*)["'].*}/,
          );
          if (plugin) {
            let pluginName = plugin[1];
            const rawPluginName = plugin[1];

            pluginName =
              '__' + pluginName + Math.random().toString(36).substring(8);

            fs.writeFileSync('./plugins/' + pluginName + '.js', response.body);
            await message.sendMessage(
              message.jid,
              successfullMessage(Lang['INSTALLED']),
              MessageType.text,
            );

            await savePlugin(url.href, pluginName, rawPluginName);

            require('./' + pluginName);
          }
        }
      });
    } catch (err) {
      console.log('err', err);
      return await message.sendMessage(
        message.jid,
        Lang['INVALID_URL'],
        MessageType.text,
      );
    }
  },
);

addCommand(
  { pattern: 'plugins', fromMe: true },
  async (client: Message | MediaMessage) => {
    await client.sendTextMessage(infoMessage(Lang['SEARCHING']));

    const plugins = await listAllSavedPlugins();
    let message = Lang['SEARCH_RESULTS'] + '\n\n';

    if (plugins.length < 1) {
      return await client.sendTextMessage(errorMessage(Lang['NO_PLUGIN']));
    }

    plugins.map((plugin) => {
      const pluginName = plugin.getDataValue('rawName');
      const url = plugin.getDataValue('url');

      message += `🛠 ${pluginName}: \n ${url}\n\n`;
    });

    message += Lang['REMOVE_USAGE'];

    await client.sendMessage(
      client.jid,
      infoMessage(message),
      MessageType.extendedText,
    );
  },
);

addCommand(
  { pattern: 'remove ?(.*)', fromMe: true, desc: Lang['REMOVE_DESC'] },
  async (client: Message | MediaMessage, match: RegExpMatchArray) => {
    const pluginName = match[1];
    const plugin = await pluginIsInstalled(pluginName);
    const rawName = plugin?.getDataValue('rawName');
    const randomDeclaredName = plugin?.getDataValue('name');

    if (!plugin) {
      return await client.sendTextMessage(errorMessage(Lang['NO_PLUGIN']));
    }
    const pluginPath = path.resolve('plugins', randomDeclaredName + '.js');

    if (fs.existsSync(pluginPath)) {
      console.log('PLUGIN EXISTS');
      fs.unlinkSync(pluginPath);
      await uninstallPlugin(rawName);

      await client.sendTextMessage(successfullMessage(Lang['DELETED']));
    } else {
      console.log('PLUGIN NOT EXISTS');
      await uninstallPlugin(rawName);
      await client.sendTextMessage(successfullMessage(Lang['DELETED']));
    }
  },
);
