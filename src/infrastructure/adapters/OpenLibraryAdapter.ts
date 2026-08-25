import type { BookSearchPort } from '../../domain/ports/BookSearchPort';
import type { BookSnippet, BookDetail } from '../../domain/models/Book';

/**
 * Adapter per l'integrazione dell'API pubblica di Open Library
 */
export class OpenLibraryAdapter implements BookSearchPort {
  private searchUrl = 'https://openlibrary.org/search.json';

  /**
   * Fase 1: Ricerca di libri leggeri (BookSnippet)
   */
  async search(query: string): Promise<BookSnippet[]> {
    const trimmed = query.trim();
    if (!trimmed) return [];
    const cleanIsbn = trimmed.replace(/[-_ \s]/g, '');
    const isIsbn = /^\d{9,13}$/.test(cleanIsbn);

    // 1. Ricerca diretta ISBN tramite API Data per risposta fulminea
    if (isIsbn) {
      try {
        const bibKey = `ISBN:${cleanIsbn}`;
        const bibUrl = `https://openlibrary.org/api/books?bibkeys=${encodeURIComponent(bibKey)}&format=json&jscmd=data`;
        const bibResp = await fetch(bibUrl);
        if (bibResp.ok) {
          const bibData = await bibResp.json();
          const bookObj = bibData[bibKey];
          if (bookObj && bookObj.title) {
            return [{
              id: `ol-isbn-${cleanIsbn}`,
              isbn: cleanIsbn,
              title: bookObj.title,
              author: bookObj.authors ? bookObj.authors.map((a: any) => a.name).join(', ') : 'Autore non specificato',
              source: 'OpenLibrary',
              coverUrl: bookObj.cover?.medium || bookObj.cover?.large || `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-M.jpg`,
              description: typeof bookObj.notes === 'string' ? bookObj.notes : bookObj.notes?.value || null,
              pageCount: bookObj.number_of_pages || null,
              publisher: bookObj.publishers ? bookObj.publishers.map((p: any) => p.name).join(', ') : null,
              publishedYear: bookObj.publish_date ? bookObj.publish_date.substring(0, 4) : null,
            }];
          }
        }
      } catch (err) {
        console.warn('[OpenLibraryAdapter] Direct ISBN fetch error:', err);
      }
    }

    const searchQuery = isIsbn ? `isbn:${cleanIsbn}` : trimmed;
    const url = `${this.searchUrl}?q=${encodeURIComponent(searchQuery)}&limit=20`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.warn(`[OpenLibraryAdapter] HTTP error! status: ${response.status}`);
        return [];
      }

      const data = await response.json();
      if (!data.docs || !Array.isArray(data.docs)) return [];

      return data.docs.map((doc: any): BookSnippet => {
        const key = doc.key ? doc.key.replace('/works/', '') : `ol-${Math.random().toString(36).substring(2, 9)}`;
        const isbn = doc.isbn && doc.isbn.length > 0 ? doc.isbn[0] : null;
        const coverUrl = doc.cover_i
          ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
          : null;

        return {
          id: key,
          isbn,
          title: doc.title || 'Titolo sconosciuto',
          author: doc.author_name ? doc.author_name.join(', ') : 'Autore sconosciuto',
          source: 'OpenLibrary',
          coverUrl,
        };
      });
    } catch (error) {
      console.error('[OpenLibraryAdapter] Errore durante la ricerca:', error);
      return [];
    }
  }

  /**
   * Fase 2: Caricamento dettagli completi (BookDetail)
   */
  async getDetails(id: string, isbn?: string): Promise<BookDetail> {
    try {
      let description: string | null = null;
      let pageCount: number | null = null;
      let publisher: string | null = null;
      let publishedYear: string | null = null;
      let title = 'Titolo sconosciuto';
      let author = 'Autore sconosciuto';
      let coverUrl: string | null = null;

      // 1. Prova prima l'API Data di Open Library via ISBN se disponibile
      if (isbn) {
        const bibKey = `ISBN:${isbn}`;
        const bibUrl = `https://openlibrary.org/api/books?bibkeys=${encodeURIComponent(bibKey)}&format=json&jscmd=data`;
        const bibResponse = await fetch(bibUrl);

        if (bibResponse.ok) {
          const bibData = await bibResponse.json();
          const bookObj = bibData[bibKey];
          if (bookObj) {
            title = bookObj.title || title;
            author = bookObj.authors ? bookObj.authors.map((a: any) => a.name).join(', ') : author;
            coverUrl = bookObj.cover?.medium || bookObj.cover?.large || null;
            publisher = bookObj.publishers ? bookObj.publishers.map((p: any) => p.name).join(', ') : null;
            publishedYear = bookObj.publish_date ? bookObj.publish_date.substring(0, 4) : null;
            pageCount = bookObj.number_of_pages || null;

            if (typeof bookObj.notes === 'string') {
              description = bookObj.notes;
            } else if (bookObj.notes && typeof bookObj.notes.value === 'string') {
              description = bookObj.notes.value;
            }
          }
        }
      }

      // 2. Se manca la descrizione o l'ID è un Works Key di Open Library, interroga la Works API
      if (!description && id) {
        const workPath = id.startsWith('/') ? id : `/works/${id}`;
        const workUrl = `https://openlibrary.org${workPath}.json`;
        const workResponse = await fetch(workUrl);

        if (workResponse.ok) {
          const workData = await workResponse.json();
          if (workData.title && title === 'Titolo sconosciuto') {
            title = workData.title;
          }

          if (typeof workData.description === 'string') {
            description = workData.description;
          } else if (workData.description && typeof workData.description.value === 'string') {
            description = workData.description.value;
          }
        }
      }

      return {
        id,
        isbn: isbn || null,
        title,
        author,
        source: 'OpenLibrary',
        coverUrl,
        description,
        pageCount,
        publisher,
        publishedYear,
      };
    } catch (error) {
      console.error(`[OpenLibraryAdapter] Errore dettagli per ID ${id}:`, error);
      return {
        id,
        isbn: isbn || null,
        title: 'Dettagli non disponibili',
        author: 'Autore sconosciuto',
        source: 'OpenLibrary',
        coverUrl: null,
        description: null,
        pageCount: null,
        publisher: null,
        publishedYear: null,
      };
    }
  }
}
