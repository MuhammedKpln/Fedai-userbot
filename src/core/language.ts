// import chalk from 'chalk';
import * as fs from "fs";
import * as path from "path";
import { LANG } from "../config";

interface ILang {
  LANGUAGE: string;
  LANGCODE: string;
  STRINGS: any;
}

// Load language file
const languageFile: string = path.resolve("languages", `${LANG}.json`);
let language: ILang;

export function loadLanguage() {
  if (LANG && fs.existsSync(languageFile)) {
    // console.log(chalk.blue.bold(`ℹ️ Loading ${LANG} language...`));
    language = JSON.parse(fs.readFileSync(languageFile).toString());
  } else {
    // console.log(
    //   chalk.red.bold(
    //     `Could not load ${LANG} language... Falling back to English.`,
    //   ),
    // );

    language = JSON.parse(
      fs.readFileSync(path.resolve("languages", "EN.json")).toString(),
    );
  }

  // console.log(chalk.green.bold(`✅ Loaded successfully ${LANG} language.`));
}

export function getString(key: string): string {
  return language["STRINGS"][key];
}
