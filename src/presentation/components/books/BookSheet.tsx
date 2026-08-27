import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Plus, Check, Share2, BookOpen, Building2, PenTool } from 'lucide-react';
import { SaveToListModal } from './SaveToListModal';
import { BookStoreActions } from './BookStoreActions';
import { RegisterBookModal } from './RegisterBookModal';
import type { Book, BookStatus } from '../../../domain/models/Book';
import { useRegisterModal } from '../../context/ModalContext';

export interface BookSheetBook {
  id: string;
  title: string;
  author: string;
  cover?: string | null;
  description?: string | null;
  pages?: number | string | null;
  year?: number | string | null;
  publisher?: string | null;
  category?: string | null;
  rating?: number | null;
  isFavorite?: boolean;
  isbn?: string | null;
  genre?: string;
  source?: string;
  rawItem?: any;
}

interface BookSheetProps {
  isOpen: boolean;
  onClose: () => void;
  book: BookSheetBook | null;
  isLoadingDetails?: boolean;
  onAddBook?: (book: BookSheetBook) => void;
  onRegisterBook?: (customizedBook: Omit<Book, 'id'>) => void;
}

function getValidImageUrl(url?: string | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed || trimmed === 'null' || trimmed === 'undefined') return null;
  if (trimmed.startsWith('http://')) return trimmed.replace(/^http:/, 'https:');
  return trimmed;
}

