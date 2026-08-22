import React, { useState } from 'react';
import type { Book } from '../../domain/models/Book';
import { useBooks } from '../hooks/useBooks';
import { useUserProfile } from '../hooks/useUserProfile';
import { CurrentlyReadingCard } from '../components/dashboard/CurrentlyReadingCard';
import { ReadingStreakBadge } from '../components/dashboard/ReadingStreakBadge';
import { BookGrid } from '../components/books/BookGrid';
import { AddBookChoiceModal } from '../components/books/AddBookChoiceModal';
import { AddBookModal } from '../components/books/AddBookModal';
import { CameraScannerModal } from '../components/books/CameraScannerModal';
import { BookDetailModal } from '../components/books/BookDetailModal';
import { Sparkles, BookOpen } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isChoiceModalOpen, setIsChoiceModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const { profile } = useUserProfile();

  const {
    books,
    filteredBooks,
    selectedFilter,
    setSelectedFilter,
    addBook,
    deleteBook,
    updateBookStatus,
    updateBook
  } = useBooks();

  const handleQuickPageUpdate = (id: string, newPagesRead: number) => {
    const targetBook = books.find(b => b.id === id);
    if (targetBook) {
      const updatedStatus = newPagesRead >= (targetBook.totalPages || 300) ? 'Letto' : 'In lettura';
      updateBookStatus(id, updatedStatus);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Welcome & Dashboard Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-[#4A4743] dark:text-[#E0DCD3] tracking-tight flex items-center gap-1.5">
            <span>Bentornato, {profile.name}</span>
            <Sparkles className="w-4 h-4 text-amber-600 fill-amber-600" />
          </h2>
          <p className="text-xs text-[#7A756D] dark:text-[#A09A90] font-medium">
            Dashboard della tua libreria personale
          </p>
        </div>

        {/* Animated Reading Streak Badge */}
        <ReadingStreakBadge daysStreak={14} />
      </div>

      {/* Hero Reading Focus Card */}
      <CurrentlyReadingCard
        books={books}
        onUpdateStatus={updateBookStatus}
        onUpdatePages={handleQuickPageUpdate}
      />

      {/* Library Grid */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-[#4A4743] dark:text-[#E0DCD3] text-base flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#31362F] dark:text-[#E0DCD3]" />
            Tutti i Libri ({books.length})
          </h3>
        </div>

        <BookGrid
          books={books}
          filteredBooks={filteredBooks}
          selectedFilter={selectedFilter}
          onSelectFilter={setSelectedFilter}
          onStatusChange={updateBookStatus}
          onDelete={deleteBook}
          onSelectBook={(book) => setSelectedBook(book)}
        />
      </div>

      {/* Book Detail & Edit Modal */}
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

      {/* Modals */}
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
    </div>
  );
};
