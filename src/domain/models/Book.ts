export type BookStatus = 'Da leggere' | 'In lettura' | 'Letto';

export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  startDate: string;
  endDate?: string;
  status: BookStatus;
  totalPages?: number;
  pagesRead?: number;
  rating?: number;
  genre?: string;
  subgenre?: string;
  notes?: string;
  isbn?: string;
}
