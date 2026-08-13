export type PrivacyLevel = 'public' | 'friends' | 'private';

export type LoanStatus = 'richiesto' | 'in_prestito' | 'restituito';

export interface AccountabilityPartner {
  id: string;
  partnerName: string;
  partnerAvatar: string;
  partnerBadge: string;
  streakDays: number;
  userReadToday: boolean;
  partnerReadToday: boolean;
  lastMissedDate?: string;
}

export interface BookLoan {
  id: string;
  bookTitle: string;
  bookAuthor: string;
  bookCover: string;
  borrowerName: string;
  borrowerAvatar: string;
  loanDate: string;
  daysElapsed: number;
  status: LoanStatus;
  isMine: boolean; // True se il libro è mio prestato ad altri, false se l'ho chiesto io
}

export interface BookTakeaway {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  bookTitle: string;
  bookAuthor: string;
  bookCover?: string;
  rating: number; // Valutazione 1-5 stelle
  content: string; // Concetto chiave, appunto o regola
  quoteAuthor?: string;
  privacy: PrivacyLevel;
  likesCount: number;
  isLiked: boolean;
  createdAt: string;
}

export interface LivePresence {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  bookTitle: string;
  bookAuthor: string;
  bookCover: string;
  progressPage: number;
  totalPages: number;
  isReadingNow: boolean;
  lastPingEmoji?: string;
  lastPingFrom?: string;
}

export interface SecretWishlistItem {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  price?: string;
  isReservedByFriend: boolean;
  reservedByUserName?: string;
}
