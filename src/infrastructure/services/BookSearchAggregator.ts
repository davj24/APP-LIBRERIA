import type { BookSearchPort } from '../../domain/ports/BookSearchPort';
import type { BookSnippet, BookDetail, BookSource } from '../../domain/models/Book';
import { GoogleBooksAdapter } from '../adapters/GoogleBooksAdapter';
import { OpenLibraryAdapter } from '../adapters/OpenLibraryAdapter';
import { SBNAdapter } from '../adapters/SBNAdapter';

/**
 * Orchestratore per la ricerca federata a due fasi (Lazy Hydration).
 * Esegue le chiamate in parallelo verso Google Books, Open Library e SBN,
 * applicando un timeout di 1500ms a ciascuna fonte per risposte fulminee.
 */
export class BookSearchAggregator {
  private googleAdapter: BookSearchPort;
  private openLibraryAdapter: BookSearchPort;
  private sbnAdapter: BookSearchPort;

  constructor(
    googleAdapter?: BookSearchPort,
    openLibraryAdapter?: BookSearchPort,
    sbnAdapter?: BookSearchPort
  ) {
    this.googleAdapter = googleAdapter || new GoogleBooksAdapter();
    this.openLibraryAdapter = openLibraryAdapter || new OpenLibraryAdapter();
    this.sbnAdapter = sbnAdapter || new SBNAdapter();
  }

  /**
   * Applica un timeout di 1500ms a una singola Promise di ricerca per non rallentare l'UI
   */
  private withTimeout<T>(promise: Promise<T>, timeoutMs = 1500): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Timeout di ${timeoutMs}ms superato per la richiesta`));
      }, timeoutMs);

      promise
        .then((res) => {
          clearTimeout(timer);
          resolve(res);
        })
        .catch((err) => {
          clearTimeout(timer);
          reject(err);
        });
    });
  }

  /**
   * Esegue la ricerca aggregata in parallelo su tutte le sorgenti (Max 1500ms totali)
   */
  async aggregateSearch(query: string): Promise<BookSnippet[]> {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return [];

    // Lancio in parallelo con un timeout sufficiente per rete mobile (4000ms)
    const results = await Promise.allSettled([
      this.withTimeout(this.googleAdapter.search(trimmedQuery), 4000),
      this.withTimeout(this.openLibraryAdapter.search(trimmedQuery), 4000),
      this.withTimeout(this.sbnAdapter.search(trimmedQuery), 3500),
    ]);

    const rawSnippets: BookSnippet[] = [];

    for (const result of results) {
      if (result.status === 'fulfilled' && Array.isArray(result.value)) {
        rawSnippets.push(...result.value);
      }
    }

    return this.removeDuplicates(rawSnippets);
  }

  /**
   * Recupera i dettagli completi del libro in modo mirato e veloce
   */
  async getDetails(
    id: string,
    source: BookSource,
    isbn?: string,
    title?: string,
    author?: string
  ): Promise<BookDetail> {
    let adapter: BookSearchPort;

    if (source === 'OpenLibrary') {
      adapter = this.openLibraryAdapter;
    } else if (source === 'SBN') {
      adapter = this.sbnAdapter;
    } else {
      adapter = this.googleAdapter;
    }

    try {
      const detail = await this.withTimeout(
        adapter.getDetails(id, isbn, title, author),
        1500
      );
      if (detail && detail.description) {
        return detail;
      }
    } catch (e) {
      console.warn('[BookSearchAggregator] Impossibile recuperare dettagli dalla sorgente primaria:', e);
    }

    // Se la sorgente primaria fallisce, usa GoogleBooksAdapter con timeout rapido
    try {
      return await this.withTimeout(
        this.googleAdapter.getDetails(id, isbn, title, author),
        1500
      );
    } catch (e) {
      return {
        id,
        isbn: isbn || null,
        title: title || 'Titolo non disponibile',
        author: author || 'Autore non disponibile',
        source,
        coverUrl: null,
        description: null,
        pageCount: null,
        publisher: null,
        publishedYear: null,
      };
    }
  }

  /**
   * Pulisce e normalizza una stringa ISBN per un confronto accurato
   */
  private normalizeIsbn(isbn: string | null): string | null {
    if (!isbn) return null;
    const cleaned = isbn.replace(/[-_ \s]/g, '').toUpperCase();
    return cleaned.length >= 9 ? cleaned : null;
  }

  /**
   * Normalizza stringhe per la deduplicazione
   */
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9àèéìòùáéíóú]/gi, '');
  }

  /**
   * Rimuove i duplicati in una singola passata Map
   */
  private removeDuplicates(snippets: BookSnippet[]): BookSnippet[] {
    const deduplicatedMap = new Map<string, BookSnippet>();

    for (const snippet of snippets) {
      const cleanIsbn = this.normalizeIsbn(snippet.isbn);
      const key = cleanIsbn
        ? `isbn:${cleanIsbn}`
        : `text:${this.normalizeText(snippet.title)}|${this.normalizeText(snippet.author)}`;

      if (!deduplicatedMap.has(key)) {
        deduplicatedMap.set(key, snippet);
      } else {
        const existing = deduplicatedMap.get(key)!;
        if (!existing.coverUrl && snippet.coverUrl) existing.coverUrl = snippet.coverUrl;
        if (!existing.isbn && snippet.isbn) existing.isbn = snippet.isbn;
        if (!existing.description && snippet.description) existing.description = snippet.description;
        if (!existing.pageCount && snippet.pageCount) existing.pageCount = snippet.pageCount;
        if (!existing.publisher && snippet.publisher) existing.publisher = snippet.publisher;
        if (!existing.publishedYear && snippet.publishedYear) existing.publishedYear = snippet.publishedYear;
      }
    }

    return Array.from(deduplicatedMap.values());
  }
}
