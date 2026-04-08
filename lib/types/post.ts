export type PostType = 'update' | 'event' | 'article' | 'showcase';

export interface Post {
  id: string;
  authorId: string;
  type: PostType;
  content: string;
  mediaUrls: string[];

  // Event-specific
  eventDate?: string;
  eventLocation?: string;
  eventUrl?: string;
  eventType?: 'physical' | 'virtual' | 'hybrid';

  // Engagement
  likeCount: number;
  commentCount: number;
  shareCount: number;
  likedByIds: string[];

  // Visibility
  isPublic: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  likeCount: number;
  likedByIds: string[];
  createdAt: string;
  updatedAt: string;
}
