import * as request from "request-promise";
import { Options } from "request";
import { MeetupEvent } from "../models/MeetupEvent";
import { MeetupGroup } from "../models/MeetupGroup";

export class MeetupService {
  public async findEventsByGroupUrlName(
    groupUrlName: string
  ): Promise<MeetupEvent[]> {
    const options: Options = {
      url: `https://api.meetup.com/${groupUrlName}/events?status=upcoming&scroll=next_upcoming&page=5`,
      method: "GET",
      forever: true,
      json: true
    };

    const events: any = await request(options);
    return Object.values(events);
  }

  public async findGroupByUrlName(groupUrlName: string): Promise<MeetupGroup> {
    const options: Options = {
      url: `https://api.meetup.com/${groupUrlName}`,
      method: "GET",
      forever: true,
      json: true
    };

    return await request(options);
  }

  public async existGroupByUrlName(groupUrlName: string): Promise<boolean> {
    try {
      await this.findGroupByUrlName(groupUrlName);

      return true;
    } catch (e) {
      if (e.statusCode === 404) {
        return false;
      } else {
        throw e;
      }
    }
  }
}
