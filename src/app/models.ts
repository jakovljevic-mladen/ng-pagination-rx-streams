export interface FakeFeedResponse {
  user: { name: string, avatar: string };
  type: 'text' | 'image';
  created: Date;

  text?: string;
  imageURL?: string;
}
