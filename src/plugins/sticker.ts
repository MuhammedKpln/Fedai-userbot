import { downloadContentFromMessage } from "@whiskeysockets/baileys";
import sharp from "sharp";
import { addCommand } from "../core/events";
import { errorMessage, infoMessage, successfullMessage } from "../core/helpers";
import { getString } from "../core/language";

const Lang = getString("sticker");

addCommand(
  { pattern: "sticker", fromMe: false, desc: Lang["STICKER_DESC"] },
  async (message) => {
    if (!message.reply_message) {
      return await message.edit(errorMessage(Lang["NEED_REPLY"]));
    }

    if (!message.reply_message.image) {
      return await message.edit(errorMessage(Lang["ONLY_IMAGE"]));
    }
    await message.edit(infoMessage(Lang["DOWNLOADING"]));

    let chunks: Uint8Array = new Uint8Array();

    const file = await downloadContentFromMessage(
      {
        directPath:
          message.reply_message.contextInfo?.quotedMessage?.imageMessage
            ?.directPath,
        mediaKey:
          message.reply_message.contextInfo?.quotedMessage?.imageMessage
            ?.mediaKey,
        url: message.reply_message.contextInfo?.quotedMessage?.imageMessage
          ?.url,
      },
      "image",
    );

    file.on("end", async () => {
      const sa = await sharp(chunks).webp({ lossless: true }).toBuffer();
      await message.edit(successfullMessage("OK"));
      await message.sendMessage(
        {
          sticker: sa,
        },
        message.jid,
      );

      chunks = new Uint8Array();
    });

    file.on("data", async (data) => {
      chunks = new Uint8Array([...chunks, ...data]);
    });

    // return await message.client.deleteMessage(message.jid, {
    //   id: downloading?.key.id,
    //   remoteJid: downloading?.key.remoteJid,
    //   fromMe: true,
    // });
  },
);
