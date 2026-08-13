import { useState, useEffect } from 'react';
import type { Book, BookStatus } from '../../domain/models/Book';
import { INITIAL_MOCK_BOOKS } from '../../infrastructure/mock/mockBooks';

const STORAGE_KEY = 'bibliodesk_books_v1';

export type FilterType = 'Tutti' | BookStatus;

export function useBooks() {
  const [books, setBooks] = useState<Book[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved books', e);
      }
    }
    return INITIAL_MOCK_BOOKS;
  });

  const [selectedFilter, setSelectedFilter] = useState<FilterType>('Tutti');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  }, [books]);

  const addBook = (bookData: Omit<Book, 'id'>) => {
    const newBook: Book = {
      ...bookData,
      id: Date.now().toString(),
      coverUrl: bookData.coverUrl.trim() || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400'
    };
    setBooks(prev => [newBook, ...prev]);
  };

  const deleteBook = (id: string) => {
    setBooks(prev => prev.filter(b => b.id !== id));
  };

  const updateBookStatus = (id: string, status: BookStatus) => {
    setBooks(prev => prev.map(book => {
      if (book.id === id) {
        const today = new Date().toISOString().split('T')[0];
        let startDate = book.startDate;
        let endDate = book.endDate;

        if (status === 'In lettura' && !startDate) {
          startDate = today;
        } else if (status === 'Letto') {
          if (!startDate) startDate = today;
          endDate = today;
        }

        return { ...book, status, startDate, endDate };
      }
      return book;
    }));
  };

  const updateBook = (updatedBook: Book) => {
    setBooks(prev => prev.map(book => (book.id === updatedBook.id ? updatedBook : book)));
  };

  const filteredBooks = books.filter(book => {
    if (selectedFilter === 'Tutti') return true;
    return book.status === selectedFilter;
  });

  return {
    books,
    filteredBooks,
    selectedFilter,
    setSelectedFilter,
    addBook,
    deleteBook,
    updateBookStatus,
    updateBook
  };
}
