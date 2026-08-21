import { supabase } from '../supabase/client';

export class SupabaseBookRepository {
  /**
   * Recupera la libreria dell'utente dalla tabella `user_books`
   * effettuando una JOIN con la tabella `books` per ottenere titolo e autore (e copertina).
   *
   * @param userId - ID dell'utente
   * @returns I dati della libreria utente o lancia un errore in caso di fallimento
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
      console.error('Errore durante la select da user_books:', error);
      throw error;
    }

    return data;
  }
}
