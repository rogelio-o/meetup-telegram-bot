export enum EventStatus {
  cancelled,
  upcoming,
  past,
  proposed,
  suggested,
  draft
}

export interface MeetupEvent {
  id: string;

  name: string;

  status: EventStatus;

  short_link: string;

  link: string;

  local_date: string;

  local_time: string;

  attendance_count: number;

  comment_count: number;

  created: Date;

  plain_text_description: string;

  plain_text_no_images_description: string;

  description: string;

  description_images: string;

  duration?: number; // default 10800000 ms

  featured: boolean;

  fee: {
    amount: number;

    currency: string;

    description: string;

    label: string;

    required: boolean;
  };

  waitlist_count: number;

  rsvp_limit: number;

  venue: {
    id: string;

    address_1: string;

    address_2: string;

    address_3: string;

    city: string;

    country: string;

    lat: string;

    localized_country_name: string;

    lon: string;

    name: string;

    phone: string;

    repinned: boolean;

    state: string;

    zip: string;
  };
}
