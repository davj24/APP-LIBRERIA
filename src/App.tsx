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
import { OnboardingWizard } from './presentation/components/auth/OnboardingWizard';
import { useUserProfile } from './presentation/hooks/useUserProfile';

function AppContent() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>(0);
  const { profile, updateProfile } = useUserProfile();

  useEffect(() => {
    const checkExistingProfile = async (user: any) => {
      if (!user?.id) return;
      try {
        const meta = user.user_metadata || {};
        const userName = meta.full_name || meta.name || user.email?.split('@')[0] || 'Lettore';
        const userAvatar = meta.avatar_url || meta.picture || undefined;

        const { data } = await supabase
          .from('profiles')
          .select('id, full_name, username, avatar_url, bio')
          .eq('id', user.id)
          .maybeSingle();

        updateProfile({
          name: data?.full_name || data?.username || userName,
          bio: data?.bio || 'Appassionato di lettura su BiblioDesk',
          avatarUrl: data?.avatar_url || userAvatar,
          isCompleted: true
        });
      } catch (e) {
        console.warn('Errore verifica profilo esistente:', e);
        updateProfile({ isCompleted: true });
      }
    };

    // 1. Recupera la sessione iniziale di Supabase al montaggio dell'app
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user?.email) {
        localStorage.setItem('bibliodesk_user_email', session.user.email.trim().toLowerCase());
        checkExistingProfile(session.user);
      }
      setLoading(false);
    }).catch((err) => {
      console.error("Errore nel recupero della sessione Supabase:", err);
      setSession(null);
      setLoading(false);
    });

    // 2. Listener globale con supabase.auth.onAuthStateChange per intercettare
    // sia i cambiamenti manuali (login/logout) sia i redirect OAuth da Google
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user?.email) {
        localStorage.setItem('bibliodesk_user_email', session.user.email.trim().toLowerCase());
        checkExistingProfile(session.user);
      }
      setLoading(false);

      // Pulisce l'URL dall'hash token se l'utente è stato autenticato da OAuth
      if (session && window.location.hash.includes('access_token')) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Spinner durante l'inizializzazione dello stato di autenticazione
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

  // Se l'utente non è autenticato (no session), mostra la AuthPage (con pulsante Google)
  if (!session) {
    return <AuthPage />;
  }

  // Se l'utente è autenticato ma non ha completato l'onboarding iniziale del profilo
  if (!profile.isCompleted) {
    return (
      <OnboardingWizard
        userEmail={session.user?.email}
        onComplete={() => updateProfile({ isCompleted: true })}
      />
    );
  }

  // Se l'utente è autenticato e il profilo è configurato, mostra la Dashboard/Layout principale
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
