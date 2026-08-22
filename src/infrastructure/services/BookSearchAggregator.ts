import type { BookSearchPort } from '../../domain/ports/BookSearchPort';
import type { BookSnippet, BookDetail, BookSource } from '../../domain/models/Book';
import { GoogleBooksAdapter } from '../adapters/GoogleBooksAdapter';
import { OpenLibraryAdapter } from '../adapters/OpenLibraryAdapter';
import { SBNAdapter } from '../adapters/SBNAdapter';

/**
 * Orchestratore per la ricerca federata a due fasi (Lazy Hydration).
 * Esegue le chiamate in parallelo verso Google Books, Open Library e SBN,
 * applicando un timeout rigoroso di 3000ms a ciascuna fonte e rimuovendo i duplicati.
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
   * Applica un timeout di 3000ms a una singola Promise di ricerca
   */
  private withTimeout<T>(promise: Promise<T>, timeoutMs = 3000): Promise<T> {
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
   * Esegue la ricerca aggregata in parallelo su tutte le sorgenti
   */
  async aggregateSearch(query: string): Promise<BookSnippet[]> {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return [];

    // Lancio in parallelo con Promise.allSettled e timeout a 3000ms per ciascuna sorgente
    const results = await Promise.allSettled([
      this.withTimeout(this.googleAdapter.search(trimmedQuery)),
      this.withTimeout(this.openLibraryAdapter.search(trimmedQuery)),
      this.withTimeout(this.sbnAdapter.search(trimmedQuery)),
    ]);

    const rawSnippets: BookSnippet[] = [];

    for (const result of results) {
      if (result.status === 'fulfilled' && Array.isArray(result.value)) {
        rawSnippets.push(...result.value);
      } else if (result.status === 'rejected') {
        console.warn('[BookSearchAggregator] Una sorgente di ricerca ha fallito o è andata in timeout:', result.reason);
      }
    }

    // Rimuove i duplicati e restituisce l'array pulito
    return this.removeDuplicates(rawSnippets);
  }

  /**
   * Recupera i dettagli completi del libro dalla sorgente specificata (o tramite fallback Google Books)
   */
  async getDetails(
    id: string,
    source: BookSource,
    isbn?: string,
    title?: string,
    author?: string
  ): Promise<BookDetail> {
    let detail: BookDetail;

    switch (source) {
      case 'Google':
        detail = await this.googleAdapter.getDetails(id, isbn, title, author);
        break;
      case 'OpenLibrary':
        detail = await this.openLibraryAdapter.getDetails(id, isbn, title, author);
        break;
      case 'SBN':
        detail = await this.sbnAdapter.getDetails(id, isbn, title, author);
        break;
      default:
        detail = await this.googleAdapter.getDetails(id, isbn, title, author);
        break;
    }

    // Se la sorgente specifica non ha restituito una descrizione, usiamo GoogleBooksAdapter come super-fallback
    if (!detail.description && (isbn || title)) {
      try {
        const fallbackDetail = await this.googleAdapter.getDetails(id, isbn, title, author);
        if (fallbackDetail.description) {
          detail.description = fallbackDetail.description;
          if (!detail.pageCount) detail.pageCount = fallbackDetail.pageCount;
          if (!detail.publisher) detail.publisher = fallbackDetail.publisher;
          if (!detail.publishedYear) detail.publishedYear = fallbackDetail.publishedYear;
          if (!detail.coverUrl) detail.coverUrl = fallbackDetail.coverUrl;
        }
      } catch (e) {
        console.warn('[BookSearchAggregator] Fallback Google Books non riuscito:', e);
      }
    }

    return detail;
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
   * Pulisce e normalizza i campi di testo per il fallback di deduplicazione
   */
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9àèéìòùáéíóú]/gi, '');
  }

  /**
   * Rimuove i duplicati usando l'ISBN come chiave principale (in una Map)
   * o la combinazione titolo + autore come fallback.
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
