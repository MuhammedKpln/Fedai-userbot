// import chalk from 'chalk';
import * as fs from "fs";
import * as path from "path";
import { LANG } from "../config";
import { Logger } from './logger';

interface ILang {
  LANGUAGE: string;
  LANGCODE: string;
  STRINGS: any;
}

// Load language file
let language: ILang;

export function loadLanguage() {
  let languageFile: string = path.resolve("languages", `${LANG}.json`);

  if (LANG && fs.existsSync(languageFile)) {
    Logger.info("Loading " + languageFile)
    language = JSON.parse(fs.readFileSync(languageFile).toString());
  } else {

    language = JSON.parse(
      fs.readFileSync(path.resolve("languages", "EN.json")).toString(),
    );
  }

}

export function getString(key: string): string {
  return language["STRINGS"][key];
}
