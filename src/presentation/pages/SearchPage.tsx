import React, { useState } from 'react';
import { Search, X, Library, Compass } from 'lucide-react';
import { useBooks } from '../hooks/useBooks';
import type { Book } from '../../domain/models/Book';
import { BookCard } from '../components/books/BookCard';
import { BookDetailModal } from '../components/books/BookDetailModal';

export const SearchPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const {
    books,
    deleteBook,
    updateBookStatus,
    updateBook
  } = useBooks();

  const trimmedQuery = searchQuery.trim().toLowerCase();

  const searchResults = trimmedQuery
    ? books.filter(book => {
        const titleMatch = book.title.toLowerCase().includes(trimmedQuery);
        const authorMatch = book.author.toLowerCase().includes(trimmedQuery);
        const isbnMatch = book.isbn ? book.isbn.toLowerCase().includes(trimmedQuery) : false;
        const genreMatch = book.genre ? book.genre.toLowerCase().includes(trimmedQuery) : false;
        return titleMatch || authorMatch || isbnMatch || genreMatch;
      })
    : [];

  return (
    <div className="space-y-6 flex flex-col min-h-[calc(100vh-12rem)] animate-in fade-in duration-200">
      {/* Prominent SearchBar */}
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
              className="absolute right-4 p-1 rounded-full bg-[#EBE5D9] dark:bg-[#383532] text-[#7A756D] dark:text-[#A09A90] hover:text-[#4A4743] dark:hover:text-[#E0DCD3] transition-colors"
              title="Cancella ricerca"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Results or Empty State Container (flex-1) */}
      <div className="flex-1 flex flex-col justify-center">
        {!trimmedQuery ? (
          /* Empty State - Invite user to explore */
          <div className="flex flex-col items-center justify-center text-center py-12 px-4 space-y-4">
            <div className="w-24 h-24 rounded-full bg-[#EBE5D9]/50 dark:bg-[#383532]/50 flex items-center justify-center border border-[#DCD5C6]/60 dark:border-[#4A4743]/40">
              <Compass className="w-12 h-12 text-[#9E988F]/40 dark:text-[#88837A]/30 animate-pulse" />
            </div>
            <div className="max-w-xs space-y-1">
              <h3 className="text-base font-bold text-[#4A4743] dark:text-[#E0DCD3]">
                Esplora la tua libreria
              </h3>
              <p className="text-xs text-[#7A756D] dark:text-[#A09A90] font-medium leading-relaxed">
                Inserisci un titolo, un autore o un codice ISBN per trovare subito un libro nella tua collezione.
              </p>
            </div>
          </div>
        ) : searchResults.length > 0 ? (
          /* Search Results */
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-[#7A756D] dark:text-[#A09A90] px-1">
              <span>Risultati della ricerca</span>
              <span>{searchResults.length} {searchResults.length === 1 ? 'libro trovato' : 'libri trovati'}</span>
            </div>
            <div className="space-y-3">
              {searchResults.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onStatusChange={updateBookStatus}
                  onDelete={deleteBook}
                  onSelectBook={(b) => setSelectedBook(b)}
                />
              ))}
            </div>
          </div>
        ) : (
          /* No Matches State */
          <div className="flex flex-col items-center justify-center text-center py-12 px-4 space-y-3">
            <div className="w-16 h-16 rounded-full bg-[#EBE5D9]/40 dark:bg-[#383532]/40 flex items-center justify-center">
              <Library className="w-8 h-8 text-[#9E988F]/50 dark:text-[#88837A]/40" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-[#4A4743] dark:text-[#E0DCD3]">
                Nessun libro trovato
              </h3>
              <p className="text-xs text-[#7A756D] dark:text-[#A09A90]">
                Nessun risultato corrisponde a "{searchQuery}"
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Book Detail Modal */}
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
