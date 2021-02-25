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

export default class Message extends WAConnection {
  jid: string;
  id: string;
  fromMe: boolean;
  message: string;
  timestamp: number;
  data: WAMessage;
  client: WAConnection;
  constructor(client: WAConnection, data: WAMessage) {
    super();
    this.client = client;
    this._patch(data);
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
    return await this.client.sendMessage(this.jid, message, type, options);
  }

  async sendTyping() {
    return await this.updatePresence(this.jid, Presence.composing);
  }

  async sendRead() {
    return await this.chatRead(this.jid);
  }
}
