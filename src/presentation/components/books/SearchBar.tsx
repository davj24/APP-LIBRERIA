import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { federatedBookSearch } from '../../../infrastructure/services/federatedBookSearch';

export type SearchStatus = 'idle' | 'loading' | 'success' | 'error';

interface OrbitalSearchIconProps {
  status: SearchStatus;
  isIsbn: boolean;
}

// 1. L'Icona Vettoriale Animata (Il Nucleo Orbitale)
export const OrbitalSearchIcon: React.FC<OrbitalSearchIconProps> = ({ status, isIsbn }) => {
  return (
    <div className="relative w-6 h-6 flex items-center justify-center">
      {status === 'success' && (
        <motion.div
          initial={{ scale: 1, opacity: 0.8 }}
          animate={{ scale: 2.5, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="absolute inset-0 rounded-full border-2 border-[#B0BEA9] dark:border-[#5C6B55]"
        />
      )}

      <motion.svg width="24" height="24" viewBox="0 0 24 24" className="absolute text-[#9E988F] dark:text-[#88837A]">
        <motion.circle
          cx="12"
          cy="12"
          r="9"
          fill="transparent"
          stroke="currentColor"
          strokeWidth="1.5"
          initial={false}
          animate={{
            rotate: status === 'loading' ? 360 : 0,
            strokeDasharray: status === 'loading' ? "10 20" : "100 0",
            scale: (status === 'success' || status === 'error') ? 0 : 1,
            opacity: (status === 'success' || status === 'error') ? 0 : 1,
          }}
          transition={{ 
            rotate: { repeat: Infinity, duration: 1, ease: 'linear' },
            scale: { duration: 0.3 },
            opacity: { duration: 0.3 }
          }}
        />

        <motion.g
          initial={false}
          animate={{
            scale: (status === 'idle' || status === 'loading') ? 1 : 0,
            opacity: (status === 'idle' || status === 'loading') ? 1 : 0
          }}
        >
          {isIsbn ? (
            <>
              <motion.rect x="9" y="8" width="1.5" height="8" fill="currentColor" />
              <motion.rect x="11.5" y="8" width="1" height="8" fill="currentColor" />
              <motion.rect x="13.5" y="8" width="1.5" height="8" fill="currentColor" />
            </>
          ) : (
            <motion.circle cx="12" cy="12" r="2.5" fill="currentColor" />
          )}
        </motion.g>

        <motion.path
          d="M7 13l3 3 7-7"
          fill="none"
          stroke="#B0BEA9"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: status === 'success' ? 1 : 0, 
            opacity: status === 'success' ? 1 : 0 
          }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        />
      </motion.svg>
    </div>
  );
};

export interface FormattedBookResult {
  id: string;
  title: string;
  author: string;
  cover: string | null;
  description?: string | null;
  pages?: number | string | null;
  year?: string | null;
  publisher?: string | null;
  category?: string | null;
  genre?: string | null;
  subgenre?: string | null;
  rating?: number | null;
  isbn?: string | null;
  source?: string;
  rawItem?: any;
}

interface SearchBarProps {
  value?: string;
  onChange?: (val: string) => void;
  onSelectGoogleBook?: (bookItem: FormattedBookResult) => void;
  onSearchActive?: (isActive: boolean) => void;
}

// 2. La Barra di Ricerca con Ricerca Federata Ibrida (Google Books + Open Library + OPAC SBN)
export function SearchBar({ value, onChange, onSelectGoogleBook, onSearchActive }: SearchBarProps) {
  const [internalQuery, setInternalQuery] = useState("");
  const [status, setStatus] = useState<SearchStatus>("idle");
  const [results, setResults] = useState<FormattedBookResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const query = value !== undefined ? value : internalQuery;

  // Controlla se è un ISBN (solo numeri o trattini)
  const isIsbn = query.trim().length > 0 && /^[\d\s-]+$/.test(query.trim()) && query.replace(/\D/g, '').length >= 9;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (onChange) {
      onChange(val);
    } else {
      setInternalQuery(val);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onChange) {
      onChange("");
    } else {
      setInternalQuery("");
    }
    setResults([]);
    setStatus("idle");
    if (onSearchActive) onSearchActive(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      (e.target as HTMLInputElement).blur();
    }
  };

  useEffect(() => {
    const handleScrollOrTouch = () => {
      if (document.activeElement === inputRef.current) {
        inputRef.current?.blur();
      }
    };

    window.addEventListener('scroll', handleScrollOrTouch, { passive: true });
    window.addEventListener('touchmove', handleScrollOrTouch, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScrollOrTouch);
      window.removeEventListener('touchmove', handleScrollOrTouch);
    };
  }, []);

  // Fetching tramite federatedBookSearch (Google Books + Open Library + SBN) con Debounce e Anti-Race Condition
  useEffect(() => {
    let isCancelled = false;
    const searchTerm = query.trim();

    if (!searchTerm || searchTerm.length < 2) {
      setResults([]);
      setStatus("idle");
      if (onSearchActive) onSearchActive(false);
      return;
    }

    if (onSearchActive) onSearchActive(true);
    setStatus("loading");

    const fetchBooks = async () => {
      try {
        const webBooks = await federatedBookSearch(searchTerm);
        if (isCancelled) return;
        
        if (webBooks && webBooks.length > 0) {
          const formattedResults: FormattedBookResult[] = webBooks.map((wb) => ({
            id: wb.id,
            title: wb.title,
            author: wb.author,
            cover: wb.coverUrl,
            description: wb.description || null,
            pages: wb.totalPages || null,
            publisher: wb.publisher || null,
            year: wb.publishedYear || null,
            category: wb.genre || null,
            genre: wb.genre || null,
            subgenre: wb.subgenre || null,
            rating: null,
            isbn: wb.isbn || null,
            source: wb.source,
            rawItem: wb
          }));
          setResults(formattedResults);
          setStatus("success");
        } else {
          setResults([]);
          setStatus("error");
        }
      } catch (error) {
        if (isCancelled) return;
        console.error('Errore durante la ricerca federata libri:', error);
        setResults([]);
        setStatus("error");
      }
    };

    const timer = setTimeout(() => {
      fetchBooks();
    }, 350);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  const handleSelectResult = (book: FormattedBookResult) => {
    if (onSelectGoogleBook) {
      onSelectGoogleBook(book);
    }

    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-4 px-4">
      <div className="relative flex items-center w-full">
        <input
          ref={inputRef}
          type="search"
          enterKeyHint="search"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Cerca titolo, autore o ISBN..."
          className="w-full py-4 pl-6 pr-14 bg-[#FCFBF8] dark:bg-[#33302D] rounded-full border border-[#DCD5C6] dark:border-[#4A4743]/50 focus:outline-none focus:ring-2 focus:ring-[#B0BEA9] transition-all text-[#4A4743] dark:text-[#E0DCD3]"
        />

        {query.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-12 top-1/2 -translate-y-1/2 p-1.5 text-[#9E988F] dark:text-[#88837A] hover:text-[#4A4743] dark:hover:text-[#E0DCD3] transition-colors z-10 cursor-pointer"
            title="Svuota ricerca"
          >
            <X size={18} />
          </button>
        )}

        <div className="absolute right-4 pointer-events-none">
          <OrbitalSearchIcon status={status} isIsbn={isIsbn} />
        </div>
      </div>

      {status === 'loading' && (
        <p className="text-center mt-4 text-xs font-semibold text-[#7A756D] dark:text-[#A09A90] animate-pulse">
          Ricerca nei cataloghi globali (Google Books, Open Library, OPAC SBN)...
        </p>
      )}

      {status === 'error' && query.trim().length >= 2 && (
        <p className="text-center mt-4 text-xs text-rose-500 font-medium">
          Nessun libro trovato nei cataloghi globali. Prova con altri termini.
        </p>
      )}

      {/* Contenitore dei Risultati */}
      <AnimatePresence>
        {results.length > 0 && status === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-full mt-4 bg-[#FCFBF8] dark:bg-[#33302D] rounded-2xl shadow-md border border-[#DCD5C6] dark:border-[#4A4743]/60 overflow-hidden"
          >
            <div className="p-2.5 bg-[#EBE5D9]/40 dark:bg-[#383532]/40 border-b border-[#DCD5C6] dark:border-[#4A4743]/50 flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#7A756D] dark:text-[#A09A90] uppercase tracking-wider">
                Risultati Cataloghi Globali
              </span>
              <span className="text-[10px] font-semibold text-[#B0BEA9] dark:text-[#5C6B55]">
                {results.length} libri trovati
              </span>
            </div>

            {results.map((book) => (
              <div
                key={book.id}
                onClick={() => handleSelectResult(book)}
                className="flex items-center gap-3.5 p-3 hover:bg-[#F4F1EA] dark:hover:bg-[#4A4743] cursor-pointer border-b last:border-b-0 border-[#DCD5C6]/60 dark:border-[#4A4743]/40 transition-colors group"
              >
                {book.cover ? (
                  <img
                    src={book.cover}
                    alt={book.title}
                    className="w-10 h-14 object-cover rounded-lg border border-[#DCD5C6] dark:border-[#4A4743]/60 shrink-0 shadow-xs group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-10 h-14 rounded-lg bg-[#EBE5D9] dark:bg-[#383532] flex items-center justify-center shrink-0 border border-[#DCD5C6] dark:border-[#4A4743]/60">
                    <span className="text-[9px] font-bold text-[#7A756D] dark:text-[#A09A90]">No Img</span>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 mb-0.5">
                    <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.2 rounded-md bg-[#5C6B55]/10 dark:bg-[#5C6B55]/20 text-[#5C6B55] dark:text-[#A0AF99]">
                      {book.source === 'openlibrary' ? 'Open Library' : book.source === 'sbn' ? 'OPAC SBN' : 'Google Books'}
                    </span>
                    {book.year && (
                      <span className="text-[10px] text-[#7A756D] dark:text-[#A09A90]">
                        • {book.year}
                      </span>
                    )}
                  </div>
                  <h4 className="font-semibold text-xs text-[#4A4743] dark:text-[#E0DCD3] line-clamp-1 group-hover:text-[#5C6B55] dark:group-hover:text-[#A0AF99] transition-colors">
                    {book.title}
                  </h4>
                  <p className="text-[11px] text-[#7A756D] dark:text-[#A09A90] line-clamp-1 mt-0.5">
                    {book.author}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SearchBar;
