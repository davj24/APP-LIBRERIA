import React from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2, Send, HeartHandshake, RefreshCw } from 'lucide-react';
import type { BookLoan } from '../../../domain/models/social';

interface LoanInventoryCardProps {
  loan: BookLoan;
  onUpdateStatus: (loanId: string, newStatus: 'in_prestito' | 'restituito') => void;
}

export const LoanInventoryCard: React.FC<LoanInventoryCardProps> = ({
  loan,
  onUpdateStatus
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-[#EBE5D9]/60 dark:bg-[#383532]/60 rounded-3xl p-4 border border-[#DCD5C6] dark:border-[#4A4743]/50 shadow-xs space-y-3 flex flex-col justify-between"
    >
      {/* Top Tag Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img
            src={loan.borrowerAvatar}
            alt={loan.borrowerName}
            className="w-7 h-7 rounded-full object-cover ring-2 ring-[#B0BEA9] dark:ring-[#5C6B55]"
          />
          <span className="text-xs font-extrabold text-[#31362F] dark:text-[#E0DCD3]">
            {loan.isMine ? `Prestato a ${loan.borrowerName}` : `Richiesto da ${loan.borrowerName}`}
          </span>
        </div>

        {loan.status === 'in_prestito' && (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <Clock size={11} /> In Prestito ({loan.daysElapsed} gg)
          </span>
        )}
        {loan.status === 'richiesto' && (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 flex items-center gap-1">
            <Send size={11} /> Richiesta Pendente
          </span>
        )}
        {loan.status === 'restituito' && (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <CheckCircle2 size={11} /> Restituito
          </span>
        )}
      </div>

      {/* Book Cover + Info */}
      <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#E0DCD3]/50 dark:bg-[#2C2926]/50 border border-[#DCD5C6]/60 dark:border-[#4A4743]/30">
        <img
          src={loan.bookCover}
          alt={loan.bookTitle}
          className="w-12 h-16 rounded-xl object-cover shadow-xs shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-extrabold text-[#31362F] dark:text-[#E0DCD3] truncate">
            {loan.bookTitle}
          </h4>
          <p className="text-[11px] text-[#7A756D] dark:text-[#A09A90] truncate">
            {loan.bookAuthor}
          </p>
          <p className="text-[10px] font-medium text-[#7A756D] dark:text-[#A09A90] mt-1">
            Data inizio prestito: {loan.loanDate}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-1 flex items-center justify-end gap-2">
        {loan.status === 'richiesto' && (
          <button
            onClick={() => onUpdateStatus(loan.id, 'in_prestito')}
            className="w-full py-2 rounded-2xl bg-[#B0BEA9] dark:bg-[#5C6B55] text-[#31362F] dark:text-[#E0DCD3] font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs hover:bg-[#A0AF99] transition-all cursor-pointer"
          >
            <HeartHandshake size={14} />
            <span>Conferma Prestito Libro</span>
          </button>
        )}

        {loan.status === 'in_prestito' && (
          <button
            onClick={() => onUpdateStatus(loan.id, 'restituito')}
            className="w-full py-2 rounded-2xl bg-[#E0DCD3] dark:bg-[#4A4743] hover:bg-[#DCD5C6] text-[#31362F] dark:text-[#E0DCD3] font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-[#DCD5C6] dark:border-[#4A4743]"
          >
            <RefreshCw size={14} />
            <span>Segna come Restituito</span>
          </button>
        )}
      </div>
    </motion.div>
  );
};
