import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export type SearchStatus = 'idle' | 'loading' | 'success' | 'error';

interface OrbitalSearchIconProps {
  status: SearchStatus;
  isIsbn: boolean;
}

// 1. L'Icona Vettoriale Animata (Il Nucleo Orbitale - IMMUTATA)
export const OrbitalSearchIcon: React.FC<OrbitalSearchIconProps> = ({ status, isIsbn }) => {
  return (
    <div className="relative w-6 h-6 flex items-center justify-center">
      {/* Onda d'urto al termine della ricerca */}
      {status === 'success' && (
        <motion.div
          initial={{ scale: 1, opacity: 0.8 }}
          animate={{ scale: 2.5, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="absolute inset-0 rounded-full border-2 border-[#B0BEA9] dark:border-[#5C6B55]"
        />
      )}

      {/* Contenitore SVG Principale */}
      <motion.svg width="24" height="24" viewBox="0 0 24 24" className="absolute text-[#9E988F] dark:text-[#88837A]">
        {/* Anello Orbitale (Gira durante il caricamento) */}
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

        {/* Il Nucleo Interno (Pallino o Codice a Barre) */}
        <motion.g
          initial={false}
          animate={{
            scale: (status === 'idle' || status === 'loading') ? 1 : 0,
            opacity: (status === 'idle' || status === 'loading') ? 1 : 0
          }}
        >
          {isIsbn ? (
            // Vettori del Codice a Barre
            <>
              <motion.rect x="9" y="8" width="1.5" height="8" fill="currentColor" />
              <motion.rect x="11.5" y="8" width="1" height="8" fill="currentColor" />
              <motion.rect x="13.5" y="8" width="1.5" height="8" fill="currentColor" />
            </>
          ) : (
            // Vettore del Pallino (Nucleo)
            <motion.circle cx="12" cy="12" r="2.5" fill="currentColor" />
          )}
        </motion.g>

        {/* Spunta di Successo (Sostituisce il nucleo) */}
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
  category?: string | null;
  rating?: number | null;
  isbn?: string | null;
  rawItem?: any;
}

interface SearchBarProps {
  value?: string;
  onChange?: (val: string) => void;
  onSelectGoogleBook?: (bookItem: FormattedBookResult) => void;
  onSearchActive?: (isActive: boolean) => void;
}

// 2. La Barra di Ricerca con Logica Ibrida (Google Books + OpenLibrary Fallback)
export function SearchBar({ value, onChange, onSelectGoogleBook, onSearchActive }: SearchBarProps) {
  const [internalQuery, setInternalQuery] = useState("");
  const [status, setStatus] = useState<SearchStatus>("idle");
  const [results, setResults] = useState<FormattedBookResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const query = value !== undefined ? value : internalQuery;

  // Controlla se è un ISBN (solo numeri)
  const isIsbn = query.trim().length > 0 && /^\d+$/.test(query.trim());

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

  // Fix per chiudere la tastiera da Mobile
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      (e.target as HTMLInputElement).blur();
    }
  };

  // Auto-dismiss keyboard when scrolling or dragging page
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

  // Logica di Fetching Ibrida (Google Books con Fallback Immediato Open Library)
  useEffect(() => {
    const searchTerm = query.trim();
    if (!searchTerm || searchTerm.length < 3) {
      setResults([]);
      setStatus("idle");
      if (onSearchActive) onSearchActive(false);
      return;
    }

    if (onSearchActive) onSearchActive(true);
    setStatus("loading");

    const fetchBooks = async () => {
      try {
        // TENTATIVO 1: GOOGLE BOOKS
        const googleRes = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchTerm)}&maxResults=15`);
        const googleData = await googleRes.json();

        if (googleData.items && googleData.items.length > 0) {
          const formattedResults: FormattedBookResult[] = googleData.items.map((item: any) => {
            const vi = item.volumeInfo || {};
            let coverUrl = vi.imageLinks?.thumbnail || vi.imageLinks?.smallThumbnail || null;
            if (coverUrl) coverUrl = coverUrl.replace(/^http:/i, 'https:').replace('&edge=curl', '');
            
            let rawDesc = vi.description || item.searchInfo?.textSnippet || '';
            const cleanDesc = rawDesc.replace(/<[^>]+>/g, '').trim() || null;

            return {
              id: item.id,
              title: vi.title || 'Titolo Sconosciuto',
              author: vi.authors && vi.authors.length > 0 ? vi.authors[0] : 'Autore Sconosciuto',
              cover: coverUrl,
              description: cleanDesc,
              pages: vi.pageCount || null,
              year: vi.publishedDate ? vi.publishedDate.substring(0, 4) : null,
              category: vi.categories && vi.categories.length > 0 ? vi.categories[0] : null,
              rating: vi.averageRating || null,
              isbn: vi.industryIdentifiers?.find((id: any) => id.type === 'ISBN_13' || id.type === 'ISBN_10')?.identifier || null,
              rawItem: item
            };
          });
          setResults(formattedResults);
          setStatus("success");
          return; // Esce se Google ha successo
        }
      } catch (error) {
        console.warn('Google Books fallito, provo Open Library:', error);
      }

      // TENTATIVO 2: FALLBACK OPEN LIBRARY SE GOOGLE FALLISCE O NON TROVA NULLA
      try {
        const openLibRes = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(searchTerm)}&limit=15`);
        const openLibData = await openLibRes.json();
        
        if (openLibData.docs && openLibData.docs.length > 0) {
          const fallbackResults: FormattedBookResult[] = openLibData.docs.map((doc: any) => ({
            id: doc.key,
            title: doc.title,
            author: doc.author_name ? doc.author_name[0] : 'Autore Sconosciuto',
            cover: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg` : null,
            description: doc.first_sentence ? (Array.isArray(doc.first_sentence) ? doc.first_sentence[0] : doc.first_sentence) : null,
            pages: doc.number_of_pages_median || null,
            year: doc.first_publish_year ? doc.first_publish_year.toString() : null,
            category: null,
            rating: null,
            isbn: doc.isbn ? doc.isbn[0] : null,
            rawItem: doc
          }));
          setResults(fallbackResults);
          setStatus("success");
        } else {
          setResults([]); // Davvero nessun risultato
          setStatus("error");
        }
      } catch (fallbackError) {
        console.error('Anche Open Library ha fallito:', fallbackError);
        setResults([]);
        setStatus("error");
      }
    };

    const timer = setTimeout(() => {
      fetchBooks();
    }, 600);

    return () => clearTimeout(timer);
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

        {/* Pulsante 'X' per svuotare la ricerca istantaneamente */}
        {query.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-12 top-1/2 -translate-y-1/2 p-1.5 text-[#9E988F] dark:text-[#88837A] hover:text-[#4A4743] dark:hover:text-[#E0DCD3] transition-colors z-10"
            title="Svuota ricerca"
          >
            <X size={18} />
          </button>
        )}

        {/* Contenitore Icona a destra */}
        <div className="absolute right-4 pointer-events-none">
          <OrbitalSearchIcon status={status} isIsbn={isIsbn} />
        </div>
      </div>

      {/* Messaggi di Feedback di Stato Visivi */}
      {status === 'loading' && (
        <p className="text-center mt-4 text-xs font-semibold text-[#7A756D] dark:text-[#A09A90] animate-pulse">
          Ricerca nel catalogo globale in corso...
        </p>
      )}

      {status === 'error' && query.trim().length >= 3 && (
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
                Risultati Catalogo Globale
              </span>
              <span className="text-[10px] font-semibold text-[#B0BEA9] dark:text-[#5C6B55]">
                {results.length} libri trovati
              </span>
            </div>

            {results.map((book) => (
              <div
                key={book.id}
                onClick={() => handleSelectResult(book)}
                className="flex items-center gap-3.5 p-3 hover:bg-[#F4F1EA] dark:hover:bg-[#4A4743] cursor-pointer border-b last:border-b-0 border-[#DCD5C6]/60 dark:border-[#4A4743]/40 transition-colors"
              >
                {book.cover ? (
                  <img
                    src={book.cover}
                    alt={book.title}
                    className="w-10 h-14 object-cover rounded-lg border border-[#DCD5C6] dark:border-[#4A4743]/60 shrink-0 shadow-xs"
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
                  <h4 className="font-semibold text-xs text-[#4A4743] dark:text-[#E0DCD3] line-clamp-1">
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
