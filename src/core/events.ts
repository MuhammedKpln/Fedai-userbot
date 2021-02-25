import { HANDLERS } from '../config';
import Message from '../types/message';

interface ICommandArgs {
  pattern: string;
  on?: string;
  fromMe: boolean;
  onlyGroup?: boolean;
  onlyPinned?: boolean;
  onlyPm?: boolean;
  deleteCommand?: boolean;
  desc?: string;
  usage?: string;
  dontAddCommandList?: boolean;
  warn?: string;
}

interface ICommand {
  pattern: string;
  on?: string;
  fromMe: boolean;
  onlyGroup?: boolean;
  onlyPinned?: boolean;
  onlyPm?: boolean;
  deleteCommand?: boolean;
  desc?: string;
  usage?: string;
  dontAddCommandList?: boolean;
  warn?: string;
  function: (client: Message, match?: RegExpMatchArray) => void;
}

export const loadedCommands: ICommand[] = [];

export function addCommand(
  info: ICommandArgs,
  func: (client: Message, match?: RegExpMatchArray) => void,
): ICommand {
  // Basit bir fonksiyon, komut eklemek için.
  var types = ['photo', 'image', 'text', 'message'];

  var infos: ICommand = {
    fromMe: info['fromMe'] === undefined ? true : info['fromMe'], // Or Sudo
    pattern: info.pattern ? info.pattern : '',
    onlyGroup: info['onlyGroup'] === undefined ? false : info['onlyGroup'],
    onlyPinned: info['onlyPinned'] === undefined ? false : info['onlyPinned'],
    onlyPm: info['onlyPm'] === undefined ? false : info['onlyPm'],
    deleteCommand:
      info['deleteCommand'] === undefined ? true : info['deleteCommand'],
    desc: info['desc'] === undefined ? '' : info['desc'],
    usage: info['usage'] === undefined ? '' : info['usage'],
    dontAddCommandList:
      info['dontAddCommandList'] === undefined
        ? false
        : info['dontAddCommandList'],
    warn: info['warn'] === undefined ? '' : info['warn'],
    function: func,
  };

  if (info['on'] === undefined && info['pattern'] === undefined) {
    infos.on = 'message';
    infos.fromMe = false;
  } else if (info['on'] !== undefined && types.includes(info['on'])) {
    infos.on = info['on'];

    if (info['pattern'] !== undefined) {
      // @ts-ignore
      infos.pattern = new RegExp(
        (info['handler'] === undefined || info['handler'] === true
          ? HANDLERS
          : '') + info.pattern,
        info['flags'] !== undefined ? info['flags'] : '',
      );
    }
  } else {
    // @ts-ignore
    infos.pattern = new RegExp(
      (info['handler'] === undefined || info['handler'] === true
        ? HANDLERS
        : '') + info.pattern,
      info['flags'] !== undefined ? info['flags'] : '',
    );
  }

  loadedCommands.push(infos);
  return infos;
}
