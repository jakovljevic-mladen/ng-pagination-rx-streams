export interface FakeFeedResponse {
  nextPageURL: string | null;
  items: FeedItem[];
}

export interface FeedItem {
  user: { name: string, avatar: string };
  type: 'text' | 'image';
  created: Date;

  text?: string;
  imageURL?: string;
}
