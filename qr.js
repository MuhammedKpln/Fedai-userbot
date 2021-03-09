const chalk = require('chalk');
const { WAConnection } = require('@adiwajshing/baileys');
const fs = require('fs');

function createStringSession(dict) {
  return Buffer.from(JSON.stringify(dict)).toString('base64');
}

async function fedai() {
  const conn = new WAConnection();
  conn.logger.level = 'warn';
  conn.regenerateQRIntervalMs = 40000;

  conn.on('connecting', async () => {
    console.log(`${chalk.green.bold('Whats')}${chalk.blue.bold('Asena')}
    ${chalk.white.italic('FEDAI QR Code receiver.')}
    ${chalk.blue.italic('ℹ️  Connecting to Whatsapp... Please Wait.')}`);
  });

  conn.on('open', () => {
    var st = createStringSession(conn.base64EncodedAuthInfo());
    console.log(
      chalk.green.bold('Your FEDAI Session string (save it secure!): '),
      st,
    );

    if (!fs.existsSync('config.env')) {
      fs.writeFileSync('config.env', `SESSION="${st}"`);
    }

    console.log(chalk.blue.bold('Put code above to heroku SESSION input.'));
    process.exit(0);
  });

  await conn.connect();
}

fedai();
