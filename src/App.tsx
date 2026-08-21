import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Session } from '@supabase/supabase-js';
import { BookOpen } from 'lucide-react';
import { supabase } from './infrastructure/supabase/client';
import { ThemeProvider } from './presentation/context/ThemeContext';
import { ModalProvider } from './presentation/context/ModalContext';
import { MainLayout } from './presentation/components/layout/MainLayout';
import type { TabType } from './presentation/components/layout/BottomNav';
import { LibraryPage } from './presentation/pages/LibraryPage';
import { SocialPage } from './presentation/pages/SocialPage';
import { StatsPage } from './presentation/pages/StatsPage';
import { ProfilePage } from './presentation/pages/ProfilePage';
import { AuthPage } from './presentation/pages/AuthPage';

function AppContent() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>(0);

  useEffect(() => {
    // 1. Recupera la sessione iniziale di Supabase con gestione degli errori
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    }).catch((err) => {
      console.error("Errore nel recupero della sessione Supabase:", err);
      setSession(null);
      setLoading(false);
    });

    // 2. Ascolta i cambiamenti di autenticazione (login/logout)
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Spinner di caricamento stato auth iniziale
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F1EA] dark:bg-[#2A2826] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#5C6B55] text-white flex items-center justify-center animate-bounce shadow-md">
            <BookOpen size={24} />
          </div>
          <span className="text-xs font-extrabold text-[#7A756D] dark:text-[#9A9488] uppercase tracking-wider">
            Caricamento BiblioDesk...
          </span>
        </div>
      </div>
    );
  }

  // Se l'utente non è autenticato, renderizza esclusivamente la AuthPage
  if (!session) {
    return <AuthPage />;
  }

  // Se l'utente è autenticato, mostra le 4 schede di navigazione
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
