import {
  MessageType,
  Presence,
  WAConnection,
  WAMessage,
} from '@adiwajshing/baileys';
import Message from './message';

export default class Image extends WAConnection {
  data: WAMessage;
  client: WAConnection;
  jid: string;
  id: string;
  fromMe: boolean;
  timestamp: number;
  url: string;
  caption: string;
  mimetype: string;
  height: number;
  width: number;
  mediaKey: Uint8Array;

  constructor(client: WAConnection, data: WAMessage) {
    super();
    this.client = client;
    if (data) this._patch(data);
  }

  _patch(data: WAMessage) {
    this.id = data.key.id === undefined ? undefined : data.key.id;
    this.jid = data.key.remoteJid;
    this.fromMe = data.key.fromMe;
    this.caption =
      data.message.imageMessage.caption === null
        ? data.message.imageMessage.caption
        : '';
    this.url = data.message.imageMessage.url;
    this.timestamp =
      typeof data.messageTimestamp === 'object'
        ? data.messageTimestamp.low
        : data.messageTimestamp;
    this.mimetype = data.message.imageMessage.mimetype;
    this.height = data.message.imageMessage.height;
    this.width = data.message.imageMessage.width;
    this.mediaKey = data.message.imageMessage.mediaKey;
    this.data = data;
  }

  async delete() {
    return await this.client.deleteMessage(this.jid, {
      id: this.id,
      remoteJid: this.jid,
      fromMe: true,
    });
  }

  async reply(text) {
    var message = await this.client.sendMessage(
      this.jid,
      text,
      MessageType.text,
      { quoted: this.data },
    );
    return new Message(this.client, message);
  }

  async sendMessage(content, type, options) {
    return await this.client.sendMessage(this.jid, content, type, options);
  }

  async sendTyping() {
    return await this.client.updatePresence(this.jid, Presence.composing);
  }

  async sendRead() {
    return await this.client.chatRead(this.jid);
  }

  async download(location = this.id) {
    await this.client.downloadAndSaveMediaMessage(this.data, location);
    return this.id + '.' + this.mimetype.split('/')[1];
  }
}
