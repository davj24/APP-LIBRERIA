import { supabase } from '../supabase/client';

export interface UserProfileSocial {
  id: string;
  username: string;
  nome_completo: string;
  avatar_url?: string;
  avatar_color?: string;
  bio?: string;
  friendshipState?: 'nessuna' | 'in_attesa' | 'ricevuta' | 'accettata';
  friendshipId?: string;
}

export interface PendingFriendRequest {
  id: string;
  created_at: string;
  fromUser: UserProfileSocial;
}

export function cleanSocialName(username?: string, fullName?: string): { displayName: string; username: string } {
  const cleanU = (username || '').includes('@') ? username!.split('@')[0] : (username || '');
  const cleanF = (fullName || '').includes('@') ? fullName!.split('@')[0] : (fullName || '');

  // Precedenza al nome utente/nickname scelto (se impostato e non 'utente'), altrimenti al nome proprio
  const chosen = (cleanU && cleanU !== 'utente') ? cleanU : (cleanF || 'Lettore');
  const userHandle = cleanU || chosen.toLowerCase().replace(/\s+/g, '_');

  return {
    displayName: chosen,
    username: userHandle
  };
}

export interface SpuntoSocial {
  id: string;
  user_id: string;
  libro_titolo: string;
  libro_autore?: string;
  libro_copertina?: string;
  testo_spunto: string;
  tipo_spunto: string; // 'Takeaway' | 'Citazione' | 'Recensione' | 'Riflessione'
  created_at: string;
  autore_nome?: string;
  autore_avatar?: string;
  autore_username?: string;
}

const STORAGE_KEY_FRIENDS = 'bibliodesk_social_friends_v1';
const STORAGE_KEY_SPUNTI = 'bibliodesk_social_spunti_v1';

function getLocalSpunti(): SpuntoSocial[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_SPUNTI);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveLocalSpunti(spunti: SpuntoSocial[]) {
  try {
    localStorage.setItem(STORAGE_KEY_SPUNTI, JSON.stringify(spunti));
  } catch (e) {
    console.warn('Failed to save local spunti:', e);
  }
}

function getLocalFriends(): UserProfileSocial[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_FRIENDS);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveLocalFriends(friends: UserProfileSocial[]) {
  try {
    localStorage.setItem(STORAGE_KEY_FRIENDS, JSON.stringify(friends));
  } catch (e) {
    console.warn('Failed to save local friends:', e);
  }
}

/**
 * 1. Cerca utenti nella tabella `profiles` per username o nome scelto.
 * Rimuove categoricamente qualsiasi email e protegge la privacy degli utenti.
 */
export async function searchUsers(query: string): Promise<UserProfileSocial[]> {
  const trimmed = query.trim().replace(/^@+/, '').replace(/[%_,]/g, '');
  if (!trimmed) return [];

  const { data: authData } = await supabase.auth.getUser();
  const currentUserId = authData?.user?.id;

  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url, bio, badge')
    .or(`username.ilike.%${trimmed}%,full_name.ilike.%${trimmed}%`)
    .limit(20);

  if (error) {
    console.warn('Errore ricerca utenti Supabase:', error);
    return [];
  }

  if (!data || data.length === 0) {
    return [];
  }

  const filtered = data.filter(u => u.id !== currentUserId);

  if (!currentUserId || filtered.length === 0) {
    return filtered.map(u => {
      const cleaned = cleanSocialName(u.username, u.full_name);
      return {
        id: u.id,
        username: cleaned.username,
        nome_completo: cleaned.displayName,
        avatar_url: u.avatar_url,
        avatar_color: u.badge || 'bg-gradient-to-tr from-indigo-600 to-violet-600',
        bio: u.bio || '',
        friendshipState: 'nessuna'
      };
    });
  }

  const targetIds = filtered.map(u => u.id);
  const { data: friendships } = await supabase
    .from('friendships')
    .select('*')
    .or(`and(user_id.eq.${currentUserId},friend_id.in.(${targetIds.join(',')})),and(friend_id.eq.${currentUserId},user_id.in.(${targetIds.join(',')}))`);

  return filtered.map(u => {
    const friendship = (friendships || []).find(
      f => (f.user_id === currentUserId && f.friend_id === u.id) || (f.friend_id === currentUserId && f.user_id === u.id)
    );
    const cleaned = cleanSocialName(u.username, u.full_name);

    let state: 'nessuna' | 'in_attesa' | 'ricevuta' | 'accettata' = 'nessuna';
    if (friendship) {
      if (friendship.status === 'accepted' || friendship.status === 'accettata') {
        state = 'accettata';
      } else if (friendship.status === 'pending' || friendship.status === 'in_attesa') {
        state = friendship.user_id === currentUserId ? 'in_attesa' : 'ricevuta';
      }
    }

    return {
      id: u.id,
      username: cleaned.username,
      nome_completo: cleaned.displayName,
      avatar_url: u.avatar_url,
      avatar_color: u.badge || 'bg-gradient-to-tr from-indigo-600 to-violet-600',
      bio: u.bio || '',
      friendshipState: state,
      friendshipId: friendship?.id
    };
  });
}

