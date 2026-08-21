import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';
import type { LivePresence } from '../../../domain/models/social';

interface CompactLiveReadersWidgetProps {
  presences: LivePresence[];
  onSendPing?: (presenceId: string, emoji: string) => void;
  onOpenFriendProfile?: (userId: string) => void;
}

export const CompactLiveReadersWidget: React.FC<CompactLiveReadersWidgetProps> = ({
  presences,
  onSendPing,
  onOpenFriendProfile
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activePings, setActivePings] = useState<Record<string, string>>({});

  if (!presences || presences.length === 0) return null;

  const pingEmojis = [
    { emoji: '☕', label: 'Caffè' },
    { emoji: '🔥', label: 'Fuoco' },
    { emoji: '👏', label: 'Applausi' },
    { emoji: '🚀', label: 'In Orbita' }
  ];

  const handlePing = (presenceId: string, emoji: string) => {
    setActivePings(prev => ({ ...prev, [presenceId]: emoji }));
    onSendPing?.(presenceId, emoji);

    setTimeout(() => {
      setActivePings(prev => {
        const copy = { ...prev };
        delete copy[presenceId];
        return copy;
      });
    }, 2500);
  };

  return (
    <div className="space-y-2">
      {/* 1. STATE COLLAPSED: Small Compact Pill Bar */}
      <motion.div
        layout
        className="bg-[#EFECE6] dark:bg-[#272422] rounded-2xl border border-[#E2DDD2] dark:border-[#36322E] p-3 shadow-xs"
      >
        <div className="flex items-center justify-between gap-3">
          
          {/* Left: Indicator + Avatar Overlaps */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-3 flex-1 text-left cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-extrabold text-[#31362F] dark:text-[#E0DCD3] group-hover:underline">
                In lettura ora ({presences.length})
              </span>
            </div>

            {/* Avatars Sovrapposti Compatte */}
            <div className="flex -space-x-2 overflow-hidden items-center">
              {presences.map((presence) => (
                <button
                  key={presence.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenFriendProfile?.(presence.userId);
                  }}
                  className="relative group/avatar cursor-pointer hover:z-20 hover:scale-110 transition-transform"
                  title={`${presence.userName} sta leggendo ${presence.bookTitle}`}
                >
                  <img
                    src={presence.userAvatar}
                    alt={presence.userName}
                    className="w-7 h-7 rounded-full object-cover ring-2 ring-[#EFECE6] dark:ring-[#272422]"
                  />
                </button>
              ))}
            </div>
          </button>

          {/* Right: Expand / Collapse Toggle Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-lg hover:bg-[#E2DDD2] dark:hover:bg-[#36322E] text-[#7A756D] dark:text-[#9A9488] transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
          >
            <span>{isExpanded ? 'Riduci' : 'Mostra'}</span>
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {/* 2. STATE EXPANDED: Full Readers List */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden pt-3 border-t border-[#E2DDD2] dark:border-[#36322E] mt-3 space-y-2.5"
            >
              {presences.map((presence) => {
                const sentPing = activePings[presence.id];
                const progressPercent = Math.round((presence.progressPage / presence.totalPages) * 100);

                return (
                  <div
                    key={presence.id}
                    className="bg-[#F7F4EE] dark:bg-[#201E1C] p-3 rounded-xl border border-[#E8E3D8] dark:border-[#312E2A] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    {/* Reader Info */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <button
                        onClick={() => onOpenFriendProfile?.(presence.userId)}
                        className="relative shrink-0 cursor-pointer hover:scale-105 transition-transform"
                      >
                        <img
                          src={presence.userAvatar}
                          alt={presence.userName}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/60"
                        />
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#201E1C]" />
                      </button>

                      <div className="min-w-0 flex-1 space-y-1">
                        <button
                          onClick={() => onOpenFriendProfile?.(presence.userId)}
                          className="text-xs font-extrabold text-[#31362F] dark:text-[#E0DCD3] truncate hover:underline text-left cursor-pointer block"
                        >
                          {presence.userName}
                        </button>
                        <p className="text-[11px] font-medium text-[#7A756D] dark:text-[#9A9488] truncate">
                          Sta leggendo <span className="font-bold text-[#31362F] dark:text-[#E0DCD3]">"{presence.bookTitle}"</span>
                        </p>

                        {/* Progress Bar */}
                        <div className="w-full bg-[#E2DDD2] dark:bg-[#36322E] h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Quick Pings */}
                    <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                      <AnimatePresence mode="wait">
                        {sentPing ? (
                          <motion.div
                            key="ping-sent"
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            className="px-2.5 py-1 rounded-xl bg-emerald-600 text-white font-extrabold text-[11px] flex items-center gap-1 shadow-sm"
                          >
                            <Check size={12} /> Inviato {sentPing}
                          </motion.div>
                        ) : (
                          <div className="flex items-center gap-1 bg-[#EBE5D9] dark:bg-[#2A2724] p-1 rounded-xl border border-[#DCD5C6] dark:border-[#383430]">
                            {pingEmojis.map(({ emoji, label }) => (
                              <button
                                key={emoji}
                                onClick={() => handlePing(presence.id, emoji)}
                                title={`Ping: ${label}`}
                                className="w-7 h-7 rounded-lg hover:bg-white dark:hover:bg-[#36322E] flex items-center justify-center text-xs transition-transform active:scale-90 cursor-pointer"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
