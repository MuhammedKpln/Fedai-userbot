import { downloadContentFromMessage } from "@whiskeysockets/baileys";
import axios from "axios";
import ffmpeg from "fluent-ffmpeg";
// import { Wit, } from "node-wit";
import { createReadStream } from "node:fs";
import { writeFile } from "node:fs/promises";
import { Readable } from "node:stream";
import { addCommand } from "../core/events";
import { errorMessage, successfullMessage } from "../core/helpers";
import { getString } from "../core/language";
import { Logger } from "../core/logger";
const Lang = getString("voicy");

function parseResponse(response) {
  const chunks = response
    .split("\r\n")
    .map((x) => x.trim())
    .filter((x) => x.length > 0);

  let prev = "";
  let jsons = [];
  for (const chunk of chunks) {
    try {
      prev += chunk;
      //@ts-ignore
      jsons.push(JSON.parse(prev));
      prev = "";
    } catch (_e) {}
  }

  return jsons;
}

async function recognizeAudio(): Promise<string> {
  return new Promise(async (resolve) => {
    const headers = {
      "Content-Type": "audio/wav",
      Authorization: `Bearer ${process.env.WITAI_API}`,
      "Transfer-Encoding": "chunked",
    };

    const file = createReadStream("./output.wav");

    const response = await axios.post<Readable>(
      "https://api.wit.ai/dictation?v=20230215",
      file,
      {
        headers: headers,
        responseType: "stream",
      },
    );

    response.data.on("readable", () => {
      let chunk;
      let contents = "";
      while (null !== (chunk = response.data.read())) {
        contents += chunk.toString();
      }

      console.log(JSON.parse());

      // for (const rsp of parseResponse(contents)) {
      //   const { error, intents, is_final, text } = rsp;
      //   if (!(error || intents)) {
      //     if (is_final) {
      //       console.log(text);

      //       resolve(text);
      //     }
      //   }
      // }
    });

    // response.data.on("end", async () => {
    //   await rm("output.ogg");
    //   await rm("output.wav");
    // });
  });
}
const convertToWav = (file) => {
  return ffmpeg(file)
    .inputFormat("ogg")
    .audioCodec("pcm_s16le")
    .format("wav")
    .save("output.wav");
};

addCommand(
  { pattern: "voicy", desc: Lang["USAGE"], fromMe: false },
  async (message) => {
    try {
      if (message.reply_message) {
        if (message.reply_message.audio) {
          console.log(
            message.reply_message.data.message?.extendedTextMessage?.contextInfo
              ?.quotedMessage?.audioMessage?.mimetype,
          );

          try {
            const chunks: Buffer[] = [];
            const file = await downloadContentFromMessage(
              {
                directPath:
                  message.reply_message.contextInfo?.quotedMessage?.audioMessage
                    ?.directPath,
                mediaKey:
                  message.reply_message.contextInfo?.quotedMessage?.audioMessage
                    ?.mediaKey,
                url: message.reply_message.contextInfo?.quotedMessage
                  ?.audioMessage?.url,
              },
              "audio",
            );

            // file.on("data", (data) => console.log("GOT DATA"));
            file.on("end", async () => {
              await writeFile("output.ogg", chunks);

              convertToWav("output.ogg").on("end", async () => {
                // const wit = new Wit({
                //   accessToken: process.env.WITAI_API!,
                // });

                // wit.
                const recognizedText = await recognizeAudio();

                await message.edit(
                  successfullMessage(
                    Lang["TEXT"] + "```" + recognizedText + "```",
                  ),
                );
              });
            });

            file.on("data", async (data) => {
              chunks.push(data);
            });
          } catch (error) {
            Logger.error(error);
          }
        } else {
          await message.edit(errorMessage(Lang["ONLY_AUDIO"]));
        }
      } else {
        await message.edit(errorMessage(Lang["NEED_REPLY"]));
      }
    } catch (err) {
      console.log(err);
    }
  },
);
