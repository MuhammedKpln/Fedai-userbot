import * as fs from 'fs';

type TLanguages = 'TR' | 'EN';

if (fs.existsSync('../../config.env')) {
  console.log('qwe');
  require('dotenv').config({ path: '../../config.env' });
}

export const SESSION: string = process.env.SESSION || '';
export const VERSION: string = '0.15';
export const HANDLERS: string = process.env.HANDLERS?.toString() || '[.!;]';
export const LANG: TLanguages =
  (process.env.BOT_LANG?.toUpperCase() as TLanguages) || 'EN';
export const WITAI_API: string = 'TEYMELA6DMC4XB5YM3SPTTQWUUIBKURG';
