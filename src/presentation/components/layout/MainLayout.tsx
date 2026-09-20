import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import type { TabType } from './BottomNav';
import { CompactProfileSheet } from '../profile/CompactProfileSheet';
import { SettingsModal } from '../profile/SettingsModal';
import { AnnouncementsModal } from '../announcements/AnnouncementsModal';
import { CameraScannerModal } from '../books/CameraScannerModal';
import { AddBookModal } from '../books/AddBookModal';
import { useBooks } from '../../hooks/useBooks';
import { useModal, useRegisterModal } from '../../context/ModalContext';
import { announcementService } from '../../../infrastructure/services/announcementService';

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
  const [isCompactProfileOpen, setIsCompactProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAnnouncementsOpen, setIsAnnouncementsOpen] = useState(false);
  const [hasUnreadAnnouncements, setHasUnreadAnnouncements] = useState(false);

  // Verifico lo sblocco sviluppatore memorizzato in sessionStorage per la sessione corrente
  const isDevUnlocked = typeof window !== 'undefined' && sessionStorage.getItem('bibliodesk_dev_session') === 'true';

  // Modal states per l'icona dello scanner / aggiunta libro
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  const { isModalOpen } = useModal();
  useRegisterModal(isCompactProfileOpen);
  useRegisterModal(isSettingsOpen);
  useRegisterModal(isAnnouncementsOpen);

  const { addBook } = useBooks();

  useEffect(() => {
    const list = announcementService.getAnnouncements();
    setHasUnreadAnnouncements(announcementService.getUnreadCount(list) > 0);
  }, [isAnnouncementsOpen]);

  return (
    <div className="min-h-screen bg-[#F4F1EA] dark:bg-[#2A2826] text-[#4A4743] dark:text-[#E0DCD3] flex flex-col antialiased transition-colors duration-200 selection:bg-[#B0BEA9]/30 selection:text-[#31362F] overflow-x-hidden">
      <Header
        activeTab={activeTab}
        onOpenProfile={() => setIsCompactProfileOpen(true)}
        onOpenAnnouncements={() => {
          setIsAnnouncementsOpen(true);
          setHasUnreadAnnouncements(false);
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
        hasUnreadAnnouncements={hasUnreadAnnouncements}
      />

      <main className="flex-1 max-w-md w-full mx-auto px-4 pt-24 pb-32 overflow-x-hidden">
        {children}
      </main>

      {/* Navigazione in Basso: Cliccando l'icona dello scanner si apre direttamente la Fotocamera pronta alla scansione */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isModalOpen={isModalOpen}
        onOpenScanner={() => setIsScannerOpen(true)}
      />

      {/* Scheda Piè di Pagina Compatta del Profilo */}
      <CompactProfileSheet
        isOpen={isCompactProfileOpen}
        onClose={() => setIsCompactProfileOpen(false)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenFullProfile={() => setActiveTab(3)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onOpenAnnouncements={() => setIsAnnouncementsOpen(true)}
      />

      {/* Modale Comunicazioni dall'App */}
      <AnnouncementsModal
        isOpen={isAnnouncementsOpen}
        onClose={() => setIsAnnouncementsOpen(false)}
        isDevUnlocked={isDevUnlocked}
      />

      {/* Scanner con Fotocamera già attiva e opzione diretta di Inserimento Manuale */}
      <CameraScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onBookScanned={addBook}
        onOpenManualEntry={() => setIsManualModalOpen(true)}
      />

      {/* Form di Inserimento Manuale del Libro */}
      <AddBookModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onAddBook={addBook}
      />
    </div>
  );
};
