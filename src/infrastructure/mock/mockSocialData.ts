import type { SocialPost, BookClub, ReaderLeaderboardUser } from '../../domain/models/social';

export const INITIAL_SOCIAL_POSTS: SocialPost[] = [
  {
    id: 'post-1',
    type: 'review',
    userId: 'user-elena',
    userName: 'Elena Rostagno',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    userBadge: 'Top Reviewer',
    bookTitle: 'Dune',
    bookAuthor: 'Frank Herbert',
    bookCover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400',
    rating: 5,
    content: 'Capolavoro assoluto della fantascienza. La costruzione del pianeta Arrakis, le dinamiche politiche e l\'ecologia del deserto sono insuperabili.',
    createdAt: '2 ore fa',
    reactions: { like: 24, fire: 18, claps: 12, bookmark: 7 },
    userReactions: { like: true, fire: false, claps: false, bookmark: false },
    comments: [
      {
        id: 'c-1',
        userId: 'user-marco',
        userName: 'Marco Bianchi',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
        content: 'Concordo al 100%! Hai già iniziato a leggere Messia di Dune?',
        createdAt: '1 ora fa'
      },
      {
        id: 'c-2',
        userId: 'user-elena',
        userName: 'Elena Rostagno',
        userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        content: 'Sì! Lo sto iniziando proprio stasera 🚀',
        createdAt: '45 min fa'
      }
    ]
  },
  {
    id: 'post-2',
    type: 'quote',
    userId: 'user-matteo',
    userName: 'Matteo Ferrari',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    userBadge: 'Filosofo della Notte',
    bookTitle: 'L\'Ombra del Vento',
    bookAuthor: 'Carlos Ruiz Zafón',
    bookCover: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400',
    content: '«Ogni libro, ogni volume possiede un’anima. L’anima di chi l’ha scritto e l’anima di coloro che l’hanno letto e hanno vissuto e sognato con esso.»',
    quoteAuthor: 'Carlos Ruiz Zafón',
    createdAt: '5 ore fa',
    reactions: { like: 42, fire: 15, claps: 28, bookmark: 19 },
    userReactions: { like: false, fire: false, claps: true, bookmark: true },
    comments: [
      {
        id: 'c-3',
        userId: 'user-giulia',
        userName: 'Giulia Conti',
        userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
        content: 'Una delle citazioni più belle sulla lettura in assoluto! ✨',
        createdAt: '3 ore fa'
      }
    ]
  },
  {
    id: 'post-3',
    type: 'update',
    userId: 'user-giulia',
    userName: 'Giulia Conti',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    userBadge: 'Lettore Instancabile',
    bookTitle: 'Il Nome della Rosa',
    bookAuthor: 'Umberto Eco',
    bookCover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400',
    progressPage: 280,
    totalPages: 512,
    content: 'Superata la metà! L\'enigma nell\'abbazia si fa sempre più fitto. Il personaggio di Guglielmo da Baskerville è semplicemente brillante.',
    createdAt: 'Yesterday',
    reactions: { like: 19, fire: 8, claps: 5, bookmark: 2 },
    userReactions: { like: false, fire: false, claps: false, bookmark: false },
    comments: []
  },
  {
    id: 'post-4',
    type: 'milestone',
    userId: 'user-davide',
    userName: 'Davide Belluzzo',
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
    userBadge: 'Sfida 2026',
    bookTitle: '1984',
    bookAuthor: 'George Orwell',
    bookCover: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=400',
    content: '🎉 Ho completato il mio 15° libro dell\'anno! Traguardo annuale raggiunto al 75%.',
    createdAt: '2 giorni fa',
    reactions: { like: 58, fire: 31, claps: 44, bookmark: 5 },
    userReactions: { like: true, fire: true, claps: true, bookmark: false },
    comments: [
      {
        id: 'c-4',
        userId: 'user-elena',
        userName: 'Elena Rostagno',
        userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        content: 'Complimenti Davide! Grande ritmo di lettura 👏🔥',
        createdAt: '1 giorno fa'
      }
    ]
  }
];

export const INITIAL_BOOK_CLUBS: BookClub[] = [
  {
    id: 'club-1',
    name: 'Sci-Fi & Mondi Futuri',
    description: 'Il club dedicato agli amanti della fantascienza, del cyberpunk e dei viaggi interstellari.',
    category: 'Fantascienza',
    icon: 'Rocket',
    coverUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=600',
    membersCount: 342,
    isJoined: true,
    currentBook: {
      title: 'Neuromante',
      author: 'William Gibson',
      coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=300',
      progressPercentage: 68
    },
    activeDiscussionCount: 14
  },
  {
    id: 'club-2',
    name: 'Gialli & Thriller Noir',
    description: 'Risolviamo insieme i misteri più fitti della letteratura di suspense moderna e classica.',
    category: 'Mistero',
    icon: 'Glasses',
    coverUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=600',
    membersCount: 518,
    isJoined: false,
    currentBook: {
      title: 'La verità sul caso Harry Quebert',
      author: 'Joël Dicker',
      coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=300',
      progressPercentage: 42
    },
    activeDiscussionCount: 29
  },
  {
    id: 'club-3',
    name: 'I Grandi Classici',
    description: 'Rileggiamo ed analizziamo i capolavori immortali della letteratura mondiale.',
    category: 'Classici',
    icon: 'Crown',
    coverUrl: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&q=80&w=600',
    membersCount: 289,
    isJoined: false,
    currentBook: {
      title: 'Cento anni di solitudine',
      author: 'Gabriel García Márquez',
      coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=300',
      progressPercentage: 85
    },
    activeDiscussionCount: 19
  }
];

export const MOCK_COMMUNITY_LEADERBOARD: ReaderLeaderboardUser[] = [
  {
    id: 'user-elena',
    name: 'Elena Rostagno',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    booksReadThisMonth: 6,
    pagesReadThisMonth: 1840,
    streakDays: 45,
    isFollowing: true,
    rank: 1
  },
  {
    id: 'user-davide',
    name: 'Davide Belluzzo (Tu)',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
    booksReadThisMonth: 5,
    pagesReadThisMonth: 1520,
    streakDays: 14,
    isFollowing: false,
    rank: 2
  },
  {
    id: 'user-matteo',
    name: 'Matteo Ferrari',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    booksReadThisMonth: 4,
    pagesReadThisMonth: 1290,
    streakDays: 28,
    isFollowing: true,
    rank: 3
  },
  {
    id: 'user-giulia',
    name: 'Giulia Conti',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    booksReadThisMonth: 4,
    pagesReadThisMonth: 1150,
    streakDays: 12,
    isFollowing: false,
    rank: 4
  }
];
