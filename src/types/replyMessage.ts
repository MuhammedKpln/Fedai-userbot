import { WAContextInfo, WAMessage, WASocket } from "@whiskeysockets/baileys";
import { BaseMessage } from "./base";

export default class ReplyMessage extends BaseMessage {
  declare jid: string;
  declare id: string | null;
  declare fromMe: boolean;
  timestamp: number;
  url: string | null;
  caption: string | null;
  mimetype: string | null;
  height: number | null;
  width: number | null;
  mediaKey: Uint8Array | null;
  message: string | null;
  client: WASocket;
  text: string;
  image: boolean;
  video: boolean;
  audio: boolean;
  declare data: WAMessage;
  contextInfo: WAContextInfo | null | undefined;

  constructor(client: WASocket, data: WAMessage) {
    super();
    this.client = client;
    if (data) this._patch(data);
  }

  _patch(data: WAMessage) {
    this.contextInfo = data!.message!.extendedTextMessage!.contextInfo;
    const contextInfo = this.contextInfo;

    this.id = contextInfo!.stanzaId || null;
    this.data = data;

    if (data.participant) {
      this.jid = data.participant;
    }

    if (contextInfo!.quotedMessage && contextInfo!.quotedMessage.imageMessage) {
      this.caption = contextInfo!.quotedMessage?.imageMessage?.caption || null;

      this.url = contextInfo!.quotedMessage?.imageMessage?.url || null;
      this.mimetype =
        contextInfo!.quotedMessage?.imageMessage?.mimetype || null;
      this.height = contextInfo!.quotedMessage?.imageMessage?.height || null;
      this.width = contextInfo!.quotedMessage?.imageMessage?.width || null;
      this.mediaKey =
        contextInfo!.quotedMessage?.imageMessage?.mediaKey || null;
      this.image = true;
    }
    if (contextInfo!.quotedMessage && contextInfo!.quotedMessage.audioMessage) {
      this.url = contextInfo!.quotedMessage?.audioMessage?.url || null;
      this.mimetype =
        contextInfo!.quotedMessage?.audioMessage?.mimetype || null;
      this.mediaKey =
        contextInfo!.quotedMessage?.audioMessage?.mediaKey || null;
      this.audio = true;
    }
    if (contextInfo!.quotedMessage && contextInfo!.quotedMessage.videoMessage) {
      this.caption = contextInfo!.quotedMessage?.videoMessage?.caption || null;

      this.url = contextInfo!.quotedMessage?.videoMessage?.url || null;
      this.mimetype =
        contextInfo!.quotedMessage?.videoMessage?.mimetype || null;
      this.height = contextInfo!.quotedMessage?.videoMessage?.height || null;
      this.width = contextInfo!.quotedMessage?.videoMessage?.width || null;
      this.mediaKey =
        contextInfo!.quotedMessage?.videoMessage?.mediaKey || null;
      this.video = true;
    } else if (
      contextInfo!.quotedMessage &&
      contextInfo!.quotedMessage.conversation
    ) {
      this.message = contextInfo!.quotedMessage.conversation;
      this.text = contextInfo!.quotedMessage.conversation;
      this.image = false;
      this.video = false;
    }
  }
}
