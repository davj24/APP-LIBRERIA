import React, { useState, useEffect, useRef } from 'react';
import type { Book, BookStatus } from '../../../domain/models/Book';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { BookOpen, Clock, CheckCircle2, Edit3, X, Save, Sparkles } from 'lucide-react';
import { useRegisterModal } from '../../context/ModalContext';

interface CurrentlyReadingCardProps {
  books: Book[];
  onUpdateStatus: (id: string, status: BookStatus) => void;
  onUpdatePages?: (id: string, pagesRead: number) => void;
}

export const CurrentlyReadingCard: React.FC<CurrentlyReadingCardProps> = ({
  books,
  onUpdateStatus,
  onUpdatePages
}) => {
  const activeList = books.filter(b => b.status === 'In lettura');

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPageModalOpen, setIsPageModalOpen] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  useRegisterModal(isPageModalOpen);

  useEffect(() => {
    if (currentIndex >= activeList.length) {
      setCurrentIndex(0);
    }
  }, [activeList.length, currentIndex]);

  const currentBook = activeList[currentIndex] || activeList[0];

  const pagesRead = currentBook?.pagesRead || 0;
  const totalPages = currentBook?.totalPages || 300;

  const [pageInput, setPageInput] = useState<string>(pagesRead.toString());

  useEffect(() => {
    if (currentBook) {
      setPageInput(pagesRead.toString());
    }
  }, [currentBook?.id, pagesRead]);

  if (!currentBook) {
    return (
      <div className="bg-[#FCFBF8] dark:bg-[#33302D] rounded-2xl p-4 border border-[#EBE5D9] dark:border-[#4A4743]/60 shadow-sm flex items-center justify-between transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#B0BEA9] dark:bg-[#5C6B55] text-[#31362F] dark:text-[#E0DCD3] flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-[#4A4743] dark:text-[#E0DCD3] text-sm">Nessuna lettura in corso</h4>
            <p className="text-xs text-[#7A756D] dark:text-[#A09A90]">Inizia un nuovo libro dalla tua lista!</p>
          </div>
        </div>
      </div>
    );
  }

  const progress = currentBook.totalPages && currentBook.pagesRead
    ? Math.min(100, Math.round((currentBook.pagesRead / currentBook.totalPages) * 100))
    : 0;

  const handleNextBook = () => {
    if (activeList.length <= 1) return;
    setCurrentIndex(prev => (prev < activeList.length - 1 ? prev + 1 : 0));
  };

  const handlePrevBook = () => {
    if (activeList.length <= 1) return;
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : activeList.length - 1));
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (activeList.length <= 1) return;
    const threshold = 40;
    const velocityThreshold = 250;

    if (info.offset.x < -threshold || info.velocity.x < -velocityThreshold) {
      handleNextBook();
    } else if (info.offset.x > threshold || info.velocity.x > velocityThreshold) {
      handlePrevBook();
    }
  };

  const handleSavePageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    inputRef.current?.blur(); // Chiudi automaticamente la tastiera a schermo

    const val = parseInt(pageInput, 10);
    if (!isNaN(val) && onUpdatePages) {
      const clampedVal = Math.max(0, Math.min(totalPages, val));
      const updatedStatus: BookStatus = clampedVal >= totalPages ? 'Letto' : 'In lettura';
      onUpdatePages(currentBook.id, clampedVal);
      if (updatedStatus !== currentBook.status) {
        onUpdateStatus(currentBook.id, updatedStatus);
      }
    }
    setIsPageModalOpen(false);
  };

  const handleQuickSetPage = (targetPages: number) => {
    setPageInput(targetPages.toString());
  };

  return (
    <>
      <div className="bg-[#FCFBF8] dark:bg-[#33302D] rounded-3xl p-4 border border-[#EBE5D9] dark:border-[#4A4743]/60 shadow-sm shadow-[#DCD5C6]/50 dark:shadow-md dark:shadow-black/30 relative overflow-hidden space-y-3 transition-colors select-none">
        {/* Top Banner Tag */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#4A4743] dark:text-[#E0DCD3] bg-[#EBE5D9] dark:bg-[#383532] px-2.5 py-1 rounded-full border border-[#DCD5C6] dark:border-[#4A4743]/60">
            <Clock className="w-3.5 h-3.5 text-[#7A756D] dark:text-[#A09A90]" />
            <span>
              In Lettura Ora {activeList.length > 1 ? `(${currentIndex + 1}/${activeList.length})` : ''}
            </span>
          </div>

          <span className="text-[11px] font-bold text-[#31362F] dark:text-[#E0DCD3] bg-[#B0BEA9]/40 dark:bg-[#5C6B55]/40 border border-[#B0BEA9] dark:border-[#5C6B55] px-2.5 py-0.5 rounded-full">
            {progress}% Completato
          </span>
        </div>

        {/* Draggable Motion Carousel with Rubber-Band Elasticity */}
        <motion.div
          key={currentBook.id}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          whileDrag={{ scale: 0.98 }}
          whileTap={{ cursor: 'grabbing' }}
          className="cursor-grab active:cursor-grabbing touch-pan-y"
        >
          <div className="flex gap-3.5 items-center">
            <div className="w-16 h-24 rounded-xl overflow-hidden bg-[#F4F1EA] dark:bg-[#2A2826] border border-[#EBE5D9] dark:border-[#4A4743]/60 shadow-sm shrink-0 relative group">
              <img
                src={currentBook.coverUrl}
                alt={currentBook.title}
                className="w-full h-full object-cover pointer-events-none"
              />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-[#4A4743] dark:text-[#E0DCD3] text-base leading-snug line-clamp-1">
                {currentBook.title}
              </h3>
              <p className="text-xs font-medium text-[#7A756D] dark:text-[#A09A90] line-clamp-1 mb-2">
                {currentBook.author}
              </p>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-semibold text-[#7A756D] dark:text-[#A09A90]">
                  <span>Progresso</span>
                  <span>{pagesRead} di {totalPages} pag.</span>
                </div>
                <div className="w-full bg-[#EBE5D9] dark:bg-[#2A2826] rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#B0BEA9] dark:bg-[#5C6B55] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Carousel Pagination Dots */}
        {activeList.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 pt-1">
            {activeList.map((b, idx) => (
              <button
                key={b.id}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex ? 'w-5 bg-[#B0BEA9] dark:bg-[#5C6B55]' : 'w-1.5 bg-[#DCD5C6] dark:bg-[#4A4743] hover:bg-[#B0BEA9]'
                }`}
                title={b.title}
              />
            ))}
          </div>
        )}

        {/* Quick Action Footer - Button to open Page Update Menu */}
        <div className="pt-2 border-t border-[#EBE5D9] dark:border-[#4A4743]/50 flex items-center justify-between gap-2">
          <button
            onClick={() => {
              setPageInput(pagesRead.toString());
              setIsPageModalOpen(true);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-[#EBE5D9] dark:bg-[#383532] hover:bg-[#DCD5C6] dark:hover:bg-[#4A4743] text-[#4A4743] dark:text-[#E0DCD3] text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 border border-[#DCD5C6] dark:border-[#4A4743]/60 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-[#4A4743] dark:text-[#E0DCD3]" />
            <span>Aggiorna Pagine ({pagesRead}/{totalPages})</span>
          </button>

          <button
            onClick={() => onUpdateStatus(currentBook.id, 'Letto')}
            className="px-3.5 py-1.5 rounded-xl bg-[#B0BEA9] dark:bg-[#5C6B55] hover:bg-[#A0AF99] dark:hover:bg-[#4D5A46] text-[#31362F] dark:text-[#E0DCD3] text-xs font-bold transition-colors flex items-center gap-1.5 border border-[#A0AF99] dark:border-[#4D5A46] cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Segna Letto</span>
          </button>
        </div>
      </div>

      {/* Page Update Menu Modal (Fix Tastiera Mobile) */}
      <AnimatePresence>
        {isPageModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              inputRef.current?.blur();
              setIsPageModalOpen(false);
            }}
            className={`fixed inset-0 z-50 flex justify-center bg-[#31362F]/60 dark:bg-black/80 backdrop-blur-xs p-3 sm:p-4 transition-all duration-200 ${
              isInputFocused
                ? 'items-start pt-8 sm:pt-0 sm:items-center'
                : 'items-end sm:items-center'
            }`}
          >
            <motion.div
              initial={{ y: "100%", opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: "100%", opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#FCFBF8] dark:bg-[#33302D] text-[#4A4743] dark:text-[#E0DCD3] w-full max-w-md rounded-3xl p-5 shadow-2xl border border-[#EBE5D9] dark:border-[#4A4743]/60 space-y-4 select-none"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-[#EBE5D9] dark:border-[#4A4743]/50 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#B0BEA9] dark:bg-[#5C6B55] text-[#31362F] dark:text-[#E0DCD3] flex items-center justify-center">
                    <Edit3 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#4A4743] dark:text-[#E0DCD3]">Aggiorna Pagina Raggiunta</h3>
                    <p className="text-[11px] text-[#7A756D] dark:text-[#A09A90] truncate max-w-[220px]">
                      {currentBook.title}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    inputRef.current?.blur();
                    setIsPageModalOpen(false);
                  }}
                  className="w-8 h-8 rounded-full bg-[#EBE5D9] dark:bg-[#383532] text-[#4A4743] dark:text-[#E0DCD3] hover:bg-[#DCD5C6] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Menu Body */}
              <form onSubmit={handleSavePageSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#4A4743] dark:text-[#E0DCD3] mb-1.5">
                    Inserisci la pagina attuale (max {totalPages} pag.):
                  </label>
                  <div className="relative flex items-center">
                    <input
                      ref={inputRef}
                      type="number"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      min="0"
                      max={totalPages}
                      value={pageInput}
                      onChange={(e) => setPageInput(e.target.value)}
                      onFocus={() => setIsInputFocused(true)}
                      onBlur={() => setIsInputFocused(false)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          inputRef.current?.blur();
                        }
                      }}
                      autoFocus
                      required
                      className="w-full px-4 py-3 rounded-2xl border-2 border-[#B0BEA9] dark:border-[#5C6B55] bg-[#F4F1EA] dark:bg-[#2A2826] text-lg font-black text-[#4A4743] dark:text-[#E0DCD3] focus:outline-none focus:border-[#5C6B55] shadow-sm"
                      placeholder="es. 145"
                    />
                    <span className="absolute right-4 text-xs font-bold text-[#7A756D] dark:text-[#A09A90]">
                      / {totalPages} pag.
                    </span>
                  </div>
                </div>

                {/* Quick Preset Buttons */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-[#7A756D] dark:text-[#A09A90] uppercase tracking-wider block">
                    Avanzamento Rapido
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuickSetPage(Math.min(totalPages, pagesRead + 5))}
                      className="py-2 bg-[#EBE5D9] dark:bg-[#383532] hover:bg-[#DCD5C6] text-[#4A4743] dark:text-[#E0DCD3] rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      +5 Pag.
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickSetPage(Math.min(totalPages, pagesRead + 10))}
                      className="py-2 bg-[#EBE5D9] dark:bg-[#383532] hover:bg-[#DCD5C6] text-[#4A4743] dark:text-[#E0DCD3] rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      +10 Pag.
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickSetPage(Math.min(totalPages, pagesRead + 25))}
                      className="py-2 bg-[#EBE5D9] dark:bg-[#383532] hover:bg-[#DCD5C6] text-[#4A4743] dark:text-[#E0DCD3] rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      +25 Pag.
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickSetPage(totalPages)}
                      className="py-2 bg-[#B0BEA9] dark:bg-[#5C6B55] hover:bg-[#A0AF99] text-[#31362F] dark:text-[#E0DCD3] rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" /> Fine
                    </button>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      inputRef.current?.blur();
                      setIsPageModalOpen(false);
                    }}
                    className="flex-1 py-3 rounded-xl border border-[#DCD5C6] dark:border-[#4A4743]/60 text-[#4A4743] dark:text-[#E0DCD3] font-semibold text-xs hover:bg-[#EBE5D9] dark:hover:bg-[#383532] transition-colors cursor-pointer"
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-[#B0BEA9] dark:bg-[#5C6B55] text-[#31362F] dark:text-[#E0DCD3] font-bold text-xs hover:bg-[#A0AF99] shadow-md shadow-[#B0BEA9]/30 transition-all flex items-center justify-center gap-1.5 border border-[#A0AF99] dark:border-[#4D5A46] cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Salva Pagina</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
