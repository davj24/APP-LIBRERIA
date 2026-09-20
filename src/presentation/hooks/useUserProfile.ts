import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../infrastructure/supabase/client';

export interface UserProfile {
  name: string;
  bio: string;
  readingGoal: number;
  avatarColor: string;
  email?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  selectedWidgets?: string[];
  favoriteGenres?: string[];
  favoriteSubgenres?: Record<string, string[]>;
  isCompleted?: boolean;
}

const DEFAULT_PROFILE: UserProfile = {
  name: 'Lettore BiblioDesk',
  bio: 'Appassionato di lettura su BiblioDesk',
  readingGoal: 24,
  avatarColor: 'from-indigo-600 to-violet-500',
  selectedWidgets: ['read_count', 'reading_count'],
  favoriteGenres: ['Fantasy & Magia', 'Narrativa & Classici'],
  favoriteSubgenres: {},
  isCompleted: true
};

const STORAGE_KEY = 'bibliodesk_user_profile';
const UPDATE_EVENT = 'bibliodesk_profile_updated';

export function isGoogleAvatarUrl(url?: string): boolean {
  if (!url) return false;
  return url.includes('googleusercontent.com') || url.includes('google.com/');
}

export function sanitizeAvatarUrl(url?: string): string | undefined {
  if (!url || isGoogleAvatarUrl(url)) return undefined;
  return url;
}

export function getLatestLocalProfile(): UserProfile {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Rimuovi SEMPRE e IMMEDIATAMENTE l'avatar di Google se presente in localStorage
      if (parsed.avatarUrl && isGoogleAvatarUrl(parsed.avatarUrl)) {
        delete parsed.avatarUrl;
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        } catch (_) {}
      }
      return {
        ...DEFAULT_PROFILE,
        ...parsed,
        avatarUrl: sanitizeAvatarUrl(parsed.avatarUrl),
        isCompleted: parsed.isCompleted !== undefined ? parsed.isCompleted : true,
        selectedWidgets: Array.isArray(parsed.selectedWidgets)
          ? parsed.selectedWidgets
          : DEFAULT_PROFILE.selectedWidgets,
        favoriteGenres: Array.isArray(parsed.favoriteGenres)
          ? parsed.favoriteGenres
          : DEFAULT_PROFILE.favoriteGenres,
        favoriteSubgenres: (parsed.favoriteSubgenres && typeof parsed.favoriteSubgenres === 'object')
          ? parsed.favoriteSubgenres
          : {}
      };
    }
  } catch (err) {
    console.warn('Failed to parse user profile from localStorage:', err);
  }
  return DEFAULT_PROFILE;
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile>(getLatestLocalProfile);

  const reloadProfileFromStorage = useCallback(() => {
    setProfile(getLatestLocalProfile());
  }, []);

  const syncProfileFromSupabase = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!error && data) {
        const current = getLatestLocalProfile();
        // Mai accettare l'avatar di Google
        const cleanRemoteAvatar = sanitizeAvatarUrl(data.avatar_url);

        const merged: UserProfile = {
          ...current,
          name: (data.username && !data.username.includes('@') ? data.username : (data.full_name || current.name)),
          bio: data.bio || current.bio,
          readingGoal: data.reading_goal || current.readingGoal,
          avatarUrl: cleanRemoteAvatar || sanitizeAvatarUrl(current.avatarUrl),
          avatarColor: (data.badge && data.badge.includes('from-')) ? data.badge : current.avatarColor,
          bannerUrl: data.banner_url || current.bannerUrl,
          favoriteGenres: Array.isArray(data.favorite_genres) && data.favorite_genres.length > 0 ? data.favorite_genres : current.favoriteGenres,
          favoriteSubgenres: (data.favorite_subgenres && typeof data.favorite_subgenres === 'object') ? data.favorite_subgenres : current.favoriteSubgenres,
          selectedWidgets: Array.isArray(data.selected_widgets) && data.selected_widgets.length > 0 ? data.selected_widgets : current.selectedWidgets,
          isCompleted: true
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        setProfile(merged);
        window.dispatchEvent(new CustomEvent(UPDATE_EVENT));
      }
    } catch (err) {
      console.warn('Errore syncProfileFromSupabase:', err);
    }
  }, []);

  useEffect(() => {
    syncProfileFromSupabase();

    const handleSync = () => {
      reloadProfileFromStorage();
    };

    window.addEventListener(UPDATE_EVENT, handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      window.removeEventListener(UPDATE_EVENT, handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [reloadProfileFromStorage, syncProfileFromSupabase]);

  const updateProfile = (newProfile: Partial<UserProfile>) => {
    setProfile(prev => {
      const updated = { ...prev, ...newProfile };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent(UPDATE_EVENT));

        // Sincronizza asincronamente su Supabase profiles se sessione attiva
        supabase.auth.getSession().then(({ data: { session } }) => {
          const userId = session?.user?.id;
          if (userId) {
            Promise.resolve(
              supabase.from('profiles').upsert({
                id: userId,
                full_name: updated.name,
                username: updated.name,
                bio: updated.bio || '',
                avatar_url: updated.avatarUrl || null,
                banner_url: updated.bannerUrl || null,
                badge: updated.avatarColor || null,
                reading_goal: updated.readingGoal || 24,
                favorite_genres: updated.favoriteGenres || [],
                favorite_subgenres: updated.favoriteSubgenres || {},
                selected_widgets: updated.selectedWidgets || ['read_count', 'reading_count'],
                updated_at: new Date().toISOString()
              })
            ).then(({ error }: any) => {
              if (error) console.warn('Sync profile to Supabase warning:', error);
            }).catch((err: any) => console.warn('Sync profile to Supabase error:', err));
          }
        });
      } catch (err) {
        console.warn('Failed to save user profile:', err);
      }
      return updated;
    });
  };

  const completeOnboarding = (onboardingData: Partial<UserProfile>) => {
    updateProfile({
      ...onboardingData,
      isCompleted: true
    });
  };

  const getInitials = () => {
    if (!profile.name) return 'D';
    return profile.name.trim().charAt(0).toUpperCase();
  };

  return {
    profile,
    updateProfile,
    completeOnboarding,
    syncProfileFromSupabase,
    initials: getInitials()
  };
}

