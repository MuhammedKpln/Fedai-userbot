import * as chalk from 'chalk';
import { Sequelize } from 'sequelize';
import { DATABASE_URL, DEBUG } from '../config';

export let database: Sequelize = loadDatabase();

export function loadDatabase(): Sequelize {
  console.log(chalk.blue('ℹ️ Loading database...'));
  if (DEBUG) {
    return (database = new Sequelize({
      dialect: 'sqlite',
      storage: DATABASE_URL,
      logging: console.log,
    }));
  } else {
    return (database = new Sequelize(DATABASE_URL, {
      dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
      logging: false,
    }));
  }
  console.log(chalk.green.bold('✅ Database loaded!'));
}
