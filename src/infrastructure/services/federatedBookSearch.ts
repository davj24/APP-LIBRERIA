import { BookSearchAggregator } from './BookSearchAggregator';

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
  source: 'google' | 'openlibrary' | 'sbn';
}

const searchAggregator = new BookSearchAggregator();

/**
 * federatedBookSearch - Ricerca ibrida aggregata nei 3 cataloghi web principali:
 * 1. Google Books API
 * 2. Open Library API
 * 3. OPAC SBN (Servizio Bibliotecario Nazionale)
 * 
 * Esegue le query in parallelo con timeout di 3000ms e rimuove automaticamente i duplicati.
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
