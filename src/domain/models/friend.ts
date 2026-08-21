export type FriendBookStatus = 'letto' | 'in_lettura' | 'da_leggere';

export interface FriendBook {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  status: FriendBookStatus;
  rating?: number;
  review?: string;
  genre?: string;
  canBorrow?: boolean;
  pageCount?: number;
}

export interface FriendTakeawayItem {
  id: string;
  bookTitle: string;
  content: string;
  rating: number;
  createdAt: string;
}

export interface FriendProfile {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  bio: string;
  badge: string;
  location?: string;
  joinedDate?: string;
  stats: {
    booksRead: number;
    pagesRead: number;
    streakDays: number;
    currentlyReadingCount: number;
    loanCount?: number;
  };
  favoriteGenres: string[];
  isFriend: boolean;
  currentlyReading: Array<{
    id: string;
    title: string;
    author: string;
    coverUrl: string;
    progressPage: number;
    totalPages: number;
  }>;
  recentTakeaways: FriendTakeawayItem[];
  library: FriendBook[];
}
