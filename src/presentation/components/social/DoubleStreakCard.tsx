import React from 'react';
import { motion } from 'framer-motion';
import { Flame, CheckCircle2, AlertCircle, Sparkles, ChevronRight } from 'lucide-react';
import type { AccountabilityPartner } from '../../../domain/models/social';

interface DoubleStreakCardProps {
  pacts: AccountabilityPartner[];
  onCheckInToday: (pactId: string) => void;
  onOpenFriendProfile?: (friendId: string) => void;
  userAvatar?: string;
  userName?: string;
}

export const DoubleStreakCard: React.FC<DoubleStreakCardProps> = ({
  pacts,
  onCheckInToday,
  onOpenFriendProfile,
  userAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
  userName = 'Tu'
}) => {
  if (!pacts || pacts.length === 0) return null;

  // Contiamo quanti patti hanno entrambi completato oggi
  const allCompleted = pacts.every(p => p.userReadToday);
  const totalStreakDays = pacts.reduce((acc, p) => acc + p.streakDays, 0);

  return (
    <div className="space-y-3">
      {/* Header Sezione */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-extrabold text-[#7A756D] dark:text-[#9A9488] uppercase tracking-wider flex items-center gap-1.5">
          <Flame size={15} className="text-amber-500 fill-amber-500 animate-pulse" />
          Costellazione di Costanza ({pacts.length} Patti)
        </h3>
        <span className="text-[11px] font-semibold text-[#888277] dark:text-[#888277]">
          Matrice di Lettura
        </span>
      </div>

      {/* CARD OPZIONE 2: COSTELLAZIONE DI LETTURA (NODO CENTRALE + RAMI PATTI) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-3xl bg-[#EFECE6] dark:bg-[#272422] p-5 sm:p-6 border border-[#E2DDD2] dark:border-[#36322E] shadow-xs space-y-6 transition-colors"
      >
        {/* Glow di sfondo ambientale */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* 1. NODO CENTRALE (TU) */}
        <div className="flex flex-col items-center justify-center relative z-10 space-y-2">
          <div className="relative">
            <motion.img
              whileHover={{ scale: 1.05 }}
              src={userAvatar}
              alt={userName}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-[#F7F4EE] dark:border-[#201E1C] ring-4 ring-amber-500/40 shadow-md"
            />
            <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white p-1 rounded-full border-2 border-[#F7F4EE] dark:border-[#201E1C] shadow-sm">
              <Sparkles size={14} />
            </div>
          </div>

          <div className="text-center">
            <h4 className="text-sm font-extrabold text-[#31362F] dark:text-[#E0DCD3]">
              {userName} (Centro Costellazione)
            </h4>
            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
              🔥 {totalStreakDays} giorni totali alimentati
            </span>
          </div>
        </div>

        {/* 2. RAMIFICAZIONI COSTELLAZIONE VERSO I PARTNER */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {pacts.map((pact) => {
            return (
              <motion.div
                key={pact.id}
                whileHover={{ y: -2 }}
                className="relative bg-[#F7F4EE] dark:bg-[#201E1C] p-3.5 rounded-2xl border border-[#E8E3D8] dark:border-[#312E2A] flex items-center justify-between gap-3 shadow-xs"
              >
                {/* Indicatore visivo di connessione / Raggio di energia */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -top-3 w-0.5 h-3 bg-gradient-to-b from-amber-500 to-transparent opacity-40 sm:hidden" />

                {/* Info Partner Node */}
                <button
                  onClick={() => onOpenFriendProfile?.('user-elena')}
                  className="flex items-center gap-3 min-w-0 text-left group cursor-pointer flex-1"
                >
                  <div className="relative shrink-0">
                    <img
                      src={pact.partnerAvatar}
                      alt={pact.partnerName}
                      className={`w-11 h-11 rounded-full object-cover border-2 transition-all ${
                        pact.partnerReadToday
                          ? 'border-emerald-500 ring-2 ring-emerald-500/30'
                          : 'border-amber-500/60 ring-2 ring-amber-500/20'
                      }`}
                    />
                    <div className={`absolute -bottom-1 -right-1 p-0.5 rounded-full text-[9px] border border-[#F7F4EE] dark:border-[#201E1C] ${
                      pact.partnerReadToday ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                    }`}>
                      {pact.partnerReadToday ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h5 className="text-xs font-bold text-[#31362F] dark:text-[#E0DCD3] group-hover:underline truncate">
                      {pact.partnerName}
                    </h5>
                    <p className="text-[11px] text-[#7A756D] dark:text-[#9A9488] truncate">
                      {pact.partnerReadToday ? 'Ha già letto oggi 📖' : 'In attesa che legga...'}
                    </p>
                  </div>
                </button>

                {/* Badge Fiamma Condivisa col Partner */}
                <div className="flex flex-col items-end shrink-0 space-y-1">
                  <div className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-700 dark:text-amber-400 font-extrabold text-xs flex items-center gap-1">
                    <Flame size={13} className="fill-amber-500 text-amber-500" />
                    <span>{pact.streakDays} gg</span>
                  </div>

                  <button
                    onClick={() => onOpenFriendProfile?.('user-elena')}
                    className="text-[10px] font-bold text-[#5C6B55] dark:text-[#A8BB9C] hover:underline flex items-center gap-0.5"
                  >
                    Scheda <ChevronRight size={10} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* 3. PULSANTE AZIONE AZIONE CHECK-IN GLOBALE */}
        <div className="pt-1">
          {!allCompleted ? (
            <button
              onClick={() => pacts.forEach(p => onCheckInToday(p.id))}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
            >
              <Flame size={16} />
              <span>Registra Lettura per Alimentare la Costellazione 🔥</span>
            </button>
          ) : (
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-center text-xs font-extrabold flex items-center justify-center gap-1.5">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <span>Tutti i patti della costellazione sono protetti per oggi!</span>
            </div>
          )}
        </div>

      </motion.div>
    </div>
  );
};
