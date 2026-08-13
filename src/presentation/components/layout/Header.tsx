import React from 'react';
import { User, Settings } from 'lucide-react';
import type { TabType } from './BottomNav';

interface HeaderProps {
  activeTab: TabType;
  onOpenProfile?: () => void;
  onOpenSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenProfile,
  onOpenSettings
}) => {
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

        {/* Right Icon Button Group: User & Settings */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenProfile}
            title="Profilo Utente"
            className="w-10 h-10 rounded-full bg-[#EBE5D9]/50 dark:bg-[#383532]/50 backdrop-blur-md border border-[#DCD5C6]/60 dark:border-[#4A4743]/50 flex items-center justify-center text-[#4A4743] dark:text-[#E0DCD3] hover:bg-[#EBE5D9] dark:hover:bg-[#383532] active:scale-95 transition-all shadow-xs"
          >
            <User className="w-5 h-5" />
          </button>

          <button
            onClick={onOpenSettings}
            title="Impostazioni"
            className="w-10 h-10 rounded-full bg-[#EBE5D9]/50 dark:bg-[#383532]/50 backdrop-blur-md border border-[#DCD5C6]/60 dark:border-[#4A4743]/50 flex items-center justify-center text-[#4A4743] dark:text-[#E0DCD3] hover:bg-[#EBE5D9] dark:hover:bg-[#383532] active:scale-95 transition-all shadow-xs"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
