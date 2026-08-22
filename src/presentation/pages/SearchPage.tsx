import React, { useState, useEffect } from 'react';
import { Search, X, Library, Compass, Globe, RefreshCw, Plus, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useBooks } from '../hooks/useBooks';
import type { Book } from '../../domain/models/Book';
import { BookCard } from '../components/books/BookCard';
import { BookDetailModal } from '../components/books/BookDetailModal';
import { BookSheet, type BookSheetBook } from '../components/books/BookSheet';
import { federatedBookSearch, getBookDetail, type WebBook } from '../../infrastructure/services/federatedBookSearch';
import { motion, AnimatePresence } from 'framer-motion';

export const SearchPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // Stato per la ricerca web async
  const [webResults, setWebResults] = useState<WebBook[]>([]);
  const [isWebSearching, setIsWebSearching] = useState(false);
  const [addingWebBookId, setAddingWebBookId] = useState<string | null>(null);

  // Stato per BookSheet (Fase 2: Lazy Hydration per dettagli e shop links)
  const [selectedSheetBook, setSelectedSheetBook] = useState<BookSheetBook | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Toast Notification State
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const {
    books,
    deleteBook,
    updateBookStatus,
    updateBook,
    addBookToLibrary
  } = useBooks();

  const trimmedQuery = searchQuery.trim().toLowerCase();

  // FASE 2.3: Filtro Locale Istantaneo "Nella tua libreria" (Nessuna chiamata di rete)
  const localResults = trimmedQuery
    ? books.filter(book => {
        const titleMatch = book.title.toLowerCase().includes(trimmedQuery);
        const authorMatch = book.author.toLowerCase().includes(trimmedQuery);
        const isbnMatch = book.isbn ? book.isbn.toLowerCase().includes(trimmedQuery) : false;
        const genreMatch = book.genre ? book.genre.toLowerCase().includes(trimmedQuery) : false;
        return titleMatch || authorMatch || isbnMatch || genreMatch;
      })
    : [];

  // FASE 2.4: Ricerca Web Async con federatedBookSearch (Google Books + Open Library + OPAC SBN)
  useEffect(() => {
    if (!trimmedQuery || trimmedQuery.length < 2) {
      setWebResults([]);
      setIsWebSearching(false);
      return;
    }

    setIsWebSearching(true);

    const timer = setTimeout(async () => {
      try {
        const results = await federatedBookSearch(trimmedQuery);
        setWebResults(results);
      } catch (err) {
        console.error('Errore durante la ricerca federata dal Web:', err);
        setWebResults([]);
      } finally {
        setIsWebSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [trimmedQuery]);

  // Gestione Dismiss automatica Toast dopo 4 secondi
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // FASE 2 (Lazy Hydration): Apertura BookSheet con caricamento dettagli completo
  const handleOpenWebBookSheet = async (webBook: WebBook) => {
    const initialSheetBook: BookSheetBook = {
      id: webBook.id,
      title: webBook.title,
      author: webBook.author,
      cover: webBook.coverUrl,
      isbn: webBook.isbn,
      description: webBook.description || null,
      pages: webBook.totalPages || null,
      publisher: webBook.publisher || null,
      year: webBook.publishedYear || null,
      source: webBook.source,
      genre: webBook.genre || 'Generico'
    };

    setSelectedSheetBook(initialSheetBook);
    setIsSheetOpen(true);
    setIsLoadingDetails(!webBook.description);

    try {
      const details = await getBookDetail(
        webBook.id,
        webBook.source,
        webBook.isbn,
        webBook.title,
        webBook.author
      );

      setSelectedSheetBook((prev) =>
        prev
          ? {
              ...prev,
              description: details.description || prev.description || null,
              pages: details.pageCount || prev.pages || null,
              publisher: details.publisher || prev.publisher || null,
              year: details.publishedYear || prev.year || null,
              isbn: details.isbn || prev.isbn
            }
          : null
      );
    } catch (err) {
      console.warn('Errore durante l\'idratazione dei dettagli del libro:', err);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // FASE 3: Salvataggio in Cloud con Optimistic UI e Rollback
  const handleSelectWebBook = async (webBook: WebBook) => {
    setAddingWebBookId(webBook.id);

    const newBookData: Omit<Book, 'id'> = {
      title: webBook.title,
      author: webBook.author,
      coverUrl: webBook.coverUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400',
      status: 'Da leggere',
      startDate: '',
      endDate: '',
      totalPages: webBook.totalPages ? Number(webBook.totalPages) : undefined,
      pagesRead: 0,
      genre: webBook.genre || 'Narrativa',
      isbn: webBook.isbn || undefined
    };

    // Esegui la funzione con Optimistic UI + Sincronizzazione + Rollback se fallisce
    const result = await addBookToLibrary(newBookData);
    setAddingWebBookId(null);

    if (!result.success) {
      setToast({
        type: 'error',
        message: result.error || 'Impossibile salvare in cloud per assenza di rete. Modifica annullata.'
      });
    } else {
      setToast({
        type: 'success',
        message: `"${webBook.title}" è stato aggiunto con successo alla tua libreria!`
      });
    }
  };

  return (
    <div className="space-y-6 flex flex-col min-h-[calc(100vh-12rem)] animate-in fade-in duration-200 relative">
      
      {/* Toast Notification Banner */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-20 left-4 right-4 z-[100] max-w-md mx-auto p-3.5 rounded-2xl shadow-xl border flex items-center gap-3 backdrop-blur-md ${
              toast.type === 'error'
                ? 'bg-rose-500/90 text-white border-rose-600'
                : 'bg-emerald-600/90 text-white border-emerald-700'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertTriangle className="w-5 h-5 shrink-0 text-amber-200" />
            ) : (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-200" />
            )}
            <span className="text-xs font-semibold leading-snug flex-1">{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="p-1 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Prominent SearchBar con feedback di digitazione */}
      <div className="mt-1 relative w-full">
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-[#9E988F] dark:text-[#88837A] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cerca titolo, autore o ISBN..."
            className="w-full pl-12 pr-12 py-4 bg-[#FCFBF8] dark:bg-[#33302D] text-[#4A4743] dark:text-[#E0DCD3] placeholder-[#9E988F] dark:placeholder-[#88837A] text-base font-medium rounded-3xl border border-[#EBE5D9] dark:border-[#4A4743]/60 shadow-sm shadow-[#DCD5C6]/40 dark:shadow-black/20 focus:outline-none focus:ring-2 focus:ring-[#B0BEA9] dark:focus:ring-[#5C6B55] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 p-1 rounded-full bg-[#EBE5D9] dark:bg-[#383532] text-[#7A756D] dark:text-[#A09A90] hover:text-[#4A4743] dark:hover:text-[#E0DCD3] transition-colors cursor-pointer"
              title="Cancella ricerca"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Contenitore dei Risultati (Fase 2: Dividi Visivamente Nella Tua Libreria vs Dal Web) */}
      <div className="flex-1 flex flex-col">
        {!trimmedQuery ? (
          /* Empty State - Nessuna query inserita */
          <div className="flex flex-col items-center justify-center text-center py-16 px-4 space-y-4 my-auto">
            <div className="w-24 h-24 rounded-full bg-[#EBE5D9]/50 dark:bg-[#383532]/50 flex items-center justify-center border border-[#DCD5C6]/60 dark:border-[#4A4743]/40">
              <Compass className="w-12 h-12 text-[#9E988F]/40 dark:text-[#88837A]/30 animate-pulse" />
            </div>
            <div className="max-w-xs space-y-1">
              <h3 className="text-base font-bold text-[#4A4743] dark:text-[#E0DCD3]">
                Ricerca Ibrida (Locale + Web)
              </h3>
              <p className="text-xs text-[#7A756D] dark:text-[#A09A90] font-medium leading-relaxed">
                Digita per cercare nei libri salvati e nei cataloghi di Google Books, Open Library e OPAC SBN.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">

            {/* SEZIONE 1: Nella tua libreria (Offline/Locale) - ISTANTANEO */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-[#4A4743] dark:text-[#E0DCD3] px-1 border-b border-[#EBE5D9] dark:border-[#4A4743]/50 pb-2">
                <span className="flex items-center gap-1.5">
                  <Library className="w-4 h-4 text-[#5C6B55] dark:text-[#A0AF99]" />
                  <span>Nella tua libreria</span>
                </span>
                <span className="text-[11px] font-semibold text-[#7A756D] dark:text-[#A09A90]">
                  {localResults.length} {localResults.length === 1 ? 'risultato locale' : 'risultati locali'}
                </span>
              </div>

              {localResults.length > 0 ? (
                <div className="space-y-3">
                  {localResults.map((book) => (
                    <BookCard
                      key={book.id}
                      book={book}
                      onStatusChange={updateBookStatus}
                      onDelete={deleteBook}
                      onSelectBook={(b) => setSelectedBook(b)}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-[#FCFBF8] dark:bg-[#33302D] p-4 rounded-2xl border border-[#EBE5D9] dark:border-[#4A4743]/60 text-center text-xs text-[#7A756D] dark:text-[#A09A90]">
                  Nessun libro trovato nella tua collezione locale per "{searchQuery}".
                </div>
              )}
            </div>

            {/* SEZIONE 2: Dal Web (Online - Google Books + Open Library + OPAC SBN) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#4A4743] dark:text-[#E0DCD3] px-1 border-b border-[#EBE5D9] dark:border-[#4A4743]/50 pb-2">
                <span className="flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-[#5C6B55] dark:text-[#A0AF99]" />
                  <span>Dal Web (Google Books + Open Library + OPAC SBN)</span>
                </span>
                {isWebSearching && (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-[#5C6B55] dark:text-[#A0AF99] animate-pulse">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Ricerca in corso...
                  </span>
                )}
              </div>

              {isWebSearching ? (
                /* Spinner dedicato solo per la sezione Dal Web */
                <div className="bg-[#FCFBF8] dark:bg-[#33302D] p-8 rounded-2xl border border-[#EBE5D9] dark:border-[#4A4743]/60 flex flex-col items-center justify-center gap-2 text-center">
                  <RefreshCw className="w-6 h-6 text-[#5C6B55] dark:text-[#A0AF99] animate-spin" />
                  <span className="text-xs font-semibold text-[#7A756D] dark:text-[#A09A90]">
                    Consultazione cataloghi online in corso...
                  </span>
                </div>
              ) : webResults.length > 0 ? (
                <div className="space-y-2.5">
                  {webResults.map((webBook) => (
                    <div
                      key={webBook.id}
                      onClick={() => handleOpenWebBookSheet(webBook)}
                      className="bg-[#FCFBF8] dark:bg-[#33302D] p-3 rounded-2xl border border-[#EBE5D9] dark:border-[#4A4743]/60 flex items-center gap-3 shadow-xs hover:border-[#5C6B55]/60 hover:shadow-md transition-all cursor-pointer group"
                    >
                      {webBook.coverUrl ? (
                        <img
                          src={webBook.coverUrl}
                          alt={webBook.title}
                          className="w-12 h-16 object-cover rounded-xl border border-[#EBE5D9] dark:border-[#4A4743]/60 shrink-0 shadow-xs group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-12 h-16 rounded-xl bg-[#F4F1EA] dark:bg-[#2A2826] flex items-center justify-center shrink-0 border border-[#EBE5D9] dark:border-[#4A4743]/60">
                          <span className="text-[9px] font-bold text-[#7A756D] dark:text-[#A09A90]">No Img</span>
                        </div>
                      )}

                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#5C6B55]/10 dark:bg-[#5C6B55]/20 text-[#5C6B55] dark:text-[#A0AF99]">
                            {webBook.source === 'google' ? 'Google Books' : webBook.source === 'openlibrary' ? 'Open Library' : 'OPAC SBN'}
                          </span>
                          {webBook.publishedYear && (
                            <span className="text-[10px] text-[#7A756D] dark:text-[#A09A90]">
                              • {webBook.publishedYear}
                            </span>
                          )}
                        </div>

                        <h4 className="font-bold text-xs text-[#31362F] dark:text-[#E0DCD3] truncate group-hover:text-[#5C6B55] dark:group-hover:text-[#A0AF99] transition-colors">
                          {webBook.title}
                        </h4>
                        <p className="text-[11px] text-[#7A756D] dark:text-[#A09A90] truncate">
                          {webBook.author}
                        </p>
                      </div>

                      {/* Pulsante 'Seleziona' / Aggiunta rapida */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectWebBook(webBook);
                        }}
                        disabled={addingWebBookId === webBook.id}
                        className="px-3.5 py-2 rounded-xl bg-[#5C6B55] hover:bg-[#4A5744] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0 active:scale-95 disabled:opacity-50"
                      >
                        {addingWebBookId === webBook.id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Plus className="w-3.5 h-3.5" />
                        )}
                        <span>Seleziona</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-[#FCFBF8] dark:bg-[#33302D] p-4 rounded-2xl border border-[#EBE5D9] dark:border-[#4A4743]/60 text-center text-xs text-[#7A756D] dark:text-[#A09A90]">
                  Nessun libro aggiuntivo trovato nei cataloghi online per "{searchQuery}".
                </div>
              )}
            </div>

          </div>
        )}
      </div>

      {/* Book Sheet per i dettagli completi dei libri dal Web (Fase 2: Lazy Hydration + Shop Links) */}
      <BookSheet
        isOpen={isSheetOpen}
        onClose={() => {
          setIsSheetOpen(false);
          setSelectedSheetBook(null);
        }}
        book={selectedSheetBook}
        isLoadingDetails={isLoadingDetails}
        onAddBook={async (bSheet) => {
          const webBookItem: WebBook = {
            id: bSheet.id,
            title: bSheet.title,
            author: bSheet.author,
            coverUrl: bSheet.cover || null,
            isbn: bSheet.isbn,
            totalPages: bSheet.pages ? Number(bSheet.pages) : undefined,
            genre: bSheet.genre,
            publishedYear: bSheet.year ? String(bSheet.year) : undefined,
            source: (bSheet.source as any) || 'google'
          };
          await handleSelectWebBook(webBookItem);
        }}
      />

      {/* Book Detail Modal per la consultazione dei libri locali */}
      <BookDetailModal
        book={selectedBook}
        isOpen={Boolean(selectedBook)}
        onClose={() => setSelectedBook(null)}
        onUpdateBook={(updatedBook) => {
          updateBook(updatedBook);
          setSelectedBook(updatedBook);
        }}
        onDeleteBook={deleteBook}
      />
    </div>
  );
};
