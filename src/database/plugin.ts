import { DataTypes } from 'sequelize';
import { database } from '../core/database';

export const PluginDB = database.define('plugin', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  rawName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  url: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

export async function savePlugin(url: string, name: string, rawName: string) {
  const Plugin = await PluginDB.findAll({
    where: { url },
  });

  if (Plugin.length >= 1) {
    return false;
  } else {
    return await PluginDB.create({ url, name, rawName });
  }
}

export async function pluginIsInstalled(rawName: string) {
  const plugin = await PluginDB.findOne({
    where: {
      rawName,
    },
  });

  return plugin;
}

export async function uninstallPlugin(rawName: string) {
  const plugin = await PluginDB.findOne({
    where: {
      rawName,
    },
  });

  if (plugin?.destroy()) {
    return true;
  }

  return false;
}

export async function listAllSavedPlugins() {
  return await PluginDB.findAll();
}
