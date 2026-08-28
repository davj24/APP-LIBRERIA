import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Mail, Lock, Eye, EyeOff, Sparkles, AlertCircle, 
  CheckCircle2, ArrowRight, Loader2, Users, Flame, X 
} from 'lucide-react';
import { supabase } from '../../infrastructure/supabase/client';
import { GoogleAuthButton } from '../components/auth/GoogleAuthButton';

interface OnboardingSlide {
  id: number;
  title: string;
  subtitle: string;
  badge: string;
  icon: React.ReactNode;
  accentGradient: string;
}

const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: 0,
    badge: 'Libreria Personale',
    title: 'Organizza e traccia ogni tua lettura',
    subtitle: 'Scansiona il codice a barre o la copertina con la fotocamera. Mantieni in ordine i tuoi libri tra Da Leggere, In Lettura e Letti.',
    icon: <BookOpen className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />,
    accentGradient: 'from-emerald-500/20 via-teal-500/10 to-transparent'
  },
  {
    id: 1,
    badge: 'Social & Takeaway',
    title: 'Condividi spunti e recensioni reali',
    subtitle: 'Scopri cosa stanno leggendo i tuoi amici, pubblica i tuoi takeaway ed entra a far parte di una vera community di lettori appassionati.',
    icon: <Users className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />,
    accentGradient: 'from-indigo-500/20 via-purple-500/10 to-transparent'
  },
  {
    id: 2,
    badge: 'Streak & Obiettivi',
    title: 'Costruisci l’abitudine di leggere ogni giorno',
    subtitle: 'Imposta i tuoi obiettivi annuali, aggiorna le pagine raggiunte e mantieni attiva la tua streak quotidiana di lettura.',
    icon: <Flame className="w-10 h-10 text-amber-600 dark:text-amber-400" />,
    accentGradient: 'from-amber-500/20 via-orange-500/10 to-transparent'
  }
];

