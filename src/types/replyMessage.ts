import {
  MessageOptions,
  MessageType,
  Presence,
  WAConnection,
  WAContactMessage,
  WAContextInfo,
  WALocationMessage,
  WAMediaUpload,
  WATextMessage,
} from '@adiwajshing/baileys';
import Message from './message';

export default class ReplyMessage {
  jid: string;
  id: string | null;
  fromMe: boolean;
  timestamp: number;
  url: string | null;
  caption: string | null;
  mimetype: string | null;
  height: number | null;
  width: number | null;
  mediaKey: Uint8Array | null;
  message: string | null;
  client: WAConnection;
  text: string;
  image: boolean;
  video: boolean;
  data: WAContextInfo;
  constructor(client: WAConnection, data: WAContextInfo) {
    this.client = client;
    if (data) this._patch(data);
  }

  _patch(data: WAContextInfo) {
    this.id = data.stanzaId || null;
    this.data = data;
    if (data.participant) {
      this.jid = data.participant;
    }

    if (data.quotedMessage && data.quotedMessage.imageMessage) {
      this.caption = data.quotedMessage?.imageMessage?.caption || null;

      this.url = data.quotedMessage?.imageMessage?.url || null;
      this.mimetype = data.quotedMessage?.imageMessage?.mimetype || null;
      this.height = data.quotedMessage?.imageMessage?.height || null;
      this.width = data.quotedMessage?.imageMessage?.width || null;
      this.mediaKey = data.quotedMessage?.imageMessage?.mediaKey || null;
      this.image = true;
    }
    if (data.quotedMessage && data.quotedMessage.videoMessage) {
      this.caption = data.quotedMessage?.videoMessage?.caption || null;

      this.url = data.quotedMessage?.videoMessage?.url || null;
      this.mimetype = data.quotedMessage?.videoMessage?.mimetype || null;
      this.height = data.quotedMessage?.videoMessage?.height || null;
      this.width = data.quotedMessage?.videoMessage?.width || null;
      this.mediaKey = data.quotedMessage?.videoMessage?.mediaKey || null;
      this.video = true;
    } else if (data.quotedMessage && data.quotedMessage.conversation) {
      this.message = data.quotedMessage.conversation;
      this.text = data.quotedMessage.conversation;
      this.image = false;
      this.video = false;
    }
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
    return await this.client.updatePresence(this.jid, Presence.composing);
  }

  async sendRead() {
    if (this.jid) {
      return await this.client.chatRead(this.jid);
    }
  }
}
