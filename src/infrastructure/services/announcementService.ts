import { supabase } from '../supabase/client';

export interface AppAnnouncement {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
  tag?: 'Nuovo' | 'Aggiornamento' | 'Avviso' | 'Manutenzione';
  pinned?: boolean;
}

const STORAGE_KEY = 'bibliodesk_announcements_v1';
const READ_KEY = 'bibliodesk_announcements_read_ids';

const INITIAL_ANNOUNCEMENTS: AppAnnouncement[] = [
  {
    id: 'ann-1',
    title: '🎉 Benvenuto nella nuova versione di BiblioDesk!',
    content: 'Siamo felici di darti il benvenuto! In questa release trovi il nuovo benvenuto personalizzato, BiblioSocial integrato, la ricerca federata su oltre 25M di libri ed il nuovo menù profilo rapido.',
    date: 'Oggi',
    author: 'Team Sviluppo',
    tag: 'Nuovo',
    pinned: true
  },
  {
    id: 'ann-2',
    title: '👥 BiblioSocial: Connetti i tuoi amici di lettura',
    content: 'Puoi cercare lettori reali, inviare richieste di amicizia e condividere spunti di lettura. La scheda globale è sempre a tua disposizione per scoprire nuove idee di lettura.',
    date: 'Ieri',
    author: 'BiblioDesk Dev',
    tag: 'Aggiornamento'
  }
];

export const announcementService = {
  getAnnouncements(): AppAnnouncement[] {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse announcements', e);
      }
    }
    // Salva le notifiche iniziali se non presenti
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ANNOUNCEMENTS));
    return INITIAL_ANNOUNCEMENTS;
  },

  async fetchAnnouncementsRemote(): Promise<AppAnnouncement[]> {
    try {
      const { data, error } = await supabase
        .from('comunicazioni_app')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && Array.isArray(data) && data.length > 0) {
        const remoteList: AppAnnouncement[] = data.map((item: any) => ({
          id: item.id || String(Math.random()),
          title: item.titolo || item.title || 'Comunicazione',
          content: item.contenuto || item.content || '',
          date: item.created_at ? new Date(item.created_at).toLocaleDateString('it-IT') : 'Recente',
          author: item.autore || 'Sviluppatore',
          tag: item.tag || 'Nuovo',
          pinned: Boolean(item.pinned)
        }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteList));
        return remoteList;
      }
    } catch (e) {
      console.warn('Supabase comunicazioni_app fallback a locale:', e);
    }
    return this.getAnnouncements();
  },

  async addAnnouncement(newAnn: Omit<AppAnnouncement, 'id' | 'date'>): Promise<AppAnnouncement> {
    const created: AppAnnouncement = {
      ...newAnn,
      id: `ann-${Date.now()}`,
      date: new Date().toLocaleDateString('it-IT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
    };

    // Tenta il salvataggio remoto su Supabase se la tabella esiste
    try {
      await supabase.from('comunicazioni_app').insert({
        titolo: created.title,
        contenuto: created.content,
        autore: created.author,
        tag: created.tag || 'Nuovo',
        pinned: created.pinned || false
      });
    } catch (e) {
      console.warn('Impossibile inserire comunicazione in Supabase remote, salvataggio locale:', e);
    }

    const current = this.getAnnouncements();
    const updated = [created, ...current];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return created;
  },

  deleteAnnouncement(id: string): AppAnnouncement[] {
    const current = this.getAnnouncements();
    const updated = current.filter(a => a.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  getUnreadCount(announcements: AppAnnouncement[]): number {
    const readIds = this.getReadIds();
    return announcements.filter(a => !readIds.includes(a.id)).length;
  },

  markAllAsRead(announcements: AppAnnouncement[]): void {
    const allIds = announcements.map(a => a.id);
    localStorage.setItem(READ_KEY, JSON.stringify(allIds));
  },

  getReadIds(): string[] {
    const saved = localStorage.getItem(READ_KEY);
    if (saved) {
      try {
        return JSON.parse(saved) || [];
      } catch (e) {
        return [];
      }
    }
    return [];
  }
};
