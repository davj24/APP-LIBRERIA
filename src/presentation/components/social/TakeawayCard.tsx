import React from 'react';
import { motion } from 'framer-motion';
import { Star, Globe, Users, Lock, Heart, Quote } from 'lucide-react';
import type { BookTakeaway, PrivacyLevel } from '../../../domain/models/social';

interface TakeawayCardProps {
  takeaway: BookTakeaway;
  onLike: (takeawayId: string) => void;
  onOpenFriendProfile?: (userId: string) => void;
}

export const TakeawayCard: React.FC<TakeawayCardProps> = ({
  takeaway,
  onLike,
  onOpenFriendProfile
}) => {
  const getPrivacyBadge = (privacy: PrivacyLevel) => {
    switch (privacy) {
      case 'public':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 flex items-center gap-1">
            <Globe size={11} /> Pubblico
          </span>
        );
      case 'friends':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <Users size={11} /> Solo Amici
          </span>
        );
      case 'private':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 border border-purple-500/30 text-purple-600 dark:text-purple-400 flex items-center gap-1">
            <Lock size={11} /> Privato (Personale)
          </span>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-[#EBE5D9]/60 dark:bg-[#383532]/60 rounded-3xl p-5 border border-[#DCD5C6] dark:border-[#4A4743]/50 shadow-xs space-y-3"
    >
      {/* Header Autore + Privacy Tag */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onOpenFriendProfile?.(takeaway.userId)}
          className="flex items-center gap-2.5 text-left cursor-pointer hover:opacity-80 transition-opacity"
          title={`Vedi profilo di ${takeaway.userName}`}
        >
          <img
            src={takeaway.userAvatar}
            alt={takeaway.userName}
            className="w-9 h-9 rounded-full object-cover ring-2 ring-[#B0BEA9] dark:ring-[#5C6B55]"
          />
          <div>
            <h4 className="text-xs font-extrabold text-[#31362F] dark:text-[#E0DCD3] hover:underline">
              {takeaway.userName}
            </h4>
            <span className="text-[10px] text-[#7A756D] dark:text-[#A09A90]">
              {takeaway.createdAt}
            </span>
          </div>
        </button>

        {getPrivacyBadge(takeaway.privacy)}
      </div>

      {/* Riferimento Libro + Voto 1-5 Stelle */}
      <div className="p-3 rounded-2xl bg-[#E0DCD3]/50 dark:bg-[#2C2926]/50 border border-[#DCD5C6]/60 dark:border-[#4A4743]/30 flex items-center justify-between">
        <div>
          <h5 className="text-xs font-bold text-[#31362F] dark:text-[#E0DCD3]">
            {takeaway.bookTitle}
          </h5>
          <p className="text-[11px] text-[#7A756D] dark:text-[#A09A90]">
            {takeaway.bookAuthor}
          </p>
        </div>

        {/* Rating Stelle */}
        <div className="flex items-center gap-0.5 shrink-0">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={13}
              className={star <= takeaway.rating ? 'text-amber-500 fill-amber-500' : 'text-neutral-300 dark:text-neutral-700'}
            />
          ))}
        </div>
      </div>

      {/* Contenuto Takeaway / Appunto */}
      <div className="p-4 rounded-2xl bg-white/60 dark:bg-neutral-800/60 border border-[#DCD5C6]/50 dark:border-[#4A4743]/40 space-y-1 relative">
        <Quote className="absolute top-2 right-2 text-[#7A756D]/10 dark:text-[#A09A90]/10 w-8 h-8 pointer-events-none" />
        <p className="text-xs text-[#31362F] dark:text-[#E0DCD3] leading-relaxed whitespace-pre-line relative z-10 font-serif">
          {takeaway.content}
        </p>
      </div>

      {/* Footer Reactions */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={() => onLike(takeaway.id)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            takeaway.isLiked
              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
              : 'hover:bg-white/40 dark:hover:bg-neutral-800/40 text-[#7A756D] dark:text-[#A09A90]'
          }`}
        >
          <Heart size={14} className={takeaway.isLiked ? 'fill-rose-500 text-rose-500' : ''} />
          <span>{takeaway.likesCount} utile</span>
        </button>
      </div>
    </motion.div>
  );
};
