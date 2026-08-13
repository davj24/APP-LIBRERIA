import React from 'react';
import type { Book, BookStatus } from '../../../domain/models/Book';
import { Calendar, Star, CheckCircle2, Clock, BookOpen } from 'lucide-react';

interface BookCardProps {
  book: Book;
  onStatusChange: (id: string, status: BookStatus) => void;
  onDelete: (id: string) => void;
  onSelectBook?: (book: Book) => void;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onStatusChange, onSelectBook }) => {
  const getStatusBadge = (status: BookStatus) => {
    switch (status) {
      case 'In lettura':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EBE5D9] dark:bg-[#383532] text-[#4A4743] dark:text-[#E0DCD3] border border-[#DCD5C6] dark:border-[#4A4743]/60">
            <Clock className="w-3 h-3 text-[#7A756D] dark:text-[#A09A90]" />
            In lettura
          </span>
        );
      case 'Letto':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#D8E2D5] dark:bg-[#3B4838] text-[#2D382B] dark:text-[#E0DCD3] border border-[#B0BEA9] dark:border-[#5C6B55]">
            <CheckCircle2 className="w-3 h-3 text-[#4D6349] dark:text-[#788C71]" />
            Letto
          </span>
        );
      case 'Da leggere':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F4F1EA] dark:bg-[#2A2826] text-[#7A756D] dark:text-[#A09A90] border border-[#EBE5D9] dark:border-[#4A4743]/50">
            <BookOpen className="w-3 h-3 text-[#9E988F] dark:text-[#88837A]" />
            Da leggere
          </span>
        );
    }
  };

  const progress = book.totalPages && book.pagesRead
    ? Math.min(100, Math.round((book.pagesRead / book.totalPages) * 100))
    : null;

  const handleCardClick = () => {
    if (onSelectBook) {
      onSelectBook(book);
    }
  };

  return (
    <div className="bg-[#FCFBF8] dark:bg-[#33302D] rounded-2xl p-3.5 border border-[#EBE5D9] dark:border-[#4A4743]/60 shadow-sm shadow-[#DCD5C6]/50 dark:shadow-md dark:shadow-black/30 hover:shadow-md transition-all duration-200 flex gap-3.5 relative group">
      {/* Cover Image - Clickable */}
      <button
        type="button"
        onClick={handleCardClick}
        className="w-20 h-28 flex-shrink-0 rounded-xl overflow-hidden bg-[#F4F1EA] dark:bg-[#2A2826] border border-[#EBE5D9] dark:border-[#4A4743]/60 shadow-inner relative text-left group-hover:border-[#B0BEA9] dark:group-hover:border-[#5C6B55] transition-all focus:outline-none"
      >
        <img
          src={book.coverUrl}
          alt={book.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400';
          }}
        />
      </button>

      {/* Book Information */}
      <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
        <div>
          <div className="flex items-start justify-between gap-1 mb-1">
            <div onClick={handleCardClick} className="cursor-pointer">
              {getStatusBadge(book.status)}
            </div>
          </div>

          {/* Title & Author - Clickable */}
          <div onClick={handleCardClick} className="cursor-pointer">
            <h3 className="font-bold text-[#4A4743] dark:text-[#E0DCD3] text-base leading-snug line-clamp-1 group-hover:text-[#2D382B] dark:group-hover:text-white transition-colors">
              {book.title}
            </h3>
            <p className="text-xs font-medium text-[#7A756D] dark:text-[#A09A90] line-clamp-1 mb-1.5">
              {book.author}
            </p>

            {/* Dates */}
            <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-[11px] text-[#7A756D] dark:text-[#A09A90]">
              {book.startDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#9E988F] dark:text-[#88837A]" />
                  <span>Inizio: {book.startDate}</span>
                </div>
              )}
              {book.endDate && (
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-[#4D6349] dark:text-[#788C71]" />
                  <span>Fine: {book.endDate}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reading Progress or Rating */}
        <div className="mt-2 pt-2 border-t border-[#EBE5D9] dark:border-[#4A4743]/50 flex items-center justify-between">
          <div onClick={handleCardClick} className="flex-1 cursor-pointer mr-2">
            {progress !== null ? (
              <div className="w-full">
                <div className="flex justify-between text-[10px] font-medium text-[#7A756D] dark:text-[#A09A90] mb-1">
                  <span>Progresso</span>
                  <span>{progress}% ({book.pagesRead}/{book.totalPages} p.)</span>
                </div>
                <div className="w-full bg-[#EBE5D9] dark:bg-[#2A2826] rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-[#B0BEA9] dark:bg-[#5C6B55] h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ) : book.rating ? (
              <div className="flex items-center gap-0.5 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < book.rating! ? 'fill-amber-500 text-amber-500' : 'text-[#DCD5C6] dark:text-[#4A4743] fill-[#DCD5C6] dark:fill-[#4A4743]'
                    }`}
                  />
                ))}
              </div>
            ) : (
              <span className="text-[11px] text-[#4A4743] dark:text-[#E0DCD3] font-semibold hover:underline">
                Dettagli & Modifica →
              </span>
            )}
          </div>

          {/* Quick status updater dropdown */}
          <select
            value={book.status}
            onChange={(e) => {
              e.stopPropagation();
              onStatusChange(book.id, e.target.value as BookStatus);
            }}
            onClick={(e) => e.stopPropagation()}
            className="text-[11px] font-medium text-[#4A4743] dark:text-[#E0DCD3] bg-[#F4F1EA] dark:bg-[#2A2826] border border-[#DCD5C6] dark:border-[#4A4743]/60 rounded-lg px-2 py-1 focus:outline-none focus:border-[#B0BEA9] dark:focus:border-[#5C6B55]"
          >
            <option value="Da leggere">Da leggere</option>
            <option value="In lettura">In lettura</option>
            <option value="Letto">Letto</option>
          </select>
        </div>
      </div>
    </div>
  );
};
