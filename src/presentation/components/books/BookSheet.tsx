import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { BookOpen, Heart, Share2, Plus, Check, X, Loader2, ExternalLink, Building2 } from 'lucide-react';
import { generateShopLinks, type ShopLink } from '../../../infrastructure/helpers/ShopLinksHelper';

export interface BookSheetBook {
  id: string;
  title: string;
  author: string;
  cover?: string | null;
  description?: string | null;
  pages?: number | string | null;
  year?: number | string | null;
  publisher?: string | null;
  genre?: string;
  isbn?: string | null;
  category?: string | null;
  rating?: number | null;
  isFavorite?: boolean;
  source?: string;
  rawItem?: any;
}

interface BookSheetProps {
  isOpen: boolean;
  onClose: () => void;
  book: BookSheetBook | null;
  isLoadingDetails?: boolean;
  onAddBook?: (book: BookSheetBook) => void;
  onToggleFavorite?: (book: BookSheetBook) => void;
}

// Helper per sanitizzare e migliorare gli URL delle copertine (Google Books API Fix)
const getValidImageUrl = (url: string | undefined | null) => {
  if (!url) return null;
  return url.replace('http:', 'https:').replace('&edge=curl', '').replace('zoom=1', 'zoom=2');
};

export const BookSheet: React.FC<BookSheetProps> = ({
  isOpen,
  onClose,
  book,
  isLoadingDetails = false,
  onAddBook,
  onToggleFavorite
}) => {
  const [isAdded, setIsAdded] = React.useState(false);
  const controls = useDragControls();

  // Blocca lo scroll del body sottostante quando il sheet è aperto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    setIsAdded(false);
  }, [book]);

  if (!book) return null;

  const cleanCoverUrl = getValidImageUrl(book.cover);
  const shopLinks = generateShopLinks(book.isbn, book.title);

  const handleAdd = () => {
    if (onAddBook) {
      onAddBook(book);
      setIsAdded(true);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: book.title,
          text: `Scopri "${book.title}" di ${book.author} su App Libreria!`,
          url: window.location.href,
        });
      } catch (err) {
        console.warn('Condivisione annullata o non supportata', err);
      }
    } else {
      navigator.clipboard?.writeText?.(`${book.title} - ${book.author}`);
      alert('Info libro copiate negli appunti!');
    }
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && book && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center">
          {/* Backdrop scuro con sfocatura */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Pannello Principale Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            onClick={(e) => e.stopPropagation()}
            drag="y"
            dragControls={controls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.8 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100 || info.velocity.y > 200) {
                onClose();
              }
            }}
            className="fixed inset-x-0 bottom-0 z-[101] w-full max-w-lg mx-auto bg-[#FCFBF8] dark:bg-[#33302D] text-[#4A4743] dark:text-[#E0DCD3] rounded-t-[32px] shadow-2xl overflow-hidden max-h-[85vh] flex flex-col border-t border-[#DCD5C6]/60 dark:border-[#4A4743]/60"
          >
            {/* AREA MANIGLIA ATTIVA */}
            <div
              className="flex w-full cursor-grab active:cursor-grabbing justify-center pt-4 pb-4 touch-none shrink-0"
              onPointerDown={(e) => controls.start(e)}
            >
              <div className="h-1.5 w-12 rounded-full bg-neutral-300 dark:bg-neutral-700" />
            </div>

            {/* Pulsante di chiusura rapido */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-[#EBE5D9]/60 dark:bg-[#383532]/60 text-[#7A756D] dark:text-[#A09A90] hover:text-[#4A4743] dark:hover:text-[#E0DCD3] transition-colors z-10"
              title="Chiudi"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Contenuto scorrevole interno */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* HEADER E COPERTINA */}
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
                <div className="flex flex-wrap items-center justify-center gap-2 mb-6 px-4">
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

              {/* BOTTONI DI AZIONE */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAdd}
                  disabled={isAdded}
                  className={`flex-1 py-3.5 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98 ${
                    isAdded
                      ? 'bg-[#D8E2D5] dark:bg-[#3B4838] text-[#2D382B] dark:text-[#E0DCD3] cursor-default'
                      : 'bg-[#B0BEA9] dark:bg-[#5C6B55] text-[#31362F] dark:text-[#E0DCD3] hover:bg-[#A0AF99] dark:hover:bg-[#4D5A47]'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Aggiunto in Libreria!</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Aggiungi in Libreria</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => onToggleFavorite && onToggleFavorite(book)}
                  className="p-3.5 rounded-2xl bg-[#EBE5D9] dark:bg-[#383532] text-[#4A4743] dark:text-[#E0DCD3] hover:bg-[#DCD5C6] dark:hover:bg-[#4A4743] transition-colors border border-[#DCD5C6]/60 dark:border-[#4A4743]/60 shrink-0"
                  title="Preferito"
                >
                  <Heart className={`w-4 h-4 ${book.isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
                </button>

                <button
                  onClick={handleShare}
                  className="p-3.5 rounded-2xl bg-[#EBE5D9] dark:bg-[#383532] text-[#4A4743] dark:text-[#E0DCD3] hover:bg-[#DCD5C6] dark:hover:bg-[#4A4743] transition-colors border border-[#DCD5C6]/60 dark:border-[#4A4743]/60 shrink-0"
                  title="Condividi"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              {/* SEZIONE LINK D'ACQUISTO / CONFRONTA PREZZI */}
              {shopLinks.length > 0 && (
                <div className="bg-[#F4F1EA] dark:bg-[#2A2826] p-4 rounded-2xl border border-[#EBE5D9] dark:border-[#4A4743]/60 space-y-2">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#7A756D] dark:text-[#A09A90]">
                    Acquista Online / Confronta Prezzi
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {shopLinks.map((shop: ShopLink) => (
                      <a
                        key={shop.name}
                        href={shop.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2 px-2 rounded-xl bg-[#FCFBF8] dark:bg-[#33302D] hover:bg-[#EBE5D9] dark:hover:bg-[#383532] text-[#4A4743] dark:text-[#E0DCD3] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-[#DCD5C6] dark:border-[#4A4743]/60 text-center"
                      >
                        <ExternalLink className="w-3 h-3 text-[#5C6B55] dark:text-[#A0AF99] shrink-0" />
                        <span className="truncate">{shop.name}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* SEZIONE SINOSSI / TRAMA CON SKELETON LOADING */}
              <div className="mt-6 mb-8 px-2">
                <h3 className="mb-3 text-lg font-bold text-neutral-900 dark:text-white flex items-center justify-between">
                  <span>Sinossi</span>
                  {isLoadingDetails && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-[#7A756D] dark:text-[#A09A90] font-normal animate-pulse">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#B0BEA9] dark:text-[#5C6B55]" />
                      <span>Caricamento dettagli completi...</span>
                    </span>
                  )}
                </h3>

                {isLoadingDetails && !book.description ? (
                  <div className="space-y-2 py-3 animate-pulse">
                    <div className="h-4 bg-[#EBE5D9] dark:bg-[#4A4743] rounded w-3/4" />
                    <div className="h-4 bg-[#EBE5D9] dark:bg-[#4A4743] rounded w-full" />
                    <div className="h-4 bg-[#EBE5D9] dark:bg-[#4A4743] rounded w-5/6" />
                  </div>
                ) : book.description ? (
                  <div className="relative">
                    <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed text-sm whitespace-pre-wrap">
                      {book.description}
                    </p>
                  </div>
                ) : (
                  <p className="text-center italic text-neutral-500 py-6 border border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl">
                    La trama non è disponibile per questa edizione.
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default BookSheet;
