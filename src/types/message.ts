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
import ReplyMessage from './replyMessage';

export default class Message {
  jid: string;
  id: string | null;
  fromMe: boolean;
  message: string | null;
  timestamp: number;
  data: WAMessage;
  client: WAConnection;
  reply_message: ReplyMessage;
  mention: string[] | null;

  constructor(client: WAConnection, data: WAMessage) {
    this.client = client;
    this._patch(data);
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
    if (data.message) {
      if (
        data.message?.extendedTextMessage &&
        data.message?.extendedTextMessage?.contextInfo
      ) {
        this.reply_message = new ReplyMessage(
          this.client,
          data.message.extendedTextMessage.contextInfo,
        );
        this.mention =
          data.message?.extendedTextMessage?.contextInfo.mentionedJid || null;
      }
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

  //@ts-ignore
  async sendMessage(
    //@ts-ignore
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
    if (this.jid) {
      return await this.client.sendMessage(this.jid, message, type, options);
    }
  }

  async sendTextMessage(message: string) {
    if (this.jid) {
      return await this.client.sendMessage(this.jid, message, MessageType.text);
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
