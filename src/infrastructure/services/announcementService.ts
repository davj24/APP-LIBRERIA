import { supabase } from '../supabase/client';

export interface AppAnnouncement {
  id: string;
  title: string;
  content: string;
  createdAt: number; // Unix timestamp in millisecondi
  author: string;
  tag?: 'Nuovo' | 'Aggiornamento' | 'Avviso' | 'Manutenzione';
  pinned?: boolean;
}

const STORAGE_KEY = 'bibliodesk_announcements_v2';
const READ_KEY = 'bibliodesk_announcements_read_ids';

const INITIAL_ANNOUNCEMENTS: AppAnnouncement[] = [
  {
    id: 'ann-welcome-1',
    title: '🎉 Benvenuto su BiblioDesk!',
    content: 'Siamo felici di darti il benvenuto! In questa sezione troverai tutte le comunicazioni ufficiali, le novità, gli aggiornamenti e gli avvisi dal team di sviluppo.',
    createdAt: Date.now() - 1000 * 60 * 5, // 5 minuti fa
    author: 'Team BiblioDesk',
    tag: 'Nuovo',
    pinned: true
  }
];

export function getRelativeTime(timestamp: number | string): string {
  const time = typeof timestamp === 'number' ? timestamp : new Date(timestamp).getTime();
  if (isNaN(time) || time <= 0) return 'Recente';

  const diffMs = Math.max(0, Date.now() - time);
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);

  if (diffSec < 60) {
    return 'Adesso';
  } else if (diffMin < 60) {
    return `${diffMin} min fa`;
  } else if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? 'ora' : 'ore'} fa`;
  } else if (diffDays < 14) {
    return `${diffDays} ${diffDays === 1 ? 'giorno' : 'giorni'} fa`;
  } else {
    return `${diffWeeks} ${diffWeeks === 1 ? 'settimana' : 'settimane'} fa`;
  }
}

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
          createdAt: item.created_at ? new Date(item.created_at).getTime() : Date.now(),
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

  async addAnnouncement(newAnn: Omit<AppAnnouncement, 'id' | 'createdAt'>): Promise<AppAnnouncement> {
    const now = Date.now();
    const created: AppAnnouncement = {
      ...newAnn,
      id: `ann-${now}`,
      createdAt: now
    };

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
  },

  getUnreadCount(announcements: AppAnnouncement[]): number {
    const readIds = this.getReadIds();
    return announcements.filter(a => !readIds.includes(a.id)).length;
  },

  markAllAsRead(announcements: AppAnnouncement[]): string[] {
    const allIds = announcements.map(a => a.id);
    localStorage.setItem(READ_KEY, JSON.stringify(allIds));
    return allIds;
  },

  markAsRead(id: string): string[] {
    const current = this.getReadIds();
    if (!current.includes(id)) {
      const updated = [...current, id];
      localStorage.setItem(READ_KEY, JSON.stringify(updated));
      return updated;
    }
    return current;
  }
};
