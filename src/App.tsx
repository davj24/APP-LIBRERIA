import { useState } from 'react';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { ThemeProvider } from './presentation/context/ThemeContext';
import { ModalProvider, useModal } from './presentation/context/ModalContext';
import { MainLayout } from './presentation/components/layout/MainLayout';
import type { TabType } from './presentation/components/layout/BottomNav';
import { DashboardPage } from './presentation/pages/DashboardPage';
import { LibraryPage } from './presentation/pages/LibraryPage';
import { SocialPage } from './presentation/pages/SocialPage';
import { StatsPage } from './presentation/pages/StatsPage';
import { ProfilePage } from './presentation/pages/ProfilePage';

function AppContent() {
  const [activeTab, setActiveTab] = useState<TabType>(0);
  const { isModalOpen } = useModal();

  const handlePanEnd = (_: any, info: PanInfo) => {
    // Se un modale, sheet o editor è aperto, disabilita lo swipe tra i tab principali
    if (isModalOpen) return;

    const threshold = 50;
    if (info.offset.x < -threshold) {
      setActiveTab((prev) => Math.min(prev + 1, 4) as TabType);
    } else if (info.offset.x > threshold) {
      setActiveTab((prev) => Math.max(prev - 1, 0) as TabType);
    }
  };

  const renderActivePage = () => {
    switch (activeTab) {
      case 0:
        return <DashboardPage />;
      case 1:
        return <LibraryPage />;
      case 2:
        return <SocialPage />;
      case 3:
        return <StatsPage />;
      case 4:
        return <ProfilePage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <MainLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -15 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onPanEnd={handlePanEnd}
          className="w-full touch-pan-y"
        >
          {renderActivePage()}
        </motion.div>
      </AnimatePresence>
    </MainLayout>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <ModalProvider>
        <AppContent />
      </ModalProvider>
    </ThemeProvider>
  );
}

export default App;