/**
 * 2. Inserisce una richiesta di amicizia in `friendships` gestendo reciproci e conflitti.
 */
export async function sendFriendRequest(targetUserId: string): Promise<boolean> {
  const { data: authData } = await supabase.auth.getUser();
  const currentUserId = authData?.user?.id;
  if (!currentUserId) throw new Error('Utente non autenticato.');
  if (currentUserId === targetUserId) return false;

  // Controlla se esiste già una relazione tra i due utenti nella tabella friendships
  const { data: existing } = await supabase
    .from('friendships')
    .select('*')
    .or(`and(user_id.eq.${currentUserId},friend_id.eq.${targetUserId}),and(friend_id.eq.${currentUserId},user_id.eq.${targetUserId})`)
    .maybeSingle();

  if (existing) {
    if (existing.status === 'accepted' || existing.status === 'accettata') return true;
    // Se l'altro utente ci aveva già mandato una richiesta, accettala immediatamente
    if (existing.user_id === targetUserId && existing.friend_id === currentUserId) {
      await supabase.from('friendships').update({ status: 'accepted' }).eq('id', existing.id);
      return true;
    }
    return true; // Già inviata in attesa
  }

  const { error } = await supabase
    .from('friendships')
    .insert({
      user_id: currentUserId,
      friend_id: targetUserId,
      status: 'pending'
    });

  if (error && error.code !== '23505') {
    console.error('Errore durante sendFriendRequest:', error);
    throw error;
  }
  return true;
}

/**
 * 3. Recupera le richieste di amicizia ricevute in attesa di risposta.
 */
export async function getPendingFriendRequests(): Promise<PendingFriendRequest[]> {
  try {
    const { data: authData } = await supabase.auth.getUser();
    const currentUserId = authData?.user?.id;
    if (!currentUserId) return [];

    const { data: requests, error } = await supabase
      .from('friendships')
      .select('*')
      .eq('friend_id', currentUserId)
      .in('status', ['pending', 'in_attesa'])
      .order('created_at', { ascending: false });

    if (error || !requests || requests.length === 0) return [];

    const senderIds = requests.map(r => r.user_id);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, bio, badge')
      .in('id', senderIds);

    const profileMap = new Map<string, any>();
    (profiles || []).forEach(p => profileMap.set(p.id, p));

    return requests.map(r => {
      const p = profileMap.get(r.user_id);
      const cleaned = cleanSocialName(p?.username, p?.full_name);
      return {
        id: r.id,
        created_at: r.created_at,
        fromUser: {
          id: r.user_id,
          username: cleaned.username,
          nome_completo: cleaned.displayName,
          avatar_url: p?.avatar_url,
          avatar_color: p?.badge || 'bg-gradient-to-tr from-indigo-600 to-violet-600',
          bio: p?.bio || '',
          friendshipState: 'ricevuta',
          friendshipId: r.id
        }
      };
    });
  } catch (err) {
    console.warn('Errore getPendingFriendRequests:', err);
    return [];
  }
}

/**
 * 4. Aggiorna lo stato di una richiesta di amicizia in 'accepted'.
 */
export async function acceptFriendRequest(friendshipId: string): Promise<boolean> {
  const { error } = await supabase
    .from('friendships')
    .update({ status: 'accepted' })
    .eq('id', friendshipId);

  if (error) {
    console.error('Errore accettazione amicizia:', error);
    throw error;
  }
  return true;
}

/**
 * 5. Rifiuta ed elimina una richiesta di amicizia.
 */
export async function rejectFriendRequest(friendshipId: string): Promise<boolean> {
  const { error } = await supabase
    .from('friendships')
    .delete()
    .eq('id', friendshipId);

  if (error) {
    console.error('Errore rifiuto amicizia:', error);
    throw error;
  }
  return true;
}

/**
 * 6. Rimuove l'amicizia o revoca la richiesta inviata tra due utenti.
 */
