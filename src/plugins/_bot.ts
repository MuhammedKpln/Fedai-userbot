import { readFile } from "fs/promises";
import path from "path";
import { changeLang } from "../config";
import { addCommand, loadedCommands } from "../core/events";
import { errorMessage, infoMessage } from "../core/helpers";
import { getString, loadLanguage } from "../core/language";
import { TLanguages } from "../interfaces/lang.interface";
import Message from "../types/message";

const Lang = getString("_bot");

addCommand(
  { pattern: "fedai", fromMe: true, dontAddCommandList: true },
  async (client: Message) => {
    const msg = infoMessage(Lang["NEW_COMMAND"]);

    await client.sendMessage({ text: msg }, client.jid);
  },
);

addCommand(
  {
    pattern: "lang ?(.*)",
    fromMe: true,
    desc: "Change bot language temporary",
  },
  async (_client: Message, match: RegExpMatchArray) => {
    const lang = match[1];

    try {
      await readFile(path.resolve("languages", lang.toUpperCase() + ".json"));

      changeLang(lang as TLanguages);
      loadLanguage();
    } catch (e) {
      await _client.edit(errorMessage("Language is not supported."));
    }
  },
);

addCommand(
  { pattern: "help", fromMe: true, dontAddCommandList: true },
  async (client: Message) => {
    // const commandForHelp: string = match[1];
    let CMD_HELP: string[] = [];
    loadedCommands.map((command) => {
      // Skip plugins who don't want to show it self in help.
      if (command.dontAddCommandList || command.pattern === undefined) return;
      const match = command.pattern
        .toString()
        .match(/(\W*)([A-Za-zğüşiöç1234567890]*)/);

      if (match) {
        CMD_HELP.push(
          "*🛠 " +
            Lang["COMMAND"] +
            ":* ```" +
            (match.length >= 3 ? match[2] : command.pattern) +
            (command.desc === "" ? "```\n\n" : "```\n"),
        );
      }

      if (command.desc !== "") {
        CMD_HELP.push(
          "*💬 " +
            Lang["DESC"] +
            ":* ```" +
            command.desc?.replace(".", "") +
            (command.warn === "" ? "```\n\n" : "```\n"),
        );
      }

      if (command.usage !== "") {
        CMD_HELP.push(
          "*⌨️ " +
            Lang["EXAMPLE"] +
            ":* ```" +
            command.usage?.replace(".", "") +
            "```\n\n",
        );
      }

      if (command.warn !== "") {
        CMD_HELP.push(
          "*⚠️ " + Lang["WARN"] + ":* ```" + command.warn + "```\n\n",
        );
      }
    });

    await client.sendMessage({ text: CMD_HELP.join("") }, client.jid);
  },
);
