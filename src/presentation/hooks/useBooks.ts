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

        if (data && Array.isArray(data) && isMounted) {
          const remoteBooks = data.map(mapDbRecordToBook);

          // Merge a prova di bomba: unisci i libri remoti da Supabase con la cache locale
          // Mantiene SEMPRE intatti i libri locali aggiunti dall'utente
          const localBooks = getLatestLocalBooks();
          const mergedMap = new Map<string, Book>();

          // 1. Inserisci prima i libri remoti da Supabase
          remoteBooks.forEach(b => mergedMap.set(b.id, b));

          // 2. Preserva tutti i libri locali non ancora presenti in Supabase (per ID o per titolo + autore)
          localBooks.forEach(localB => {
            if (mergedMap.has(localB.id)) return;

            const existsByTitleAuthor = remoteBooks.some(
              remoteB =>
                remoteB.title.trim().toLowerCase() === localB.title.trim().toLowerCase() &&
                remoteB.author.trim().toLowerCase() === localB.author.trim().toLowerCase()
            );

            if (!existsByTitleAuthor) {
              mergedMap.set(localB.id, localB);
            }
          });

          const mergedBooks = Array.from(mergedMap.values());
          setBooks(mergedBooks);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedBooks));
        }
      } catch (err) {
        console.warn('Sincronizzazione Supabase offline-first fallback a cache locale:', err);
      } finally {
        if (isMounted) setIsLoadingSync(false);
      }
    }

    // 1. Sincronizzazione iniziale all'avvio
    syncFromSupabase();

    // 2. Sincronizzazione automatica al ripristino o cambio sessione Auth
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
        syncFromSupabase();
      }
    });

    // 3. Sincronizzazione al rientro nell'App sulla Schermata Home (PWA focus / visibility)
    const handleFocusOrVisibility = () => {
      if (document.visibilityState === 'visible') {
        syncFromSupabase();
      }
    };

    window.addEventListener('focus', handleFocusOrVisibility);
    document.addEventListener('visibilitychange', handleFocusOrVisibility);

    // Event listener per sincronizzazione istantanea tra hook diversi nell'app
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
  }, []);

  // Salva ogni modifica nel localStorage e notifica gli altri hook
  const saveBooksLocally = (newBooks: Book[]) => {
    setBooks(newBooks);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newBooks));
    window.dispatchEvent(new Event(UPDATE_EVENT));
  };

  /**
   * addBookToLibrary - Approccio Offline-First Garantito (Fase 3)
   * Il libro viene SEMPRE salvato con successo in locale ed è totalmente protetto dai refresh.
   */
  const addBookToLibrary = async (bookData: Omit<Book, 'id'>): Promise<{ success: boolean; book?: Book; error?: string }> => {
    const tempId = `book-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newBook: Book = {
      ...bookData,
      id: tempId,
      coverUrl: bookData.coverUrl ? bookData.coverUrl.trim() : 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400'
    };

    // 1. Leggi SEMPRE i libri più recenti da localStorage per evitare sovrascritture da closure stale
    const currentLocalBooks = getLatestLocalBooks();

    // Evita duplicati identici se già premuto più volte
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
      // 2. Sincronizzazione in background su Supabase
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        let insertPayload: any = {
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
        };

        let { data, error } = await supabase
          .from('libreria_personale')
          .insert([insertPayload])
          .select();

        if (error && error.message?.includes('subgenre')) {
          delete insertPayload.subgenre;
          const retry = await supabase
            .from('libreria_personale')
            .insert([insertPayload])
            .select();
          data = retry.data;
          error = retry.error;
        }

        if (error) {
          console.warn('Avviso sincronizzazione Supabase (libro mantenuto in locale):', error.message);
        } else if (data && data[0] && data[0].id) {
          const realId = data[0].id.toString();
          const latest = getLatestLocalBooks();
          const finalBooks = latest.map(b => b.id === tempId ? { ...b, id: realId } : b);
          saveBooksLocally(finalBooks);
          return { success: true, book: { ...newBook, id: realId } };
        }
      }

      return { success: true, book: newBook };
    } catch (err: any) {
      console.warn('Sincronizzazione cloud non riuscita. Libro conservato in locale:', err);
      return { success: true, book: newBook };
    }
  };

  // Wrapper compatibile per addBook semplice
  const addBook = (bookData: Omit<Book, 'id'>) => {
    addBookToLibrary(bookData);
  };

  const deleteBook = async (id: string) => {
    const current = getLatestLocalBooks();
    const updated = current.filter(b => b.id !== id);
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
    const current = getLatestLocalBooks();
    const updated = current.map(book => (book.id === updatedBook.id ? updatedBook : book));
    saveBooksLocally(updated);

    if (!updatedBook.id.startsWith('temp-') && !updatedBook.id.startsWith('book-')) {
      try {
        let payload: any = {
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
        };

        let { error } = await supabase
          .from('libreria_personale')
          .update(payload)
          .eq('id', updatedBook.id);

        if (error && error.message?.includes('subgenre')) {
          delete payload.subgenre;
          await supabase
            .from('libreria_personale')
            .update(payload)
            .eq('id', updatedBook.id);
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
    updateBook
  };
}