export const BookSheet: React.FC<BookSheetProps> = ({
  isOpen,
  onClose,
  book,
  isLoadingDetails = false,
  onAddBook,
  onRegisterBook,
}) => {
  useRegisterModal(isOpen);
  const [isAdded, setIsAdded] = useState(false);
  const [isSaveToListOpen, setIsSaveToListOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  if (!book) return null;

  const handleAdd = () => {
    if (onAddBook && !isAdded) {
      onAddBook(book);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 3000);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: book.title,
          text: `Scopri "${book.title}" di ${book.author} su BiblioDesk!`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Condivisione annullata o non supportata');
      }
    } else {
      navigator.clipboard.writeText(`"${book.title}" di ${book.author}`);
      alert('Info libro copiate negli appunti!');
    }
  };

  const handleSaveToList = ({ isFavorite }: { status?: BookStatus; isFavorite?: boolean; listName: string }) => {
    if (onAddBook) {
      onAddBook({
        ...book,
        isFavorite: isFavorite ?? book.isFavorite,
      });
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 3000);
    }
  };

  const cleanCoverUrl = getValidImageUrl(book.cover);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
          {/* Backdrop Scuro */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[100]"
          />

          {/* Bottom Sheet Modal */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative z-[101] max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-[#FCFBF8] dark:bg-[#33302D] text-[#4A4743] dark:text-[#E0DCD3] shadow-2xl border border-[#EBE5D9] dark:border-[#4A4743]/60 transition-colors"
          >
            {/* Pulsante di Chiusura 'X' */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 rounded-full bg-black/10 dark:bg-white/10 p-2 text-neutral-600 dark:text-neutral-300 hover:bg-black/20 dark:hover:bg-white/20 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            {/* Handle di Trascinamento Mobile */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="h-1.5 w-12 rounded-full bg-neutral-300 dark:bg-neutral-700" />
            </div>

            <div className="p-6 space-y-6">
              {/* HEADER INFO LIBRO: Copertina + Titolo + Autore */}
              <div className="flex flex-col items-center text-center">
                {cleanCoverUrl ? (
                  <img
                    src={cleanCoverUrl}
                    alt={book.title}
                    className="h-48 w-32 rounded-lg object-cover shadow-xl mb-6 bg-neutral-200 dark:bg-neutral-800 shrink-0"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="h-48 w-32 rounded-lg bg-neutral-200 dark:bg-neutral-800 flex flex-col items-center justify-center mb-6 shadow-md border border-neutral-300 dark:border-neutral-700 shrink-0">
                    <BookOpen className="text-neutral-400 mb-2" size={32} />
                    <span className="text-xs text-neutral-500 font-medium px-2 text-center">Nessuna Immagine</span>
                  </div>
                )}

                <h2 className="mb-2 text-2xl font-bold text-neutral-900 dark:text-white leading-tight">
                  {book.title}
                </h2>
                <p className="mb-4 text-lg font-medium text-neutral-600 dark:text-neutral-400">
                  {book.author}
                </p>

                {/* BADGE METADATA (Anno, Pagine, Editore, Categoria, Rating) */}
                <div className="flex flex-wrap items-center justify-center gap-2 mb-2 px-4">
                  {book.year && (
                    <span className="rounded-full bg-neutral-100 dark:bg-neutral-800 px-3 py-1 text-xs font-medium text-neutral-600 dark:text-neutral-300">
                      {book.year}
                    </span>
                  )}
                  {book.pages && (
                    <span className="rounded-full bg-neutral-100 dark:bg-neutral-800 px-3 py-1 text-xs font-medium text-neutral-600 dark:text-neutral-300">
                      {book.pages} p.
                    </span>
                  )}
                  {book.publisher && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#EBE5D9] dark:bg-[#383532] px-3 py-1 text-xs font-medium text-[#4A4743] dark:text-[#E0DCD3]">
                      <Building2 className="w-3 h-3 text-[#7A756D] dark:text-[#A09A90]" />
                      {book.publisher}
                    </span>
                  )}
                  {(book.category || book.genre) && (
                    <span className="rounded-full border border-neutral-200 dark:border-neutral-700 px-3 py-1 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                      {book.category || book.genre}
                    </span>
                  )}
                  {book.isbn && (
                    <span className="rounded-full bg-neutral-100 dark:bg-neutral-800 px-3 py-1 text-xs font-mono text-neutral-500 dark:text-neutral-400">
                      ISBN: {book.isbn}
                    </span>
                  )}
                  {book.rating && (
                    <span className="flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/30 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-400">
                      ★ {book.rating}
                    </span>
                  )}
                </div>
              </div>

              {/* BOTTONI DI AZIONE PRIMARI */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAdd}
                  disabled={isAdded}
                  className={`flex-1 py-3.5 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-98 cursor-pointer ${
                    isAdded
                      ? 'bg-[#D8E2D5] dark:bg-[#3B4838] text-[#2D382B] dark:text-[#E0DCD3] cursor-default'
                      : 'bg-[#B0BEA9] dark:bg-[#5C6B55] text-[#31362F] dark:text-[#E0DCD3] hover:bg-[#A0AF99] dark:hover:bg-[#4D5A47]'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Aggiunto!</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Aggiungi in Libreria</span>
                    </>
                  )}
                </button>

                {/* Tasto Registra / Personalizza */}
                <button
                  onClick={() => setIsRegisterOpen(true)}
                  className="py-3.5 px-3.5 rounded-2xl bg-[#EBE5D9] dark:bg-[#383532] text-[#31362F] dark:text-[#E0DCD3] hover:bg-[#DCD5C6] dark:hover:bg-[#4A4743] transition-colors border border-[#DCD5C6]/60 dark:border-[#4A4743]/60 shrink-0 cursor-pointer active:scale-95 text-xs font-extrabold flex items-center gap-1"
                  title="Personalizza e Registra"
                >
                  <PenTool className="w-4 h-4 text-[#5C6B55] dark:text-[#A8BB9C]" />
                  <span>Registra</span>
                </button>

                {/* TASTO CUORE: Apre la schermata di selezione delle liste */}
                <button
                  onClick={() => setIsSaveToListOpen(true)}
                  className="p-3.5 rounded-2xl bg-[#EBE5D9] dark:bg-[#383532] text-[#4A4743] dark:text-[#E0DCD3] hover:bg-[#DCD5C6] dark:hover:bg-[#4A4743] transition-colors border border-[#DCD5C6]/60 dark:border-[#4A4743]/60 shrink-0 cursor-pointer active:scale-95"
                  title="Salva nelle tue Liste"
                >
                  <Heart className={`w-4 h-4 ${book.isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
                </button>

                <button
                  onClick={handleShare}
                  className="p-3.5 rounded-2xl bg-[#EBE5D9] dark:bg-[#383532] text-[#4A4743] dark:text-[#E0DCD3] hover:bg-[#DCD5C6] dark:hover:bg-[#4A4743] transition-colors border border-[#DCD5C6]/60 dark:border-[#4A4743]/60 shrink-0 cursor-pointer active:scale-95"
                  title="Condividi"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              {/* SEZIONE AZIONI COMMERCIALI ED USATO (BookStoreActions) */}
              <div className="pt-2">
                <BookStoreActions
                  book={{
                    title: book.title,
                    author: book.author,
                    isbn: book.isbn,
                  }}
                />
              </div>

              {/* SEZIONE SINOSSI / TRAMA CON SKELETON LOADING */}
              <div className="pt-2 mb-8">
                <h3 className="mb-3 text-lg font-bold text-neutral-900 dark:text-white flex items-center justify-between">
                  <span>Sinossi</span>
                  {isLoadingDetails && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-[#7A756D] dark:text-[#A09A90] font-normal animate-pulse">
                      Caricamento trama...
                    </span>
                  )}
                </h3>

                {isLoadingDetails && !book.description ? (
                  <div className="space-y-2 animate-pulse">
                    <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded-md w-full" />
                    <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded-md w-5/6" />
                    <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded-md w-4/6" />
                  </div>
                ) : book.description ? (
                  <p className="text-sm font-medium leading-relaxed text-neutral-700 dark:text-neutral-300 whitespace-pre-line">
                    {book.description}
                  </p>
                ) : (
                  <p className="text-sm italic text-neutral-400 dark:text-neutral-500">
                    Nessuna descrizione o trama disponibile per questo libro.
                  </p>
                )}
              </div>
            </div>

            {/* Modal di Selezione Liste (quando si clicca sul Cuore) */}
            <SaveToListModal
              isOpen={isSaveToListOpen}
              onClose={() => setIsSaveToListOpen(false)}
              bookTitle={book.title}
              bookAuthor={book.author}
              coverUrl={cleanCoverUrl}
              isFavorite={book.isFavorite}
              onSaveToList={handleSaveToList}
            />

            {/* Modale Registra & Personalizza Libro */}
            <RegisterBookModal
              isOpen={isRegisterOpen}
              onClose={() => setIsRegisterOpen(false)}
              initialBook={{
                title: book.title,
                author: book.author,
                coverUrl: cleanCoverUrl || undefined,
                totalPages: book.pages ? Number(book.pages) : undefined,
                genre: book.genre,
                isbn: book.isbn || undefined,
                notes: book.description || undefined
              }}
              onConfirmSave={(customizedBook) => {
                setIsRegisterOpen(false);
                if (onRegisterBook) {
                  onRegisterBook(customizedBook);
                } else if (onAddBook) {
                  onAddBook({
                    ...book,
                    cover: customizedBook.coverUrl,
                    pages: customizedBook.totalPages,
                  });
                }
                onClose();
              }}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
