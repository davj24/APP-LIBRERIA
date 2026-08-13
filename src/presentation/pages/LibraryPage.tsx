import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { useBooks } from '../hooks/useBooks';
import { BookOpen, Clock, CheckCircle2, Users, Tag } from 'lucide-react';

export type LibrarySubTab = 'books' | 'authors' | 'genres';

export const LibraryPage: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<LibrarySubTab>('books');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
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

  // Selezione libro dai risultati di ricerca
  const handleBookSelect = (baseBook: FormattedBookResult) => {
    const sheetBook: BookSheetBook = {
      id: baseBook.id || String(Math.random()),
      title: baseBook.title || 'Titolo Sconosciuto',
      author: baseBook.author || 'Autore Sconosciuto',
      cover: baseBook.cover || null,
      description: baseBook.description || null,
      pages: baseBook.pages || null,
      year: baseBook.year || null,
      category: baseBook.category || null,
      rating: baseBook.rating || null,
      isbn: baseBook.isbn || null,
      genre: baseBook.category || 'Digitale',
      rawItem: baseBook.rawItem || baseBook
    };

    setSelectedBookDetails(sheetBook);
    setIsSheetOpen(true);
    setIsLoadingDetails(false);
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
      genre: bSheet.genre || bSheet.category || 'Digitale'
    });
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* SearchBar Component con Callback per Selezione Risultato */}
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        onSelectGoogleBook={handleBookSelect}
        onSearchActive={setIsSearchActive}
      />

      {/* Main Page Content che si nasconde fluidamente durante la ricerca */}
      <AnimatePresence mode="wait">
        {!isSearchActive && (
          <motion.div
            key="library-main-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="space-y-4"
          >
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
          </motion.div>
        )}
      </AnimatePresence>

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
      />

      <AddBookModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onAddBook={addBook}
      />

      {/* Componente BookSheet (Bottom Sheet dei dettagli libro con Fetch Secondario per Trama Perfetta) */}
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
