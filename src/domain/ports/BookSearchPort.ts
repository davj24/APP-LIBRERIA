import type { BookSnippet, BookDetail } from '../models/Book';

/**
 * Port primario per la ricerca dei libri (Clean Architecture).
 * Definisce l'interfaccia a due fasi (Lazy Hydration):
 * 1. Ricerca iniziale leggera (snippets)
 * 2. Caricamento dettagliato su richiesta (getDetails) con parametri di fallback per titolo ed autore
 */
export interface BookSearchPort {
  /**
   * Esegue la ricerca iniziale e restituisce un array di BookSnippet leggeri
   */
  search(query: string): Promise<BookSnippet[]>;

  /**
   * Recupera i dettagli completi (BookDetail) per uno specifico libro
   */
  getDetails(id: string, isbn?: string, title?: string, author?: string): Promise<BookDetail>;
}
