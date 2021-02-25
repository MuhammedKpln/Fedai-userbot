import {
  MessageOptions,
  MessageType,
  Presence,
  WAConnection,
  WAContactMessage,
  WALocationMessage,
  WAMediaUpload,
  WAMessage,
  WATextMessage,
} from '@adiwajshing/baileys';
import Message from './message';

export default class ReplyMessage extends WAConnection {
  jid: string;
  id: string | null;
  fromMe: boolean;
  timestamp: number;
  url: string;
  caption: string;
  mimetype: string;
  height: number;
  width: number;
  mediaKey: Uint8Array;
  message: string | null;
  data: WAMessage;
  client: WAConnection;
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
    if (data.message?.extendedTextMessage) {
      this.message = data.message?.extendedTextMessage?.text || null;
    } else {
      this.message = data.message?.conversation || null;
    }
    this.timestamp =
      typeof data.messageTimestamp === 'object'
        ? data.messageTimestamp.low
        : data.messageTimestamp;
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
      return this.sendMessage(this.jid, text, MessageType.text).then((m) => {
        if (m) {
          return new Message(this.client, m);
        }

        return false;
      });
    }

    return false;
  }

  async sendMessage(
    jid: string,
    message:
      | string
      | WATextMessage
      | WALocationMessage
      | WAContactMessage
      | WAMediaUpload,
    type: MessageType,
    options?: MessageOptions,
  ) {
    return await this.client.sendMessage(
      this.jid || jid,
      message,
      type,
      options,
    );
  }

  async sendTyping() {
    return await this.updatePresence(this.jid, Presence.composing);
  }

  async sendRead() {
    if (this.jid) {
      return await this.chatRead(this.jid);
    }
  }
}
