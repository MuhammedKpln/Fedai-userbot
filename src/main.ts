import { WAMessage, WASocket } from "@whiskeysockets/baileys";
import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";

import { LANG } from "./config";
import { startSocket } from "./core/connection";
import { loadedCommands } from "./core/events";
import { errorMessage, infoMessage } from "./core/helpers";
import { getString, loadLanguage } from "./core/language";
import { Logger } from "./core/logger";
import Message from "./types/message";

dotenv.config({
  path: "../../config.env",
});

let bot: WASocket;
const logger = Logger.child({ module: "main" });

function loadPlugins() {
  logger.info("Loading core plugins..");

  fs.readdirSync("./plugins").forEach((plugin) => {
    const pluginExt = path.extname(plugin).toLowerCase();
    if (pluginExt == ".js") {
      require("./plugins/" + plugin);
    }
  });
}

async function loadExternalPlugins() {
  logger.info("Installing external plugins..");

  // const plugins = await PluginDB.findAll();

  // plugins.map(async (plugin) => {
  //   if (!fs.existsSync("./plugins/" + plugin.getDataValue("name") + ".js")) {
  //     console.log(plugin.getDataValue("name"));
  //     var response = await got(plugin.getDataValue("url"));
  //     if (response.statusCode == 200) {
  //       fs.writeFileSync(
  //         "./plugins/" + plugin.getDataValue("name") + ".js",
  //         response.body,
  //       );
  //       require("./plugins/" + plugin.getDataValue("name") + ".js");
  //     }
  //   }
  // });

  // logger.info("Plugins installed!");

  // console.log(chalk.green.bold('✅ Plugins installed!'));
}

function commandCatcher(lastMessage: WAMessage) {
  loadedCommands.map(async (command) => {
    let message: string = "";

    if (lastMessage.key.remoteJid) {
      await bot.sendPresenceUpdate("unavailable", lastMessage.key.remoteJid);
    }

    // if (lastMessage.key.fromMe) {
    if (lastMessage.message?.conversation) {
      // If user simply just use the command
      message = lastMessage.message.conversation;
    }
    if (lastMessage.message?.extendedTextMessage) {
      // If user quoted a message
      if (lastMessage.message.extendedTextMessage.text) {
        message = lastMessage.message.extendedTextMessage.text;
      }
    }
    if (lastMessage.message?.imageMessage?.caption) {
      // If replying a image message with command
      message = lastMessage?.message?.imageMessage.caption;
    }
    let match: RegExpMatchArray | null;

    if (command.pattern !== undefined) {
      match = message.match(command.pattern);
    } else match = message.match(message);

    // Check if message contains any command with help of regex.

    // console.log(match);
    if (match) {
      const client = new Message(bot, lastMessage);

      // Message is sent from a group
      if (command.onlyGroup === true && !client.jid.includes("-")) {
        return client.sendMessage({
          text: infoMessage(getString("_bot")["ONLY_GROUPS"]),
        });
      }
      // Message is not sent from a group
      if (command.onlyPm === true && client.jid.includes("-")) {
        return client.sendMessage({
          text: infoMessage(getString("_bot")["ONLY_PM"]),
        });
      }

      if (command.fromMe !== undefined && command.fromMe) {
        if (!lastMessage.key.fromMe) {
          await bot.sendMessage(lastMessage.key.remoteJid!, {
            text: errorMessage("Only author."),
          });
          return;
        }
      }

      try {
        command.function(client, match);
      } catch (err) {
        await sendLogToUser(err, lastMessage.key.remoteJid);
      }
    }
    // }
  });
}

async function init() {
  bot = await startSocket();
  loadLanguage();
  loadPlugins();
  await loadExternalPlugins();

  bot.ev.process((event) => {
    const MESSAGE_UPSERT = event["messages.upsert"];

    if (MESSAGE_UPSERT) {
      if (MESSAGE_UPSERT.type == "notify") {
        for (const msg of MESSAGE_UPSERT.messages) {
          commandCatcher(msg);
          logger.info("Process commands");
        }
      }
    }
  });
}

async function sendLogToUser(
  err: unknown,
  remoteJid: string | null | undefined,
) {
  if (!remoteJid) {
    return;
  }

  if (LANG === "TR") {
    await bot.sendMessage(remoteJid, {
      text:
        "*-- HATA RAPORU [FEDAI] --*" +
        "\n*FEDAI bir hata gerçekleşti!*" +
        "\n_Bu hata logunda numaranız veya karşı bir tarafın numarası olabilir. Lütfen buna dikkat edin!_" +
        "\n_Yardım için Telegram grubumuza yazabilirsiniz._" +
        "\n_Bu mesaj sizin numaranıza (kaydedilen mesajlar) gitmiş olmalıdır._" +
        "*Gerçekleşen Hata:* ```" +
        err +
        "```\n\n",
    });
  } else if (LANG === "EN") {
    await bot.sendMessage(remoteJid, {
      text:
        "*-- HATA RAPORU [FEDAI] --*" +
        "\n*FEDAI bir hata gerçekleşti!*" +
        "\n_Bu hata logunda numaranız veya karşı bir tarafın numarası olabilir. Lütfen buna dikkat edin!_" +
        "\n_Yardım için Telegram grubumuza yazabilirsiniz._" +
        "\n_Bu mesaj sizin numaranıza (kaydedilen mesajlar) gitmiş olmalıdır._" +
        "*Gerçekleşen Hata:* ```" +
        err +
        "```\n\n",
    });
  }
}

// if (!SESSION) {

//   console.log(
//     logger.error(
//       'We could not found session string, please setup your environment variables.',
//     ),
//   );
// } else {
init();
// }
