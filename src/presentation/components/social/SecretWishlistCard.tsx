import React from 'react';
import { motion } from 'framer-motion';
import { Gift, Check, EyeOff } from 'lucide-react';
import type { SecretWishlistItem } from '../../../domain/models/social';

interface SecretWishlistCardProps {
  item: SecretWishlistItem;
  isOwnerView?: boolean;
  onToggleReserve: (itemId: string) => void;
}

export const SecretWishlistCard: React.FC<SecretWishlistCardProps> = ({
  item,
  isOwnerView = false,
  onToggleReserve
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-[#EBE5D9]/60 dark:bg-[#383532]/60 rounded-3xl p-4 border border-[#DCD5C6] dark:border-[#4A4743]/50 shadow-xs flex items-center justify-between gap-3"
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <img
          src={item.coverUrl}
          alt={item.title}
          className="w-12 h-16 rounded-xl object-cover shadow-xs shrink-0"
        />

        <div className="min-w-0 flex-1">
          <h4 className="text-xs font-extrabold text-[#31362F] dark:text-[#E0DCD3] truncate">
            {item.title}
          </h4>
          <p className="text-[11px] text-[#7A756D] dark:text-[#A09A90] truncate">
            {item.author}
          </p>
          {item.price && (
            <span className="text-[10px] font-bold text-[#5C6B55] dark:text-[#B0BEA9] inline-block mt-0.5">
              {item.price}
            </span>
          )}

          {/* Per gli Amici: Mostra se qualcuno l'ha prenotato per evitare doppioni */}
          {!isOwnerView && item.isReservedByFriend && (
            <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-1">
              <Gift size={11} /> Prenotato come regalo da {item.reservedByUserName || 'un amico'}
            </div>
          )}

          {/* Per il Proprietario della lista: La sorpresa rimane protetta! */}
          {isOwnerView && (
            <div className="text-[10px] font-medium text-[#7A756D] dark:text-[#A09A90] flex items-center gap-1 mt-1 italic">
              <EyeOff size={11} /> Sorpresa protetta (visibile solo agli amici)
            </div>
          )}
        </div>
      </div>

      {/* Tasto Prenota Regalo (Visibile agli Amici) */}
      {!isOwnerView && (
        <button
          onClick={() => onToggleReserve(item.id)}
          className={`px-3 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer ${
            item.isReservedByFriend
              ? 'bg-amber-500 text-white hover:bg-amber-600'
              : 'bg-[#B0BEA9] dark:bg-[#5C6B55] text-[#31362F] dark:text-[#E0DCD3] hover:bg-[#A0AF99]'
          }`}
        >
          {item.isReservedByFriend ? (
            <>
              <Check size={14} />
              <span>Prenotato</span>
            </>
          ) : (
            <>
              <Gift size={14} />
              <span>Prenota Regalo</span>
            </>
          )}
        </button>
      )}
    </motion.div>
  );
};
