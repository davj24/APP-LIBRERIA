import type { 
  AccountabilityPartner, 
  BookLoan, 
  BookTakeaway, 
  LivePresence, 
  SecretWishlistItem 
} from '../../domain/models/social';

// 1. Patto di Costanza (Davide & Elena)
export const INITIAL_ACCOUNTABILITY_PARTNER: AccountabilityPartner = {
  id: 'patto-elena',
  partnerName: 'Elena Rostagno',
  partnerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  partnerBadge: 'Partner di Lettura',
  streakDays: 14,
  userReadToday: true,
  partnerReadToday: true
};

// 2. Presenza Live stile Discord
export const INITIAL_LIVE_PRESENCES: LivePresence[] = [
  {
    id: 'presence-1',
    userId: 'user-elena',
    userName: 'Elena Rostagno',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    bookTitle: 'Dune',
    bookAuthor: 'Frank Herbert',
    bookCover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400',
    progressPage: 215,
    totalPages: 512,
    isReadingNow: true
  },
  {
    id: 'presence-2',
    userId: 'user-matteo',
    userName: 'Matteo Ferrari',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    bookTitle: 'L\'Ombra del Vento',
    bookAuthor: 'Carlos Ruiz Zafón',
    bookCover: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400',
    progressPage: 94,
    totalPages: 440,
    isReadingNow: true
  }
];

// 3. Inventario Prestiti Fisici
export const INITIAL_BOOK_LOANS: BookLoan[] = [
  {
    id: 'loan-1',
    bookTitle: 'Il Nome della Rosa',
    bookAuthor: 'Umberto Eco',
    bookCover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400',
    borrowerName: 'Damiano',
    borrowerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    loanDate: '01/08/2026',
    daysElapsed: 12,
    status: 'in_prestito',
    isMine: true
  },
  {
    id: 'loan-2',
    bookTitle: '1984',
    bookAuthor: 'George Orwell',
    bookCover: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=400',
    borrowerName: 'Tommaso',
    borrowerAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=200',
    loanDate: '10/08/2026',
    daysElapsed: 3,
    status: 'richiesto',
    isMine: true
  }
];

// 4. Feed Takeaways & Rating con Selettore Privacy
export const INITIAL_TAKEAWAYS: BookTakeaway[] = [
  {
    id: 'takeaway-1',
    userId: 'user-elena',
    userName: 'Elena Rostagno',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    bookTitle: 'Dune',
    bookAuthor: 'Frank Herbert',
    bookCover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400',
    rating: 5,
    content: 'Takeaway chiave: «Non devo avere paura. La paura uccide la mente. La paura è la piccola morte che porta con sé l\'annientamento totale.» — La lezione sull\'autocontrollo emotivo è applicabile in qualsiasi ambito della vita quotidiana.',
    quoteAuthor: 'Frank Herbert',
    privacy: 'public',
    likesCount: 18,
    isLiked: true,
    createdAt: '2 ore fa'
  },
  {
    id: 'takeaway-2',
    userId: 'user-davide',
    userName: 'Davide Belluzzo (Tu)',
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
    bookTitle: 'Atomic Habits',
    bookAuthor: 'James Clear',
    bookCover: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400',
    rating: 5,
    content: 'Appunto personale: Non devi cambiare i tuoi obiettivi, devi migliorare i tuoi sistemi. Per la lettura quotidiana, l\'ancoraggio alle 22:00 funziona meglio che leggere al mattino.',
    privacy: 'private',
    likesCount: 0,
    isLiked: false,
    createdAt: 'Ieri'
  },
  {
    id: 'takeaway-3',
    userId: 'user-matteo',
    userName: 'Matteo Ferrari',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    bookTitle: 'L\'Ombra del Vento',
    bookAuthor: 'Carlos Ruiz Zafón',
    rating: 4,
    content: '«Ogni libro possiede un\'anima. L\'anima di chi l\'ha scritto e l\'anima di coloro che l\'hanno letto e hanno vissuto e sognato con esso.»',
    privacy: 'friends',
    likesCount: 12,
    isLiked: false,
    createdAt: '3 giorni fa'
  }
];

// 5. Wishlist Regali Segreti (Anti-Doppioni)
export const INITIAL_SECRET_WISHLIST: SecretWishlistItem[] = [];

