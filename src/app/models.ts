export type FeedFilterType = '' | 'onlyImages' | 'onlyText'; // An empty string because of <option value="">All<...>

export interface FeedFilter {
  feedFilter: FeedFilterType;
}

export interface FakeFeedResponse {
  nextPage: number | null;
  items: FeedItem[];
}

export interface FeedItem {
  user: { name: string, avatar: string };
  type: 'text' | 'image';
  created: Date;

  text?: string;
  imageURL?: string;
}
