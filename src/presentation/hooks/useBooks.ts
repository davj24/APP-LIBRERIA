import { useState, useEffect, useCallback } from 'react';
import type { Book, BookStatus } from '../../domain/models/Book';
import { supabase } from '../../infrastructure/supabase/client';

const STORAGE_KEY = 'bibliodesk_books_v1';
const UPDATE_EVENT = 'bibliodesk_books_updated';

export type FilterType = 'Tutti' | BookStatus;

const MOCK_BOOK_IDS = ['1', '2', '3'];

function getLatestLocalBooks(): Book[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.filter((b: any) => b && typeof b === 'object' && b.id && !MOCK_BOOK_IDS.includes(String(b.id)));
      }
    }
  } catch (e) {
    console.error('Failed to parse saved books from localStorage', e);
  }
  return [];
}

export function useBooks() {
  const [books, setBooks] = useState<Book[]>(() => {
    return getLatestLocalBooks();
  });

  const [selectedFilter, setSelectedFilter] = useState<FilterType>('Tutti');
  const [isLoadingSync, setIsLoadingSync] = useState(false);

  // Sincronizzazione basata su Session User ID (Cloud First + Offline Fallback)
  const syncFromSupabase = useCallback(async () => {
    try {
      setIsLoadingSync(true);
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      if (!userId) {
        setIsLoadingSync(false);
        return;
      }

      let fetchedRemoteBooks: Book[] = [];

      // Query Schema Relazionale con JOIN tra user_books e books isolata per user_id
      try {
        const { data: userBooksData, error: ubErr } = await supabase
          .from('user_books')
          .select(`
            id,
            book_id,
            status,
            pages_read,
            start_date,
            end_date,
            rating,
            books (
              id,
              title,
              author,
              cover_url,
              isbn,
              total_pages,
              genre
            )
          `)
          .eq('user_id', userId);

        if (!ubErr && userBooksData && Array.isArray(userBooksData)) {
          userBooksData.forEach((ub: any) => {
            const b = ub.books;
            if (b) {
              fetchedRemoteBooks.push({
                id: b.id?.toString() || ub.book_id?.toString(),
                title: b.title || 'Senza titolo',
                author: b.author || 'Autore sconosciuto',
                coverUrl: b.cover_url || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400',
                status: (ub.status as BookStatus) || 'Da leggere',
                startDate: ub.start_date || '',
                endDate: ub.end_date || '',
                totalPages: b.total_pages || undefined,
                pagesRead: ub.pages_read || 0,
                genre: b.genre || 'Narrativa',
                rating: ub.rating || undefined,
                isbn: b.isbn || undefined
              });
            }
          });
        }
      } catch (relErr) {
        console.warn('Query relazionale user_books:', relErr);
      }

      // Merge intelligente con cache locale
      const localBooks = getLatestLocalBooks();
      const mergedMap = new Map<string, Book>();

      // 1. Inserisci i libri remoti dal Cloud
      fetchedRemoteBooks.forEach(b => mergedMap.set(b.id, b));

      // 2. Se ci sono libri salvati solo in locale, sincronizzali sul cloud
      const unuploadedLocalBooks = localBooks.filter(localB => {
        if (mergedMap.has(localB.id)) return false;
        const existsInRemote = fetchedRemoteBooks.some(
          remoteB =>
            remoteB.title.trim().toLowerCase() === localB.title.trim().toLowerCase() &&
            remoteB.author.trim().toLowerCase() === localB.author.trim().toLowerCase()
        );
        return !existsInRemote;
      });

      if (unuploadedLocalBooks.length > 0 && userId) {
        for (const localB of unuploadedLocalBooks) {
          try {
            const { data: bookInsertData } = await supabase
              .from('books')
              .insert([{
                title: localB.title,
                author: localB.author,
                cover_url: localB.coverUrl,
                isbn: localB.isbn || null,
                total_pages: localB.totalPages || null,
                genre: localB.genre || 'Narrativa'
              }])
              .select();

            if (bookInsertData && bookInsertData[0]?.id) {
              const createdId = bookInsertData[0].id.toString();
              await supabase.from('user_books').insert([{
                user_id: userId,
                book_id: bookInsertData[0].id,
                status: localB.status || 'Da leggere',
                pages_read: localB.pagesRead || 0,
                start_date: localB.startDate || null,
                end_date: localB.endDate || null
              }]);
              mergedMap.set(createdId, { ...localB, id: createdId });
            } else {
              mergedMap.set(localB.id, localB);
            }
          } catch (upErr) {
            console.warn('Auto-upload libro locale a Supabase fallito:', upErr);
            mergedMap.set(localB.id, localB);
          }
        }
      }

      const mergedBooks = Array.from(mergedMap.values());
      setBooks(mergedBooks);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedBooks));
      window.dispatchEvent(new Event(UPDATE_EVENT));
    } catch (err) {
      console.warn('Sincronizzazione Supabase offline-first fallback a cache locale:', err);
    } finally {
      setIsLoadingSync(false);
    }
  }, []);

  // Sincronizzazione automatica all'avvio e ai cambi di stato
  useEffect(() => {
    let isMounted = true;

    if (isMounted) {
      syncFromSupabase();
    }

    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
        syncFromSupabase();
      }
    });

    const handleFocusOrVisibility = () => {
      if (document.visibilityState === 'visible') {
        syncFromSupabase();
      }
    };

    window.addEventListener('focus', handleFocusOrVisibility);
    document.addEventListener('visibilitychange', handleFocusOrVisibility);

    const handleBooksUpdated = () => {
      setBooks(getLatestLocalBooks());
    };

    window.addEventListener(UPDATE_EVENT, handleBooksUpdated);
    return () => {
      isMounted = false;
      authListener?.subscription.unsubscribe();
      window.removeEventListener('focus', handleFocusOrVisibility);
      document.removeEventListener('visibilitychange', handleFocusOrVisibility);
      window.removeEventListener(UPDATE_EVENT, handleBooksUpdated);
    };
  }, [syncFromSupabase]);

  // Salva ogni modifica nel localStorage e notifica gli altri hook
  const saveBooksLocally = (newBooks: Book[]) => {
    setBooks(newBooks);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newBooks));
    window.dispatchEvent(new Event(UPDATE_EVENT));
  };

  /**
   * addBookToLibrary - Salva il libro sia in locale che nel Cloud Supabase
   */
  const addBookToLibrary = async (bookData: Omit<Book, 'id'>): Promise<{ success: boolean; book?: Book; error?: string }> => {
    const tempId = `book-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newBook: Book = {
      ...bookData,
      id: tempId,
      pagesRead: bookData.pagesRead || 0,
      coverUrl: bookData.coverUrl ? bookData.coverUrl.trim() : 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400'
    };

    const currentLocalBooks = getLatestLocalBooks();

    const isDuplicate = currentLocalBooks.some(
      b => b.title.trim().toLowerCase() === newBook.title.trim().toLowerCase() &&
           b.author.trim().toLowerCase() === newBook.author.trim().toLowerCase() &&
           b.id !== tempId
    );

    if (isDuplicate) {
      const existing = currentLocalBooks.find(b => b.title.trim().toLowerCase() === newBook.title.trim().toLowerCase());
      return { success: true, book: existing };
    }

    const updatedBooks = [newBook, ...currentLocalBooks];
    saveBooksLocally(updatedBooks);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      if (userId) {
        // 1. Inserisci o collega il libro nella tabella `books`
        const { data: bookInsertData } = await supabase
          .from('books')
          .insert([{
            title: newBook.title,
            author: newBook.author,
            cover_url: newBook.coverUrl,
            isbn: newBook.isbn || null,
            total_pages: newBook.totalPages || null,
            genre: newBook.genre || 'Narrativa'
          }])
          .select();

        if (bookInsertData && bookInsertData[0]?.id) {
          const createdBookId = bookInsertData[0].id.toString();

          // 2. Inserisci nella libreria dell'utente `user_books`
          await supabase.from('user_books').insert([{
            user_id: userId,
            book_id: bookInsertData[0].id,
            status: newBook.status || 'Da leggere',
            pages_read: newBook.pagesRead || 0,
            start_date: newBook.startDate || null,
            end_date: newBook.endDate || null
          }]);

          const latest = getLatestLocalBooks();
          const finalBooks = latest.map(b => b.id === tempId ? { ...b, id: createdBookId } : b);
          saveBooksLocally(finalBooks);
          return { success: true, book: { ...newBook, id: createdBookId } };
        }
      }

      return { success: true, book: newBook };
    } catch (err: any) {
      console.warn('Sincronizzazione cloud non riuscita. Libro conservato in locale:', err);
      return { success: true, book: newBook };
    }
  };

  const addBook = (bookData: Omit<Book, 'id'>) => {
    addBookToLibrary(bookData);
  };

  const deleteBook = async (id: string) => {
    const current = getLatestLocalBooks();
    const updated = current.filter(b => b.id !== id);
    saveBooksLocally(updated);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      if (userId && !id.startsWith('book-') && !id.startsWith('temp-')) {
        await supabase
          .from('user_books')
          .delete()
          .eq('book_id', id)
          .eq('user_id', userId);
      }
    } catch (e) {
      console.warn('Errore eliminazione Supabase:', e);
    }
  };

  const updateBookStatus = async (id: string, status: BookStatus) => {
    const today = new Date().toISOString().split('T')[0];
    let updatedBookRef: Book | null = null;
    const current = getLatestLocalBooks();

    const updated = current.map(book => {
      if (book.id === id) {
        let startDate = book.startDate;
        let endDate = book.endDate;
        let pagesRead = book.pagesRead;

        if (status === 'Da leggere') {
          startDate = '';
          endDate = '';
          pagesRead = 0;
        } else if (status === 'In lettura' && !startDate) {
          startDate = today;
        } else if (status === 'Letto') {
          if (!startDate) startDate = today;
          endDate = today;
          if (book.totalPages) pagesRead = book.totalPages;
        }

        updatedBookRef = { ...book, status, startDate, endDate, pagesRead };
        return updatedBookRef;
      }
      return book;
    });

    saveBooksLocally(updated);

    if (updatedBookRef && !id.startsWith('temp-') && !id.startsWith('book-')) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;

        if (userId) {
          await supabase
            .from('user_books')
            .update({
              status: (updatedBookRef as Book).status,
              start_date: (updatedBookRef as Book).startDate || null,
              end_date: (updatedBookRef as Book).endDate || null,
              pages_read: (updatedBookRef as Book).pagesRead || 0,
              updated_at: new Date().toISOString()
            })
            .eq('book_id', id)
            .eq('user_id', userId);
        }
      } catch (e) {
        console.warn('Errore aggiornamento stato Supabase:', e);
      }
    }
  };

  const updateBookPages = async (id: string, pagesRead: number) => {
    const current = getLatestLocalBooks();
    let updatedBookRef: Book | null = null;

    const updated = current.map(book => {
      if (book.id === id) {
        let status = book.status;
        if (pagesRead > 0 && status === 'Da leggere') {
          status = 'In lettura';
        }
        if (book.totalPages && pagesRead >= book.totalPages) {
          status = 'Letto';
        }
        updatedBookRef = { ...book, pagesRead, status };
        return updatedBookRef;
      }
      return book;
    });

    saveBooksLocally(updated);

    if (updatedBookRef && !id.startsWith('temp-') && !id.startsWith('book-')) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;

        if (userId) {
          await supabase
            .from('user_books')
            .update({
              pages_read: pagesRead,
              status: (updatedBookRef as Book).status,
              updated_at: new Date().toISOString()
            })
            .eq('book_id', id)
            .eq('user_id', userId);
        }
      } catch (e) {
        console.warn('Errore sincronizzazione pagine lette Supabase:', e);
      }
    }
  };

  const updateBook = async (updatedBook: Book) => {
    const current = getLatestLocalBooks();
    const updated = current.map(book => (book.id === updatedBook.id ? updatedBook : book));
    saveBooksLocally(updated);

    if (!updatedBook.id.startsWith('temp-') && !updatedBook.id.startsWith('book-')) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;

        await supabase
          .from('books')
          .update({
            title: updatedBook.title,
            author: updatedBook.author,
            cover_url: updatedBook.coverUrl,
            isbn: updatedBook.isbn || null,
            total_pages: updatedBook.totalPages || null,
            genre: updatedBook.genre || 'Narrativa'
          })
          .eq('id', updatedBook.id);

        if (userId) {
          await supabase
            .from('user_books')
            .update({
              status: updatedBook.status,
              pages_read: updatedBook.pagesRead || 0,
              start_date: updatedBook.startDate || null,
              end_date: updatedBook.endDate || null,
              updated_at: new Date().toISOString()
            })
            .eq('book_id', updatedBook.id)
            .eq('user_id', userId);
        }
      } catch (e) {
        console.warn('Errore aggiornamento libro Supabase:', e);
      }
    }
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
    isLoadingSync,
    addBookToLibrary,
    addBook,
    deleteBook,
    updateBookStatus,
    updateBookPages,
    updateBook,
    syncFromSupabase
  };
}
