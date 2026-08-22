import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Settings, Database, Smartphone, ShieldCheck, RefreshCw, Sun, Moon, 
  LogOut, Trash2, ShieldAlert, Loader2, Code2, Lock, KeyRound, ChevronDown, 
  ChevronUp, Terminal, CheckCircle2, AlertCircle, Wrench
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useRegisterModal } from '../../context/ModalContext';
import { supabase } from '../../../infrastructure/supabase/client';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Password predefinita per sbloccare l'area sviluppatore
const DEV_PASSWORD = 'dev2026';

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  useRegisterModal(isOpen);
  const { isDarkMode, toggleTheme } = useTheme();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Stato per l'Area Sviluppatore
  const [isDevOpen, setIsDevOpen] = useState(false);
  const [isDevUnlocked, setIsDevUnlocked] = useState<boolean>(() => {
    return sessionStorage.getItem('bibliodesk_dev_unlocked') === 'true';
  });
  const [devPasswordInput, setDevPasswordInput] = useState('');
  const [devErrorMsg, setDevErrorMsg] = useState<string | null>(null);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

  const handleUnlockDev = (e: React.FormEvent) => {
    e.preventDefault();
    setDevErrorMsg(null);

    if (devPasswordInput === DEV_PASSWORD) {
      setIsDevUnlocked(true);
      sessionStorage.setItem('bibliodesk_dev_unlocked', 'true');
      setDevPasswordInput('');
    } else {
      setDevErrorMsg('Password errata. Riprova.');
    }
  };

  const handleLockDev = () => {
    setIsDevUnlocked(false);
    sessionStorage.removeItem('bibliodesk_dev_unlocked');
    setDevPasswordInput('');
    setDevErrorMsg(null);
  };

  const handleLogout = async (clearLocalData: boolean) => {
    setIsLoggingOut(true);
    try {
      if (clearLocalData) {
        localStorage.removeItem('bibliodesk_books_v1');
        localStorage.removeItem('bibliodesk_user_profile');
        localStorage.removeItem('user_collections');
        localStorage.clear();
      }

      setShowLogoutConfirm(false);
      onClose();

      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Errore durante il logout da Supabase:', error);
      }
    } catch (err) {
      console.error('Errore imprevisto durante il logout:', err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleCloseModal = () => {
    setShowLogoutConfirm(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#31362F]/60 dark:bg-black/80 backdrop-blur-xs p-0 sm:p-4"
        >
          <motion.div
            initial={{ y: "100%", opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: "100%", opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-[#FCFBF8] dark:bg-[#33302D] text-[#4A4743] dark:text-[#E0DCD3] w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-[#EBE5D9] dark:border-[#4A4743]/60 max-h-[90vh] overflow-y-auto space-y-4 transition-colors relative"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#EBE5D9] dark:border-[#4A4743]/50 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#B0BEA9] dark:bg-[#5C6B55] text-[#31362F] dark:text-[#E0DCD3] flex items-center justify-center">
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#4A4743] dark:text-[#E0DCD3]">Impostazioni App</h2>
                  <p className="text-[11px] text-[#7A756D] dark:text-[#A09A90]">Tema, preferenze e account</p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="w-8 h-8 rounded-full bg-[#EBE5D9] dark:bg-[#383532] text-[#4A4743] dark:text-[#E0DCD3] hover:bg-[#DCD5C6] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Dark Mode Toggle */}
            <div className="bg-[#F4F1EA] dark:bg-[#2A2826] rounded-2xl p-4 border border-[#EBE5D9] dark:border-[#4A4743]/60 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#B0BEA9] dark:bg-[#5C6B55] text-[#31362F] dark:text-[#E0DCD3] flex items-center justify-center">
                    {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-700" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#4A4743] dark:text-[#E0DCD3]">Tema Notturno</h4>
                    <p className="text-xs text-[#7A756D] dark:text-[#A09A90]">
                      {isDarkMode ? 'Attivo (Antracite caldo)' : 'Disattivo (Sabbia calda)'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={toggleTheme}
                  type="button"
                  role="switch"
                  aria-checked={isDarkMode}
                  className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isDarkMode ? 'bg-[#5C6B55]' : 'bg-[#EBE5D9]'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-[#FCFBF8] dark:bg-[#E0DCD3] shadow-md ring-0 transition duration-200 ease-in-out flex items-center justify-center ${
                      isDarkMode ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  >
                    {isDarkMode ? (
                      <Moon className="w-3.5 h-3.5 text-[#2A2826]" />
                    ) : (
                      <Sun className="w-3.5 h-3.5 text-amber-700" />
                    )}
                  </span>
                </button>
              </div>
            </div>

            {/* Account & Logout Section */}
            <div className="bg-[#F4F1EA] dark:bg-[#2A2826] rounded-2xl p-4 border border-[#EBE5D9] dark:border-[#4A4743]/60 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                    <LogOut className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#4A4743] dark:text-[#E0DCD3]">Account & Sessione</h4>
                    <p className="text-xs text-[#7A756D] dark:text-[#A09A90]">
                      Disconnettiti da questo dispositivo
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(true)}
                  className="px-3.5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>

            {/* Menù a Tendina Sviluppatore (Protetto da Password) */}
            <div className="bg-[#F4F1EA] dark:bg-[#2A2826] rounded-2xl border border-[#EBE5D9] dark:border-[#4A4743]/60 overflow-hidden transition-all">
              {/* Header Accordion Sviluppatore */}
              <button
                type="button"
                onClick={() => setIsDevOpen(!isDevOpen)}
                className="w-full p-4 flex items-center justify-between hover:bg-[#EBE5D9]/40 dark:hover:bg-[#383532]/40 transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Code2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-[#4A4743] dark:text-[#E0DCD3]">Sviluppatore</h4>
                      {isDevUnlocked && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                          Sbloccato
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#7A756D] dark:text-[#A09A90]">
                      {isDevUnlocked ? 'Angolo di sviluppo e diagnostica' : 'Area riservata protetta da password'}
                    </p>
                  </div>
                </div>
                {isDevOpen ? (
                  <ChevronUp className="w-4 h-4 text-[#7A756D] dark:text-[#A09A90]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#7A756D] dark:text-[#A09A90]" />
                )}
              </button>

              {/* Contenuto Tendina Sviluppatore */}
              <AnimatePresence>
                {isDevOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="border-t border-[#EBE5D9] dark:border-[#4A4743]/50 p-4 space-y-4"
                  >
                    {!isDevUnlocked ? (
                      /* Form Password di Accesso */
                      <form onSubmit={handleUnlockDev} className="space-y-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#4A4743] dark:text-[#E0DCD3]">
                          <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          <span>Inserisci password sviluppatore:</span>
                        </div>

                        <div className="relative">
                          <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7A756D] dark:text-[#A09A90]" />
                          <input
                            type="password"
                            required
                            placeholder="Password di accesso (es. dev2026)"
                            value={devPasswordInput}
                            onChange={(e) => setDevPasswordInput(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-[#FCFBF8] dark:bg-[#33302D] border border-[#EBE5D9] dark:border-[#4A4743] rounded-xl text-xs text-[#4A4743] dark:text-[#E0DCD3] focus:outline-none focus:border-[#5C6B55]"
                          />
                        </div>

                        {devErrorMsg && (
                          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>{devErrorMsg}</span>
                          </div>
                        )}

                        <button
                          type="submit"
                          className="w-full py-2 bg-[#5C6B55] hover:bg-[#4A5744] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                        >
                          Accedi all'Angolo Sviluppatore
                        </button>
                      </form>
                    ) : (
                      /* Angolo Sviluppatore Sbloccato */
                      <div className="space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-[#EBE5D9] dark:border-[#4A4743]/50">
                          <div className="flex items-center gap-2">
                            <Terminal className="w-4 h-4 text-[#5C6B55] dark:text-[#A0AF99]" />
                            <span className="text-xs font-black text-[#31362F] dark:text-[#E0DCD3] uppercase tracking-wider">
                              Angolo Sviluppo
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={handleLockDev}
                            className="text-[10px] font-bold px-2 py-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-colors cursor-pointer"
                          >
                            Blocca Area
                          </button>
                        </div>

                        {/* Supabase Status & Keys */}
                        <div className="bg-[#FCFBF8] dark:bg-[#33302D] rounded-xl p-3 border border-[#EBE5D9] dark:border-[#4A4743]/60 space-y-2 text-xs">
                          <div className="flex items-center justify-between font-bold">
                            <span className="flex items-center gap-1.5 text-[#4A4743] dark:text-[#E0DCD3]">
                              <Database className="w-3.5 h-3.5 text-emerald-600" /> Database Supabase
                            </span>
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#D8E2D5] dark:bg-[#3B4838] text-[#2D382B] dark:text-[#E0DCD3]">
                              {isSupabaseConfigured ? 'Connesso' : 'Locale'}
                            </span>
                          </div>

                          <div className="space-y-1 text-[11px] font-mono text-[#7A756D] dark:text-[#A09A90] pt-1">
                            <div className="flex justify-between">
                              <span>VITE_SUPABASE_URL</span>
                              <span>{supabaseUrl ? '•• Configurato ••' : 'Non impostato'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>VITE_SUPABASE_ANON_KEY</span>
                              <span>{supabaseAnonKey ? '•• Configurato ••' : 'Non impostato'}</span>
                            </div>
                          </div>
                        </div>

                        {/* PWA & System Diagnostic */}
                        <div className="bg-[#FCFBF8] dark:bg-[#33302D] rounded-xl p-3 border border-[#EBE5D9] dark:border-[#4A4743]/60 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between py-0.5 border-b border-[#EBE5D9] dark:border-[#4A4743]/40">
                            <span className="flex items-center gap-1.5 text-[#4A4743] dark:text-[#E0DCD3]">
                              <Smartphone className="w-3.5 h-3.5" /> PWA Service Worker
                            </span>
                            <span className="font-bold text-[#31362F] dark:text-[#E0DCD3]">Attivo / Offline</span>
                          </div>
                          <div className="flex items-center justify-between py-0.5 border-b border-[#EBE5D9] dark:border-[#4A4743]/40">
                            <span className="flex items-center gap-1.5 text-[#4A4743] dark:text-[#E0DCD3]">
                              <RefreshCw className="w-3.5 h-3.5" /> LocalStorage Sync
                            </span>
                            <span className="font-bold text-[#31362F] dark:text-[#E0DCD3]">Attivo</span>
                          </div>
                          <div className="flex items-center justify-between py-0.5">
                            <span className="flex items-center gap-1.5 text-[#4A4743] dark:text-[#E0DCD3]">
                              <ShieldCheck className="w-3.5 h-3.5" /> Versione App
                            </span>
                            <span className="font-bold text-[#31362F] dark:text-[#E0DCD3]">v1.0.0</span>
                          </div>
                        </div>

                        {/* Quick Dev Action Tools */}
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[11px] font-bold text-[#7A756D] dark:text-[#A09A90] block">Strumenti Diagnostici:</span>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                console.log('--- BIBLIODESK DIAGNOSTICS ---');
                                console.log('Supabase Configured:', isSupabaseConfigured);
                                console.log('Supabase URL:', supabaseUrl);
                                console.log('SessionStorage:', sessionStorage);
                                console.log('LocalStorage keys:', Object.keys(localStorage));
                                alert('Diagnostica stampata in console browser (F12)');
                              }}
                              className="p-2 rounded-xl bg-[#FCFBF8] dark:bg-[#33302D] hover:bg-[#EBE5D9] dark:hover:bg-[#383532] border border-[#EBE5D9] dark:border-[#4A4743] text-[11px] font-bold text-[#4A4743] dark:text-[#E0DCD3] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Wrench className="w-3.5 h-3.5 text-amber-600" />
                              <span>Log Console</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                alert('Sessione Supabase attiva ed in ascolto con onAuthStateChange.');
                              }}
                              className="p-2 rounded-xl bg-[#FCFBF8] dark:bg-[#33302D] hover:bg-[#EBE5D9] dark:hover:bg-[#383532] border border-[#EBE5D9] dark:border-[#4A4743] text-[11px] font-bold text-[#4A4743] dark:text-[#E0DCD3] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Test Auth</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sub-modal / Menu di conferma Logout */}
            <AnimatePresence>
              {showLogoutConfirm && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-[#31362F]/70 dark:bg-black/85 backdrop-blur-xs"
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 15 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 15 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="bg-[#FCFBF8] dark:bg-[#33302D] text-[#4A4743] dark:text-[#E0DCD3] w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-[#EBE5D9] dark:border-[#4A4743]/60 space-y-4 text-left"
                  >
                    {/* Header menu logout */}
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                        <ShieldAlert className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-[#31362F] dark:text-[#E0DCD3]">
                          Conferma Logout
                        </h3>
                        <p className="text-xs text-[#7A756D] dark:text-[#A09A90] mt-0.5">
                          Il tuo account non verrà eliminato. Scegli come procedere con i tuoi dati su questo dispositivo:
                        </p>
                      </div>
                    </div>

                    {/* Opzioni di Logout */}
                    <div className="space-y-2.5 pt-1">
                      {/* Opzione 1: Logout Semplice */}
                      <button
                        type="button"
                        disabled={isLoggingOut}
                        onClick={() => handleLogout(false)}
                        className="w-full text-left p-3.5 rounded-2xl bg-[#F4F1EA] dark:bg-[#2A2826] hover:bg-[#EBE5D9] dark:hover:bg-[#383532] border border-[#EBE5D9] dark:border-[#4A4743]/60 transition-all group cursor-pointer flex items-start gap-3"
                      >
                        <div className="w-8 h-8 rounded-xl bg-[#5C6B55]/15 dark:bg-[#5C6B55]/30 text-[#5C6B55] dark:text-[#A0AF99] flex items-center justify-center shrink-0 mt-0.5">
                          <LogOut className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#31362F] dark:text-[#E0DCD3]">
                              Logout Semplice
                            </span>
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#D8E2D5] dark:bg-[#3B4838] text-[#2D382B] dark:text-[#E0DCD3]">
                              Consigliato
                            </span>
                          </div>
                          <p className="text-[11px] text-[#7A756D] dark:text-[#A09A90] mt-0.5 leading-snug">
                            Disconnette la sessione e mantiene la libreria e il profilo salvati sul dispositivo.
                          </p>
                        </div>
                      </button>

                      {/* Opzione 2: Logout e Cancella Dati Locali */}
                      <button
                        type="button"
                        disabled={isLoggingOut}
                        onClick={() => handleLogout(true)}
                        className="w-full text-left p-3.5 rounded-2xl bg-rose-500/5 dark:bg-rose-950/20 hover:bg-rose-500/10 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 transition-all group cursor-pointer flex items-start gap-3"
                      >
                        <div className="w-8 h-8 rounded-xl bg-rose-500/15 dark:bg-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                          <Trash2 className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-rose-700 dark:text-rose-300">
                              Logout + Cancella Dati
                            </span>
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300">
                              Pulizia
                            </span>
                          </div>
                          <p className="text-[11px] text-rose-600/80 dark:text-rose-300/70 mt-0.5 leading-snug">
                            Disconnette la sessione e rimuove la libreria locale da questo dispositivo.
                          </p>
                        </div>
                      </button>
                    </div>

                    {/* Bottone Annulla */}
                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        disabled={isLoggingOut}
                        onClick={() => setShowLogoutConfirm(false)}
                        className="w-full py-2.5 rounded-xl border border-[#DCD5C6] dark:border-[#4A4743]/60 text-[#4A4743] dark:text-[#E0DCD3] font-bold text-xs hover:bg-[#EBE5D9] dark:hover:bg-[#383532] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {isLoggingOut ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Disconnessione in corso...</span>
                          </>
                        ) : (
                          <span>Annulla</span>
                        )}
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
