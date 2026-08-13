import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Check } from 'lucide-react';
import type { LivePresence } from '../../../domain/models/social';

interface LivePresenceWidgetProps {
  presences: LivePresence[];
  onSendPing: (presenceId: string, emoji: string) => void;
}

export const LivePresenceWidget: React.FC<LivePresenceWidgetProps> = ({
  presences,
  onSendPing
}) => {
  const [activePings, setActivePings] = useState<Record<string, string>>({});

  const pingEmojis = [
    { emoji: '☕', label: 'Caffè' },
    { emoji: '🔥', label: 'Fuoco' },
    { emoji: '👏', label: 'Applausi' },
    { emoji: '🚀', label: 'In Orbita' }
  ];

  const handlePing = (presenceId: string, emoji: string) => {
    setActivePings(prev => ({ ...prev, [presenceId]: emoji }));
    onSendPing(presenceId, emoji);

    setTimeout(() => {
      setActivePings(prev => {
        const copy = { ...prev };
        delete copy[presenceId];
        return copy;
      });
    }, 2500);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-extrabold text-[#7A756D] dark:text-[#A09A90] uppercase tracking-wider flex items-center gap-1.5">
          <Radio size={14} className="text-emerald-500 animate-pulse" />
          Amici in Lettura Ora (Presenza Live)
        </h3>
        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
          {presences.length} Attivi
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {presences.map((presence) => {
          const sentPing = activePings[presence.id];
          const progressPercent = Math.round((presence.progressPage / presence.totalPages) * 100);

          return (
            <motion.div
              key={presence.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#EBE5D9]/60 dark:bg-[#383532]/60 rounded-3xl p-4 border border-[#DCD5C6] dark:border-[#4A4743]/50 shadow-xs flex items-center justify-between gap-3 relative overflow-hidden"
            >
              {/* Info Lettore + Libro */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="relative shrink-0">
                  <img
                    src={presence.userAvatar}
                    alt={presence.userName}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-emerald-500/60"
                  />
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#383532]" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-extrabold text-[#31362F] dark:text-[#E0DCD3] truncate">
                      {presence.userName}
                    </h4>
                  </div>
                  <p className="text-[11px] font-medium text-[#7A756D] dark:text-[#A09A90] truncate">
                    Sta leggendo <span className="font-bold text-[#31362F] dark:text-[#E0DCD3]">"{presence.bookTitle}"</span> (pag. {presence.progressPage}/{presence.totalPages})
                  </p>

                  {/* Progress Line */}
                  <div className="w-full h-1 bg-[#DCD5C6] dark:bg-[#4A4743] rounded-full overflow-hidden mt-1.5">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Quick Ping Buttons */}
              <div className="flex items-center gap-1 shrink-0">
                <AnimatePresence mode="wait">
                  {sentPing ? (
                    <motion.div
                      key="ping-sent"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      className="px-3 py-1.5 rounded-2xl bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-1 shadow-md"
                    >
                      <Check size={14} /> Ping inviato {sentPing}!
                    </motion.div>
                  ) : (
                    <div className="flex items-center gap-1 bg-white/40 dark:bg-neutral-800/40 p-1 rounded-2xl border border-[#DCD5C6]/60 dark:border-[#4A4743]/40">
                      {pingEmojis.map(({ emoji, label }) => (
                        <button
                          key={emoji}
                          onClick={() => handlePing(presence.id, emoji)}
                          title={`Invia Ping: ${label}`}
                          className="w-8 h-8 rounded-xl hover:bg-white dark:hover:bg-neutral-700 flex items-center justify-center text-sm transition-transform active:scale-90 cursor-pointer"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
