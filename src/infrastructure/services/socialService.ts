import { supabase } from '../supabase/client';

export interface UserProfileSocial {
  id: string;
  username: string;
  nome_completo: string;
  avatar_url?: string;
  bio?: string;
  friendshipState?: 'nessuna' | 'in_attesa' | 'accettata';
  friendshipId?: string;
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

/**
 * 1. Cerca utenti nella tabella `profili` (con fallback su `profiles`) per username o nome_completo.
 */
export async function searchUsers(query: string): Promise<UserProfileSocial[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const { data: authData } = await supabase.auth.getUser();
  const currentUserId = authData?.user?.id;

  // Tentativo di ricerca su tabella `profili`
  let { data, error } = await supabase
    .from('profili')
    .select('*')
    .or(`username.ilike.%${trimmed}%,nome_completo.ilike.%${trimmed}%`)
    .limit(20);

  // Fallback su tabella `profiles` se `profili` non restituisce risultati o genera errore schema
  if (error || !data || data.length === 0) {
    const { data: fallbackData } = await supabase
      .from('profiles')
      .select('*')
      .or(`username.ilike.%${trimmed}%,full_name.ilike.%${trimmed}%`)
      .limit(20);

    if (fallbackData && fallbackData.length > 0) {
      data = fallbackData.map(r => ({
        id: r.id,
        username: r.username || 'utente',
        nome_completo: r.full_name || r.nome_completo || 'Lettore',
        avatar_url: r.avatar_url,
        bio: r.bio
      }));
    }
  }

  if (!data) return [];

  // Filtra l'utente corrente dai risultati di ricerca
  const filtered = data.filter(u => u.id !== currentUserId);

  if (!currentUserId || filtered.length === 0) {
    return filtered.map(u => ({
      id: u.id,
      username: u.username || 'utente',
      nome_completo: u.nome_completo || u.full_name || 'Lettore',
      avatar_url: u.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
      bio: u.bio || '',
      friendshipState: 'nessuna'
    }));
  }

  // Controlla lo stato delle amicizie nella tabella `amicizie`
  const targetIds = filtered.map(u => u.id);
  const { data: friendships } = await supabase
    .from('amicizie')
    .select('*')
    .or(`and(user_id.eq.${currentUserId},amico_id.in.(${targetIds.join(',')})),and(amico_id.eq.${currentUserId},user_id.in.(${targetIds.join(',')}))`);

  return filtered.map(u => {
    const friendship = (friendships || []).find(
      f => (f.user_id === currentUserId && f.amico_id === u.id) || (f.amico_id === currentUserId && f.user_id === u.id)
    );
    return {
      id: u.id,
      username: u.username || 'utente',
      nome_completo: u.nome_completo || u.full_name || 'Lettore',
      avatar_url: u.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
      bio: u.bio || '',
      friendshipState: friendship ? (friendship.stato as any) : 'nessuna',
      friendshipId: friendship?.id
    };
  });
}

/**
 * 2. Inserisce una riga in `amicizie` con stato 'in_attesa'.
 */
export async function sendFriendRequest(targetUserId: string): Promise<boolean> {
  const { data: authData } = await supabase.auth.getUser();
  const currentUserId = authData?.user?.id;
  if (!currentUserId) throw new Error('Utente non autenticato.');

  const { error } = await supabase
    .from('amicizie')
    .insert({
      user_id: currentUserId,
      amico_id: targetUserId,
      stato: 'in_attesa'
    });

  if (error) {
    console.error('Errore invio richiesta di amicizia:', error);
    throw error;
  }
  return true;
}

/**
 * 3. Aggiorna lo stato di una richiesta di amicizia in 'accettata'.
 */
export async function acceptFriendRequest(friendshipId: string): Promise<boolean> {
  const { error } = await supabase
    .from('amicizie')
    .update({ stato: 'accettata' })
    .eq('id', friendshipId);

  if (error) {
    console.error('Errore accettazione amicizia:', error);
    throw error;
  }
  return true;
}

/**
 * 4. Recupera l'elenco degli utenti con cui c'è un'amicizia accettata.
 */
export async function getFriends(): Promise<UserProfileSocial[]> {
  const { data: authData } = await supabase.auth.getUser();
  const currentUserId = authData?.user?.id;
  if (!currentUserId) return [];

  const { data: friendships, error } = await supabase
    .from('amicizie')
    .select('*')
    .eq('stato', 'accettata')
    .or(`user_id.eq.${currentUserId},amico_id.eq.${currentUserId}`);

  if (error || !friendships || friendships.length === 0) return [];

  const friendIds = friendships.map(f => (f.user_id === currentUserId ? f.amico_id : f.user_id));

  let { data: profiles } = await supabase
    .from('profili')
    .select('*')
    .in('id', friendIds);

  if (!profiles || profiles.length === 0) {
    const { data: fallbackProfiles } = await supabase
      .from('profiles')
      .select('*')
      .in('id', friendIds);
    profiles = fallbackProfiles || [];
  }

  return (profiles || []).map(p => ({
    id: p.id,
    username: p.username || 'amico',
    nome_completo: p.nome_completo || p.full_name || 'Amico Lettore',
    avatar_url: p.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
    bio: p.bio || '',
    friendshipState: 'accettata'
  }));
}

/**
 * 5. Recupera gli ultimi spunti pubblicati unendo i dati del profilo autore.
 */
export async function getSpuntiFeed(): Promise<SpuntoSocial[]> {
  const { data: spunti, error } = await supabase
    .from('spunti_social')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(30);

  if (error || !spunti || spunti.length === 0) return [];

  const userIds = Array.from(new Set(spunti.map(s => s.user_id).filter(Boolean)));

  const profileMap: Record<string, { nome: string; avatar: string; username: string }> = {};
  if (userIds.length > 0) {
    let { data: profiles } = await supabase
      .from('profili')
      .select('*')
      .in('id', userIds);

    if (!profiles || profiles.length === 0) {
      const { data: fallbackProfiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);
      profiles = fallbackProfiles || [];
    }

    (profiles || []).forEach(p => {
      profileMap[p.id] = {
        nome: p.nome_completo || p.full_name || p.username || 'Lettore BiblioDesk',
        avatar: p.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
        username: p.username || 'utente'
      };
    });
  }

  return spunti.map(s => ({
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
}

/**
 * 6. Pubblica un nuovo spunto associato a auth.uid().
 */
export async function createSpunto(data: {
  libro_titolo: string;
  libro_autore?: string;
  libro_copertina?: string;
  testo_spunto: string;
  tipo_spunto: string;
}): Promise<SpuntoSocial> {
  const { data: authData } = await supabase.auth.getUser();
  const currentUserId = authData?.user?.id;
  if (!currentUserId) throw new Error('Devi aver effettuato l\'accesso per condividere uno spunto.');

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

  if (error) {
    console.error('Errore pubblicazione spunto:', error);
    throw error;
  }

  let { data: profile } = await supabase
    .from('profili')
    .select('*')
    .eq('id', currentUserId)
    .single();

  if (!profile) {
    const { data: fallbackProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', currentUserId)
      .single();
    profile = fallbackProfile;
  }

  return {
    id: inserted.id?.toString() || Date.now().toString(),
    user_id: currentUserId,
    libro_titolo: inserted.libro_titolo,
    libro_autore: inserted.libro_autore || '',
    libro_copertina: inserted.libro_copertina || '',
    testo_spunto: inserted.testo_spunto,
    tipo_spunto: inserted.tipo_spunto,
    created_at: inserted.created_at,
    autore_nome: profile?.nome_completo || profile?.full_name || 'Tu',
    autore_avatar: profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
    autore_username: profile?.username || 'tu'
  };
}

export const socialService = {
  searchUsers,
  sendFriendRequest,
  acceptFriendRequest,
  getFriends,
  getSpuntiFeed,
  createSpunto,
};
