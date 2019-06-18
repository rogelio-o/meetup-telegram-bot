import * as request from "request-promise";
import { Options } from "request";
import * as aws from "aws-sdk";
import { TelegramOutputMessage } from "../models/TelegramOutputMessage";

const decrypt = (encrypted: string): Promise<string> => {
  const kms = new aws.KMS();

  return new Promise((resolve, reject) => {
    kms.decrypt(
      { CiphertextBlob: new Buffer(encrypted, "base64") },
      (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data.Plaintext.toString("ascii"));
        }
      }
    );
  });
};

export class TelegramService {
  private token: string;

  private decrypted: boolean;

  constructor(token: string, encrypted: boolean) {
    this.token = token;
    this.decrypted = !encrypted;
  }

  private async getToken() {
    if (!this.decrypted) {
      this.token = await decrypt(this.token);
      this.decrypted = true;
    }

    return this.token;
  }

  public async sendTextMessage(chatId: string, text: string): Promise<void> {
    const message: TelegramOutputMessage = {
      chat_id: chatId,
      text
    };

    return this.sendMessage(message);
  }

  public async sendMessage(message: TelegramOutputMessage): Promise<void> {
    const token = await this.getToken();
    const options: Options = {
      url: `https://api.telegram.org/bot${token}/sendMessage`,
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
