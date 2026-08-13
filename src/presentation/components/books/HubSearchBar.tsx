import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Globe, Library } from 'lucide-react';
import { OrbitalSearchIcon, type SearchStatus } from './OrbitalSearchIcon';

export type SearchMode = 'local' | 'online';

interface HubSearchBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchMode: SearchMode;
  setSearchMode: (mode: SearchMode) => void;
  onTriggerOnlineSearch: (query: string) => void;
  searchStatus?: SearchStatus;
}

export const HubSearchBar: React.FC<HubSearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  searchMode,
  setSearchMode,
  onTriggerOnlineSearch,
  searchStatus: externalSearchStatus
}) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check if string contains 10 to 13 digits (ISBN detection)
  const cleanQuery = searchQuery.trim();
  const isIsbn = /^\d{10,13}$/.test(cleanQuery);

  const isInputDisabled = searchMode === 'online' && !isOnline;

  // Determine computed status
  const currentStatus: SearchStatus = externalSearchStatus
    ? externalSearchStatus
    : searchMode === 'online' && !isOnline
    ? 'offline'
    : 'idle';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchMode === 'online' && isOnline) {
      onTriggerOnlineSearch(searchQuery);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="bg-[#FCFBF8] dark:bg-[#33302D] rounded-full p-1.5 border border-[#EBE5D9] dark:border-[#4A4743]/60 shadow-sm shadow-[#DCD5C6]/40 dark:shadow-black/20 flex items-center gap-2 transition-all">
        {/* Input Wrapper with Orbital Nucleus & Shimmer Overlay */}
        <div className="relative flex-1 flex items-center min-w-0">
          {/* Dynamic Nucleo Orbitale Icon */}
          <div className="absolute left-3 flex items-center justify-center pointer-events-none z-10">
            <OrbitalSearchIcon
              searchStatus={currentStatus}
              isIsbn={isIsbn}
              searchMode={searchMode}
            />
          </div>

          {/* Text Input (No native placeholder) */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={isInputDisabled}
            className={`w-full pl-11 pr-8 py-2 bg-transparent text-xs font-semibold text-[#4A4743] dark:text-[#E0DCD3] focus:outline-none ${
              isInputDisabled ? 'cursor-not-allowed opacity-60' : ''
            }`}
          />

          {/* Custom Overlay Placeholder */}
          {!searchQuery && (
            <div className="pointer-events-none absolute left-11 inset-y-0 flex items-center overflow-hidden">
              {searchMode === 'local' ? (
                <span className="text-xs font-semibold text-[#9E988F] dark:text-[#88837A]">
                  Cerca nei tuoi libri...
                </span>
              ) : isOnline ? (
                <motion.span
                  animate={{ backgroundPosition: ['200% center', '-200% center'] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                  className="text-xs font-bold text-transparent bg-clip-text bg-[length:200%_auto] bg-[linear-gradient(110deg,#9ca3af,45%,#374151,55%,#9ca3af)] dark:bg-[linear-gradient(110deg,#7A756D,45%,#E0DCD3,55%,#7A756D)]"
                >
                  Cerca online...
                </motion.span>
              ) : (
                <span className="text-xs font-semibold text-rose-500/90 dark:text-rose-400/90">
                  Sei offline...
                </span>
              )}
            </div>
          )}

          {/* Clear Button */}
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 p-1 rounded-full text-[#7A756D] hover:text-[#4A4743] dark:hover:text-[#E0DCD3] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Mode Selector Pill Toggle */}
        <div className="bg-[#EBE5D9] dark:bg-[#383532] p-1 rounded-full flex items-center gap-1 border border-[#DCD5C6] dark:border-[#4A4743]/50 shrink-0">
          <button
            type="button"
            onClick={() => setSearchMode('local')}
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all flex items-center gap-1 ${
              searchMode === 'local'
                ? 'bg-[#FCFBF8] dark:bg-[#2A2826] text-[#4A4743] dark:text-[#E0DCD3] shadow-xs'
                : 'text-[#7A756D] dark:text-[#A09A90] hover:text-[#4A4743] dark:hover:text-[#E0DCD3]'
            }`}
            title="Filtra libri salvati nella tua libreria"
          >
            <Library className="w-3 h-3" />
            <span>I miei libri</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSearchMode('online');
              if (searchMode === 'online' && isOnline && searchQuery.trim()) {
                onTriggerOnlineSearch(searchQuery);
              }
            }}
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all flex items-center gap-1 ${
              searchMode === 'online'
                ? 'bg-[#B0BEA9] dark:bg-[#5C6B55] text-[#31362F] dark:text-[#E0DCD3] shadow-xs'
                : 'text-[#7A756D] dark:text-[#A09A90] hover:text-[#4A4743] dark:hover:text-[#E0DCD3]'
            }`}
            title="Cerca nel catalogo globale Google Books"
          >
            <Globe className="w-3 h-3" />
            <span>Online</span>
          </button>
        </div>
      </div>
    </form>
  );
};
