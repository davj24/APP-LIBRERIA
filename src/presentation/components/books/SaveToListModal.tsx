import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, BookOpen, Clock, CheckCircle2, ShoppingBag, Check, Bookmark } from 'lucide-react';
import type { BookStatus } from '../../../domain/models/Book';
import { useRegisterModal } from '../../context/ModalContext';

export interface SaveToListModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookTitle?: string;
  bookAuthor?: string;
  coverUrl?: string | null;
  currentStatus?: BookStatus;
  isFavorite?: boolean;
  onSaveToList: (targetList: { status?: BookStatus; isFavorite?: boolean; listName: string }) => void;
}

export const SaveToListModal: React.FC<SaveToListModalProps> = ({
  isOpen,
  onClose,
  bookTitle = 'Libro',
  bookAuthor = '',
  coverUrl,
  currentStatus,
  isFavorite = false,
  onSaveToList,
}) => {
  useRegisterModal(isOpen);
  const [selectedList, setSelectedList] = useState<string | null>(null);

  const lists = [
    {
      id: 'to-read',
      name: 'Da Leggere',
      description: 'Aggiungi alla tua lista dei desideri di lettura',
      status: 'Da leggere' as BookStatus,
      icon: BookOpen,
      color: 'bg-[#F4F1EA] text-[#7A756D] border-[#EBE5D9] dark:bg-[#2A2826] dark:text-[#A09A90] dark:border-[#4A4743]/50',
    },
    {
      id: 'reading',
      name: 'In Lettura',
      description: 'Libri che stai leggendo attualmente',
      status: 'In lettura' as BookStatus,
      icon: Clock,
      color: 'bg-[#EBE5D9] text-[#4A4743] border-[#DCD5C6] dark:bg-[#383532] dark:text-[#E0DCD3] dark:border-[#4A4743]/60',
    },
    {
      id: 'read',
      name: 'Letto',
      description: 'Sposta tra i libri completati',
      status: 'Letto' as BookStatus,
      icon: CheckCircle2,
      color: 'bg-[#D8E2D5] text-[#2D382B] border-[#B0BEA9] dark:bg-[#3B4838] dark:text-[#E0DCD3] dark:border-[#5C6B55]',
    },
    {
      id: 'favorites',
      name: 'Preferiti & Wishlist',
      description: 'Salva nella tua collezione speciale dei preferiti',
      isFavorite: true,
      icon: Heart,
      color: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/60',
    },
    {
      id: 'buy-list',
      name: 'Da Acquistare',
      description: 'Reminder per gli acquisti futuri su Amazon / IBS / Vinted',
      status: 'Da leggere' as BookStatus,
      icon: ShoppingBag,
      color: 'bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/60',
    },
  ];

  const handleSelect = (item: typeof lists[0]) => {
    setSelectedList(item.id);
    setTimeout(() => {
      onSaveToList({
        status: item.status,
        isFavorite: item.isFavorite,
        listName: item.name,
      });
      setSelectedList(null);
      onClose();
    }, 200);
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
          {/* Backdrop scuro */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[200]"
          />

          <motion.div
            initial={{ y: '100%', opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: '100%', opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={(_: any, info: any) => {
              if (info.offset.y > 100 || info.velocity.y > 350) {
                onClose();
              }
            }}
            className="relative z-[201] bg-[#FCFBF8] dark:bg-[#33302D] text-[#4A4743] dark:text-[#E0DCD3] w-full max-w-md rounded-t-[2.25rem] sm:rounded-3xl shadow-2xl border border-[#EBE5D9] dark:border-[#4A4743]/60 transition-colors max-h-[85vh] flex flex-col overflow-hidden select-none"
          >
            {/* Drag Handle Bar */}
            <div className="w-full pt-2.5 pb-1 flex justify-center cursor-grab active:cursor-grabbing shrink-0">
              <div className="w-12 h-1.5 bg-[#DCD5C6] dark:bg-[#4A4743] rounded-full" />
            </div>

            {/* Content Container */}
            <div className="p-5 pt-1 space-y-4 overflow-y-auto flex-1">
              {/* Header */}
            <div className="flex items-center justify-between border-b border-[#EBE5D9] dark:border-[#4A4743]/50 pb-3 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                {coverUrl ? (
                  <img
                    src={coverUrl}
                    alt={bookTitle}
                    className="w-10 h-14 object-cover rounded-lg border border-[#EBE5D9] dark:border-[#4A4743]/60 shrink-0 shadow-xs"
                  />
                ) : (
                  <div className="w-10 h-14 rounded-lg bg-[#B0BEA9] dark:bg-[#5C6B55] text-[#31362F] dark:text-[#E0DCD3] flex items-center justify-center shrink-0 font-bold text-xs">
                    <Bookmark className="w-5 h-5" />
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-[#4A4743] dark:text-[#E0DCD3] truncate">
                    Salva nelle tue Liste
                  </h3>
                  <p className="text-xs font-semibold text-[#7A756D] dark:text-[#A09A90] truncate">
                    "{bookTitle}" {bookAuthor ? `• ${bookAuthor}` : ''}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-[#EBE5D9] dark:bg-[#383532] text-[#4A4743] dark:text-[#E0DCD3] hover:bg-[#DCD5C6] flex items-center justify-center transition-colors shrink-0 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* List Selection Options */}
            <div className="space-y-2.5 overflow-y-auto pr-1 py-1 flex-1">
              {lists.map((item) => {
                const IconComponent = item.icon;
                const isSelected = selectedList === item.id;
                const isCurrent =
                  (item.status && item.status === currentStatus) ||
                  (item.isFavorite && isFavorite);

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center gap-3.5 group cursor-pointer active:scale-98 ${item.color} ${
                      isSelected ? 'ring-2 ring-[#B0BEA9] dark:ring-[#5C6B55]' : ''
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/60 dark:bg-black/20 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                      <IconComponent className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-xs leading-tight">{item.name}</h4>
                        {isCurrent && (
                          <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10">
                            Attuale
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] opacity-80 line-clamp-1 mt-0.5 font-medium">
                        {item.description}
                      </p>
                    </div>

                    <div className="w-6 h-6 rounded-full border border-current/30 flex items-center justify-center shrink-0">
                      {isSelected || isCurrent ? (
                        <Check className="w-3.5 h-3.5 font-bold" />
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
