import React from 'react';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import {
  X,
  User,
  Settings,
  BookOpen,
  Flame,
  Target,
  Sparkles,
  ChevronRight,
  BookCheck
} from 'lucide-react';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useBooks } from '../../hooks/useBooks';

interface CompactProfileSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
  onOpenFullProfile: () => void;
}

export const CompactProfileSheet: React.FC<CompactProfileSheetProps> = ({
  isOpen,
  onClose,
  onOpenSettings,
  onOpenFullProfile
}) => {
  const { profile } = useUserProfile();
  const { books } = useBooks();

  const readCount = books.filter(b => b.status === 'Letto').length;
  const readingBooks = books.filter(b => b.status === 'In lettura');
  const currentReadingBook = readingBooks[0] || books.find(b => b.status === 'In lettura');

  const currentProgressPercent = currentReadingBook && currentReadingBook.totalPages
    ? Math.min(100, Math.round(((currentReadingBook.pagesRead || 0) / currentReadingBook.totalPages) * 100))
    : 0;

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.y > 100 || info.velocity.y > 400) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-end justify-center">
          {/* Backdrop con sfocatura */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
          />

          {/* Bottom Sheet Card del Profilo */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="relative z-10 w-full max-w-md bg-[#FCFBF8] dark:bg-[#2A2826] rounded-t-[2.5rem] p-6 shadow-2xl border-t border-[#EBE5D9] dark:border-[#4A4743]/60 space-y-5 select-none"
          >
            {/* Handle di Trascinamento */}
            <div className="w-12 h-1.5 bg-[#DCD5C6] dark:bg-[#4A4743] rounded-full mx-auto mb-1 opacity-80" />

            {/* Header Profilo con Avatar e Identità */}
            <div className="flex items-start justify-between gap-4 pt-1">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#5C6B55] to-[#788C71] text-white font-bold text-xl flex items-center justify-center shadow-md ring-4 ring-[#EBE5D9] dark:ring-[#383532] shrink-0 overflow-hidden">
                  {profile.avatarUrl ? (
                    <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}</span>
                  )}
                </div>

                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-black text-[#31362F] dark:text-[#E0DCD3] truncate leading-tight flex items-center gap-1.5">
                    <span>{profile.name}</span>
                    <Sparkles size={14} className="text-amber-500 fill-amber-500 shrink-0" />
                  </h3>
                  <p className="text-xs text-[#7A756D] dark:text-[#9A9488] truncate mt-0.5 font-medium">
                    {profile.bio || 'Appassionato lettore su BiblioDesk'}
                  </p>
                  <div className="inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 rounded-full bg-[#5C6B55]/15 dark:bg-[#A8BB9C]/15 border border-[#5C6B55]/30 text-[#3B4838] dark:text-[#A8BB9C] text-[10px] font-bold">
                    <Target size={11} />
                    <span>Obiettivo 2026: {profile.readingGoal || 24} libri</span>
                  </div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-[#EBE5D9] dark:bg-[#383532] text-[#4A4743] dark:text-[#E0DCD3] hover:bg-[#DCD5C6] flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            {/* Mini-Grid Statistiche Sintetiche */}
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <div className="bg-[#F7F4EE] dark:bg-[#201E1C] p-3 rounded-2xl border border-[#E8E3D8] dark:border-[#312E2A] text-center shadow-xs">
                <div className="w-7 h-7 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto mb-1">
                  <BookCheck size={15} />
                </div>
                <div className="text-base font-black text-[#31362F] dark:text-[#E0DCD3]">{readCount}</div>
                <div className="text-[10px] font-bold text-[#7A756D] dark:text-[#9A9488]">Letti</div>
              </div>

              <div className="bg-[#F7F4EE] dark:bg-[#201E1C] p-3 rounded-2xl border border-[#E8E3D8] dark:border-[#312E2A] text-center shadow-xs">
                <div className="w-7 h-7 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-1">
                  <Flame size={15} className="fill-amber-500" />
                </div>
                <div className="text-base font-black text-[#31362F] dark:text-[#E0DCD3]">0 gg</div>
                <div className="text-[10px] font-bold text-[#7A756D] dark:text-[#9A9488]">Streak</div>
              </div>

              <div className="bg-[#F7F4EE] dark:bg-[#201E1C] p-3 rounded-2xl border border-[#E8E3D8] dark:border-[#312E2A] text-center shadow-xs">
                <div className="w-7 h-7 rounded-xl bg-[#5C6B55]/15 text-[#5C6B55] dark:text-[#A8BB9C] flex items-center justify-center mx-auto mb-1">
                  <BookOpen size={15} />
                </div>
                <div className="text-base font-black text-[#31362F] dark:text-[#E0DCD3]">{readingBooks.length}</div>
                <div className="text-[10px] font-bold text-[#7A756D] dark:text-[#9A9488]">In lettura</div>
              </div>
            </div>

            {/* In Lettura (Mini Progress Card se presente) */}
            {currentReadingBook && (
              <div className="bg-[#F7F4EE] dark:bg-[#201E1C] p-3.5 rounded-2xl border border-[#E8E3D8] dark:border-[#312E2A] flex items-center gap-3">
                <img
                  src={currentReadingBook.coverUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400'}
                  alt={currentReadingBook.title}
                  className="w-10 h-14 rounded-lg object-cover border border-[#DCD5C6] dark:border-[#4A4743]/60 shrink-0 shadow-xs"
                />
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5C6B55] dark:text-[#A8BB9C]">
                      Lettura Attiva
                    </span>
                    <span className="text-[11px] font-bold text-[#31362F] dark:text-[#E0DCD3]">
                      {currentProgressPercent}%
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-[#31362F] dark:text-[#E0DCD3] truncate">
                    {currentReadingBook.title}
                  </h4>
                  <div className="w-full bg-[#E8E3D8] dark:bg-[#312E2A] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#5C6B55] h-full rounded-full transition-all duration-300"
                      style={{ width: `${currentProgressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Footer Azioni Rapide */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                onClick={() => {
                  onClose();
                  onOpenSettings();
                }}
                className="py-3 px-3 bg-[#F7F4EE] dark:bg-[#201E1C] hover:bg-[#EFECE6] dark:hover:bg-[#272422] text-[#31362F] dark:text-[#E0DCD3] rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 border border-[#E2DDD2] dark:border-[#36322E] shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                <Settings size={15} className="text-[#7A756D] dark:text-[#9A9488]" />
                <span>Impostazioni</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenFullProfile();
                }}
                className="py-3 px-3 bg-[#5C6B55] hover:bg-[#4D5A46] text-white rounded-2xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer border border-[#788C71]"
              >
                <User size={15} />
                <span>Profilo Completo</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
