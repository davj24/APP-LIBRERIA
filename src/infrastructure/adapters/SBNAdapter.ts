import type { BookSearchPort } from '../../domain/ports/BookSearchPort';
import type { BookSnippet, BookDetail } from '../../domain/models/Book';

/**
 * Adapter per l'integrazione del catalogo OPAC SBN (Servizio Bibliotecario Nazionale)
 */
export class SBNAdapter implements BookSearchPort {
  private baseUrl = 'https://opac.sbn.it/opac-search-api/search';

  /**
   * Fase 1: Ricerca nel catalogo SBN (BookSnippet)
   */
  async search(query: string): Promise<BookSnippet[]> {
    const trimmed = query.trim();
    if (!trimmed) return [];

    // Parametri di query per OPAC SBN REST API
    const url = `${this.baseUrl}?q=${encodeURIComponent(trimmed)}&maxResults=20`;

    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        console.warn(`[SBNAdapter] HTTP error! status: ${response.status}`);
        return [];
      }

      const data = await response.json();
      const records = data.results || data.items || data.docs || (Array.isArray(data) ? data : []);

      if (!Array.isArray(records)) return [];

      return records.map((item: any, index: number): BookSnippet => {
        const id = item.bid || item.id || item.code || `sbn-${index}-${Date.now()}`;
        const isbn = item.isbn || item.codiceIsbn || item.identifiers?.find((idObj: any) => idObj.type === 'ISBN')?.value || null;
        const title = item.titolo || item.title || 'Titolo non specificato (SBN)';
        const author = item.autore || item.author || item.nomi || 'Autore non specificato';
        const coverUrl = item.cover || item.thumbnail || (isbn ? `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg` : null);

        return {
          id: String(id),
          isbn: isbn ? String(isbn).trim() : null,
          title: String(title).trim(),
          author: Array.isArray(author) ? author.join(', ') : String(author).trim(),
          source: 'SBN',
          coverUrl,
        };
      });
    } catch (error) {
      console.warn('[SBNAdapter] Catalogo OPAC SBN non accessibile direttamente da browser (CORS), procedo con Google Books e Open Library.');
      return [];
    }
  }

  /**
   * Fase 2: Caricamento dettagli dal catalogo SBN (BookDetail)
   */
  async getDetails(id: string, isbn?: string): Promise<BookDetail> {
    try {
      const detailUrl = `${this.baseUrl}/${encodeURIComponent(id)}`;
      const response = await fetch(detailUrl, {
        headers: { 'Accept': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        const info = data.record || data || {};
        const parsedIsbn = info.isbn || isbn || null;

        return {
          id,
          isbn: parsedIsbn,
          title: info.titolo || info.title || 'Titolo non specificato (SBN)',
          author: info.autore || info.author || 'Autore non specificato',
          source: 'SBN',
          coverUrl: info.coverUrl || (parsedIsbn ? `https://covers.openlibrary.org/b/isbn/${parsedIsbn}-M.jpg` : null),
          description: info.descrizione || info.note || null,
          pageCount: info.pagine ? parseInt(info.pagine, 10) : null,
          publisher: info.editore || info.publisher || null,
          publishedYear: info.annoPubblicazione || info.anno ? String(info.annoPubblicazione || info.anno) : null,
        };
      }
    } catch (error) {
      console.warn(`[SBNAdapter] Errore caricamento dettagli SBN per ID ${id}:`, error);
    }

    // Fallback in caso di mancata risposta o errore
    return {
      id,
      isbn: isbn || null,
      title: 'Scheda Catalogo SBN',
      author: 'Autore non disponibile',
      source: 'SBN',
      coverUrl: isbn ? `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg` : null,
      description: 'Dettagli consultabili nel catalogo del Servizio Bibliotecario Nazionale (SBN).',
      pageCount: null,
      publisher: null,
      publishedYear: null,
    };
  }
}
