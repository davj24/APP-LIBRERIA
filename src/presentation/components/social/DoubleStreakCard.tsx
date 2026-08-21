import React, { useState } from 'react';
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
  const [activePactIndex, setActivePactIndex] = useState(0);

  if (!pacts || pacts.length === 0) return null;

  const currentPact = pacts[activePactIndex] || pacts[0];
  const isBothCompleted = currentPact.userReadToday && currentPact.partnerReadToday;

  return (
    <div className="space-y-2">
      
      {/* Header con Selettore se ci sono più patti (Scalabilità Multi-Streak) */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-extrabold text-[#7A756D] dark:text-[#9A9488] uppercase tracking-wider flex items-center gap-1.5">
          <Flame size={15} className="text-amber-500 fill-amber-500 animate-pulse" />
          Patto di Costanza (Streak Condivisa)
        </h3>

        {pacts.length > 1 && (
          <div className="flex items-center gap-1">
            {pacts.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => setActivePactIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === activePactIndex
                    ? 'w-5 bg-amber-500'
                    : 'bg-[#DCD5C6] dark:bg-[#4A4743] hover:bg-amber-400'
                }`}
                title={`Patto con ${p.partnerName}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Hero Card Doppia Streak */}
      <motion.div
        key={currentPact.id}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1C1A18] via-[#2D2824] to-[#1E1C1A] text-white p-5 border border-[#3E3833] shadow-xl space-y-4"
      >
        {/* Glow ambientale infuocato di sfondo */}
        <div className="absolute -top-16 -left-16 w-40 h-40 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-40 h-40 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* 1. PONTE VISIVO DOPPIA STREAK (Two avatars connected by fire bridge) */}
        <div className="relative z-10 flex items-center justify-between px-2">
          
          {/* Avatar Utente (Tu) */}
          <div className="flex flex-col items-center gap-1.5">
            <div className="relative">
              <img
                src={userAvatar}
                alt={userName}
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 shadow-lg transition-all ${
                  currentPact.userReadToday 
                    ? 'border-emerald-500 ring-4 ring-emerald-500/30' 
                    : 'border-amber-500/60 ring-2 ring-amber-500/20'
                }`}
              />
              <div className={`absolute -bottom-1 -right-1 p-1 rounded-full text-[10px] font-black border-2 border-[#1C1A18] ${
                currentPact.userReadToday ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
              }`}>
                {currentPact.userReadToday ? <CheckCircle2 size={12} /> : <Flame size={12} />}
              </div>
            </div>
            <span className="text-xs font-bold text-[#E0DCD3]">
              {userName}
            </span>
          </div>

          {/* Ponte di Fuoco centrale con conteggio giorni */}
          <div className="flex-1 flex flex-col items-center justify-center px-3 space-y-1">
            <div className="relative w-full flex items-center justify-center">
              {/* Linea congiungente con gradiente */}
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-amber-500 to-orange-500 rounded-full opacity-60" />
              
              {/* Badge centrale Fiamma */}
              <motion.div 
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="relative z-10 px-3 py-1.5 bg-[#2C2723] rounded-full border border-amber-500/40 shadow-lg flex items-center gap-1.5 text-amber-400"
              >
                <Flame size={18} className="fill-amber-500 text-amber-500" />
                <span className="text-sm font-black text-white">{currentPact.streakDays} gg</span>
              </motion.div>
            </div>
            
            <span className="text-[10px] font-semibold text-amber-300/80 uppercase tracking-widest text-center">
              Streak Condivisa
            </span>
          </div>

          {/* Avatar Amico Partner (Elena) */}
          <button
            onClick={() => onOpenFriendProfile?.('user-elena')}
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
            title={`Vedi profilo di ${currentPact.partnerName}`}
          >
            <div className="relative">
              <img
                src={currentPact.partnerAvatar}
                alt={currentPact.partnerName}
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 shadow-lg transition-all group-hover:scale-105 ${
                  currentPact.partnerReadToday 
                    ? 'border-emerald-500 ring-4 ring-emerald-500/30' 
                    : 'border-amber-500/60 ring-2 ring-amber-500/20'
                }`}
              />
              <div className={`absolute -bottom-1 -right-1 p-1 rounded-full text-[10px] font-black border-2 border-[#1C1A18] ${
                currentPact.partnerReadToday ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
              }`}>
                {currentPact.partnerReadToday ? <CheckCircle2 size={12} /> : <Flame size={12} />}
              </div>
            </div>
            <span className="text-xs font-bold text-[#E0DCD3] group-hover:underline truncate max-w-[80px]">
              {currentPact.partnerName.split(' ')[0]}
            </span>
          </button>
        </div>

        {/* 2. STATO CHECK-IN ODIERNO */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          {/* Box Tu */}
          <div className={`p-3 rounded-2xl border text-xs space-y-1 transition-all ${
            currentPact.userReadToday
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
          }`}>
            <div className="flex items-center justify-between font-extrabold text-[11px]">
              <span>Tu</span>
              {currentPact.userReadToday ? <CheckCircle2 size={14} className="text-emerald-400" /> : <AlertCircle size={14} className="text-amber-400" />}
            </div>
            <p className="font-bold text-[11px]">
              {currentPact.userReadToday ? 'Lettura fatta oggi! 🎉' : 'Non ancora letto oggi'}
            </p>
          </div>

          {/* Box Partner */}
          <button
            onClick={() => onOpenFriendProfile?.('user-elena')}
            className={`p-3 rounded-2xl border text-xs space-y-1 transition-all text-left cursor-pointer hover:opacity-90 ${
              currentPact.partnerReadToday
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            }`}
          >
            <div className="flex items-center justify-between font-extrabold text-[11px]">
              <span className="truncate">{currentPact.partnerName.split(' ')[0]}</span>
              {currentPact.partnerReadToday ? <CheckCircle2 size={14} className="text-emerald-400" /> : <AlertCircle size={14} className="text-amber-400" />}
            </div>
            <p className="font-bold text-[11px]">
              {currentPact.partnerReadToday ? 'Ha già letto oggi! 📖' : 'In attesa che legga...'}
            </p>
          </button>
        </div>

        {/* 3. PULSANTE REGISTRA O AVVISO */}
        {!currentPact.userReadToday ? (
          <button
            onClick={() => onCheckInToday(currentPact.id)}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
          >
            <Flame size={16} />
            <span>Registra Lettura di Oggi per Salvare la Fiamma</span>
          </button>
        ) : (
          <div className="flex items-center justify-between px-2 text-[11px] font-semibold text-emerald-400/90">
            <span className="flex items-center gap-1">
              <Sparkles size={13} />
              {isBothCompleted ? 'Fiamma protetta per oggi per entrambi!' : 'In attesa che l\'amico completi.'}
            </span>
            <button
              onClick={() => onOpenFriendProfile?.('user-elena')}
              className="text-white hover:underline font-bold flex items-center gap-0.5"
            >
              Profilo <ChevronRight size={12} />
            </button>
          </div>
        )}

      </motion.div>
    </div>
  );
};
