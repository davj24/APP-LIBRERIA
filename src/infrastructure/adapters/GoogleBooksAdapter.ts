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
   * Fase 1: Ricerca di libri leggeri (BookSnippet) arricchiti con i dati pronti
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
      });
    } catch (error) {
      console.error('[GoogleBooksAdapter] Errore durante la ricerca:', error);
      return [];
    }
  }

  /**
   * Fase 2: Caricamento dettagli completi (BookDetail) con pulizia dell'ID e fallback robusti
   */
  async getDetails(id: string, isbn?: string, title?: string, author?: string): Promise<BookDetail> {
    const apiKeyParam = this.getApiKeyParam();
    // Rimuove eventuali prefissi 'gb-', 'ol-', 'sbn-' per ottenere il vero volume ID Google
    const cleanId = id.replace(/^(gb-|ol-|sbn-)/, '');

    try {
      // 1. Prova prima il recupero diretto tramite Volume ID
      if (cleanId && !cleanId.includes('-')) {
        const url = `${this.baseUrl}/${encodeURIComponent(cleanId)}${apiKeyParam ? '?' + apiKeyParam.replace('&', '') : ''}`;
        const response = await fetch(url);
        if (response.ok) {
          const item = await response.json();
          const detail = this.mapToDetail(item);
          if (detail.description) return detail;
        }
      }

      // 2. Fallback per ISBN se la chiamata per ID fallisce o non ha descrizione
      if (isbn && isbn.trim()) {
        const searchUrl = `${this.baseUrl}?q=isbn:${encodeURIComponent(isbn.trim())}${apiKeyParam}`;
        const isbnResp = await fetch(searchUrl);
        if (isbnResp.ok) {
          const isbnData = await isbnResp.json();
          if (isbnData.items && isbnData.items.length > 0) {
            return this.mapToDetail(isbnData.items[0]);
          }
        }
      }

      // 3. Fallback per Titolo e Autore se l'ISBN non ha dato risultati
      if (title && title.trim()) {
        const searchTerms = `${title.trim()} ${author ? author.trim() : ''}`.trim();
        const searchUrl = `${this.baseUrl}?q=${encodeURIComponent(searchTerms)}&maxResults=5${apiKeyParam}`;
        const textResp = await fetch(searchUrl);
        if (textResp.ok) {
          const textData = await textResp.json();
          if (textData.items && textData.items.length > 0) {
            // Cerca il primo risultato che abbia una descrizione
            const withDesc = textData.items.find((it: any) => it.volumeInfo?.description);
            return this.mapToDetail(withDesc || textData.items[0]);
          }
        }
      }
    } catch (error) {
      console.warn(`[GoogleBooksAdapter] Errore dettagli per ID ${id}:`, error);
    }

    // Struttura base di ripiego se tutto fallisce
    return {
      id,
      isbn: isbn || null,
      title: title || 'Titolo non disponibile',
      author: author || 'Autore non disponibile',
      source: 'Google',
      coverUrl: null,
      description: null,
      pageCount: null,
      publisher: null,
      publishedYear: null,
    };
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
