export interface MeetupGroup {
  urlname: string;

  approved: boolean;

  name: string;

  plain_text_description: string;

  plain_text_no_images_description: string;

  description: string;

  city: string;

  untranslated_city: string;

  city_link: string;

  country: string;

  created: Date;

  category: {
    id: string;

    name: string;

    shortname: string;

    sort_name: string;
  };
}
