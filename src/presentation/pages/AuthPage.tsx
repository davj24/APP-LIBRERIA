import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Mail, Lock, Eye, EyeOff, Sparkles, AlertCircle, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '../../infrastructure/supabase/client';
import { GoogleAuthButton } from '../components/auth/GoogleAuthButton';

export const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
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
          email: email.trim(),
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

  return (
    <div className="min-h-screen bg-[#F4F1EA] dark:bg-[#2A2826] text-[#4A4743] dark:text-[#E0DCD3] flex flex-col justify-center items-center px-4 py-8 antialiased selection:bg-[#B0BEA9]/30">
      
      {/* Container Centrale Form Login/Registrazione */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-[#F7F4EE] dark:bg-[#201E1C] p-6 sm:p-8 rounded-3xl border border-[#E2DDD2] dark:border-[#383430] shadow-2xl space-y-6 relative overflow-hidden"
      >
        {/* Ambient Glow */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#5C6B55]/20 rounded-full blur-2xl pointer-events-none" />

        {/* Header App */}
        <div className="text-center space-y-2 relative z-10">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#5C6B55] text-white flex items-center justify-center shadow-md">
            <BookOpen size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#2E332B] dark:text-[#ECE7DE] tracking-tight">
              BiblioDesk
            </h1>
            <p className="text-xs text-[#7A756D] dark:text-[#9E988F] font-medium flex items-center justify-center gap-1">
              <Sparkles size={12} className="text-[#5C6B55] dark:text-[#A8BB9C]" />
              La tua libreria digitale e social di lettura
            </p>
          </div>
        </div>

        {/* Mode Selector Tabs (Accedi / Registrati) */}
        <div className="flex bg-[#EFECE6] dark:bg-[#272422] p-1 rounded-2xl border border-[#E2DDD2] dark:border-[#36322E] relative z-10">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
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
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'signup'
                ? 'bg-[#5C6B55] text-white shadow-sm'
                : 'text-[#7A756D] dark:text-[#9A9488] hover:text-[#31362F] dark:hover:text-[#E0DCD3]'
            }`}
          >
            Crea Account
          </button>
        </div>

        {/* Pulsante Google OAuth */}
        <div className="relative z-10 space-y-4">
          <GoogleAuthButton onError={(err) => setErrorMsg(err)} />

          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#E2DDD2] dark:border-[#36322E] w-full" />
            <span className="bg-[#F7F4EE] dark:bg-[#201E1C] px-3 text-[11px] font-bold text-[#8C867B] dark:text-[#888277] uppercase tracking-wider absolute">
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

        {/* Native Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          
          {/* Campo Email */}
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
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-[#EFECE6] dark:bg-[#272422] border border-[#E2DDD2] dark:border-[#36322E] rounded-2xl text-[#31362F] dark:text-[#E0DCD3] placeholder-[#9E988F] focus:outline-none focus:ring-2 focus:ring-[#5C6B55]"
              />
            </div>
          </div>

          {/* Campo Password */}
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
                className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-[#EFECE6] dark:bg-[#272422] border border-[#E2DDD2] dark:border-[#36322E] rounded-2xl text-[#31362F] dark:text-[#E0DCD3] placeholder-[#9E988F] focus:outline-none focus:ring-2 focus:ring-[#5C6B55]"
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-[#5C6B55] hover:bg-[#475441] text-white rounded-2xl font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer active:scale-98"
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
  );
};

