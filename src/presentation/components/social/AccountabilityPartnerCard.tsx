import React from 'react';
import { motion } from 'framer-motion';
import { Flame, CheckCircle2, AlertCircle, ShieldCheck, HeartHandshake } from 'lucide-react';
import type { AccountabilityPartner } from '../../../domain/models/social';

interface AccountabilityPartnerCardProps {
  partnerData: AccountabilityPartner;
  onCheckInToday: () => void;
  onOpenFriendProfile?: (userId: string) => void;
}

export const AccountabilityPartnerCard: React.FC<AccountabilityPartnerCardProps> = ({
  partnerData,
  onCheckInToday,
  onOpenFriendProfile
}) => {
  const isBothCompleted = partnerData.userReadToday && partnerData.partnerReadToday;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-[#EBE5D9]/60 dark:bg-[#383532]/60 rounded-3xl p-5 border border-[#DCD5C6] dark:border-[#4A4743]/50 shadow-xs space-y-4"
    >
      {/* Header Widget Patto */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <HeartHandshake size={18} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-[#31362F] dark:text-[#E0DCD3]">
              Patto di Costanza
            </h3>
            <p className="text-[11px] text-[#7A756D] dark:text-[#A09A90]">
              Streak Condiviso con {partnerData.partnerName}
            </p>
          </div>
        </div>

        {/* Fiamma Condivisa */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-black text-sm">
          <Flame size={18} className="fill-amber-500 animate-pulse" />
          <span>{partnerData.streakDays} Giorni</span>
        </div>
      </div>

      {/* Stato dei due partner per la giornata di oggi */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        {/* Tu (Davide) */}
        <div className={`p-3 rounded-2xl border transition-all ${
          partnerData.userReadToday 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300' 
            : 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-extrabold">Tu</span>
            {partnerData.userReadToday ? (
              <CheckCircle2 size={16} className="text-emerald-500" />
            ) : (
              <AlertCircle size={16} className="text-amber-500" />
            )}
          </div>
          <p className="text-xs font-bold">
            {partnerData.userReadToday ? 'Lettura registrata oggi! 🎉' : 'Nessuna lettura oggi'}
          </p>
        </div>

        {/* Amico (Elena) */}
        <button
          onClick={() => onOpenFriendProfile?.('user-elena')}
          className={`p-3 rounded-2xl border transition-all text-left cursor-pointer hover:opacity-90 ${
            partnerData.partnerReadToday 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300' 
              : 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <img
                src={partnerData.partnerAvatar}
                alt={partnerData.partnerName}
                className="w-4 h-4 rounded-full object-cover"
              />
              <span className="text-[11px] font-extrabold truncate max-w-[80px] hover:underline">
                {partnerData.partnerName.split(' ')[0]}
              </span>
            </div>
            {partnerData.partnerReadToday ? (
              <CheckCircle2 size={16} className="text-emerald-500" />
            ) : (
              <AlertCircle size={16} className="text-amber-500" />
            )}
          </div>
          <p className="text-xs font-bold">
            {partnerData.partnerReadToday ? 'Ha già letto oggi! 📖' : 'In attesa che legga...'}
          </p>
        </button>
      </div>

      {/* Regola della Fiamma / Warning */}
      <div className="p-3 rounded-2xl bg-[#E0DCD3]/40 dark:bg-[#2C2926]/40 text-xs text-[#7A756D] dark:text-[#A09A90] flex items-center gap-2">
        <ShieldCheck size={16} className="shrink-0 text-[#5C6B55] dark:text-[#B0BEA9]" />
        <p className="text-[11px] leading-tight">
          {isBothCompleted 
            ? '🔥 La fiamma è al sicuro per oggi! Avete entrambi mantenuto il patto.'
            : '⚠️ Se uno dei due salta la giornata di oggi, la fiamma dello streak condiviso si spegnerà per entrambi!'}
        </p>
      </div>

      {/* Pulsante per completare il Check-in odierno */}
      {!partnerData.userReadToday && (
        <button
          onClick={onCheckInToday}
          className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Flame size={16} />
          <span>Registra Lettura di Oggi per Salvare la Fiamma</span>
        </button>
      )}
    </motion.div>
  );
};
