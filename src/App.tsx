import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './presentation/context/ThemeContext';
import { ModalProvider } from './presentation/context/ModalContext';
import { MainLayout } from './presentation/components/layout/MainLayout';
import type { TabType } from './presentation/components/layout/BottomNav';
import { LibraryPage } from './presentation/pages/LibraryPage';
import { SocialPage } from './presentation/pages/SocialPage';
import { StatsPage } from './presentation/pages/StatsPage';
import { ProfilePage } from './presentation/pages/ProfilePage';

function AppContent() {
  const [activeTab, setActiveTab] = useState<TabType>(0);

  const renderActivePage = () => {
    switch (activeTab) {
      case 0:
        return <LibraryPage />;
      case 1:
        return <SocialPage />;
      case 2:
        return <StatsPage />;
      case 3:
        return <ProfilePage />;
      default:
        return <LibraryPage />;
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
          className="w-full"
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
