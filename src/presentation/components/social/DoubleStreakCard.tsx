import React from 'react';
import { motion } from 'framer-motion';
import { Flame, CheckCircle2, AlertCircle, ChevronRight, Sparkles } from 'lucide-react';
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

  return (
    <div className="space-y-3">
      
      {/* Header Sezione */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-extrabold text-[#7A756D] dark:text-[#9A9488] uppercase tracking-wider flex items-center gap-1.5">
          <Flame size={15} className="text-amber-500 fill-amber-500 animate-pulse" />
          Patti di Costanza ({pacts.length})
        </h3>
        <span className="text-[11px] font-semibold text-[#888277] dark:text-[#888277]">
          Tutti i patti attivi
        </span>
      </div>

      {/* Lista di TUTTE le Streak Visibili Insieme (Senza Swipe o cambi pagina) */}
      <div className="space-y-3">
        {pacts.map((pact) => {
          const isBothCompleted = pact.userReadToday && pact.partnerReadToday;
          
          return (
            <motion.div
              key={pact.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-3xl bg-[#EFECE6] dark:bg-[#272422] p-4 sm:p-5 border border-[#E2DDD2] dark:border-[#36322E] shadow-xs space-y-4 transition-colors"
            >
              {/* 1. PONTE VISIVO DOPPIA STREAK (Palette Coerente Chiara/Scura) */}
              <div className="relative z-10 flex items-center justify-between px-1 sm:px-2">
                
                {/* Avatar Utente (Tu) */}
                <div className="flex flex-col items-center gap-1.5">
                  <div className="relative">
                    <img
                      src={userAvatar}
                      alt={userName}
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 shadow-sm transition-all ${
                        pact.userReadToday 
                          ? 'border-emerald-500 ring-2 ring-emerald-500/30' 
                          : 'border-amber-500/60 ring-2 ring-amber-500/20'
                      }`}
                    />
                    <div className={`absolute -bottom-1 -right-1 p-0.5 rounded-full text-[10px] border-2 border-[#EFECE6] dark:border-[#272422] ${
                      pact.userReadToday ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                    }`}>
                      {pact.userReadToday ? <CheckCircle2 size={11} /> : <Flame size={11} />}
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#31362F] dark:text-[#E0DCD3]">
                    {userName}
                  </span>
                </div>

                {/* Ponte di Fuoco centrale con conteggio giorni */}
                <div className="flex-1 flex flex-col items-center justify-center px-2 space-y-1">
                  <div className="relative w-full flex items-center justify-center">
                    {/* Linea congiungente con gradiente */}
                    <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-emerald-500/60 via-amber-500/80 to-orange-500/60 rounded-full" />
                    
                    {/* Badge centrale Fiamma */}
                    <div className="relative z-10 px-2.5 py-1 bg-[#F7F4EE] dark:bg-[#1E1C1A] rounded-full border border-amber-500/40 shadow-xs flex items-center gap-1 text-amber-600 dark:text-amber-400">
                      <Flame size={16} className="fill-amber-500 text-amber-500 animate-pulse" />
                      <span className="text-xs font-black text-[#31362F] dark:text-[#E0DCD3]">{pact.streakDays} gg</span>
                    </div>
                  </div>
                  
                  <span className="text-[10px] font-bold text-[#7A756D] dark:text-[#9A9488] uppercase tracking-wider text-center">
                    Streak Condivisa
                  </span>
                </div>

                {/* Avatar Amico Partner */}
                <button
                  onClick={() => onOpenFriendProfile?.('user-elena')}
                  className="flex flex-col items-center gap-1.5 group cursor-pointer"
                  title={`Vedi profilo di ${pact.partnerName}`}
                >
                  <div className="relative">
                    <img
                      src={pact.partnerAvatar}
                      alt={pact.partnerName}
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 shadow-sm transition-all group-hover:scale-105 ${
                        pact.partnerReadToday 
                          ? 'border-emerald-500 ring-2 ring-emerald-500/30' 
                          : 'border-amber-500/60 ring-2 ring-amber-500/20'
                      }`}
                    />
                    <div className={`absolute -bottom-1 -right-1 p-0.5 rounded-full text-[10px] border-2 border-[#EFECE6] dark:border-[#272422] ${
                      pact.partnerReadToday ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                    }`}>
                      {pact.partnerReadToday ? <CheckCircle2 size={11} /> : <Flame size={11} />}
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#31362F] dark:text-[#E0DCD3] group-hover:underline truncate max-w-[75px]">
                    {pact.partnerName.split(' ')[0]}
                  </span>
                </button>
              </div>

              {/* 2. STATO CHECK-IN ODIERNO (Card integrate trasparenti) */}
              <div className="grid grid-cols-2 gap-2 pt-0.5">
                {/* Box Tu */}
                <div className={`p-2.5 rounded-2xl border text-xs space-y-0.5 transition-all ${
                  pact.userReadToday
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300'
                }`}>
                  <div className="flex items-center justify-between font-extrabold text-[11px]">
                    <span>Tu</span>
                    {pact.userReadToday ? <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400" /> : <AlertCircle size={13} className="text-amber-600 dark:text-amber-400" />}
                  </div>
                  <p className="font-bold text-[11px]">
                    {pact.userReadToday ? 'Lettura registrata! 🎉' : 'Non ancora letto oggi'}
                  </p>
                </div>

                {/* Box Partner */}
                <button
                  onClick={() => onOpenFriendProfile?.('user-elena')}
                  className={`p-2.5 rounded-2xl border text-xs space-y-0.5 transition-all text-left cursor-pointer hover:opacity-90 ${
                    pact.partnerReadToday
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300'
                  }`}
                >
                  <div className="flex items-center justify-between font-extrabold text-[11px]">
                    <span className="truncate">{pact.partnerName.split(' ')[0]}</span>
                    {pact.partnerReadToday ? <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400" /> : <AlertCircle size={13} className="text-amber-600 dark:text-amber-400" />}
                  </div>
                  <p className="font-bold text-[11px]">
                    {pact.partnerReadToday ? 'Ha già letto oggi! 📖' : 'In attesa che legga...'}
                  </p>
                </button>
              </div>

              {/* 3. AZIONE CHECK-IN O CONFERMA */}
              {!pact.userReadToday ? (
                <button
                  onClick={() => onCheckInToday(pact.id)}
                  className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-xs shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
                >
                  <Flame size={15} />
                  <span>Registra Lettura di Oggi con {pact.partnerName.split(' ')[0]}</span>
                </button>
              ) : (
                <div className="flex items-center justify-between px-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                  <span className="flex items-center gap-1">
                    <Sparkles size={12} />
                    {isBothCompleted ? 'Fiamma protetta per entrambi!' : 'In attesa che l\'amico completi.'}
                  </span>
                  <button
                    onClick={() => onOpenFriendProfile?.('user-elena')}
                    className="text-[#5C6B55] dark:text-[#A8BB9C] hover:underline font-bold flex items-center gap-0.5"
                  >
                    Profilo <ChevronRight size={12} />
                  </button>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