export const AuthPage: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Auto-play del carosello ogni 5 secondi se il modale di autenticazione non è aperto
  useEffect(() => {
    if (isAuthModalOpen) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % ONBOARDING_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isAuthModalOpen]);

  const handleOpenAuth = (authMode: 'signin' | 'signup') => {
    setMode(authMode);
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsAuthModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim() || !password) {
      setErrorMsg('Inserisci sia l\'email che la password.');
      return;
    }

    if (mode === 'signup' && password.length < 6) {
      setErrorMsg('La password deve contenere almeno 6 caratteri.');
      return;
    }

    setIsLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      localStorage.setItem('bibliodesk_user_email', cleanEmail);

      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: password
        });

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setErrorMsg('Credenziali errate. Verifica email e password.');
          } else {
            setErrorMsg(error.message || 'Errore durante l\'accesso.');
          }
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: password
        });

        if (error) {
          setErrorMsg(error.message || 'Errore durante la registrazione.');
        } else if (data.user) {
          setSuccessMsg('Registrazione completata! Se richiesta, controlla la tua email per confermare l\'account.');
        }
      }
    } catch (err: any) {
      console.error('Auth Exception:', err);
      setErrorMsg('Si è verificato un errore di connessione. Riprova.');
    } finally {
      setIsLoading(false);
    }
  };

  const activeSlideData = ONBOARDING_SLIDES[currentSlide];

  return (
    <div className="min-h-screen bg-[#F4F1EA] dark:bg-[#2A2826] text-[#4A4743] dark:text-[#E0DCD3] flex flex-col justify-between items-center p-4 sm:p-6 relative overflow-hidden select-none">
      
      {/* Ambient Decorative Glow Orbs */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#5C6B55]/15 dark:bg-[#A8BB9C]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Brand Top */}
      <header className="pt-2 sm:pt-4 flex items-center justify-between z-10 w-full max-w-md">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-[#5C6B55] text-white flex items-center justify-center shadow-md">
            <BookOpen size={20} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-[#31362F] dark:text-[#ECE7DE]">
              BiblioDesk
            </h1>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#7A756D] dark:text-[#9A9488]">
              Book Club & Reading Tracker
            </p>
          </div>
        </div>
      </header>

      {/* L'ISOLA CENTRALE (Central Floating Elevated Card) */}
      <main className="my-auto z-10 max-w-md w-full">
        <div className="bg-[#FCFBF8] dark:bg-[#201E1C] rounded-[32px] p-6 sm:p-8 border border-[#E2DDD2] dark:border-[#383430] shadow-2xl space-y-6 relative overflow-hidden">
          
          {/* Ambient Glow Inside Island */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#5C6B55]/15 rounded-full blur-xl pointer-events-none" />

          {/* Slide Content inside the Island */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="text-center space-y-4 flex flex-col items-center"
            >
              {/* Badge */}
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-[#EFECE6] dark:bg-[#272422] text-[#5C6B55] dark:text-[#A8BB9C] border border-[#DCD5C6] dark:border-[#4A4743]/60 shadow-xs">
                <Sparkles size={13} />
                {activeSlideData.badge}
              </span>

              {/* Icon Box */}
              <div className="relative my-1">
                <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-b ${activeSlideData.accentGradient} bg-[#F4F1EA] dark:bg-[#2A2826] border border-[#EBE5D9] dark:border-[#4A4743] shadow-md flex items-center justify-center`}>
                  {activeSlideData.icon}
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-black text-[#31362F] dark:text-[#ECE7DE] leading-tight tracking-tight">
                  {activeSlideData.title}
                </h2>
                <p className="text-xs sm:text-sm text-[#7A756D] dark:text-[#9A9488] leading-relaxed font-medium px-2">
                  {activeSlideData.subtitle}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Pagination Dots inside the Island */}
          <div className="flex items-center justify-center gap-2 pt-1">
            {ONBOARDING_SLIDES.map((slide) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setCurrentSlide(slide.id)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  currentSlide === slide.id
                    ? 'w-7 bg-[#5C6B55] dark:bg-[#A8BB9C]'
                    : 'w-2 bg-[#DCD5C6] dark:bg-[#4A4743] hover:bg-[#B0BEA9]'
                }`}
                aria-label={`Slide ${slide.id + 1}`}
              />
            ))}
          </div>

          {/* Action Buttons Integrated Inside the Island */}
          <div className="border-t border-[#EBE5D9] dark:border-[#383430] pt-4 space-y-3">
            {/* Tasto Principale: Google OAuth */}
            <div className="w-full">
              <GoogleAuthButton
                label="Continua con Google"
                className="py-3.5"
                onError={(err) => {
                  setErrorMsg(err);
                  setIsAuthModalOpen(true);
                }}
              />
            </div>

            {/* Tasti Secondari per Email: Non ho un account & Ho già un account */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleOpenAuth('signup')}
                className="py-2.5 px-3 rounded-2xl bg-[#EFECE6] dark:bg-[#272422] hover:bg-[#EBE5D9] dark:hover:bg-[#383532] text-[#31362F] dark:text-[#E0DCD3] text-xs font-bold border border-[#E2DDD2] dark:border-[#36322E] flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <span>Non ho un account</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenAuth('signin')}
                className="py-2.5 px-3 rounded-2xl bg-[#EFECE6] dark:bg-[#272422] hover:bg-[#EBE5D9] dark:hover:bg-[#383532] text-[#31362F] dark:text-[#E0DCD3] text-xs font-bold border border-[#E2DDD2] dark:border-[#36322E] flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <span>Ho già un account</span>
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* Footer Legal */}
      <footer className="z-10 text-center py-2">
        <p className="text-[11px] text-[#8C867B] dark:text-[#888277] font-medium">
          BiblioDesk © 2026 • Tutti i diritti riservati
        </p>
      </footer>

      {/* Modale Bottom Sheet per Login / Registrazione */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4">
            
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Bottom Sheet Card */}
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative w-full max-w-md bg-[#FCFBF8] dark:bg-[#201E1C] rounded-t-3xl sm:rounded-3xl p-6 border-t sm:border border-[#EBE5D9] dark:border-[#383430] shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto z-10"
            >
              {/* Drag Handle Top for Mobile */}
              <div className="w-12 h-1.5 bg-[#DCD5C6] dark:bg-[#4A4743] rounded-full mx-auto sm:hidden mb-2" />

              {/* Header Modal */}
              <div className="flex items-center justify-between pb-2 border-b border-[#EBE5D9] dark:border-[#383430]">
                <div>
                  <h3 className="text-lg font-black text-[#31362F] dark:text-[#ECE7DE]">
                    {mode === 'signin' ? 'Bentornato su BiblioDesk' : 'Crea il tuo Account'}
                  </h3>
                  <p className="text-xs text-[#7A756D] dark:text-[#9A9488]">
                    {mode === 'signin' ? 'Accedi per sincronizzare la tua libreria' : 'Inizia subito ad organizzare le tue letture'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#EBE5D9] dark:bg-[#383532] text-[#7A756D] dark:text-[#E0DCD3] flex items-center justify-center hover:bg-[#DCD5C6] cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Mode Selector Tabs (Accedi / Registrati) */}
              <div className="flex bg-[#EFECE6] dark:bg-[#272422] p-1 rounded-2xl border border-[#E2DDD2] dark:border-[#36322E]">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    mode === 'signin'
                      ? 'bg-[#5C6B55] text-white shadow-sm'
                      : 'text-[#7A756D] dark:text-[#9A9488] hover:text-[#31362F] dark:hover:text-[#E0DCD3]'
                  }`}
                >
                  Accedi
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    mode === 'signup'
                      ? 'bg-[#5C6B55] text-white shadow-sm'
                      : 'text-[#7A756D] dark:text-[#9A9488] hover:text-[#31362F] dark:hover:text-[#E0DCD3]'
                  }`}
                >
                  Crea Account
                </button>
              </div>

              {/* Pulsante Google OAuth */}
              <div className="space-y-3">
                <GoogleAuthButton
                  label={mode === 'signin' ? 'Accedi con Google' : 'Registrati con Google'}
                  onError={(err) => setErrorMsg(err)}
                />

                <div className="relative flex items-center justify-center">
                  <div className="border-t border-[#E2DDD2] dark:border-[#36322E] w-full" />
                  <span className="bg-[#FCFBF8] dark:bg-[#201E1C] px-3 text-[10px] font-bold text-[#8C867B] dark:text-[#888277] uppercase tracking-wider absolute">
                    oppure con email
                  </span>
                </div>
              </div>

              {/* Error / Success Feedback Alerts */}
              <AnimatePresence mode="wait">
                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs font-semibold flex items-start gap-2"
                  >
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </motion.div>
                )}

                {successMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-start gap-2"
                  >
                    <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-500" />
                    <span>{successMsg}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form Email & Password */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#555047] dark:text-[#BEB8AC]">
                    Indirizzo Email
                  </label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C867B] dark:text-[#888277]" />
                    <input
                      type="email"
                      required
                      placeholder="nome@esempio.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-[#F4F1EA] dark:bg-[#272422] border border-[#E2DDD2] dark:border-[#36322E] rounded-2xl text-[#31362F] dark:text-[#E0DCD3] placeholder-[#9E988F] focus:outline-none focus:ring-2 focus:ring-[#5C6B55]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#555047] dark:text-[#BEB8AC]">
                    Password
                  </label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C867B] dark:text-[#888277]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-[#F4F1EA] dark:bg-[#272422] border border-[#E2DDD2] dark:border-[#36322E] rounded-2xl text-[#31362F] dark:text-[#E0DCD3] placeholder-[#9E988F] focus:outline-none focus:ring-2 focus:ring-[#5C6B55]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8C867B] dark:text-[#888277] hover:text-[#31362F] dark:hover:text-[#E0DCD3]"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 bg-[#5C6B55] hover:bg-[#475441] text-white rounded-2xl font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer active:scale-98"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Elaborazione...</span>
                    </>
                  ) : (
                    <>
                      <span>{mode === 'signin' ? 'Accedi a BiblioDesk' : 'Crea Account'}</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
