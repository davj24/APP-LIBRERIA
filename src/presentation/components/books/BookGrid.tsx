import React, { useState } from 'react';
import type { Book, BookStatus } from '../../../domain/models/Book';
import { BookCard } from './BookCard';
import type { FilterType } from '../../hooks/useBooks';
import { Search, BookOpen } from 'lucide-react';

interface BookGridProps {
  books: Book[];
  filteredBooks: Book[];
  selectedFilter: FilterType;
  onSelectFilter: (filter: FilterType) => void;
  onStatusChange: (id: string, status: BookStatus) => void;
  onDelete: (id: string) => void;
  onSelectBook?: (book: Book) => void;
}

export const BookGrid: React.FC<BookGridProps> = ({
  books,
  filteredBooks,
  selectedFilter,
  onSelectFilter,
  onStatusChange,
  onDelete,
  onSelectBook
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filterOptions: { label: FilterType; count: number }[] = [
    { label: 'Tutti', count: books.length },
    { label: 'In lettura', count: books.filter(b => b.status === 'In lettura').length },
    { label: 'Da leggere', count: books.filter(b => b.status === 'Da leggere').length },
    { label: 'Letto', count: books.filter(b => b.status === 'Letto').length },
  ];

  const displayedBooks = filteredBooks.filter(book =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A756D] dark:text-[#A09A90]" />
        <input
          type="text"
          placeholder="Cerca per titolo o autore..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-[#FCFBF8] dark:bg-[#33302D] border border-[#EBE5D9] dark:border-[#4A4743]/60 rounded-xl text-sm text-[#4A4743] dark:text-[#E0DCD3] placeholder:text-[#9E988F] dark:placeholder:text-[#88837A] shadow-sm shadow-[#DCD5C6]/50 dark:shadow-none focus:outline-none focus:border-[#B0BEA9] dark:focus:border-[#5C6B55] transition-all"
        />
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {filterOptions.map((option) => (
          <button
            key={option.label}
            onClick={() => onSelectFilter(option.label)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
              selectedFilter === option.label
                ? 'bg-[#B0BEA9] dark:bg-[#5C6B55] text-[#31362F] dark:text-[#E0DCD3] shadow-sm border border-[#A0AF99] dark:border-[#4D5A46]'
                : 'bg-[#FCFBF8] dark:bg-[#33302D] text-[#7A756D] dark:text-[#A09A90] border border-[#EBE5D9] dark:border-[#4A4743]/60 hover:bg-[#F4F1EA] dark:hover:bg-[#383532]'
            }`}
          >
            <span>{option.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                selectedFilter === option.label
                  ? 'bg-[#31362F] dark:bg-[#2A2826] text-[#FCFBF8] dark:text-[#E0DCD3]'
                  : 'bg-[#EBE5D9] dark:bg-[#383532] text-[#4A4743] dark:text-[#E0DCD3]'
              }`}
            >
              {option.count}
            </span>
          </button>
        ))}
      </div>

      {/* Book List / Grid */}
      {displayedBooks.length > 0 ? (
        <div className="grid grid-cols-1 gap-3">
          {displayedBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onStatusChange={onStatusChange}
              onDelete={onDelete}
              onSelectBook={onSelectBook}
            />
          ))}
        </div>
      ) : (
        <div className="bg-[#FCFBF8] dark:bg-[#33302D] rounded-2xl p-8 border border-dashed border-[#DCD5C6] dark:border-[#4A4743]/60 text-center my-6">
          <div className="w-12 h-12 rounded-2xl bg-[#EBE5D9] dark:bg-[#383532] text-[#4A4743] dark:text-[#E0DCD3] flex items-center justify-center mx-auto mb-3">
            <BookOpen className="w-6 h-6" />
          </div>
          <h4 className="font-semibold text-[#4A4743] dark:text-[#E0DCD3] text-base mb-1">
            Nessun libro trovato
          </h4>
          <p className="text-xs text-[#7A756D] dark:text-[#A09A90] max-w-xs mx-auto mb-4">
            Non ci sono libri che corrispondono ai filtri scelti. Aggiungi il tuo primo libro usando il pulsante + in basso!
          </p>
        </div>
      )}
    </div>
  );
};
