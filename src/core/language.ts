import * as chalk from 'chalk';
import * as fs from 'fs';
import { LANG } from '../config';

interface ILang {
  LANGUAGE: string;
  LANGCODE: string;
  STRINGS: any;
}

// Load language file
const languageFile: string = `./languages/${LANG}.json`;
let language: ILang;

export function loadLanguage() {
  if (LANG && fs.existsSync(languageFile)) {
    console.log(chalk.green.bold(`Loading ${LANG} language...`));
    language = JSON.parse(fs.readFileSync(languageFile).toString());
  } else {
    console.log(
      chalk.red.bold(
        `Could not load ${LANG} language... Falling back to English.`,
      ),
    );

    language = JSON.parse(fs.readFileSync('./languages/EN.json').toString());
  }
}

export function getString(key: string): string {
  return language['STRINGS'][key];
}
