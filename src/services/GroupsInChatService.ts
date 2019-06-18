import { IChatRepository } from "../repositories/IChatRepository";
import { MeetupService } from "./MeetupService";
import { MeetupGroup } from "../models/MeetupGroup";
import { MeetupEvent } from "../models/MeetupEvent";

export class GroupsInChatService {
  private meetupService: MeetupService;

  private chatRepository: IChatRepository;

  constructor(meetupService: MeetupService, chatRepository: IChatRepository) {
    this.meetupService = meetupService;
    this.chatRepository = chatRepository;
  }

  public async addGroupToChat(
    chatId: string,
    groupUrlName: string
  ): Promise<boolean> {
    const parsedGroupUrlName = this.formatGroupUrlName(groupUrlName);
    const existGroup = await this.meetupService.existGroupByUrlName(
      parsedGroupUrlName
    );
    if (!existGroup) {
      return Promise.resolve(false);
    }

    return this.chatRepository
      .addGroup(chatId, parsedGroupUrlName)
      .then(() => true);
  }

  public removeGroupFromChat(
    chatId: string,
    groupUrlName: string
  ): Promise<void> {
    const parsedGroupUrlName = this.formatGroupUrlName(groupUrlName);

    return this.chatRepository.removeGroup(chatId, parsedGroupUrlName);
  }

  public async findGroupsOfChat(chatId: string): Promise<MeetupGroup[]> {
    const groupsIds = await this.chatRepository.findGroupIds(chatId);

    return Promise.all(
      groupsIds.map(groupId => this.meetupService.findGroupByUrlName(groupId))
    );
  }

  public async findNextEventsOfChat(chatId: string): Promise<MeetupEvent[]> {
    const groupsIds = await this.chatRepository.findGroupIds(chatId);
    const groupedEvents: MeetupEvent[][] = await Promise.all(
      groupsIds.map(groupId =>
        this.meetupService.findEventsByGroupUrlName(groupId)
      )
    );
    const events: MeetupEvent[] = groupedEvents.reduce(
      (a, b) => a.concat(b),
      []
    );

    return events
      .sort((a, b) => {
        const dateA = new Date(a.local_date + "T" + a.local_time);
        const dateB = new Date(b.local_date + "T" + b.local_time);

        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 10);
  }

  private formatGroupUrlName(groupUrlName: string): string {
    if (
      groupUrlName.startsWith("http://") ||
      groupUrlName.startsWith("https://")
    ) {
      const urlWithoutQuery = groupUrlName.split("?")[0];
      const endsIndex = urlWithoutQuery.endsWith("/")
        ? urlWithoutQuery.length - 1
        : urlWithoutQuery.length;
      const startsIndex = urlWithoutQuery.lastIndexOf("/", endsIndex - 1) + 1;

      return urlWithoutQuery.substring(startsIndex, endsIndex);
    } else {
      return groupUrlName;
    }
  }
}
