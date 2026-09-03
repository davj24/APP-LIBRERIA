import { useState, useEffect, useCallback } from 'react';

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

function getLatestLocalProfile(): UserProfile {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_PROFILE,
        ...parsed,
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

  useEffect(() => {
    const handleSync = () => {
      reloadProfileFromStorage();
    };

    window.addEventListener(UPDATE_EVENT, handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      window.removeEventListener(UPDATE_EVENT, handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [reloadProfileFromStorage]);

  const updateProfile = (newProfile: Partial<UserProfile>) => {
    setProfile(prev => {
      const updated = { ...prev, ...newProfile };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent(UPDATE_EVENT));
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
    initials: getInitials()
  };
}

