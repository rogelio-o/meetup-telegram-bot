import { TelegramMessageEntity } from "./TelegramMessageEntity";

export interface TelegramInputMessage {
  message_id: string;

  from: {
    id: number;

    is_bot: boolean;

    first_name: string;

    last_name: string;

    username: string;

    language_code: string;
  };

  chat: {
    id: number;

    first_name: string;

    last_name: string;

    username: string;

    type: string;
  };

  date: number;

  text: string;

  entities: TelegramMessageEntity[];
}