export async function removeFriendship(targetUserId: string): Promise<boolean> {
  const { data: authData } = await supabase.auth.getUser();
  const currentUserId = authData?.user?.id;
  if (!currentUserId) return false;

  const { error } = await supabase
    .from('friendships')
    .delete()
    .or(`and(user_id.eq.${currentUserId},friend_id.eq.${targetUserId}),and(friend_id.eq.${currentUserId},user_id.eq.${targetUserId})`);

  if (error) {
    console.error('Errore rimozione amicizia:', error);
    throw error;
  }

  // Aggiorna anche la cache locale rimuovendo l'utente
  const local = getLocalFriends().filter(f => f.id !== targetUserId);
  saveLocalFriends(local);
  return true;
}

/**
 * 7. Recupera l'elenco degli utenti con cui c'è un'amicizia accettata (con cache locale salvaguardata).
 */
export async function getFriends(): Promise<UserProfileSocial[]> {
  const localFriends = getLocalFriends();
  try {
    const { data: authData } = await supabase.auth.getUser();
    const currentUserId = authData?.user?.id;
    if (!currentUserId) return localFriends;

    const { data: friendships, error } = await supabase
      .from('friendships')
      .select('*')
      .in('status', ['accepted', 'accettata'])
      .or(`user_id.eq.${currentUserId},friend_id.eq.${currentUserId}`);

    if (error || !friendships || friendships.length === 0) return [];

    const friendIds = friendships.map(f => (f.user_id === currentUserId ? f.friend_id : f.user_id));

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, bio, badge')
      .in('id', friendIds);

    const friendshipMap = new Map<string, string>();
    friendships.forEach(f => {
      const otherId = f.user_id === currentUserId ? f.friend_id : f.user_id;
      friendshipMap.set(otherId, f.id);
    });

    const remoteFriends: UserProfileSocial[] = (profiles || []).map(p => {
      const cleaned = cleanSocialName(p.username, p.full_name);
      return {
        id: p.id,
        username: cleaned.username,
        nome_completo: cleaned.displayName,
        avatar_url: p.avatar_url || '',
        avatar_color: p.badge || 'bg-gradient-to-tr from-indigo-600 to-violet-600',
        bio: p.bio || '',
        friendshipState: 'accettata',
        friendshipId: friendshipMap.get(p.id)
      };
    });

    saveLocalFriends(remoteFriends);
    return remoteFriends;
  } catch (err) {
    console.warn('Fallback amicizie a locale:', err);
    return localFriends;
  }
}

/**
 * 8. Recupera gli ultimi spunti pubblicati unendo i dati del profilo autore (con cache locale salvaguardata).
 */
export async function getSpuntiFeed(): Promise<SpuntoSocial[]> {
  const localSpunti = getLocalSpunti();

  try {
    const { data: spunti, error } = await supabase
      .from('spunti_social')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30);

    if (error || !spunti || spunti.length === 0) return localSpunti;

    const userIds = Array.from(new Set(spunti.map(s => s.user_id).filter(Boolean)));

    const profileMap: Record<string, { nome: string; avatar: string; username: string }> = {};
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, badge')
        .in('id', userIds);

      (profiles || []).forEach(p => {
        profileMap[p.id] = {
          nome: p.full_name || p.username || 'Lettore BiblioDesk',
          avatar: p.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
          username: p.username || 'utente'
        };
      });
    }

    const remoteSpunti: SpuntoSocial[] = spunti.map(s => ({
      id: s.id?.toString() || Date.now().toString(),
      user_id: s.user_id,
      libro_titolo: s.libro_titolo || 'Senza titolo',
      libro_autore: s.libro_autore || 'Autore sconosciuto',
      libro_copertina: s.libro_copertina || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400',
      testo_spunto: s.testo_spunto || s.testo || '',
      tipo_spunto: s.tipo_spunto || 'Takeaway',
      created_at: s.created_at || new Date().toISOString(),
      autore_nome: profileMap[s.user_id]?.nome || 'Lettore BiblioDesk',
      autore_avatar: profileMap[s.user_id]?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
      autore_username: profileMap[s.user_id]?.username || 'utente'
    }));

    // Merge tra remoto e locale
    const mergedMap = new Map<string, SpuntoSocial>();
    remoteSpunti.forEach(s => mergedMap.set(s.id, s));
    localSpunti.forEach(s => {
      if (!mergedMap.has(s.id)) mergedMap.set(s.id, s);
    });

    const merged = Array.from(mergedMap.values());
    saveLocalSpunti(merged);
    return merged;
  } catch (err) {
    console.warn('Fallback spunti feed a cache locale:', err);
    return localSpunti;
  }
}

