import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../infrastructure/supabase/client';

export interface WishlistItem {
  id: string;
  title: string;
  author: string;
  price?: string;
  coverUrl: string;
}

export type CollectionIconName =
  | 'Heart' | 'Flame' | 'Trophy' | 'Sparkles' | 'BookMarked' | 'Library'
  | 'Star' | 'Crown' | 'Compass' | 'GraduationCap' | 'Coffee' | 'Moon'
  | 'Rocket' | 'Zap' | 'Glasses' | 'Bookmark';

export interface UserCollection {
  id: string;
  name: string;
  description: string;
  iconName: CollectionIconName;
  accentColor: string;
  items: WishlistItem[];
}

export const INITIAL_COLLECTIONS: UserCollection[] = [
  {
    id: 'c1',
    name: 'La mia Wishlist',
    description: 'Libri che desideri acquistare e leggere prossimamente.',
    iconName: 'Heart',
    accentColor: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    items: []
  },
  {
    id: 'c2',
    name: 'In Coda sul Comodino',
    description: 'Titoli già acquistati e in tuo possesso pronti in coda di lettura.',
    iconName: 'Library',
    accentColor: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    items: []
  },
  {
    id: 'c3',
    name: 'I Miei Preferiti',
    description: 'I capolavori indimenticabili che hanno lasciato il segno.',
    iconName: 'Trophy',
    accentColor: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
    items: []
  }
];

const STORAGE_KEY = 'bibliodesk_user_collections_v1';
const UPDATE_EVENT = 'bibliodesk_collections_updated';

function getStoredCollections(): UserCollection[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Errore lettura raccolte da localStorage:', err);
  }
  return INITIAL_COLLECTIONS;
}

export function useCollections() {
  const [collections, setCollections] = useState<UserCollection[]>(getStoredCollections);
  const [isLoadingSync, setIsLoadingSync] = useState(false);

  const saveLocally = useCallback((newCollections: UserCollection[]) => {
    setCollections(newCollections);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newCollections));
      window.dispatchEvent(new CustomEvent(UPDATE_EVENT));
    } catch (e) {
      console.warn('Errore salvataggio raccolte locale:', e);
    }
  }, []);

  const syncFromSupabase = useCallback(async () => {
    try {
      setIsLoadingSync(true);
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) {
        setIsLoadingSync(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_collections')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (!error && data && data.length > 0) {
        const remoteCols: UserCollection[] = data.map((d: any) => ({
          id: d.id.toString(),
          name: d.name,
          description: d.description || '',
          iconName: (d.icon_name as CollectionIconName) || 'Heart',
          accentColor: d.accent_color || INITIAL_COLLECTIONS[0].accentColor,
          items: Array.isArray(d.items) ? d.items : []
        }));

        saveLocally(remoteCols);
      } else if (!error && (!data || data.length === 0)) {
        // Se sul server non ci sono raccolte, inizializziamo con quelle locali
        const current = getStoredCollections();
        for (const col of current) {
          try {
            await supabase.from('user_collections').insert({
              user_id: userId,
              name: col.name,
              description: col.description,
              icon_name: col.iconName,
              accent_color: col.accentColor,
              items: col.items
            });
          } catch (insertErr) {
            console.warn('Errore seed raccolte remote:', insertErr);
          }
        }
      }
    } catch (err) {
      console.warn('Sincronizzazione raccolte fallback a locale:', err);
    } finally {
      setIsLoadingSync(false);
    }
  }, [saveLocally]);

  useEffect(() => {
    const handleSync = () => {
      setCollections(getStoredCollections());
    };

    window.addEventListener(UPDATE_EVENT, handleSync);
    window.addEventListener('storage', handleSync);
    syncFromSupabase();

    return () => {
      window.removeEventListener(UPDATE_EVENT, handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [syncFromSupabase]);

  const addCollection = async (newColData: Omit<UserCollection, 'id' | 'items'>) => {
    const tempId = `col-${Date.now()}`;
    const newCol: UserCollection = {
      ...newColData,
      id: tempId,
      items: []
    };

    const updated = [...collections, newCol];
    saveLocally(updated);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (userId) {
        const { data } = await supabase
          .from('user_collections')
          .insert({
            user_id: userId,
            name: newCol.name,
            description: newCol.description,
            icon_name: newCol.iconName,
            accent_color: newCol.accentColor,
            items: []
          })
          .select()
          .single();

        if (data && data.id) {
          const finalCols = updated.map(c => c.id === tempId ? { ...c, id: data.id.toString() } : c);
          saveLocally(finalCols);
        }
      }
    } catch (err) {
      console.warn('Errore salvataggio remoto raccolta:', err);
    }
  };

  const updateCollection = async (updatedCol: UserCollection) => {
    const updated = collections.map(c => c.id === updatedCol.id ? updatedCol : c);
    saveLocally(updated);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (userId && !updatedCol.id.startsWith('col-') && !updatedCol.id.startsWith('c')) {
        await supabase
          .from('user_collections')
          .update({
            name: updatedCol.name,
            description: updatedCol.description,
            icon_name: updatedCol.iconName,
            accent_color: updatedCol.accentColor,
            items: updatedCol.items,
            updated_at: new Date().toISOString()
          })
          .eq('id', updatedCol.id)
          .eq('user_id', userId);
      }
    } catch (err) {
      console.warn('Errore aggiornamento remoto raccolta:', err);
    }
  };

  const deleteCollection = async (id: string) => {
    const updated = collections.filter(c => c.id !== id);
    saveLocally(updated);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (userId && !id.startsWith('col-') && !id.startsWith('c')) {
        await supabase
          .from('user_collections')
          .delete()
          .eq('id', id)
          .eq('user_id', userId);
      }
    } catch (err) {
      console.warn('Errore eliminazione remota raccolta:', err);
    }
  };

  const addItemToCollection = async (collectionId: string, item: WishlistItem) => {
    const target = collections.find(c => c.id === collectionId);
    if (!target) return;

    if (target.items.some(i => i.title.trim().toLowerCase() === item.title.trim().toLowerCase())) {
      return; // Già presente
    }

    const updatedCol = {
      ...target,
      items: [item, ...target.items]
    };
    await updateCollection(updatedCol);
  };

  const removeItemFromCollection = async (collectionId: string, itemId: string) => {
    const target = collections.find(c => c.id === collectionId);
    if (!target) return;

    const updatedCol = {
      ...target,
      items: target.items.filter(i => i.id !== itemId)
    };
    await updateCollection(updatedCol);
  };

  return {
    collections,
    isLoadingSync,
    addCollection,
    updateCollection,
    deleteCollection,
    addItemToCollection,
    removeItemFromCollection,
    syncFromSupabase
  };
}
