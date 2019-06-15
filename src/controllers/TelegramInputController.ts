import { GroupsInChatService } from "../services/GroupsInChatService";
import { TelegramInputMessage } from "../models/TelegramInputMessage";
import { MeetupEvent } from "../models/MeetupEvent";
import { TelegramService } from "../services/telegramService";

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

    if (message.text === "/meetup_events") {
      await this.events(chatId);
    } else if (message.text.startsWith("/meetup_add_group ")) {
      await this.addGroup(chatId, message.text.substr(18));
    } else if (message.text.startsWith("/meetup_remove_group ")) {
      await this.removeGroup(chatId, message.text.substr(21));
    } else if (message.text === "/meetup_groups") {
      await this.groups(chatId);
    }
  }

  private async events(chatId: string): Promise<void> {
    const events: MeetupEvent[] = await this.groupsInChatService.findNextEventsOfChat(
      chatId
    );

    await this.telegramService.sendMessage(
      chatId,
      events.map(e => e.name).join(", ")
    );
  }

  private async addGroup(chatId: string, groupId: string): Promise<void> {
    await this.groupsInChatService.addGroupToChat(chatId, groupId);

    await this.telegramService.sendMessage(chatId, "Group added");
  }

  private async removeGroup(chatId: string, groupId: string): Promise<void> {
    await this.groupsInChatService.removeGroupFromChat(chatId, groupId);

    await this.telegramService.sendMessage(chatId, "Group removed");
  }

  private async groups(chatId: string): Promise<void> {
    const groups = await this.groupsInChatService.findGroupsOfChat(chatId);

    await this.telegramService.sendMessage(
      chatId,
      "Groups: " + groups.map(group => group.name).join(", ")
    );
  }
}
