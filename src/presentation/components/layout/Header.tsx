import React from 'react';
import { User, Settings, Megaphone } from 'lucide-react';
import type { TabType } from './BottomNav';
import { useUserProfile } from '../../hooks/useUserProfile';

interface HeaderProps {
  activeTab: TabType;
  onOpenProfile?: () => void;
  onOpenAnnouncements?: () => void;
  onOpenSettings?: () => void;
  hasUnreadAnnouncements?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenProfile,
  onOpenAnnouncements,
  onOpenSettings,
  hasUnreadAnnouncements = false
}) => {
  const { profile } = useUserProfile();

  const getPageTitle = (tab: TabType): string => {
    switch (tab) {
      case 0:
        return 'La mia Libreria';
      case 1:
        return 'BiblioSocial';
      case 2:
        return 'Statistiche';
      case 3:
        return 'Profilo';
      default:
        return 'La mia Libreria';
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 w-full bg-[#F4F1EA]/90 dark:bg-[#2A2826]/90 backdrop-blur-md border-b border-[#EBE5D9] dark:border-[#4A4743]/50 pt-[env(safe-area-inset-top,1rem)] pt-4 px-6 pb-4 transition-all">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Dynamic Page Title */}
        <h1 className="text-xl font-black tracking-tight text-[#4A4743] dark:text-[#E0DCD3]">
          {getPageTitle(activeTab)}
        </h1>

        {/* Right Icon Button Group: Announcements, User & Settings */}
        <div className="flex items-center gap-2">
          {/* Comunicazioni dall'App */}
          <button
            onClick={onOpenAnnouncements}
            title="Comunicazioni dall'App"
            className="relative w-10 h-10 rounded-full bg-[#EBE5D9]/50 dark:bg-[#383532]/50 backdrop-blur-md border border-[#DCD5C6]/60 dark:border-[#4A4743]/50 flex items-center justify-center text-[#4A4743] dark:text-[#E0DCD3] hover:bg-[#EBE5D9] dark:hover:bg-[#383532] active:scale-95 transition-all shadow-xs cursor-pointer"
          >
            <Megaphone className="w-4 h-4 text-[#5C6B55] dark:text-[#A8BB9C]" />
            {hasUnreadAnnouncements && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-[#F4F1EA] dark:ring-[#2A2826] animate-pulse" />
            )}
          </button>

          {/* Scheda Profilo */}
          <button
            onClick={onOpenProfile}
            title="Scheda Profilo"
            className="w-10 h-10 rounded-full bg-[#EBE5D9]/50 dark:bg-[#383532]/50 backdrop-blur-md border border-[#DCD5C6]/60 dark:border-[#4A4743]/50 flex items-center justify-center text-[#4A4743] dark:text-[#E0DCD3] hover:bg-[#EBE5D9] dark:hover:bg-[#383532] active:scale-95 transition-all shadow-xs overflow-hidden cursor-pointer"
          >
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5" />
            )}
          </button>

          {/* Impostazioni */}
          <button
            onClick={onOpenSettings}
            title="Impostazioni"
            className="w-10 h-10 rounded-full bg-[#EBE5D9]/50 dark:bg-[#383532]/50 backdrop-blur-md border border-[#DCD5C6]/60 dark:border-[#4A4743]/50 flex items-center justify-center text-[#4A4743] dark:text-[#E0DCD3] hover:bg-[#EBE5D9] dark:hover:bg-[#383532] active:scale-95 transition-all shadow-xs cursor-pointer"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
