import axios from "axios";
import { LANG } from "../config";
import { addCommand } from "../core/events";
import { errorMessage } from "../core/helpers";
import { getString } from "../core/language";

const Lang = getString("tts");

addCommand(
  { pattern: "tts ?(.*)", fromMe: true, desc: Lang["TTS_DESC"] },
  async (message, match) => {
    if (match && !match[1]) {
      return await message.sendTextMessage(errorMessage(Lang["NEED_TEXT"]));
    }

    const text = match ? match[1] : "";

    try {
      const { data } = await axios.get(
        `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${LANG}&q=${text}`,
        { responseType: "arraybuffer" },
      );

      if (data) {
        await message.delete();
        return await message.sendMessage(
          {
            audio: Buffer.from(data),
            ptt: true,
          },
          message.jid,
        );
      }
    } catch (error) {
      await message.edit(errorMessage(Lang["TTS_ERROR"]));
    }
  },
);
