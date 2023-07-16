import { downloadContentFromMessage } from "@whiskeysockets/baileys";
import axios from "axios";
import ffmpeg from "fluent-ffmpeg";
import { Wit, } from "node-wit";
import { createReadStream } from "node:fs";
import { writeFile } from "node:fs/promises";
import { Readable } from "node:stream";
import { addCommand } from "../core/events";
import { errorMessage, successfullMessage } from "../core/helpers";
import { getString } from "../core/language";
import { Logger } from "../core/logger";
import  fetch from 'node-fetch'

import { parse } from "node:path";
const Lang = getString("voicy");

function parseResponse(response) {
  const chunks = response
    .split("\r\n")
    .map((x) => x.trim())
    .filter((x) => x.length > 0);

    // console.log(chunks)

  let prev = "";
  let jsons = [];
  for (const chunk of chunks) {
    try {
      prev += chunk;
      //@ts-ignore
      jsons.push(JSON.parse(chunk));
      prev = "";
    } catch (_e) {
      // console.error(_e)
    }
  }

  return jsons;
}


export const parseChunkedResponse = <Dto>(body = ""): Dto[] => {
  // Split by newline, trim, remove empty lines
  const chunks = body
    .split("\r\n")
    .map((chunk) => chunk.trim())
    .filter((chunk) => Boolean(chunk.length));

  // Loop through the chunks and try to Json.parse
  return chunks.reduce<{ prev: string; acc: Dto[] }>(
    ({ prev, acc }, chunk) => {
      const newPrev = `${prev}${chunk}`;
      try {
        const newChunk: Dto = JSON.parse(newPrev);
        return { prev: "", acc: [...acc, newChunk] };
      } catch (err) {
        return { prev: newPrev, acc };
      }
    },
    { prev: "", acc: [] },
  ).acc;
};

async function recognizeAudio(): Promise<string> {
  return new Promise(async (resolve) => {
    const headers = {
      "Content-Type": `audio/wav`,
      Authorization: `Bearer ${process.env.WITAI_API}`,
      Accept: "application/json",

      "Transfer-Encoding": "chunked",

    };

    const file = createReadStream("./output.wav");







    const response = await axios.request<string>(
      {
        method: "POST",
        url: "https://api.wit.ai/dictation",
        params: {
          v: 20230215,
        },
        headers: {
          Authorization: `Bearer ${process.env.WITAI_API}`,
          Accept: "application/json",
          "Content-Type": `audio/wav`,
          "Transfer-Encoding": "chunked",
        },
        timeout: 10_000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        responseType: "text",
        data: file,
        transformResponse: (d) => d,
      }
    ).then((response) => {
      const chunks = parseChunkedResponse(response.data);
      const finalizedChunks = chunks.filter(
        ({ is_final: isFinal }) => isFinal,
      );
      if (!finalizedChunks.length) {
        Logger.warn(
          `The final response chunk not found. Transcription is empty.`,
          chunks.map(({ text }) => text),
        );
      }

      console.log(finalizedChunks)
      return finalizedChunks;
    })




    // // wit.dictation('audio/wav', response.body)
    // response.data.on("readable", () => {
    //   let chunk;
    //   let contents = "";
    //   while (null !== (chunk = response.body.read())) {
    //     contents += chunk.toString()
    //   }

    //   console.log(parseResponse(contents))

      // console.log(JSON.parse());

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
  // });
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

                const recognizedText = await recognizeAudio();

                // await message.edit(
                //   successfullMessage(
                //     Lang["TEXT"] + "```" + recognizedText + "```",
                //   ),
                // );
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
