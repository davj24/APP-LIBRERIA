import React, { useState } from 'react';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import type { TabType } from './BottomNav';
import { ProfileModal } from '../profile/ProfileModal';
import { SettingsModal } from '../profile/SettingsModal';
import { CameraScannerModal } from '../books/CameraScannerModal';
import { useBooks } from '../../hooks/useBooks';
import { useModal, useRegisterModal } from '../../context/ModalContext';

interface MainLayoutProps {
  children: React.ReactNode;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  activeTab,
  setActiveTab
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const { isModalOpen } = useModal();
  useRegisterModal(isProfileOpen);
  useRegisterModal(isSettingsOpen);
  useRegisterModal(isScannerOpen);

  const { addBook } = useBooks();

  return (
    <div className="min-h-screen bg-[#F4F1EA] dark:bg-[#2A2826] text-[#4A4743] dark:text-[#E0DCD3] flex flex-col antialiased transition-colors duration-200 selection:bg-[#B0BEA9]/30 selection:text-[#31362F] overflow-x-hidden">
      <Header
        activeTab={activeTab}
        onOpenProfile={() => setActiveTab(3)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <main className="flex-1 max-w-md w-full mx-auto px-4 pt-24 pb-32 overflow-hidden">
        {children}
      </main>

      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isModalOpen={isModalOpen}
        onOpenScanner={() => setIsScannerOpen(true)}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <CameraScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onBookScanned={addBook}
      />
    </div>
  );
};