/**
 * 9. Pubblica un nuovo spunto associato a auth.uid() con salvataggio locale immediato.
 */
export async function createSpunto(data: {
  libro_titolo: string;
  libro_autore?: string;
  libro_copertina?: string;
  testo_spunto: string;
  tipo_spunto: string;
}): Promise<SpuntoSocial> {
  const { data: authData } = await supabase.auth.getUser();
  const currentUserId = authData?.user?.id || 'offline-user';

  const newSpunto: SpuntoSocial = {
    id: `spunto-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    user_id: currentUserId,
    libro_titolo: data.libro_titolo.trim(),
    libro_autore: data.libro_autore?.trim() || 'Autore sconosciuto',
    libro_copertina: data.libro_copertina?.trim() || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400',
    testo_spunto: data.testo_spunto.trim(),
    tipo_spunto: data.tipo_spunto || 'Takeaway',
    created_at: new Date().toISOString(),
    autore_nome: 'Tu',
    autore_avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
    autore_username: 'tu'
  };

  // 1. Salvataggio locale immediato
  const localCurrent = getLocalSpunti();
  saveLocalSpunti([newSpunto, ...localCurrent]);

  try {
    if (currentUserId !== 'offline-user') {
      const payload = {
        user_id: currentUserId,
        libro_titolo: data.libro_titolo.trim(),
        libro_autore: data.libro_autore?.trim() || null,
        libro_copertina: data.libro_copertina?.trim() || null,
        testo_spunto: data.testo_spunto.trim(),
        tipo_spunto: data.tipo_spunto || 'Takeaway',
      };

      const { data: inserted, error } = await supabase
        .from('spunti_social')
        .insert(payload)
        .select()
        .single();

      if (!error && inserted) {
        const realSpunto: SpuntoSocial = {
          ...newSpunto,
          id: inserted.id?.toString() || newSpunto.id,
          created_at: inserted.created_at || newSpunto.created_at
        };
        const updatedLocal = [realSpunto, ...localCurrent.filter(s => s.id !== newSpunto.id)];
        saveLocalSpunti(updatedLocal);
        return realSpunto;
      }
    }
  } catch (err) {
    console.warn('Pubblicazione cloud spunto offline-first, conservato in locale:', err);
  }

  return newSpunto;
}

/**
 * 10. Recupera lettori suggeriti reali dal database con stato di amicizia aggiornato.
 */
export async function getSuggestedUsers(): Promise<UserProfileSocial[]> {
  try {
    const { data: authData } = await supabase.auth.getUser();
    const currentUserId = authData?.user?.id;

    let query = supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, bio, badge')
      .limit(10);

    if (currentUserId) {
      query = query.neq('id', currentUserId);
    }

    const { data } = await query;
    if (!data || data.length === 0) return [];

    let friendships: any[] = [];
    if (currentUserId && data.length > 0) {
      const targetIds = data.map(u => u.id);
      const { data: rels } = await supabase
        .from('friendships')
        .select('*')
        .or(`and(user_id.eq.${currentUserId},friend_id.in.(${targetIds.join(',')})),and(friend_id.eq.${currentUserId},user_id.in.(${targetIds.join(',')}))`);
      friendships = rels || [];
    }

    return data.map(u => {
      const friendship = friendships.find(
        f => (f.user_id === currentUserId && f.friend_id === u.id) || (f.friend_id === currentUserId && f.user_id === u.id)
      );

      let state: 'nessuna' | 'in_attesa' | 'ricevuta' | 'accettata' = 'nessuna';
      if (friendship) {
        if (friendship.status === 'accepted' || friendship.status === 'accettata') {
          state = 'accettata';
        } else if (friendship.status === 'pending' || friendship.status === 'in_attesa') {
          state = friendship.user_id === currentUserId ? 'in_attesa' : 'ricevuta';
        }
      }

      const cleaned = cleanSocialName(u.username, u.full_name);
      return {
        id: u.id,
        username: cleaned.username,
        nome_completo: cleaned.displayName,
        avatar_url: u.avatar_url || '',
        avatar_color: u.badge || 'bg-gradient-to-tr from-indigo-600 to-violet-600',
        bio: u.bio || '',
        friendshipState: state,
        friendshipId: friendship?.id
      };
    });
  } catch (err) {
    console.warn('Errore durante il recupero dei lettori suggeriti:', err);
    return [];
  }
}

export const socialService = {
  searchUsers,
  sendFriendRequest,
  getPendingFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriendship,
  getFriends,
  getSpuntiFeed,
  createSpunto,
  getSuggestedUsers,
};
