import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Globe, Plus, Check, RefreshCw, BookOpen } from 'lucide-react';
import type { Book } from '../../../domain/models/Book';
import { useRegisterModal } from '../../context/ModalContext';

interface GoogleBooksSearchModalProps {
  isOpen: boolean;
  initialQuery?: string;
  onClose: () => void;
  onAddBook: (book: Omit<Book, 'id'>) => void;
}

interface GoogleBookItem {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  totalPages: number;
  genre: string;
  description: string;
  publishedDate: string;
}

export const GoogleBooksSearchModal: React.FC<GoogleBooksSearchModalProps> = ({
  isOpen,
  initialQuery = '',
  onClose,
  onAddBook
}) => {
  useRegisterModal(isOpen);
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<GoogleBookItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addedBookIds, setAddedBookIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery);
      if (initialQuery.trim()) {
        searchGoogleBooks(initialQuery);
      }
    } else {
      setResults([]);
      setError(null);
    }
  }, [isOpen, initialQuery]);

  const searchGoogleBooks = async (searchTerms: string) => {
    const q = searchTerms.trim();
    if (!q) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=12`);
      if (!res.ok) {
        throw new Error('Impossibile contattare i servizi Google Books.');
      }
      const data = await res.json();

      if (data.items && data.items.length > 0) {
        const parsedBooks: GoogleBookItem[] = data.items.map((item: any) => {
          const info = item.volumeInfo || {};
          const imageLinks = info.imageLinks || {};
          const rawCover = imageLinks.thumbnail || imageLinks.smallThumbnail || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400';
          const secureCover = rawCover.replace(/^http:\/\//i, 'https://');

          return {
            id: item.id,
            title: info.title || 'Titolo Sconosciuto',
            author: info.authors ? info.authors.join(', ') : 'Autore Sconosciuto',
            coverUrl: secureCover,
            totalPages: info.pageCount || 300,
            genre: info.categories ? info.categories[0] : 'Saggio / Narrativa',
            description: info.description || '',
            publishedDate: info.publishedDate || ''
          };
        });
        setResults(parsedBooks);
      } else {
        setResults([]);
        setError(`Nessun risultato trovato nel catalogo Google Books per "${q}".`);
      }
    } catch (err: any) {
      console.warn('Google Books API error:', err);
      setError('Errore di connessione a Google Books. Riprova tra poco.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchGoogleBooks(query);
  };

  const handleAddGoogleBook = (gBook: GoogleBookItem) => {
    const newBookData: Omit<Book, 'id'> = {
      title: gBook.title,
      author: gBook.author,
      coverUrl: gBook.coverUrl,
      startDate: '',
      endDate: '',
      status: 'Da leggere',
      totalPages: gBook.totalPages,
      pagesRead: 0,
      genre: gBook.genre,
      notes: gBook.description ? gBook.description.slice(0, 200) + '...' : ''
    };

    onAddBook(newBookData);
    setAddedBookIds(prev => new Set(prev).add(gBook.id));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#31362F]/60 dark:bg-black/80 backdrop-blur-xs p-0 sm:p-4"
        >
          <motion.div
            initial={{ y: "100%", opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: "100%", opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-[#FCFBF8] dark:bg-[#33302D] text-[#4A4743] dark:text-[#E0DCD3] w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-[#EBE5D9] dark:border-[#4A4743]/60 flex flex-col max-h-[85vh] overflow-hidden transition-colors"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#EBE5D9] dark:border-[#4A4743]/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#B0BEA9] dark:bg-[#5C6B55] text-[#31362F] dark:text-[#E0DCD3] flex items-center justify-center border border-[#A0AF99] dark:border-[#4D5A46]">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#4A4743] dark:text-[#E0DCD3]">Catalogo Google Books</h2>
                  <p className="text-[11px] text-[#7A756D] dark:text-[#A09A90]">Cerca e aggiungi libri dal web</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-[#EBE5D9] dark:bg-[#383532] text-[#4A4743] dark:text-[#E0DCD3] hover:bg-[#DCD5C6] flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input Bar */}
            <form onSubmit={handleSearchSubmit} className="my-3 relative">
              <div className="relative flex items-center">
                <Search className="absolute left-3.5 w-4 h-4 text-[#9E988F] dark:text-[#88837A]" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cerca titolo, autore o ISBN..."
                  className="w-full pl-10 pr-24 py-2.5 bg-[#F4F1EA] dark:bg-[#2A2826] text-xs font-semibold text-[#4A4743] dark:text-[#E0DCD3] rounded-full border border-[#DCD5C6] dark:border-[#4A4743]/60 focus:outline-none focus:border-[#B0BEA9] dark:focus:border-[#5C6B55]"
                />
                <button
                  type="submit"
                  disabled={isLoading || !query.trim()}
                  className="absolute right-1 px-3 py-1.5 rounded-full bg-[#B0BEA9] dark:bg-[#5C6B55] text-[#31362F] dark:text-[#E0DCD3] text-xs font-bold hover:bg-[#A0AF99] disabled:opacity-50 transition-all"
                >
                  {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Cerca'}
                </button>
              </div>
            </form>

            {/* Results Container */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-3 my-1">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-2 text-[#7A756D] dark:text-[#A09A90]">
                  <RefreshCw className="w-7 h-7 text-[#B0BEA9] dark:text-[#5C6B55] animate-spin" />
                  <span className="text-xs font-semibold">Ricerca nel catalogo in corso...</span>
                </div>
              ) : error ? (
                <div className="text-center py-10 px-4 text-xs font-medium text-[#7A756D] dark:text-[#A09A90]">
                  {error}
                </div>
              ) : results.length > 0 ? (
                results.map((b) => {
                  const isAdded = addedBookIds.has(b.id);

                  return (
                    <div
                      key={b.id}
                      className="bg-[#FCFBF8] dark:bg-[#2A2826] p-3 rounded-2xl border border-[#EBE5D9] dark:border-[#4A4743]/60 shadow-xs flex gap-3 items-center"
                    >
                      <img
                        src={b.coverUrl}
                        alt={b.title}
                        className="w-12 h-16 object-cover rounded-lg border border-[#DCD5C6] dark:border-[#4A4743]/60 shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs text-[#4A4743] dark:text-[#E0DCD3] truncate">{b.title}</h4>
                        <p className="text-[11px] text-[#7A756D] dark:text-[#A09A90] truncate">{b.author}</p>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-[#7A756D] dark:text-[#A09A90]">
                          <span className="bg-[#EBE5D9] dark:bg-[#383532] px-2 py-0.5 rounded-full">{b.genre}</span>
                          <span>{b.totalPages} pag.</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleAddGoogleBook(b)}
                        disabled={isAdded}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1 border ${
                          isAdded
                            ? 'bg-[#D8E2D5] dark:bg-[#3B4838] text-[#2D382B] dark:text-[#E0DCD3] border-[#B0BEA9] dark:border-[#5C6B55]'
                            : 'bg-[#B0BEA9] dark:bg-[#5C6B55] text-[#31362F] dark:text-[#E0DCD3] hover:bg-[#A0AF99] border-[#A0AF99] dark:border-[#4D5A46] active:scale-95 shadow-xs'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#4D6349] dark:text-[#788C71]" />
                            <span>Aggiunto</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Aggiungi</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-10 px-4 space-y-2">
                  <BookOpen className="w-10 h-10 text-[#9E988F]/40 dark:text-[#88837A]/30" />
                  <p className="text-xs text-[#7A756D] dark:text-[#A09A90]">
                    Digita un titolo o un autore per cercare direttamente su Google Books.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
