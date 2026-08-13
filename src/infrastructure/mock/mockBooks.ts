import type { Book } from '../../domain/models/Book';

export const INITIAL_MOCK_BOOKS: Book[] = [
  {
    id: '1',
    title: "L'Ombra del Vento",
    author: 'Carlos Ruiz Zafón',
    coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400',
    startDate: '2026-08-01',
    endDate: '',
    status: 'In lettura',
    totalPages: 528,
    pagesRead: 340,
    rating: 5,
    genre: 'Mistero & Romanzo'
  },
  {
    id: '2',
    title: '1984',
    author: 'George Orwell',
    coverUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400',
    startDate: '2026-07-10',
    endDate: '2026-07-25',
    status: 'Letto',
    totalPages: 328,
    pagesRead: 328,
    rating: 5,
    genre: 'Dystopian Sci-Fi'
  },
  {
    id: '3',
    title: 'Dune',
    author: 'Frank Herbert',
    coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400',
    startDate: '',
    endDate: '',
    status: 'Da leggere',
    totalPages: 688,
    pagesRead: 0,
    genre: 'Fantascienza'
  }
];
