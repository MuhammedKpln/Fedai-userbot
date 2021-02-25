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
  id: string;
  fromMe: boolean;
  timestamp: number;
  url: string;
  caption: string;
  mimetype: string;
  height: number;
  width: number;
  mediaKey: Uint8Array;
  message: string;
  data: WAMessage;
  client: WAConnection;
  constructor(client: WAConnection, data: WAMessage) {
    super();
    this.client = client;
    if (data) this._patch(data);
  }

  _patch(data: WAMessage) {
    this.id = data.key.id === undefined ? undefined : data.key.id;
    this.jid = data.key.remoteJid;
    this.fromMe = data.key.fromMe;
    this.message =
      data.message.extendedTextMessage === null
        ? data.message.conversation
        : data.message.extendedTextMessage.text;
    this.timestamp =
      typeof data.messageTimestamp === 'object'
        ? data.messageTimestamp.low
        : data.messageTimestamp;
    this.data = data;
  }

  async delete() {
    return await this.deleteMessage(this.jid, {
      id: this.id,
      remoteJid: this.jid,
      fromMe: true,
    });
  }

  async reply(text) {
    var message = await this.sendMessage(this.jid, text, MessageType.text);
    return new Message(this.client, message);
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
    return await this.chatRead(this.jid);
  }
}
