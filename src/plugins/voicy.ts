import { downloadContentFromMessage } from "@whiskeysockets/baileys";
import axios from "axios";
import ffmpeg from "fluent-ffmpeg";
import { createReadStream } from "node:fs";
import { rm, writeFile } from "node:fs/promises";
import { addCommand } from "../core/events";
import { errorMessage, infoMessage, successfullMessage } from "../core/helpers";
import { getString } from "../core/language";
import { Logger } from "../core/logger";
import { Root } from "./types/voicy";

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
    const file = createReadStream("./output.wav");
    axios
      .request<string>({
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
      })
      .then((response) => {
        const chunks = parseChunkedResponse<Root>(response.data);
        const finalizedChunks = chunks.filter(
          ({ is_final: isFinal }) => isFinal,
        );
        if (!finalizedChunks.length) {
          Logger.warn(
            `The final response chunk not found. Transcription is empty.`,
            chunks.map(({ text }) => text),
          );
        }

        resolve(finalizedChunks.map((chunk) => chunk.text).join(". "));

        return finalizedChunks;
      });
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
  { pattern: "voicy", desc: getString("voicy")["USAGE"], fromMe: false },
  async (message) => {
    const Lang = getString("voicy");

    try {
      if (message.reply_message) {
        if (message.reply_message.audio) {
          console.log(
            message.reply_message.data.message?.extendedTextMessage?.contextInfo
              ?.quotedMessage?.audioMessage?.mimetype,
          );

          try {
            await message.edit(infoMessage(Lang["RECOGNIZING"]));
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

            file.on("end", async () => {
              await writeFile("output.ogg", chunks);

              convertToWav("output.ogg").on("end", async () => {
                try {
                  const recognizedText = await recognizeAudio();

                  await message.sendMessage({
                    text: successfullMessage(
                      `${Lang["TEXT"]} ${recognizedText}`,
                    ),
                  });
                } catch (error) {
                  await message.edit(infoMessage(Lang["UNRECOGNIZED"]));
                } finally {
                  await cleanup();
                }
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

async function cleanup() {
  await rm("output.ogg");
  await rm("output.wav");
}
