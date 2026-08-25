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

  const rawSnippets = await searchAggregator.aggregateSearch(searchTerm);
  const cleanQueryIsbn = searchTerm.replace(/[-_ \s]/g, '').toUpperCase();
  const isIsbnSearch = /^\d{9,13}$/.test(cleanQueryIsbn);

  // Filter out placeholder titles ('Titolo sconosciuto', 'Titolo non specificato')
  const validSnippets = rawSnippets.filter((s) => {
    if (!s.title || !s.title.trim()) return false;
    const lower = s.title.toLowerCase();
    return !lower.includes('titolo sconosciuto') && !lower.includes('titolo non specificato');
  });

  const finalSnippets = validSnippets.length > 0 ? validSnippets : rawSnippets.filter(s => s.title && s.title.trim().length > 0);

  // Sorting / Ranking (Fact Checking): Prioritize matching ISBN and completeness
  finalSnippets.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    if (a.coverUrl) scoreA += 3;
    if (b.coverUrl) scoreB += 3;

    if (a.author && !a.author.toLowerCase().includes('sconosciuto')) scoreA += 2;
    if (b.author && !b.author.toLowerCase().includes('sconosciuto')) scoreB += 2;

    if (a.description) scoreA += 2;
    if (b.description) scoreB += 2;

    if (isIsbnSearch) {
      if (a.isbn && a.isbn.replace(/[-_ \s]/g, '').toUpperCase() === cleanQueryIsbn) scoreA += 6;
      if (b.isbn && b.isbn.replace(/[-_ \s]/g, '').toUpperCase() === cleanQueryIsbn) scoreB += 6;
    }

    return scoreB - scoreA;
  });

  return finalSnippets.map((snippet) => {
    let mappedSource: 'google' | 'openlibrary' | 'sbn' = 'google';
    if (snippet.source === 'OpenLibrary') mappedSource = 'openlibrary';
    if (snippet.source === 'SBN') mappedSource = 'sbn';

    return {
      id: snippet.id,
      title: snippet.title,
      author: snippet.author,
      coverUrl: snippet.coverUrl,
      isbn: snippet.isbn || (isIsbnSearch ? cleanQueryIsbn : null),
      description: snippet.description || null,
      totalPages: snippet.pageCount || null,
      publisher: snippet.publisher || null,
      publishedYear: snippet.publishedYear || null,
      source: mappedSource,
    };
  });
}

/**
 * Fase 2 (Lazy Hydration): Recupera i dettagli completi del libro (BookDetail)
 * invocando l'adapter corrispondente alla sorgente con fallback automatici.
 */
export async function getBookDetail(
  id: string,
  source: 'google' | 'openlibrary' | 'sbn',
  isbn?: string | null,
  title?: string | null,
  author?: string | null
): Promise<BookDetail> {
  let mappedSource: 'Google' | 'OpenLibrary' | 'SBN' = 'Google';
  if (source === 'openlibrary') mappedSource = 'OpenLibrary';
  if (source === 'sbn') mappedSource = 'SBN';

  return searchAggregator.getDetails(
    id,
    mappedSource,
    isbn || undefined,
    title || undefined,
    author || undefined
  );
}
