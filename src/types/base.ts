import {
  AnyMessageContent,
  WAMessage,
  WASocket,
} from "@whiskeysockets/baileys";
import Message from "./message";

export class BaseMessage {
  jid: string;
  id: string | null;
  fromMe: boolean;
  client: WASocket;
  data: WAMessage;

  async delete() {
    await this.client.sendMessage(this.data.key.remoteJid!, {
      delete: this.data.key,
    });
  }

  async edit(text: string) {
    await this.client.sendMessage(this.data.key.remoteJid!, {
      text: text,
      edit: this.data.key,
    });
  }

  async reply(
    message: AnyMessageContent,
    quotedMessage,
  ): Promise<Message | void> {
    if (this.jid) {
      const m = await this.client.sendMessage(this.jid, message, {
        quoted: quotedMessage,
      });
      if (m) {
        return new Message(this.client, m);
      }
    }
  }

  async sendMessage(message: AnyMessageContent, jid?: string): Promise<void> {
    if (this.jid) {
      await this.client.sendMessage(jid || this.jid, message);
    }
  }
  async sendTextMessage(message: string, jid?: string): Promise<void> {
    if (this.jid) {
      await this.sendMessage(
        {
          text: message,
        },
        jid,
      );
    }
  }

  async sendTyping(): Promise<void> {
    await this.client.sendPresenceUpdate("composing", this.jid);
  }

  async sendRead(): Promise<void> {
    if (this.jid) {
      await this.client.chatModify(
        { markRead: false, lastMessages: [] },
        this.jid,
      );
    }
  }
}
