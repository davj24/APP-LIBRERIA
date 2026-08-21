import { supabase } from '../supabase/client';
import type { UserProfile } from '../../domain/models/profile';

export class SupabaseProfileRepository {
  /**
   * Recupera il profilo pubblico dell'utente dalla tabella `profiles`.
   */
  async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Nessun profilo trovato
        return null;
      }
      console.error('Errore getProfile:', error);
      throw error;
    }

    return {
      id: data.id,
      username: data.username || 'utente',
      fullName: data.full_name || 'Utente BiblioDesk',
      avatarUrl: data.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
      bio: data.bio || 'Appassionato lettore su BiblioDesk',
      badge: data.badge || 'Lettore Novizio 📚',
      createdAt: data.created_at
    };
  }

  /**
   * Aggiorna le informazioni del profilo dell'utente.
   */
  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    const payload: any = {};
    if (updates.username) payload.username = updates.username;
    if (updates.fullName) payload.full_name = updates.fullName;
    if (updates.avatarUrl) payload.avatar_url = updates.avatarUrl;
    if (updates.bio) payload.bio = updates.bio;
    if (updates.badge) payload.badge = updates.badge;

    const { error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', userId);

    if (error) {
      console.error('Errore updateProfile:', error);
      throw error;
    }
  }

  /**
   * Cerca amici o lettori nel database tramite username o nome.
   */
  async searchProfiles(query: string): Promise<UserProfile[]> {
    if (!query.trim()) return [];

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
      .limit(10);

    if (error) {
      console.error('Errore searchProfiles:', error);
      throw error;
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      username: row.username || '',
      fullName: row.full_name || 'Lettore',
      avatarUrl: row.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
      bio: row.bio || '',
      badge: row.badge || 'Lettore Novizio 📚',
      createdAt: row.created_at
    }));
  }
}
