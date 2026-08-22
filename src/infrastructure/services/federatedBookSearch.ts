import { BookSearchAggregator } from './BookSearchAggregator';
import type { BookDetail } from '../../domain/models/Book';

export interface WebBook {
  id: string;
  title: string;
  author: string;
  coverUrl: string | null;
  description?: string | null;
  totalPages?: number | null;
  genre?: string | null;
  isbn?: string | null;
  publishedYear?: string | null;
  publisher?: string | null;
  source: 'google' | 'openlibrary' | 'sbn';
}

const searchAggregator = new BookSearchAggregator();

/**
 * Fase 1: Ricerca ibrida aggregata nei 3 cataloghi web principali (Google Books + Open Library + OPAC SBN)
 * Esegue le query in parallelo con timeout di 3000ms e rimuove i duplicati.
 */
export async function federatedBookSearch(query: string): Promise<WebBook[]> {
  const searchTerm = query.trim();
  if (!searchTerm || searchTerm.length < 2) return [];

  const snippets = await searchAggregator.aggregateSearch(searchTerm);

  return snippets.map((snippet) => {
    let mappedSource: 'google' | 'openlibrary' | 'sbn' = 'google';
    if (snippet.source === 'OpenLibrary') mappedSource = 'openlibrary';
    if (snippet.source === 'SBN') mappedSource = 'sbn';

    return {
      id: snippet.id,
      title: snippet.title,
      author: snippet.author,
      coverUrl: snippet.coverUrl,
      isbn: snippet.isbn,
      source: mappedSource,
    };
  });
}

/**
 * Fase 2 (Lazy Hydration): Recupera i dettagli completi del libro (BookDetail)
 * invocando l'adapter corrispondente alla sorgente.
 */
export async function getBookDetail(
  id: string,
  source: 'google' | 'openlibrary' | 'sbn',
  isbn?: string | null
): Promise<BookDetail> {
  let mappedSource: 'Google' | 'OpenLibrary' | 'SBN' = 'Google';
  if (source === 'openlibrary') mappedSource = 'OpenLibrary';
  if (source === 'sbn') mappedSource = 'SBN';

  return searchAggregator.getDetails(id, mappedSource, isbn || undefined);
}
