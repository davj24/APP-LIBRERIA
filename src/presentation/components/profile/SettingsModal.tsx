import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, Database, Smartphone, ShieldCheck, RefreshCw, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useRegisterModal } from '../../context/ModalContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  useRegisterModal(isOpen);
  const { isDarkMode, toggleTheme } = useTheme();

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

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
            className="bg-[#FCFBF8] dark:bg-[#33302D] text-[#4A4743] dark:text-[#E0DCD3] w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-[#EBE5D9] dark:border-[#4A4743]/60 max-h-[90vh] overflow-y-auto space-y-4 transition-colors"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#EBE5D9] dark:border-[#4A4743]/50 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#B0BEA9] dark:bg-[#5C6B55] text-[#31362F] dark:text-[#E0DCD3] flex items-center justify-center">
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#4A4743] dark:text-[#E0DCD3]">Impostazioni App</h2>
                  <p className="text-[11px] text-[#7A756D] dark:text-[#A09A90]">Tema, backend e preferenze PWA</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-[#EBE5D9] dark:bg-[#383532] text-[#4A4743] dark:text-[#E0DCD3] hover:bg-[#DCD5C6] flex items-center justify-center transition-colors"
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

            {/* Supabase connection status */}
            <div className="bg-[#F4F1EA] dark:bg-[#2A2826] rounded-2xl p-4 border border-[#EBE5D9] dark:border-[#4A4743]/60 space-y-3">
              <div className="flex items-center justify-between border-b border-[#EBE5D9] dark:border-[#4A4743]/50 pb-2">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#31362F] dark:text-[#E0DCD3]" />
                  <h4 className="text-xs font-bold text-[#4A4743] dark:text-[#E0DCD3]">Database Supabase</h4>
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#D8E2D5] dark:bg-[#3B4838] text-[#2D382B] dark:text-[#E0DCD3]">
                  {isSupabaseConfigured ? 'Connesso' : 'Locale'}
                </span>
              </div>
              <div className="space-y-1.5 text-xs text-[#7A756D] dark:text-[#A09A90]">
                <div className="flex justify-between font-mono text-[11px]">
                  <span>VITE_SUPABASE_URL</span>
                  <span>{supabaseUrl ? '•• Configurato ••' : 'Non impostato'}</span>
                </div>
                <div className="flex justify-between font-mono text-[11px]">
                  <span>VITE_SUPABASE_ANON_KEY</span>
                  <span>{supabaseAnonKey ? '•• Configurato ••' : 'Non impostato'}</span>
                </div>
              </div>
            </div>

            {/* PWA & System info */}
            <div className="bg-[#F4F1EA] dark:bg-[#2A2826] rounded-2xl p-4 border border-[#EBE5D9] dark:border-[#4A4743]/60 space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-[#EBE5D9] dark:border-[#4A4743]/50">
                <span className="flex items-center gap-2 font-medium text-[#4A4743] dark:text-[#E0DCD3]">
                  <Smartphone className="w-3.5 h-3.5" /> PWA Status
                </span>
                <span className="font-bold text-[#31362F] dark:text-[#E0DCD3]">Pronta / Off-line</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#EBE5D9] dark:border-[#4A4743]/50">
                <span className="flex items-center gap-2 font-medium text-[#4A4743] dark:text-[#E0DCD3]">
                  <RefreshCw className="w-3.5 h-3.5" /> Data Storage
                </span>
                <span className="font-bold text-[#31362F] dark:text-[#E0DCD3]">LocalStorage Sync</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="flex items-center gap-2 font-medium text-[#4A4743] dark:text-[#E0DCD3]">
                  <ShieldCheck className="w-3.5 h-3.5" /> Versione
                </span>
                <span className="font-bold text-[#31362F] dark:text-[#E0DCD3]">v1.0.0</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
