import { DataTypes } from 'sequelize';
import { database } from '../core/database';

const PluginDB = database.define('plugin', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  url: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

export async function installPlugin(adres, file) {
  var Plugin = await PluginDB.findAll({
    where: { url: adres },
  });

  if (Plugin.length >= 1) {
    return false;
  } else {
    return await PluginDB.create({ url: adres, name: file });
  }
}
