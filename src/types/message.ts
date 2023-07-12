import { WAMessage, WASocket } from "@whiskeysockets/baileys";
import { BaseMessage } from "./base";
import ReplyMessage from "./replyMessage";

export default class Message extends BaseMessage {
  message: string | null;
  timestamp: number | Long.Long | null | undefined;
  reply_message: ReplyMessage;

  mention: string[] | null;

  constructor(client: WASocket, data: WAMessage) {
    super();
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
    // For repliying messages?

    if (data.message) {
      if (
        data.message?.extendedTextMessage &&
        data.message?.extendedTextMessage?.contextInfo
      ) {
        console.log("OK");
        this.reply_message = new ReplyMessage(this.client, data);
        this.mention =
          data.message?.extendedTextMessage?.contextInfo.mentionedJid || null;
      }
    }

    this.timestamp = data.messageTimestamp;
    this.data = data;
  }
}
