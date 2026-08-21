import { supabase } from '../supabase/client';

export class SupabaseBookRepository {
  /**
   * Recupera la libreria personale dell'utente eseguendo una query alla tabella `user_books`
   * in JOIN con la tabella `books` per ottenere titolo, autore e cover_url.
   */
  async getUserLibrary(userId: string) {
    const { data, error } = await supabase
      .from('user_books')
      .select(`
        id,
        user_id,
        status,
        rating,
        review,
        created_at,
        books (
          id,
          title,
          author,
          cover_url
        )
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('Errore nella query Supabase (getUserLibrary):', error);
      throw new Error(`Errore nel caricamento della libreria per l'utente ${userId}: ${error.message}`);
    }

    return data;
  }
}
