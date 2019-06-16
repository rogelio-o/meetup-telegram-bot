export interface TelegramOutputMessage {
  chat_id: string;

  text: string;

  parse_mode?: string;

  disable_web_page_preview?: boolean;
}
