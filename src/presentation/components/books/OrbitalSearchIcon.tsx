import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, WifiOff } from 'lucide-react';
import type { SearchMode } from './HubSearchBar';

export type SearchStatus = 'idle' | 'loading' | 'success' | 'error' | 'offline';

interface OrbitalSearchIconProps {
  searchStatus: SearchStatus;
  isIsbn: boolean;
  searchMode?: SearchMode;
}

export const OrbitalSearchIcon: React.FC<OrbitalSearchIconProps> = ({
  searchStatus,
  isIsbn,
  searchMode = 'local'
}) => {
  const isOnlineMode = searchMode === 'online';

  // Determine if ring should implode/disappear
  const isImploded = searchStatus === 'success' || searchStatus === 'error' || searchStatus === 'offline';
  const isLoading = searchStatus === 'loading';

  return (
    <div className="relative w-6 h-6 flex items-center justify-center select-none pointer-events-none">
      {/* 1. Anello Esterno (Radar Orbitale) */}
      <motion.div
        className={`absolute inset-0 rounded-full ${
          isLoading
            ? 'border-2 border-dashed border-t-transparent border-[#B0BEA9] dark:border-[#5C6B55]'
            : isOnlineMode
            ? 'border border-[#B0BEA9] dark:border-[#5C6B55]'
            : 'border border-[#9E988F] dark:border-[#88837A]'
        }`}
        animate={{
          rotate: isLoading ? 360 : 0,
          scale: isImploded ? 0 : 1,
          opacity: isImploded ? 0 : 1
        }}
        transition={
          isLoading
            ? { repeat: Infinity, duration: 1, ease: 'linear' }
            : { duration: 0.3, ease: 'easeOut' }
        }
      />

      {/* Onda d'urto (Shockwave) al completamento con successo */}
      {searchStatus === 'success' && (
        <motion.div
          key="shockwave"
          initial={{ scale: 0.8, opacity: 0.9 }}
          animate={{ scale: 2.4, opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="absolute inset-0 rounded-full border border-[#B0BEA9] dark:border-[#5C6B55] pointer-events-none"
        />
      )}

      {/* 2. Il Nucleo Centrale (Morphing Fluid) */}
      <AnimatePresence mode="wait">
        {searchStatus === 'offline' ? (
          /* Stato Offline -> WifiOff con leggero sobbalzo */
          <motion.div
            key="offline"
            initial={{ scale: 0.5, opacity: 0, y: -4 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="text-rose-500 dark:text-rose-400"
          >
            <WifiOff className="w-3.5 h-3.5" />
          </motion.div>
        ) : searchStatus === 'error' ? (
          /* Stato Errore -> X con sobbalzo */
          <motion.div
            key="error"
            initial={{ scale: 0.5, opacity: 0, y: -4 }}
            animate={{ scale: 1, opacity: 1, y: [ -4, 0, -2, 0 ] }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="text-rose-500 dark:text-rose-400"
          >
            <X className="w-3.5 h-3.5" />
          </motion.div>
        ) : searchStatus === 'success' ? (
          /* Stato Successo -> Sparkles Verde Salvia */
          <motion.div
            key="success"
            initial={{ scale: 0, opacity: 0, rotate: -45 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 22 }}
            className="text-[#4D6349] dark:text-[#788C71]"
          >
            <Sparkles className="w-3.5 h-3.5 fill-[#B0BEA9]/30" />
          </motion.div>
        ) : isIsbn ? (
          /* Riconoscimento ISBN -> 3 stanghette verticali (Codice a barre) */
          <motion.div
            key="barcode"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center gap-[2px]"
          >
            <motion.div
              animate={{ height: ['8px', '12px', '8px'] }}
              transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
              className="w-[2px] h-3 bg-[#4A4743] dark:bg-[#E0DCD3] rounded-full"
            />
            <motion.div
              animate={{ height: ['12px', '8px', '12px'] }}
              transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
              className="w-[2px] h-3 bg-[#B0BEA9] dark:bg-[#5C6B55] rounded-full"
            />
            <motion.div
              animate={{ height: ['8px', '12px', '8px'] }}
              transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
              className="w-[2px] h-3 bg-[#4A4743] dark:bg-[#E0DCD3] rounded-full"
            />
          </motion.div>
        ) : (
          /* Stato Idle -> Punto solido centrale */
          <motion.div
            key="idle-dot"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`w-2 h-2 rounded-full ${
              isOnlineMode ? 'bg-[#B0BEA9] dark:bg-[#5C6B55]' : 'bg-[#4A4743] dark:bg-[#E0DCD3]'
            }`}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
