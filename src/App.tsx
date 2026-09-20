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
import { useUserProfile, getLatestLocalProfile, sanitizeAvatarUrl } from './presentation/hooks/useUserProfile';

function AppContent() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>(0);
  const { profile, updateProfile } = useUserProfile();

  useEffect(() => {
    const checkExistingProfile = async (user: any) => {
      if (!user?.id) return;
      try {
        const currentLocal = getLatestLocalProfile();
        const meta = user.user_metadata || {};
        const googleFullName = meta.full_name || meta.name;

        const { data } = await supabase
          .from('profiles')
          .select('id, full_name, username, avatar_url, bio, reading_goal, favorite_genres, favorite_subgenres, selected_widgets, banner_url')
          .eq('id', user.id)
          .maybeSingle();

        // 1. Massima priorità: username o nome personalizzato presente su Supabase (diverso dal nome Google)
        if (data && (data.username || (data.full_name && data.full_name !== googleFullName))) {
          updateProfile({
            name: data.username || data.full_name,
            bio: data.bio || currentLocal.bio,
            avatarUrl: sanitizeAvatarUrl(data.avatar_url),
            readingGoal: data.reading_goal || currentLocal.readingGoal,
            favoriteGenres: Array.isArray(data.favorite_genres) && data.favorite_genres.length > 0 ? data.favorite_genres : currentLocal.favoriteGenres,
            favoriteSubgenres: data.favorite_subgenres || currentLocal.favoriteSubgenres,
            selectedWidgets: Array.isArray(data.selected_widgets) && data.selected_widgets.length > 0 ? data.selected_widgets : currentLocal.selectedWidgets,
            bannerUrl: data.banner_url || currentLocal.bannerUrl,
            isCompleted: true
          });
          return;
        }

        // 2. Seconda priorità: nome personalizzato locale (che NON sia il nome imposto da Google o default generico)
        const isDefaultOrGoogleName = !currentLocal.name || 
          currentLocal.name === 'Lettore BiblioDesk' || 
          currentLocal.name === 'Nuovo Lettore' || 
          currentLocal.name === 'Lettore' ||
          (googleFullName && currentLocal.name.trim().toLowerCase() === googleFullName.trim().toLowerCase());

        // 3. Se l'avatar locale era stato contaminato da Google, ripuliscilo subito
        if (!isDefaultOrGoogleName) {
          updateProfile({
            ...currentLocal,
            avatarUrl: sanitizeAvatarUrl(currentLocal.avatarUrl),
            isCompleted: true
          });
        } else {
          updateProfile({
            avatarUrl: undefined
          });
        }

        // 4. Assicura sempre l'esistenza del record in Supabase 'profiles' per la ricerca sociale
        const finalProfile = getLatestLocalProfile();
        const effectiveName = finalProfile.name && !isDefaultOrGoogleName 
          ? finalProfile.name 
          : (user.email?.split('@')[0] || 'Lettore');

        await supabase.from('profiles').upsert({
          id: user.id,
          username: effectiveName,
          full_name: effectiveName,
          avatar_url: sanitizeAvatarUrl(finalProfile.avatarUrl),
          badge: finalProfile.avatarColor || 'bg-gradient-to-tr from-indigo-600 to-violet-600',
          bio: finalProfile.bio || '',
          reading_goal: finalProfile.readingGoal || 24,
          updated_at: new Date().toISOString()
        });
      } catch (e) {
        console.warn('Errore verifica profilo esistente:', e);
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
