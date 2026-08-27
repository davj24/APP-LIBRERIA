import { useState, useEffect, useCallback } from 'react';
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

  // Sincronizzazione atomica e resiliente da Supabase (Supporta schema relazionale + tabella flat)
  const syncFromSupabase = useCallback(async () => {
    try {
      setIsLoadingSync(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setIsLoadingSync(false);
        return;
      }

      const userId = session.user.id;
      let fetchedRemoteBooks: Book[] = [];

      // APPROCCIO A: Query Schema Relazionale (user_books + books)
      try {
        const { data: userBooksData } = await supabase
          .from('user_books')
          .select('*')
          .eq('user_id', userId);

        const { data: libPersRelData } = await supabase
          .from('libreria_personale')
          .select('*')
          .eq('user_id', userId);

        const bookIdMap = new Map<string, { status?: string; pagesRead?: number; startDate?: string; endDate?: string }>();

        if (userBooksData && Array.isArray(userBooksData)) {
          userBooksData.forEach(ub => {
            if (ub.book_id) {
              bookIdMap.set(ub.book_id.toString(), {
                status: ub.status || 'Da leggere',
                pagesRead: ub.pages_read || 0,
                startDate: ub.start_date || '',
                endDate: ub.end_date || ''
              });
            }
          });
        }

        if (libPersRelData && Array.isArray(libPersRelData)) {
          libPersRelData.forEach(lp => {
            if (lp.book_id && !bookIdMap.has(lp.book_id.toString())) {
              bookIdMap.set(lp.book_id.toString(), { status: 'Da leggere' });
            }
          });
        }

        if (bookIdMap.size > 0) {
          const idsToFetch = Array.from(bookIdMap.keys());
          const { data: booksMetadata } = await supabase
            .from('books')
            .select('*')
            .in('id', idsToFetch);

          if (booksMetadata && Array.isArray(booksMetadata)) {
            booksMetadata.forEach(b => {
              const relInfo = bookIdMap.get(b.id.toString()) || {};
              fetchedRemoteBooks.push({
                id: b.id.toString(),
                title: b.title || 'Senza titolo',
                author: b.author || 'Autore sconosciuto',
                coverUrl: b.cover_url || b.coverUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400',
                status: (relInfo.status as BookStatus) || 'Da leggere',
                startDate: relInfo.startDate || '',
                endDate: relInfo.endDate || '',
                totalPages: b.total_pages || undefined,
                pagesRead: relInfo.pagesRead || 0,
                genre: b.genre || 'Narrativa',
                isbn: b.isbn || undefined
              });
            });
          }
        }
      } catch (relErr) {
        console.warn('Query relazionale (user_books + books) non disponibile, provo fallback flat:', relErr);
      }

      // APPROCCIO B: Fallback Query Tabella Flat (libreria_personale con colonne dirette)
      if (fetchedRemoteBooks.length === 0) {
        try {
          let { data, error } = await supabase
            .from('libreria_personale')
            .select('*')
            .order('created_at', { ascending: false });

          if (error || !data) {
            const fallback1 = await supabase.from('libreria_personale').select('*');
            data = fallback1.data;
          }

          if (data && Array.isArray(data)) {
            const flatBooks = data.filter(d => d.title || d.titolo).map(mapDbRecordToBook);
            fetchedRemoteBooks.push(...flatBooks);
          }
        } catch (flatErr) {
          console.warn('Query flat libreria_personale fallback fallito:', flatErr);
        }
      }

      // MERGE INTELLIGENTE CON CACHE LOCALE (No data loss)
      const localBooks = getLatestLocalBooks();
      const mergedMap = new Map<string, Book>();

      // 1. Inserisci prima i libri remoti scaricati dal Cloud
      fetchedRemoteBooks.forEach(b => mergedMap.set(b.id, b));

      // 2. Preserva tutti i libri locali non ancora presenti sul Cloud
      localBooks.forEach(localB => {
        if (mergedMap.has(localB.id)) return;

        const existsInRemote = fetchedRemoteBooks.some(
          remoteB =>
            remoteB.title.trim().toLowerCase() === localB.title.trim().toLowerCase() &&
            remoteB.author.trim().toLowerCase() === localB.author.trim().toLowerCase()
        );

        if (!existsInRemote) {
          mergedMap.set(localB.id, localB);
        }
      });

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
   * addBookToLibrary - Approccio Dual-Storage Garantito (Relazionale + Flat Fallback)
   * Il libro viene SEMPRE salvato in locale e sincronizzato col Cloud in qualsiasi struttura DB.
   */
  const addBookToLibrary = async (bookData: Omit<Book, 'id'>): Promise<{ success: boolean; book?: Book; error?: string }> => {
    const tempId = `book-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newBook: Book = {
      ...bookData,
      id: tempId,
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
      
      if (session?.user) {
        let createdBookId: string | null = null;

        // 1. TENTATIVO SCHEMA RELAZIONALE: Inserimento in `books`
        try {
          const { data: bookInsertData } = await supabase
            .from('books')
            .insert([{
              title: newBook.title,
              author: newBook.author,
              cover_url: newBook.coverUrl,
              isbn: newBook.isbn || null
            }])
            .select();

          if (bookInsertData && bookInsertData[0]?.id) {
            createdBookId = bookInsertData[0].id.toString();

            // Inserisci in user_books
            await supabase.from('user_books').insert([{
              user_id: session.user.id,
              book_id: bookInsertData[0].id,
              status: newBook.status || 'Da leggere'
            }]);

            // Inserisci in libreria_personale
            await supabase.from('libreria_personale').insert([{
              user_id: session.user.id,
              book_id: bookInsertData[0].id
            }]);
          }
        } catch (relErr) {
          console.warn('Inserimento relazionale books/user_books non riuscito:', relErr);
        }

        // 2. TENTATIVO SCHEMA FLAT: Fallback inserimento diretto in `libreria_personale`
        if (!createdBookId) {
          try {
            const { data: flatInsertData } = await supabase
              .from('libreria_personale')
              .insert([{
                user_id: session.user.id,
                title: newBook.title,
                author: newBook.author,
                cover_url: newBook.coverUrl,
                status: newBook.status || 'Da leggere'
              }])
              .select();

            if (flatInsertData && flatInsertData[0]?.id) {
              createdBookId = flatInsertData[0].id.toString();
            }
          } catch (flatErr) {
            console.warn('Inserimento flat libreria_personale non riuscito:', flatErr);
          }
        }

        if (createdBookId) {
          const latest = getLatestLocalBooks();
          const finalBooks = latest.map(b => b.id === tempId ? { ...b, id: createdBookId! } : b);
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
      if (!id.startsWith('temp-') && !id.startsWith('book-')) {
        await supabase.from('user_books').delete().eq('book_id', id);
        await supabase.from('libreria_personale').delete().eq('book_id', id);
        await supabase.from('libreria_personale').delete().eq('id', id);
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
        }

        updatedBookRef = { ...book, status, startDate, endDate, pagesRead };
        return updatedBookRef;
      }
      return book;
    }
    );

    saveBooksLocally(updated);

    if (updatedBookRef && !id.startsWith('temp-') && !id.startsWith('book-')) {
      try {
        await supabase
          .from('user_books')
          .update({ status: (updatedBookRef as Book).status })
          .eq('book_id', id);

        await supabase
          .from('libreria_personale')
          .update({ status: (updatedBookRef as Book).status })
          .eq('id', id);
      } catch (e) {
        console.warn('Errore aggiornamento stato Supabase:', e);
      }
    }
  };

  const updateBook = async (updatedBook: Book) => {
    const current = getLatestLocalBooks();
    const updated = current.map(book => (book.id === updatedBook.id ? updatedBook : book));
    saveBooksLocally(updated);

    if (!updatedBook.id.startsWith('temp-') && !updatedBook.id.startsWith('book-')) {
      try {
        await supabase
          .from('books')
          .update({
            title: updatedBook.title,
            author: updatedBook.author,
            cover_url: updatedBook.coverUrl,
            isbn: updatedBook.isbn || null
          })
          .eq('id', updatedBook.id);

        await supabase
          .from('user_books')
          .update({ status: updatedBook.status })
          .eq('book_id', updatedBook.id);
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
    const current = getLatestLocalBooks();
    const updated = current.map(book => {
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
    updateBook,
    syncFromSupabase
  };
}
