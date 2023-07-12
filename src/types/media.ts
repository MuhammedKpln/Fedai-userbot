import { WAMessage, WASocket } from "@whiskeysockets/baileys";
import { BaseMessage } from "./base";

export default class MediaMessage extends BaseMessage {
  timestamp: number | Long.Long | null | undefined;
  url: string | null;
  caption: string | null;
  mimetype: string | null;
  height: number | null;
  width: number | null;
  mediaKey: Uint8Array | null;

  constructor(client: WASocket, data: WAMessage) {
    super();
    this.client = client;
    if (data) this._patch(data);
  }

  _patch(data: WAMessage) {
    this.id = data.key.id || null;
    if (data.key.remoteJid) {
      this.jid = data.key.remoteJid;
    }
    if (data.key.fromMe) {
      this.fromMe = data.key.fromMe;
    }
    this.caption = data.message?.imageMessage?.caption || null;

    this.url = data.message?.imageMessage?.url || null;
    this.timestamp = data.messageTimestamp;
    this.mimetype = data.message?.imageMessage?.mimetype || null;
    this.height = data.message?.imageMessage?.height || null;
    this.width = data.message?.imageMessage?.width || null;
    this.mediaKey = data.message?.imageMessage?.mediaKey || null;
    this.data = data;
  }
}
