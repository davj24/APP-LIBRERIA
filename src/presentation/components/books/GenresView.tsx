import React, { useState } from 'react';
import type { Book, BookStatus } from '../../../domain/models/Book';
import { BookCard } from './BookCard';
import { Search, Tag, ChevronDown, ChevronUp, Layers } from 'lucide-react';

interface GenresViewProps {
  books: Book[];
  onStatusChange: (id: string, status: BookStatus) => void;
  onDeleteBook: (id: string) => void;
  onSelectBook: (book: Book) => void;
}

export const GenresView: React.FC<GenresViewProps> = ({
  books,
  onStatusChange,
  onDeleteBook,
  onSelectBook
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGenre, setExpandedGenre] = useState<string | null>(null);

  // Group books by genre
  const genreMap = books.reduce<Record<string, Book[]>>((acc, book) => {
    const genreName = book.genre?.trim() || 'Generale / Altro';
    if (!acc[genreName]) {
      acc[genreName] = [];
    }
    acc[genreName].push(book);
    return acc;
  }, {});

  const genresList = Object.keys(genreMap).sort((a, b) => a.localeCompare(b));

  const filteredGenres = genresList.filter(genre =>
    genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    genreMap[genre].some(b => b.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const toggleGenre = (genre: string) => {
    setExpandedGenre(prev => (prev === genre ? null : genre));
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A756D] dark:text-[#A09A90]" />
        <input
          type="text"
          placeholder="Cerca per genere o titolo..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-[#FCFBF8] dark:bg-[#33302D] border border-[#EBE5D9] dark:border-[#4A4743]/60 rounded-xl text-sm text-[#4A4743] dark:text-[#E0DCD3] placeholder:text-[#9E988F] dark:placeholder:text-[#88837A] shadow-sm shadow-[#DCD5C6]/50 dark:shadow-none focus:outline-none focus:border-[#B0BEA9] dark:focus:border-[#5C6B55] transition-all"
        />
      </div>

      <div className="text-xs font-bold text-[#7A756D] dark:text-[#A09A90] flex items-center justify-between">
        <span>{filteredGenres.length} {filteredGenres.length === 1 ? 'Genere trovato' : 'Generi trovati'}</span>
      </div>

      {/* Genres List */}
      {filteredGenres.length > 0 ? (
        <div className="space-y-3">
          {filteredGenres.map(genre => {
            const genreBooks = genreMap[genre];
            const isExpanded = expandedGenre === genre || Boolean(searchQuery);

            return (
              <div
                key={genre}
                className="bg-[#FCFBF8] dark:bg-[#33302D] rounded-2xl border border-[#EBE5D9] dark:border-[#4A4743]/60 shadow-sm shadow-[#DCD5C6]/50 dark:shadow-none overflow-hidden transition-colors"
              >
                {/* Genre Card Header */}
                <button
                  onClick={() => toggleGenre(genre)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-[#F4F1EA] dark:hover:bg-[#383532] transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-[#B0BEA9] dark:bg-[#5C6B55] text-[#31362F] dark:text-[#E0DCD3] border border-[#A0AF99] dark:border-[#4D5A46] font-extrabold text-base flex items-center justify-center shadow-xs shrink-0">
                      <Tag className="w-5 h-5" />
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-bold text-[#4A4743] dark:text-[#E0DCD3] text-base leading-tight truncate">
                        {genre}
                      </h3>
                      <p className="text-xs font-medium text-[#7A756D] dark:text-[#A09A90] mt-0.5">
                        {genreBooks.length} {genreBooks.length === 1 ? 'libro in questo genere' : 'libri in questo genere'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Covers preview stack */}
                    <div className="hidden sm:flex -space-x-2 overflow-hidden mr-2">
                      {genreBooks.slice(0, 3).map(b => (
                        <img
                          key={b.id}
                          src={b.coverUrl}
                          alt={b.title}
                          className="inline-block h-8 w-6 rounded-md object-cover border-2 border-[#FCFBF8] dark:border-[#33302D] shadow-xs"
                        />
                      ))}
                    </div>

                    <div className="w-8 h-8 rounded-xl bg-[#EBE5D9] dark:bg-[#383532] text-[#4A4743] dark:text-[#E0DCD3] flex items-center justify-center">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </button>

                {/* Expanded Books List */}
                {isExpanded && (
                  <div className="p-4 bg-[#F4F1EA] dark:bg-[#2A2826] border-t border-[#EBE5D9] dark:border-[#4A4743]/50 space-y-3 animate-in fade-in">
                    <div className="text-[11px] font-bold text-[#7A756D] dark:text-[#A09A90] uppercase tracking-wider">
                      Libri del genere "{genre}" ({genreBooks.length})
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {genreBooks.map(book => (
                        <BookCard
                          key={book.id}
                          book={book}
                          onStatusChange={onStatusChange}
                          onDelete={onDeleteBook}
                          onSelectBook={onSelectBook}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-[#FCFBF8] dark:bg-[#33302D] rounded-2xl p-8 border border-dashed border-[#DCD5C6] dark:border-[#4A4743]/60 text-center my-6">
          <div className="w-12 h-12 rounded-2xl bg-[#EBE5D9] dark:bg-[#383532] text-[#4A4743] dark:text-[#E0DCD3] flex items-center justify-center mx-auto mb-3">
            <Layers className="w-6 h-6" />
          </div>
          <h4 className="font-semibold text-[#4A4743] dark:text-[#E0DCD3] text-base mb-1">
            Nessun genere trovato
          </h4>
          <p className="text-xs text-[#7A756D] dark:text-[#A09A90]">
            Nessun genere corrisponde alla ricerca effettuata.
          </p>
        </div>
      )}
    </div>
  );
};
