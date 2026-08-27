import { useState, useEffect } from 'react';
import type { Book, BookStatus } from '../../domain/models/Book';
import { supabase } from '../../infrastructure/supabase/client';

const STORAGE_KEY = 'bibliodesk_books_v1';
const UPDATE_EVENT = 'bibliodesk_books_updated';

export type FilterType = 'Tutti' | BookStatus;

function mapDbRecordToBook(rec: any): Book {
  return {
    id: rec.id?.toString() || Date.now().toString(),
    title: rec.title || 'Senza titolo',
    author: rec.author || 'Autore sconosciuto',
    coverUrl: rec.cover_url || rec.coverUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400',
    status: rec.status || 'Da leggere',
    startDate: rec.start_date || rec.startDate || '',
    endDate: rec.end_date || rec.endDate || '',
    totalPages: rec.total_pages || rec.totalPages || undefined,
    pagesRead: rec.pages_read || rec.pagesRead || undefined,
    genre: rec.genre || 'Narrativa',
    subgenre: rec.subgenre || undefined,
    rating: rec.rating || undefined,
    isbn: rec.isbn || undefined
  };
}

export function useBooks() {
  const [books, setBooks] = useState<Book[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse saved books', e);
      }
    }
    return [];
  });

  const [selectedFilter, setSelectedFilter] = useState<FilterType>('Tutti');
  const [isLoadingSync, setIsLoadingSync] = useState(false);

  // Sincronizzazione automatica da Supabase all'avvio / login (Fase 1: Offline-first)
  useEffect(() => {
    let isMounted = true;

    async function syncFromSupabase() {
      try {
        setIsLoadingSync(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          setIsLoadingSync(false);
          return;
        }

        const { data, error } = await supabase
          .from('libreria_personale')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.warn('Query Supabase libreria_personale fallita (offline o errore DB):', error.message);
          return;
        }

        if (data && Array.isArray(data) && data.length > 0 && isMounted) {
          const remoteBooks = data.map(mapDbRecordToBook);
          setBooks(remoteBooks);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteBooks));
        }
      } catch (err) {
        console.warn('Sincronizzazione Supabase offline-first fallback a cache locale:', err);
      } finally {
        if (isMounted) setIsLoadingSync(false);
      }
    }

    syncFromSupabase();

    // Event listener per sincronizzazione istantanea tra hook diversi nell'app
    const handleBooksUpdated = () => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          setBooks(JSON.parse(saved));
        } catch (e) {}
      }
    };

    window.addEventListener(UPDATE_EVENT, handleBooksUpdated);
    return () => {
      isMounted = false;
      window.removeEventListener(UPDATE_EVENT, handleBooksUpdated);
    };
  }, []);

  // Salva ogni modifica nel localStorage e notifica gli altri hook
  const saveBooksLocally = (newBooks: Book[]) => {
    setBooks(newBooks);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newBooks));
    window.dispatchEvent(new Event(UPDATE_EVENT));
  };

  /**
   * addBookToLibrary - Approccio Offline-First Garantito (Fase 3)
   * Il libro viene SEMPRE salvato con successo in locale.
   * La sincronizzazione Supabase avviene in background senza mai cancellare il libro se la rete fallisce.
   */
  const addBookToLibrary = async (bookData: Omit<Book, 'id'>): Promise<{ success: boolean; book?: Book; error?: string }> => {
    const tempId = `book-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newBook: Book = {
      ...bookData,
      id: tempId,
      coverUrl: bookData.coverUrl ? bookData.coverUrl.trim() : 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400'
    };

    // 1. Salvataggio locale immediato e garantito (Offline-first)
    const updatedBooks = [newBook, ...books];
    saveBooksLocally(updatedBooks);

    try {
      // 2. Sincronizzazione in background su Supabase
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data, error } = await supabase
          .from('libreria_personale')
          .insert([{
            user_id: session.user.id,
            title: newBook.title,
            author: newBook.author,
            cover_url: newBook.coverUrl,
            status: newBook.status || 'Da leggere',
            start_date: newBook.startDate || null,
            end_date: newBook.endDate || null,
            total_pages: newBook.totalPages || null,
            pages_read: newBook.pagesRead || 0,
            genre: newBook.genre || 'Narrativa',
            subgenre: newBook.subgenre || null,
            rating: newBook.rating || null,
            isbn: newBook.isbn || null
          }])
          .select();

        if (error) {
          console.warn('Avviso sincronizzazione Supabase (libro mantenuto in locale):', error.message);
        } else if (data && data[0] && data[0].id) {
          const realId = data[0].id.toString();
          const finalBooks = updatedBooks.map(b => b.id === tempId ? { ...b, id: realId } : b);
          saveBooksLocally(finalBooks);
          return { success: true, book: { ...newBook, id: realId } };
        }
      }

      return { success: true, book: newBook };
    } catch (err: any) {
      console.warn('Sincronizzazione cloud non riuscita. Libro conservato in locale:', err);
      // Il libro resta salvato nella libreria locale dell'utente!
      return { success: true, book: newBook };
    }
  };

  // Wrapper compatibile per addBook semplice
  const addBook = (bookData: Omit<Book, 'id'>) => {
    addBookToLibrary(bookData);
  };

  const deleteBook = async (id: string) => {
    const updated = books.filter(b => b.id !== id);
    saveBooksLocally(updated);

    try {
      if (!id.startsWith('temp-') && !id.startsWith('book-')) {
        await supabase.from('libreria_personale').delete().eq('id', id);
      }
    } catch (e) {
      console.warn('Errore eliminazione Supabase:', e);
    }
  };

  const updateBookStatus = async (id: string, status: BookStatus) => {
    const today = new Date().toISOString().split('T')[0];
    let updatedBookRef: Book | null = null;

    const updated = books.map(book => {
      if (book.id === id) {
        let startDate = book.startDate;
        let endDate = book.endDate;

        if (status === 'In lettura' && !startDate) {
          startDate = today;
        } else if (status === 'Letto') {
          if (!startDate) startDate = today;
          endDate = today;
        }

        updatedBookRef = { ...book, status, startDate, endDate };
        return updatedBookRef;
      }
      return book;
    });

    saveBooksLocally(updated);

    if (updatedBookRef && !id.startsWith('temp-') && !id.startsWith('book-')) {
      try {
        await supabase
          .from('libreria_personale')
          .update({
            status: (updatedBookRef as Book).status,
            start_date: (updatedBookRef as Book).startDate || null,
            end_date: (updatedBookRef as Book).endDate || null
          })
          .eq('id', id);
      } catch (e) {
        console.warn('Errore aggiornamento stato Supabase:', e);
      }
    }
  };

  const updateBook = async (updatedBook: Book) => {
    const updated = books.map(book => (book.id === updatedBook.id ? updatedBook : book));
    saveBooksLocally(updated);

    if (!updatedBook.id.startsWith('temp-') && !updatedBook.id.startsWith('book-')) {
      try {
        await supabase
          .from('libreria_personale')
          .update({
            title: updatedBook.title,
            author: updatedBook.author,
            cover_url: updatedBook.coverUrl,
            status: updatedBook.status,
            start_date: updatedBook.startDate || null,
            end_date: updatedBook.endDate || null,
            total_pages: updatedBook.totalPages || null,
            pages_read: updatedBook.pagesRead || 0,
            genre: updatedBook.genre || null,
            subgenre: updatedBook.subgenre || null,
            rating: updatedBook.rating || null,
            isbn: updatedBook.isbn || null
          })
          .eq('id', updatedBook.id);
      } catch (e) {
        console.warn('Errore aggiornamento libro Supabase:', e);
      }
    }
  };

  const filteredBooks = books.filter(book => {
    if (selectedFilter === 'Tutti') return true;
    return book.status === selectedFilter;
  });

  const updateBookPages = (id: string, pagesRead: number) => {
    const updated = books.map(book => {
      if (book.id === id) {
        return { ...book, pagesRead };
      }
      return book;
    });
    saveBooksLocally(updated);
  };

  return {
    books,
    filteredBooks,
    selectedFilter,
    setSelectedFilter,
    isLoadingSync,
    addBookToLibrary,
    addBook,
    deleteBook,
    updateBookStatus,
    updateBookPages,
    updateBook
  };
}
