import { supabase } from '../supabase/client';
import type { BookTakeaway, LivePresence } from '../../domain/models/social';
import type { UserProfile } from '../../domain/models/profile';

export class SupabaseSocialRepository {
  /**
   * Recupera la lista degli amici dell'utente dalla tabella `friendships` in JOIN con `profiles`.
   */
  async getFriends(userId: string): Promise<UserProfile[]> {
    const { data, error } = await supabase
      .from('friendships')
      .select(`
        friend_id,
        profiles:friend_id (*)
      `)
      .eq('user_id', userId)
      .eq('status', 'accepted');

    if (error) {
      console.error('Errore getFriends:', error);
      throw error;
    }

    return (data || []).map((item: any) => {
      const p = item.profiles;
      return {
        id: p.id,
        username: p.username || 'amico',
        fullName: p.full_name || 'Amico BiblioDesk',
        avatarUrl: p.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        bio: p.bio || '',
        badge: p.badge || 'Lettore Accanito 📚',
        createdAt: p.created_at
      };
    });
  }

  /**
   * Aggiunge un amico creando un record bidirezionale nella tabella `friendships`.
   */
  async addFriend(userId: string, friendId: string): Promise<void> {
    const { error } = await supabase.from('friendships').insert([
      { user_id: userId, friend_id: friendId, status: 'accepted' },
      { user_id: friendId, friend_id: userId, status: 'accepted' }
    ]);

    if (error && error.code !== '23505') { // Ignora se esiste già
      console.error('Errore addFriend:', error);
      throw error;
    }
  }

  /**
   * Recupera gli spunti recenti (Feed Amici o Feed Globale) in JOIN con la tabella `profiles`.
   */
  async getTakeaways(feedType: 'amici' | 'globale', userId?: string): Promise<BookTakeaway[]> {
    let query = supabase
      .from('takeaways')
      .select(`
        id,
        user_id,
        book_title,
        book_author,
        content,
        rating,
        privacy,
        created_at,
        profiles:user_id (id, full_name, avatar_url)
      `)
      .order('created_at', { ascending: false })
      .limit(20);

    if (feedType === 'amici' && userId) {
      query = query.eq('privacy', 'public');
    } else {
      query = query.eq('privacy', 'public');
    }

    const { data, error } = await query;

    if (error) {
      console.error('Errore getTakeaways:', error);
      throw error;
    }

    return (data || []).map((row: any) => {
      const profile = row.profiles || {};
      const createdAtDate = new Date(row.created_at);
      const timeDiffHours = Math.round((Date.now() - createdAtDate.getTime()) / (1000 * 60 * 60));
      const formattedTime = timeDiffHours < 1 ? 'Poco fa' : timeDiffHours < 24 ? `${timeDiffHours} ore fa` : `${Math.floor(timeDiffHours / 24)} gg fa`;

      return {
        id: row.id,
        userId: row.user_id,
        userName: profile.full_name || 'Lettore',
        userAvatar: profile.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        bookTitle: row.book_title,
        bookAuthor: row.book_author,
        content: row.content,
        rating: row.rating || 5,
        privacy: row.privacy || 'public',
        likesCount: 0,
        isLiked: false,
        createdAt: formattedTime
      };
    });
  }

  /**
   * Pubblica un nuovo spunto o recensione nel feed Supabase.
   */
  async createTakeaway(
    userId: string, 
    takeaway: { bookTitle: string; bookAuthor: string; content: string; rating: number; privacy: 'public' | 'friends' | 'private' }
  ): Promise<void> {
    const { error } = await supabase.from('takeaways').insert({
      user_id: userId,
      book_title: takeaway.bookTitle,
      book_author: takeaway.bookAuthor,
      content: takeaway.content,
      rating: takeaway.rating,
      privacy: takeaway.privacy
    });

    if (error) {
      console.error('Errore createTakeaway:', error);
      throw error;
    }
  }

  /**
   * Recupera la presenza in lettura live degli amici.
   */
  async getLivePresences(): Promise<LivePresence[]> {
    const { data, error } = await supabase
      .from('reading_presences')
      .select(`
        id,
        user_id,
        book_title,
        book_author,
        cover_url,
        progress_page,
        total_pages,
        is_reading_now,
        profiles:user_id (id, full_name, avatar_url)
      `)
      .eq('is_reading_now', true)
      .order('updated_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Errore getLivePresences:', error);
      return [];
    }

    return (data || []).map((row: any) => {
      const p = row.profiles || {};
      return {
        id: row.id,
        userId: row.user_id,
        userName: p.full_name || 'Lettore',
        userAvatar: p.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        bookTitle: row.book_title,
        bookAuthor: row.book_author,
        bookCover: row.cover_url || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400',
        progressPage: row.progress_page || 0,
        totalPages: row.total_pages || 100,
        isReadingNow: true
      };
    });
  }

  /**
   * Aggiorna lo stato di lettura in tempo reale dell'utente corrente.
   */
  async updateLivePresence(
    userId: string,
    presence: { bookTitle: string; bookAuthor: string; coverUrl?: string; progressPage: number; totalPages: number }
  ): Promise<void> {
    const { error } = await supabase.from('reading_presences').upsert({
      user_id: userId,
      book_title: presence.bookTitle,
      book_author: presence.bookAuthor,
      cover_url: presence.coverUrl,
      progress_page: presence.progressPage,
      total_pages: presence.totalPages,
      is_reading_now: true,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });

    if (error) {
      console.error('Errore updateLivePresence:', error);
    }
  }
}
