import {
  MessageType,
  Presence,
  WAConnection,
  WAMessage,
} from '@adiwajshing/baileys';
import Message from './message';

export default class MediaMessage extends WAConnection {
  data: WAMessage;
  client: WAConnection;
  jid: string;
  id: string | null;
  fromMe: boolean;
  timestamp: number | null;
  url: string | null;
  caption: string | null;
  mimetype: string | null;
  height: number | null;
  width: number | null;
  mediaKey: Uint8Array | null;

  constructor(client: WAConnection, data: WAMessage) {
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
    this.timestamp =
      typeof data.messageTimestamp === 'object'
        ? data.messageTimestamp.low
        : data.messageTimestamp;
    this.mimetype = data.message?.imageMessage?.mimetype || null;
    this.height = data.message?.imageMessage?.height || null;
    this.width = data.message?.imageMessage?.width || null;
    this.mediaKey = data.message?.imageMessage?.mediaKey || null;
    this.data = data;
  }

  async delete() {
    if (this.jid) {
      return await this.client.deleteMessage(this.jid, {
        id: this.id,
        remoteJid: this.jid,
        fromMe: true,
      });
    }

    return false;
  }

  async reply(text) {
    if (this.jid) {
      var message = await this.client.sendMessage(
        this.jid,
        text,
        MessageType.text,
        { quoted: this.data },
      );
      return new Message(this.client, message);
    }

    return false;
  }
  //@ts-ignore
  async sendMessage(content, type, options) {
    if (this.jid) {
      return await this.client.sendMessage(this.jid, content, type, options);
    }
  }

  async sendTyping() {
    return await this.client.updatePresence(this.jid, Presence.composing);
  }

  async sendRead() {
    if (this.jid) {
      return await this.client.chatRead(this.jid);
    }
  }
}
