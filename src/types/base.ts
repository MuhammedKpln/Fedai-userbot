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

export class BaseMessage {
  jid: string;
  id: string | null;
  fromMe: boolean;
  client: WAConnection;
  data: WAMessage;

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

  async sendImageMessage(image: Buffer | WAMediaUpload) {
    if (this.jid) {
      return await this.client.sendMessage(this.jid, image, MessageType.image);
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
