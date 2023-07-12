import { TLanguages } from "./interfaces/lang.interface";

function convertToBool(bool: string): boolean {
  return bool.toLowerCase() === "false" ? false : true;
}

export const SESSION: string = process.env.SESSION || "";
export const VERSION: string = "0.15";
export const HANDLERS: string = process.env.HANDLERS?.toString() || "[.!;]";
export let LANG: TLanguages =
  (process.env.BOT_LANG?.toUpperCase() as TLanguages) || "EN";
export const WITAI_API: string = process.env.WITAI_API!;
export const DATABASE_URL: string = process.env.DATABASE_URL || "./fedaibot.db";
export const DEBUG: boolean = process.env.DEBUG
  ? convertToBool(process.env.DEBUG)
  : true;
export const HEROKU_API: string = process.env.HEROKU_API || "";
export const HEROKU_APP_NAME: string = process.env.HEROKU_APP_NAME || "";

export function changeLang(lang: TLanguages): void {
  LANG = lang;
}
