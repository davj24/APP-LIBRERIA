import React from 'react';
import { motion } from 'framer-motion';
import { Users, BookOpen, MessageSquare, Check, Plus, Rocket, Glasses, Crown } from 'lucide-react';
import type { BookClub } from '../../../domain/models/social';

interface BookClubsCardProps {
  club: BookClub;
  onToggleJoin: (clubId: string) => void;
}

export const BookClubsCard: React.FC<BookClubsCardProps> = ({
  club,
  onToggleJoin
}) => {
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Rocket': return Rocket;
      case 'Glasses': return Glasses;
      case 'Crown': return Crown;
      default: return BookOpen;
    }
  };

  const IconComp = getIconComponent(club.icon);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-[#EBE5D9]/60 dark:bg-[#383532]/60 rounded-3xl overflow-hidden border border-[#DCD5C6] dark:border-[#4A4743]/50 shadow-xs flex flex-col justify-between transition-colors"
    >
      {/* Cover Image & Header */}
      <div className="relative h-28 w-full overflow-hidden">
        <img
          src={club.coverUrl}
          alt={club.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-4 justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0">
              <IconComp size={16} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white leading-tight">
                {club.name}
              </h3>
              <span className="text-[10px] font-medium text-white/80">
                {club.category}
              </span>
            </div>
          </div>

          <button
            onClick={() => onToggleJoin(club.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
              club.isJoined
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-[#B0BEA9] dark:bg-[#5C6B55] text-[#31362F] dark:text-[#E0DCD3] hover:bg-[#A0AF99]'
            }`}
          >
            {club.isJoined ? (
              <>
                <Check size={14} />
                <span>Iscritto</span>
              </>
            ) : (
              <>
                <Plus size={14} />
                <span>Partecipa</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <p className="text-xs text-[#7A756D] dark:text-[#A09A90] leading-relaxed">
          {club.description}
        </p>

        {/* Libro del Mese in Corso */}
        <div className="p-3 rounded-2xl bg-[#E0DCD3]/50 dark:bg-[#2C2926]/50 border border-[#DCD5C6]/60 dark:border-[#4A4743]/30 flex items-center gap-3">
          <img
            src={club.currentBook.coverUrl}
            alt={club.currentBook.title}
            className="w-10 h-14 rounded-lg object-cover shadow-xs shrink-0"
          />
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#B0BEA9] dark:text-[#889B80]">
              Libro del Mese
            </span>
            <h4 className="text-xs font-bold text-[#31362F] dark:text-[#E0DCD3] truncate">
              {club.currentBook.title}
            </h4>
            <p className="text-[11px] text-[#7A756D] dark:text-[#A09A90] truncate">
              {club.currentBook.author}
            </p>
          </div>
        </div>

        {/* Footer Info (Membri + Discussioni) */}
        <div className="flex items-center justify-between text-xs font-bold text-[#7A756D] dark:text-[#A09A90] pt-1">
          <div className="flex items-center gap-1">
            <Users size={14} />
            <span>{club.membersCount} membri</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare size={14} />
            <span>{club.activeDiscussionCount} discussioni</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
