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
    const existGroup = await this.meetupService.existGroupByUrlName(
      groupUrlName
    );
    if (!existGroup) {
      return Promise.resolve(false);
    }

    return this.chatRepository.addGroup(chatId, groupUrlName).then(() => true);
  }

  public removeGroupFromChat(
    chatId: string,
    groupUrlName: string
  ): Promise<void> {
    return this.chatRepository.removeGroup(chatId, groupUrlName);
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
}
