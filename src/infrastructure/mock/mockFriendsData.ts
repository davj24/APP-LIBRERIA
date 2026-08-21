import type { FriendProfile } from '../../domain/models/friend';

export const MOCK_FRIENDS: Record<string, FriendProfile> = {
  'user-elena': {
    id: 'user-elena',
    name: 'Elena Rostagno',
    handle: '@elena_books',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    bio: 'Devoratrice seriale di fantascienza, saggi scientifici e grandi classici del 900. Sempre in cerca di consigli per la prossima lettura!',
    badge: 'Partner di Lettura 📚',
    location: 'Milano, Italia',
    joinedDate: 'Membro dal Gen 2024',
    stats: {
      booksRead: 48,
      pagesRead: 14250,
      streakDays: 14,
      currentlyReadingCount: 1,
      loanCount: 3
    },
    favoriteGenres: ['Fantascienza', 'Saggistica', 'Classici', 'Dystopian'],
    isFriend: true,
    currentlyReading: [
      {
        id: 'reading-1',
        title: 'Dune',
        author: 'Frank Herbert',
        coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400',
        progressPage: 215,
        totalPages: 512
      }
    ],
    recentTakeaways: [
      {
        id: 'tk-1',
        bookTitle: 'Dune',
        content: '«Non devo avere paura. La paura uccide la mente. La paura è la piccola morte che porta con sé l\'annientamento totale.» — Lezione straordinaria sull\'autocontrollo.',
        rating: 5,
        createdAt: '2 ore fa'
      },
      {
        id: 'tk-2',
        bookTitle: '1984',
        content: 'L\'importanza di preservare il linguaggio e il pensiero critico contro ogni manipolazione della realtà.',
        rating: 5,
        createdAt: '3 giorni fa'
      }
    ],
    library: [
      {
        id: 'el-1',
        title: 'Dune',
        author: 'Frank Herbert',
        coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400',
        status: 'in_lettura',
        rating: 5,
        review: 'Capolavoro assoluto della fantascienza world-building ineguagliabile.',
        genre: 'Fantascienza',
        canBorrow: false,
        pageCount: 512
      },
      {
        id: 'el-2',
        title: '1984',
        author: 'George Orwell',
        coverUrl: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=400',
        status: 'letto',
        rating: 5,
        review: 'Un monito senza tempo sulla libertà di pensiero.',
        genre: 'Dystopian',
        canBorrow: true,
        pageCount: 328
      },
      {
        id: 'el-3',
        title: 'Fahrenheit 451',
        author: 'Ray Bradbury',
        coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400',
        status: 'letto',
        rating: 4,
        review: 'Un\'ode toccante all\'importanza dei libri scritti.',
        genre: 'Fantascienza',
        canBorrow: true,
        pageCount: 208
      },
      {
        id: 'el-4',
        title: 'Sapiens: Da animali a dèi',
        author: 'Yuval Noah Harari',
        coverUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400',
        status: 'letto',
        rating: 5,
        review: 'Illuminante sulla storia e i miti condivisi dell\'umanità.',
        genre: 'Saggistica',
        canBorrow: true,
        pageCount: 540
      },
      {
        id: 'el-5',
        title: 'Neuromante',
        author: 'William Gibson',
        coverUrl: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=400',
        status: 'da_leggere',
        genre: 'Cyberpunk',
        canBorrow: true,
        pageCount: 270
      },
      {
        id: 'el-6',
        title: 'Guida Galattica per gli Autostoppisti',
        author: 'Douglas Adams',
        coverUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=400',
        status: 'letto',
        rating: 5,
        review: 'Divertente, assurdo e geniale!',
        genre: 'Umoristico / Fantascienza',
        canBorrow: true,
        pageCount: 224
      }
    ]
  },
  'user-matteo': {
    id: 'user-matteo',
    name: 'Matteo Ferrari',
    handle: '@matteo_reads',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    bio: 'Passionato di thriller psicologici, gialli storici e narrativa spagnola contemporanea.',
    badge: 'Cacciatore di Gialli 🕵️‍♂️',
    location: 'Torino, Italia',
    joinedDate: 'Membro dal Mar 2024',
    stats: {
      booksRead: 34,
      pagesRead: 11200,
      streakDays: 8,
      currentlyReadingCount: 1,
      loanCount: 1
    },
    favoriteGenres: ['Thriller', 'Gialli', 'Narrativa', 'Mistero'],
    isFriend: true,
    currentlyReading: [
      {
        id: 'reading-2',
        title: 'L\'Ombra del Vento',
        author: 'Carlos Ruiz Zafón',
        coverUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400',
        progressPage: 94,
        totalPages: 440
      }
    ],
    recentTakeaways: [
      {
        id: 'tk-3',
        bookTitle: 'L\'Ombra del Vento',
        content: '«Ogni libro possiede un\'anima. L\'anima di chi l\'ha scritto e l\'anima di coloro che l\'hanno letto.»',
        rating: 4,
        createdAt: '3 giorni fa'
      }
    ],
    library: [
      {
        id: 'mf-1',
        title: 'L\'Ombra del Vento',
        author: 'Carlos Ruiz Zafón',
        coverUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400',
        status: 'in_lettura',
        rating: 4,
        genre: 'Mistero / Narrativa',
        canBorrow: false,
        pageCount: 440
      },
      {
        id: 'mf-2',
        title: 'Il Gioco dell\'Angelo',
        author: 'Carlos Ruiz Zafón',
        coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400',
        status: 'da_leggere',
        genre: 'Mistero',
        canBorrow: true,
        pageCount: 520
      },
      {
        id: 'mf-3',
        title: 'La Verità sul Caso Harry Quebert',
        author: 'Joël Dicker',
        coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400',
        status: 'letto',
        rating: 5,
        review: 'Trama avvincente con colpi di scena continui fino all\'ultima pagina.',
        genre: 'Thriller',
        canBorrow: true,
        pageCount: 770
      },
      {
        id: 'mf-4',
        title: 'Uomini che odiano le donne',
        author: 'Stieg Larsson',
        coverUrl: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=400',
        status: 'letto',
        rating: 5,
        review: 'Capostipite del noir nordico eccezionale.',
        genre: 'Thriller / Giallo',
        canBorrow: true,
        pageCount: 676
      }
    ]
  },
  'user-damiano': {
    id: 'user-damiano',
    name: 'Damiano Rinaldi',
    handle: '@damiano_books',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    bio: 'Amante della saggistica storica, filosofia antica e romanzi d\'epoca.',
    badge: 'Storico di Biblioteca 🏛️',
    location: 'Bologna, Italia',
    joinedDate: 'Membro dal Mag 2024',
    stats: {
      booksRead: 29,
      pagesRead: 9800,
      streakDays: 5,
      currentlyReadingCount: 1,
      loanCount: 2
    },
    favoriteGenres: ['Storico', 'Filosofia', 'Saggi', 'Classici'],
    isFriend: true,
    currentlyReading: [
      {
        id: 'reading-3',
        title: 'Il Nome della Rosa',
        author: 'Umberto Eco',
        coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400',
        progressPage: 310,
        totalPages: 503
      }
    ],
    recentTakeaways: [
      {
        id: 'tk-4',
        bookTitle: 'Pensieri',
        content: '«La felicità della tua vita dipende dalla qualità dei tuoi pensieri.» — Marco Aurelio.',
        rating: 5,
        createdAt: '5 giorni fa'
      }
    ],
    library: [
      {
        id: 'dr-1',
        title: 'Il Nome della Rosa',
        author: 'Umberto Eco',
        coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400',
        status: 'in_lettura',
        rating: 5,
        genre: 'Storico / Giallo',
        canBorrow: false,
        pageCount: 503
      },
      {
        id: 'dr-2',
        title: 'Pensieri',
        author: 'Marco Aurelio',
        coverUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400',
        status: 'letto',
        rating: 5,
        review: 'Guida etica fondamentale per la vita quotidiana.',
        genre: 'Filosofia',
        canBorrow: true,
        pageCount: 240
      },
      {
        id: 'dr-3',
        title: 'La Repubblica',
        author: 'Platone',
        coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400',
        status: 'letto',
        rating: 4,
        genre: 'Filosofia',
        canBorrow: true,
        pageCount: 416
      }
    ]
  },
  'user-tommaso': {
    id: 'user-tommaso',
    name: 'Tommaso Valli',
    handle: '@tommy_reads',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=200',
    bio: 'Fanatico di romanzi distopici, graphic novel ed epica fantasy.',
    badge: 'Esploratore Fantasy ⚔️',
    location: 'Firenze, Italia',
    joinedDate: 'Membro dal Giu 2024',
    stats: {
      booksRead: 19,
      pagesRead: 6400,
      streakDays: 3,
      currentlyReadingCount: 1,
      loanCount: 1
    },
    favoriteGenres: ['Fantasy', 'Graphic Novel', 'Distopia'],
    isFriend: true,
    currentlyReading: [
      {
        id: 'reading-4',
        title: '1984',
        author: 'George Orwell',
        coverUrl: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=400',
        progressPage: 140,
        totalPages: 328
      }
    ],
    recentTakeaways: [],
    library: [
      {
        id: 'tv-1',
        title: '1984',
        author: 'George Orwell',
        coverUrl: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=400',
        status: 'in_lettura',
        genre: 'Distopia',
        canBorrow: false,
        pageCount: 328
      },
      {
        id: 'tv-2',
        title: 'Il Signore degli Anelli: La Compagnia dell\'Anello',
        author: 'J.R.R. Tolkien',
        coverUrl: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=400',
        status: 'letto',
        rating: 5,
        review: 'L\'inizio dell\'avventura epica suprema.',
        genre: 'Fantasy',
        canBorrow: true,
        pageCount: 576
      }
    ]
  }
};
