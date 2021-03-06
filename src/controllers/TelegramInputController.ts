import { GroupsInChatService } from "../services/GroupsInChatService";
import { TelegramInputMessage } from "../models/TelegramInputMessage";
import { MeetupEvent } from "../models/MeetupEvent";
import { TelegramService } from "../services/telegramService";
import { TelegramOutputMessage } from "../models/TelegramOutputMessage";

export class TelegramInputController {
  private groupsInChatService: GroupsInChatService;

  private telegramService: TelegramService;

  constructor(
    groupsInChatService: GroupsInChatService,
    telegramService: TelegramService
  ) {
    this.groupsInChatService = groupsInChatService;
    this.telegramService = telegramService;
  }

  public async process(message: TelegramInputMessage): Promise<void> {
    const chatId = message.chat.id.toString();

    if (
      message.text === "/meetup_events" ||
      message.text === "/meetup_events@meetup_telegram_bot"
    ) {
      await this.events(chatId);
    } else if (
      message.text.startsWith("/meetup_add_group ") ||
      message.text.startsWith("/meetup_add_group@meetup_telegram_bot ")
    ) {
      await this.addGroup(chatId, message.text.substr(18));
    } else if (
      message.text.startsWith("/meetup_remove_group ") ||
      message.text.startsWith("/meetup_remove_group@meetup_telegram_bot ")
    ) {
      await this.removeGroup(chatId, message.text.substr(21));
    } else if (
      message.text === "/meetup_groups" ||
      message.text === "/meetup_groups@meetup_telegram_bot"
    ) {
      await this.groups(chatId);
    } else if (
      message.text === "/meetup_help" ||
      message.text === "/meetup_help@meetup_telegram_bot"
    ) {
      await this.help(chatId);
    }
  }

  private async events(chatId: string): Promise<void> {
    const events: MeetupEvent[] = await this.groupsInChatService.findNextEventsOfChat(
      chatId
    );

    await Promise.all(events.map(event => this.event(chatId, event)));
  }

  private async event(chatId: string, event: MeetupEvent): Promise<void> {
    const address = event.venue
      ? (event.venue.name ? event.venue.name : "") +
        (event.venue.address_1
          ? (event.venue.name ? ", " : "") + event.venue.address_1
          : "") +
        (event.venue.address_2 ? " " + event.venue.address_2 : "") +
        (event.venue.address_3 ? " " + event.venue.address_3 : "")
      : "";
    const rawDescription = event.description.replace(/<[^>]*>?/gm, "");
    const description =
      rawDescription.substr(0, 200) +
      (rawDescription.length > 200 ? "..." : "");
    const date = new Date(event.local_date + "T" + event.local_time);

    const text = `*${event.name}*
${date.toLocaleDateString("en-GB", {
  weekday: "long",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit"
})}
${description} [Read more](${event.link})
_${address}_`;
    const message: TelegramOutputMessage = {
      chat_id: chatId,
      text,
      parse_mode: "markdown",
      disable_web_page_preview: true
    };
    await this.telegramService.sendMessage(message);
  }

  private async addGroup(chatId: string, groupId: string): Promise<void> {
    const result = await this.groupsInChatService.addGroupToChat(
      chatId,
      groupId
    );
    const message = result
      ? "Meetup group added to chat."
      : "The meetup group you're trying to add doesn't exist.";

    await this.telegramService.sendTextMessage(chatId, message);
  }

  private async removeGroup(chatId: string, groupId: string): Promise<void> {
    await this.groupsInChatService.removeGroupFromChat(chatId, groupId);

    await this.telegramService.sendTextMessage(
      chatId,
      "Meetup group removed from chat."
    );
  }

  private async groups(chatId: string): Promise<void> {
    const groups = await this.groupsInChatService.findGroupsOfChat(chatId);
    const groupsList = groups
      .map(
        group => `- [${group.name}](https://www.meetup.com/${group.urlname})`
      )
      .join("\n");
    const text = `Meetup groups:
${groupsList}`;
    const message: TelegramOutputMessage = {
      chat_id: chatId,
      text,
      parse_mode: "markdown",
      disable_web_page_preview: true
    };

    await this.telegramService.sendMessage(message);
  }

  private async help(chatId: string): Promise<void> {
    const text = `How to use Meetup Telegram Bot?:
- */meetup_groups:* it retrieves all the meetup groups added to the chat.
- */meetup_add_group [group URL]:* it adds a meetup group to the chat.
- */meetup_remove_group [group URL]:* it removes a meetup group from the chat.
- */meetup_events:* it retrieves 10 upcoming events from the meetup groups in the chat.`;
    const message: TelegramOutputMessage = {
      chat_id: chatId,
      text,
      parse_mode: "markdown",
      disable_web_page_preview: true
    };

    await this.telegramService.sendMessage(message);
  }
}
