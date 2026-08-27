import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { Book } from '../../domain/models/Book';
import { BookGrid } from '../components/books/BookGrid';
import { AuthorsView } from '../components/books/AuthorsView';
import { GenresView } from '../components/books/GenresView';
import { AddBookChoiceModal } from '../components/books/AddBookChoiceModal';
import { AddBookModal } from '../components/books/AddBookModal';
import { CameraScannerModal } from '../components/books/CameraScannerModal';
import { BookDetailModal } from '../components/books/BookDetailModal';
import { SearchBar, type FormattedBookResult } from '../components/books/SearchBar';
import { BookSheet, type BookSheetBook } from '../components/books/BookSheet';
import { CurrentlyReadingCard } from '../components/dashboard/CurrentlyReadingCard';
import { useBooks } from '../hooks/useBooks';
import { useUserProfile } from '../hooks/useUserProfile';
import { getBookDetail } from '../../infrastructure/services/federatedBookSearch';
import { BookOpen, Clock, CheckCircle2, Users, Tag, Camera, PlusCircle, Sparkles } from 'lucide-react';

export type LibrarySubTab = 'books' | 'authors' | 'genres';

export const LibraryPage: React.FC = () => {
  const { profile } = useUserProfile();
  const userFirstName = profile?.name ? profile.name.split(' ')[0] : 'Lettore';

  const [activeSubTab, setActiveSubTab] = useState<LibrarySubTab>('books');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // Stati locali dedicati al Bottom Sheet dei dettagli libro da ricerca
  const [selectedBookDetails, setSelectedBookDetails] = useState<BookSheetBook | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const [isChoiceModalOpen, setIsChoiceModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);

  const {
    books,
    selectedFilter,
    setSelectedFilter,
    addBook,
    deleteBook,
    updateBookStatus,
    updateBookPages,
    updateBook
  } = useBooks();

  const trimmedQuery = searchQuery.trim().toLowerCase();

  // Filter local books in real time by searchQuery
  const localFilteredBooks = books.filter(book => {
    if (selectedFilter !== 'Tutti' && book.status !== selectedFilter) {
      return false;
    }

    if (!trimmedQuery) return true;

    const titleMatch = book.title.toLowerCase().includes(trimmedQuery);
    const authorMatch = book.author.toLowerCase().includes(trimmedQuery);
    const genreMatch = book.genre ? book.genre.toLowerCase().includes(trimmedQuery) : false;
    const notesMatch = book.notes ? book.notes.toLowerCase().includes(trimmedQuery) : false;
    return titleMatch || authorMatch || genreMatch || notesMatch;
  });

  const readingCount = books.filter(b => b.status === 'In lettura').length;
  const toReadCount = books.filter(b => b.status === 'Da leggere').length;
  const readCount = books.filter(b => b.status === 'Letto').length;

  // Selezione libro dai risultati di ricerca con Lazy Hydration
  const handleBookSelect = async (baseBook: FormattedBookResult) => {
    const sheetBook: BookSheetBook = {
      id: baseBook.id || String(Math.random()),
      title: baseBook.title || 'Titolo Sconosciuto',
      author: baseBook.author || 'Autore Sconosciuto',
      cover: baseBook.cover || null,
      description: baseBook.description || null,
      pages: baseBook.pages || null,
      year: baseBook.year || null,
      publisher: baseBook.publisher || null,
      category: baseBook.category || null,
      rating: baseBook.rating || null,
      isbn: baseBook.isbn || null,
      source: baseBook.source || 'google',
      genre: baseBook.category || 'Digitale',
      rawItem: baseBook.rawItem || baseBook
    };

    setSelectedBookDetails(sheetBook);
    setIsSheetOpen(true);

    const needsDetailFetch = !baseBook.description || !baseBook.publisher;
    setIsLoadingDetails(needsDetailFetch);

    if (needsDetailFetch) {
      try {
        const details = await getBookDetail(
          baseBook.id,
          (baseBook.source as any) || 'google',
          baseBook.isbn,
          baseBook.title,
          baseBook.author
        );

        setSelectedBookDetails((prev) =>
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
      } catch (e) {
        console.warn('Errore idratazione dettagli per LibraryPage:', e);
      } finally {
        setIsLoadingDetails(false);
      }
    }
  };

  const handleAddFromSheet = (bSheet: BookSheetBook) => {
    addBook({
      title: bSheet.title,
      author: bSheet.author,
      coverUrl: bSheet.cover || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400',
      startDate: '',
      endDate: '',
      status: 'Da leggere',
      totalPages: typeof bSheet.pages === 'number' ? bSheet.pages : (parseInt(String(bSheet.pages)) || 300),
      pagesRead: 0,
      genre: bSheet.genre || bSheet.category || 'Digitale',
      isbn: bSheet.isbn || undefined
    });
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* SearchBar Component con Callback per Selezione Risultato */}
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        onSelectGoogleBook={handleBookSelect}
      />

      {/* Main Page Content */}
      <motion.div
        key="library-main-content"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="space-y-4"
      >
        {/* WELCOME SCREEN SCHERMATA DI BENVENUTO SE 0 LIBRI IN LIBRERIA */}
        {books.length === 0 && !trimmedQuery ? (
          <div className="bg-[#EFECE6] dark:bg-[#272422] border border-[#E2DDD2] dark:border-[#36322E] rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-sm">
            <div className="w-16 h-16 rounded-3xl bg-[#5C6B55]/15 dark:bg-[#A8BB9C]/15 text-[#5C6B55] dark:text-[#A8BB9C] flex items-center justify-center mx-auto border border-[#5C6B55]/30">
              <BookOpen size={32} />
            </div>

            <div className="max-w-md mx-auto space-y-2">
              <h2 className="text-xl sm:text-2xl font-black text-[#31362F] dark:text-[#E0DCD3] tracking-tight">
                Benvenuto nella tua Libreria, {userFirstName}! 📚
              </h2>
              <p className="text-xs sm:text-sm text-[#7A756D] dark:text-[#9A9488] leading-relaxed">
                La tua libreria personale è ancora vuota. Aggiungi il tuo primo libro per iniziare a monitorare le tue letture, salvare i tuoi takeaway e tracciare la tua streak!
              </p>
            </div>

            {/* Pulsanti Azione Rapida */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto pt-2">
              <button
                onClick={() => setIsCameraModalOpen(true)}
                className="p-4 rounded-2xl bg-[#5C6B55] hover:bg-[#4D5A46] text-white text-xs font-extrabold flex items-center justify-center gap-2.5 shadow-md active:scale-95 transition-all cursor-pointer border border-[#788C71]"
              >
                <Camera size={18} />
                <span>Scansiona con Fotocamera</span>
              </button>

              <button
                onClick={() => setIsManualModalOpen(true)}
                className="p-4 rounded-2xl bg-[#F7F4EE] dark:bg-[#201E1C] hover:bg-[#EFECE6] dark:hover:bg-[#272422] text-[#31362F] dark:text-[#E0DCD3] text-xs font-extrabold flex items-center justify-center gap-2.5 border border-[#E2DDD2] dark:border-[#36322E] shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                <PlusCircle size={18} className="text-[#5C6B55] dark:text-[#A8BB9C]" />
                <span>Inserisci Manualmente</span>
              </button>
            </div>

            <div className="pt-3 border-t border-[#E2DDD2] dark:border-[#36322E] max-w-sm mx-auto">
              <p className="text-[11px] text-[#7A756D] dark:text-[#9A9488] font-medium flex items-center justify-center gap-1.5">
                <Sparkles size={13} className="text-amber-500 fill-amber-500" />
                <span>Oppure usa la barra in alto per cercare tra oltre 25M di libri!</span>
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Invito alla ricerca se nessun libro locale corrisponde */}
            {trimmedQuery && localFilteredBooks.length === 0 && (
              <div className="bg-[#EBE5D9]/60 dark:bg-[#383532]/60 rounded-2xl p-3 text-center border border-[#DCD5C6] dark:border-[#4A4743]/50 max-w-md mx-auto">
                <p className="text-xs text-[#7A756D] dark:text-[#A09A90] font-medium">
                  Nessun libro trovato nella tua libreria per "{searchQuery}".
                </p>
              </div>
            )}

            {/* Sub-Navigation Tabs (Libri, Autori, Generi) */}
            <div className="bg-[#EBE5D9] dark:bg-[#383532] p-1 rounded-2xl flex items-center gap-1 border border-[#DCD5C6] dark:border-[#4A4743]/60 transition-colors">
              <button
                onClick={() => setActiveSubTab('books')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeSubTab === 'books'
                    ? 'bg-[#B0BEA9] dark:bg-[#5C6B55] text-[#31362F] dark:text-[#E0DCD3] shadow-sm'
                    : 'text-[#7A756D] dark:text-[#A09A90] hover:text-[#4A4743] dark:hover:text-[#E0DCD3]'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Tutti i Libri</span>
              </button>

              <button
                onClick={() => setActiveSubTab('authors')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeSubTab === 'authors'
                    ? 'bg-[#B0BEA9] dark:bg-[#5C6B55] text-[#31362F] dark:text-[#E0DCD3] shadow-sm'
                    : 'text-[#7A756D] dark:text-[#A09A90] hover:text-[#4A4743] dark:hover:text-[#E0DCD3]'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Autori</span>
              </button>

              <button
                onClick={() => setActiveSubTab('genres')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeSubTab === 'genres'
                    ? 'bg-[#B0BEA9] dark:bg-[#5C6B55] text-[#31362F] dark:text-[#E0DCD3] shadow-sm'
                    : 'text-[#7A756D] dark:text-[#A09A90] hover:text-[#4A4743] dark:hover:text-[#E0DCD3]'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Generi</span>
              </button>
            </div>

            {/* Tab Content */}
            {activeSubTab === 'books' && (
              <>
                {/* Hero Card Lettura in Corso (se attiva e nessuna ricerca pendente) */}
                {!trimmedQuery && selectedFilter === 'Tutti' && (
                  <CurrentlyReadingCard
                    books={books}
                    onUpdateStatus={updateBookStatus}
                    onUpdatePages={updateBookPages}
                  />
                )}

                {/* Summary Pills */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-[#FCFBF8] dark:bg-[#33302D] border border-[#EBE5D9] dark:border-[#4A4743]/60 rounded-2xl p-2.5 text-center shadow-sm shadow-[#DCD5C6]/50 dark:shadow-none transition-colors">
                    <div className="text-[10px] font-bold text-[#4A4743] dark:text-[#E0DCD3] bg-[#EBE5D9] dark:bg-[#383532] px-2 py-0.5 rounded-full inline-flex items-center gap-1 mb-1">
                      <Clock className="w-3 h-3 text-[#7A756D] dark:text-[#A09A90]" /> In Lettura
                    </div>
                    <div className="text-lg font-black text-[#4A4743] dark:text-[#E0DCD3]">{readingCount}</div>
                  </div>

                  <div className="bg-[#FCFBF8] dark:bg-[#33302D] border border-[#EBE5D9] dark:border-[#4A4743]/60 rounded-2xl p-2.5 text-center shadow-sm shadow-[#DCD5C6]/50 dark:shadow-none transition-colors">
                    <div className="text-[10px] font-bold text-[#7A756D] dark:text-[#A09A90] bg-[#F4F1EA] dark:bg-[#2A2826] px-2 py-0.5 rounded-full inline-flex items-center gap-1 mb-1">
                      <BookOpen className="w-3 h-3 text-[#9E988F] dark:text-[#88837A]" /> Da Leggere
                    </div>
                    <div className="text-lg font-black text-[#4A4743] dark:text-[#E0DCD3]">{toReadCount}</div>
                  </div>

                  <div className="bg-[#FCFBF8] dark:bg-[#33302D] border border-[#EBE5D9] dark:border-[#4A4743]/60 rounded-2xl p-2.5 text-center shadow-sm shadow-[#DCD5C6]/50 dark:shadow-none transition-colors">
                    <div className="text-[10px] font-bold text-[#2D382B] dark:text-[#E0DCD3] bg-[#D8E2D5] dark:bg-[#3B4838] px-2 py-0.5 rounded-full inline-flex items-center gap-1 mb-1">
                      <CheckCircle2 className="w-3 h-3 text-[#4D6349] dark:text-[#788C71]" /> Letti
                    </div>
                    <div className="text-lg font-black text-[#4A4743] dark:text-[#E0DCD3]">{readCount}</div>
                  </div>
                </div>

                {/* Book Grid */}
                <BookGrid
                  books={books}
                  filteredBooks={localFilteredBooks}
                  selectedFilter={selectedFilter}
                  onSelectFilter={setSelectedFilter}
                  onStatusChange={updateBookStatus}
                  onDelete={deleteBook}
                  onSelectBook={(book) => setSelectedBook(book)}
                />
              </>
            )}

            {activeSubTab === 'authors' && (
              <AuthorsView
                books={books}
                onStatusChange={updateBookStatus}
                onDeleteBook={deleteBook}
                onSelectBook={(book) => setSelectedBook(book)}
              />
            )}

            {activeSubTab === 'genres' && (
              <GenresView
                books={books}
                onStatusChange={updateBookStatus}
                onDeleteBook={deleteBook}
                onSelectBook={(book) => setSelectedBook(book)}
              />
            )}
          </>
        )}
      </motion.div>

      {/* Book Detail & Edit Modal per i libri della libreria locale */}
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

      {/* Add Modals */}
      <AddBookChoiceModal
        isOpen={isChoiceModalOpen}
        onClose={() => setIsChoiceModalOpen(false)}
        onSelectCamera={() => setIsCameraModalOpen(true)}
        onSelectManual={() => setIsManualModalOpen(true)}
      />

      <CameraScannerModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onBookScanned={addBook}
        onOpenManualEntry={() => setIsManualModalOpen(true)}
      />

      <AddBookModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onAddBook={addBook}
      />

      {/* Componente BookSheet per i dettagli dei libri da ricerca */}
      <BookSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        book={selectedBookDetails}
        isLoadingDetails={isLoadingDetails}
        onAddBook={handleAddFromSheet}
      />
    </div>
  );
};
