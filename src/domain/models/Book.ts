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

/**
 * Sorgenti disponibili per la ricerca dei libri
 */
export type BookSource = 'Google' | 'OpenLibrary' | 'SBN';

/**
 * Snippet essenziale per il primo livello di ricerca (Fase 1: Lazy Hydration)
 */
export interface BookSnippet {
  id: string;
  isbn: string | null;
  title: string;
  author: string;
  source: BookSource;
  coverUrl: string | null;
}

/**
 * Dettaglio completo del libro ottenuto su richiesta (Fase 2: Lazy Hydration)
 */
export interface BookDetail extends BookSnippet {
  description?: string | null;
  pageCount?: number | null;
  publisher?: string | null;
  publishedYear?: string | null;
}
