import { WAConnection } from '@adiwajshing/baileys';
import * as chalk from 'chalk';
import { SESSION, VERSION } from '../config';
import { loadSession } from './session';

export function connect(): WAConnection {
  const conn: WAConnection = new WAConnection();
  conn.loadAuthInfo(loadSession(SESSION));

  conn.on('connecting', async () => {
    console.log(`${chalk.green.bold('Whats')}${chalk.blue.bold('Asena')}`);
    console.log(`${chalk.white.bold('Version:')} ${chalk.red.bold(VERSION)}`);

    console.log(
      `${chalk.blue.italic('ℹ️ Connecting to WhatsApp... Please wait.')}`,
    );

    conn.on('open', async () => {
      console.log(chalk.green.bold('✅ Login successful!'));
    });
  });

  return conn;
}
