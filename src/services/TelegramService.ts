import * as request from "request-promise";
import { Options } from "request";
import { TelegramOutputMessage } from "../models/TelegramOutputMessage";

export class TelegramService {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  public async sendTextMessage(chatId: string, text: string): Promise<void> {
    const message: TelegramOutputMessage = {
      chat_id: chatId,
      text
    };

    return this.sendMessage(message);
  }

  public async sendMessage(message: TelegramOutputMessage): Promise<void> {
    if (!this.token) {
      return Promise.reject(new Error("Token not provided!"));
    }

    const options: Options = {
      url: `https://api.telegram.org/bot${this.token}/sendMessage`,
      method: "POST",
      forever: true,
      json: true,
      form: message
    };
    const data: any = await request(options);

    if (data.ok) {
      return data.result;
    } else {
      throw new Error(`${data.error_code} ${data.description}`);
    }
  }
}
