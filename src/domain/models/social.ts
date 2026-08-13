export type PostType = 'update' | 'review' | 'quote' | 'milestone';

export type ReactionType = 'like' | 'fire' | 'claps' | 'bookmark';

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
}

export interface SocialPost {
  id: string;
  type: PostType;
  userId: string;
  userName: string;
  userAvatar: string;
  userBadge?: string;
  bookTitle?: string;
  bookAuthor?: string;
  bookCover?: string;
  rating?: number; // per le recensioni (1-5)
  progressPage?: number; // per aggiornamenti di lettura (es. pag 145/380)
  totalPages?: number;
  content: string; // Testo del post o citazione
  quoteAuthor?: string;
  createdAt: string;
  reactions: Record<ReactionType, number>;
  userReactions: Record<ReactionType, boolean>;
  comments: Comment[];
}

export interface BookClub {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  coverUrl: string;
  membersCount: number;
  isJoined: boolean;
  currentBook: {
    title: string;
    author: string;
    coverUrl: string;
    progressPercentage: number;
  };
  activeDiscussionCount: number;
}

export interface ReaderLeaderboardUser {
  id: string;
  name: string;
  avatarUrl: string;
  booksReadThisMonth: number;
  pagesReadThisMonth: number;
  streakDays: number;
  isFollowing: boolean;
  rank: number;
}
