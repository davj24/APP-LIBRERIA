import { useState, useEffect } from 'react';

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
  isCompleted?: boolean;
}

const DEFAULT_PROFILE: UserProfile = {
  name: 'Nuovo Lettore',
  bio: 'Appassionato di lettura su BiblioDesk',
  readingGoal: 24,
  avatarColor: 'from-indigo-600 to-violet-500',
  selectedWidgets: ['read_count', 'reading_count'],
  favoriteGenres: ['🐉 Fantasy', '📚 Narrativa'],
  isCompleted: false
};

const STORAGE_KEY = 'bibliodesk_user_profile';

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_PROFILE,
          ...parsed,
          selectedWidgets: (parsed.selectedWidgets && Array.isArray(parsed.selectedWidgets) && parsed.selectedWidgets.length > 0)
            ? parsed.selectedWidgets
            : DEFAULT_PROFILE.selectedWidgets,
          favoriteGenres: (parsed.favoriteGenres && Array.isArray(parsed.favoriteGenres))
            ? parsed.favoriteGenres
            : DEFAULT_PROFILE.favoriteGenres
        };
      }
      return DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch (err) {
      console.warn('Failed to save user profile:', err);
    }
  }, [profile]);

  const updateProfile = (newProfile: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...newProfile }));
  };

  const completeOnboarding = (onboardingData: Partial<UserProfile>) => {
    setProfile(prev => ({
      ...prev,
      ...onboardingData,
      isCompleted: true
    }));
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
