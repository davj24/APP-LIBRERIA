import type { BookSearchPort } from '../../domain/ports/BookSearchPort';
import type { BookSnippet, BookDetail } from '../../domain/models/Book';

/**
 * Adapter per l'integrazione dell'API pubblica di Google Books
 */
export class GoogleBooksAdapter implements BookSearchPort {
  private baseUrl = 'https://www.googleapis.com/books/v1/volumes';

  /**
   * Ottiene la chiave API dalle variabili d'ambiente se disponibile
   */
  private getApiKeyParam(): string {
    const apiKey = import.meta.env?.VITE_GOOGLE_BOOKS_API_KEY;
    return apiKey ? `&key=${encodeURIComponent(apiKey)}` : '';
  }

  /**
   * Estrae il codice ISBN dagli industryIdentifiers di Google Books
   */
  private extractIsbn(identifiers?: Array<{ type: string; identifier: string }>): string | null {
    if (!identifiers || !Array.isArray(identifiers)) return null;
    const isbn13 = identifiers.find((id) => id.type === 'ISBN_13');
    if (isbn13) return isbn13.identifier;
    const isbn10 = identifiers.find((id) => id.type === 'ISBN_10');
    return isbn10 ? isbn10.identifier : null;
  }

  /**
   * Fase 1: Ricerca di libri leggeri (BookSnippet)
   */
  async search(query: string): Promise<BookSnippet[]> {
    const trimmed = query.trim();
    if (!trimmed) return [];

    const url = `${this.baseUrl}?q=${encodeURIComponent(trimmed)}&maxResults=20${this.getApiKeyParam()}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.warn(`[GoogleBooksAdapter] HTTP error! status: ${response.status}`);
        return [];
      }

      const data = await response.json();
      if (!data.items || !Array.isArray(data.items)) return [];

      return data.items.map((item: any): BookSnippet => {
        const info = item.volumeInfo || {};
        const coverUrl =
          info.imageLinks?.thumbnail ||
          info.imageLinks?.smallThumbnail ||
          null;

        return {
          id: item.id,
          isbn: this.extractIsbn(info.industryIdentifiers),
          title: info.title || 'Titolo sconosciuto',
          author: info.authors ? info.authors.join(', ') : 'Autore sconosciuto',
          source: 'Google',
          coverUrl: coverUrl ? coverUrl.replace(/^http:/, 'https:') : null,
        };
      });
    } catch (error) {
      console.error('[GoogleBooksAdapter] Errore durante la ricerca:', error);
      return [];
    }
  }

  /**
   * Fase 2: Caricamento dettagli completi (BookDetail)
   */
  async getDetails(id: string, isbn?: string): Promise<BookDetail> {
    const apiKeyParam = this.getApiKeyParam();
    let url = `${this.baseUrl}/${encodeURIComponent(id)}${apiKeyParam ? '?' + apiKeyParam.replace('&', '') : ''}`;

    try {
      let response = await fetch(url);

      // Fallback: se l'ID non è un volume ID valido e abbiamo un ISBN, cerchiamo per ISBN
      if (!response.ok && isbn) {
        const searchUrl = `${this.baseUrl}?q=isbn:${encodeURIComponent(isbn)}${apiKeyParam}`;
        response = await fetch(searchUrl);
        if (response.ok) {
          const searchData = await response.json();
          if (searchData.items && searchData.items.length > 0) {
            const item = searchData.items[0];
            return this.mapToDetail(item);
          }
        }
      }

      if (!response.ok) {
        throw new Error(`Google Books API HTTP error: ${response.status}`);
      }

      const item = await response.json();
      return this.mapToDetail(item);
    } catch (error) {
      console.error(`[GoogleBooksAdapter] Errore caricamento dettagli per ID ${id}:`, error);
      // Ritorna una struttura base se fallisce
      return {
        id,
        isbn: isbn || null,
        title: 'Dettagli non disponibili',
        author: 'Sconosciuto',
        source: 'Google',
        coverUrl: null,
        description: null,
        pageCount: null,
        publisher: null,
        publishedYear: null,
      };
    }
  }

  /**
   * Mappa un oggetto volume di Google Books in BookDetail
   */
  private mapToDetail(item: any): BookDetail {
    const info = item.volumeInfo || {};
    const coverUrl =
      info.imageLinks?.thumbnail ||
      info.imageLinks?.smallThumbnail ||
      null;

    const publishedYear = info.publishedDate
      ? info.publishedDate.substring(0, 4)
      : null;

    return {
      id: item.id,
      isbn: this.extractIsbn(info.industryIdentifiers),
      title: info.title || 'Titolo sconosciuto',
      author: info.authors ? info.authors.join(', ') : 'Autore sconosciuto',
      source: 'Google',
      coverUrl: coverUrl ? coverUrl.replace(/^http:/, 'https:') : null,
      description: info.description || null,
      pageCount: info.pageCount || null,
      publisher: info.publisher || null,
      publishedYear,
    };
  }
}
