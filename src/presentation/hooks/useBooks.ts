import { useState, useEffect, useCallback } from 'react';
import type { Book, BookStatus } from '../../domain/models/Book';
import { supabase } from '../../infrastructure/supabase/client';

const STORAGE_KEY = 'bibliodesk_books_v1';
const UPDATE_EVENT = 'bibliodesk_books_updated';

export type FilterType = 'Tutti' | BookStatus;

const MOCK_BOOK_IDS = ['1', '2', '3'];

function mapDbRecordToBook(rec: any): Book {
  return {
    id: rec.id?.toString() || Date.now().toString(),
    title: rec.title || rec.titolo || 'Senza titolo',
    author: rec.author || rec.autore || 'Autore sconosciuto',
    coverUrl: rec.cover_url || rec.coverUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400',
    status: (rec.status as BookStatus) || 'Da leggere',
    startDate: rec.start_date || rec.startDate || '',
    endDate: rec.end_date || rec.endDate || '',
    totalPages: rec.total_pages || rec.totalPages || undefined,
    pagesRead: rec.pages_read || rec.pagesRead || 0,
    genre: rec.genre || 'Narrativa',
    subgenre: rec.subgenre || undefined,
    rating: rec.rating || undefined,
    isbn: rec.isbn || undefined
  };
}

function getUserEmail(): string | null {
  try {
    const savedProfile = localStorage.getItem('bibliodesk_user_profile');
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      if (parsed.email && typeof parsed.email === 'string' && parsed.email.trim()) {
        return parsed.email.trim().toLowerCase();
      }
    }
    const directEmail = localStorage.getItem('bibliodesk_user_email');
    if (directEmail && directEmail.trim()) {
      return directEmail.trim().toLowerCase();
    }
  } catch (e) {
    console.warn('Errore lettura email account:', e);
  }
  return null;
}

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

  // Sincronizzazione ibrida e retrocompatibile (User ID + Email Account + Fallback Schema Flat)
  const syncFromSupabase = useCallback(async () => {
    try {
      setIsLoadingSync(true);
      const { data: { session } } = await supabase.auth.getSession();
      const sessionEmail = session?.user?.email?.trim().toLowerCase();
      const localEmail = getUserEmail();
      const activeEmail = sessionEmail || localEmail;
      const userId = session?.user?.id;

      if (!userId && !activeEmail) {
        setIsLoadingSync(false);
        return;
      }

      if (sessionEmail && sessionEmail !== localEmail) {
        localStorage.setItem('bibliodesk_user_email', sessionEmail);
      }

      let fetchedRemoteBooks: Book[] = [];
      const bookIdMap = new Map<string, { status?: BookStatus; pagesRead?: number; startDate?: string; endDate?: string; rating?: number }>();

      // 1. TENTATIVO SCHEMA RELAZIONALE CON JOIN (user_books + books)
      try {
        let userBooksQuery = supabase
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
          `);

        if (userId && activeEmail) {
          userBooksQuery = userBooksQuery.or(`user_id.eq.${userId},user_email.eq.${activeEmail}`);
        } else if (userId) {
          userBooksQuery = userBooksQuery.eq('user_id', userId);
        } else if (activeEmail) {
          userBooksQuery = userBooksQuery.eq('user_email', activeEmail);
        }

        const { data: userBooksData, error: ubErr } = await userBooksQuery;

        if (!ubErr && userBooksData && Array.isArray(userBooksData)) {
          userBooksData.forEach((ub: any) => {
            const b = ub.books;
            const bId = ub.book_id?.toString();
            if (b) {
              fetchedRemoteBooks.push({
                id: b.id?.toString() || bId,
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
            } else if (bId) {
              bookIdMap.set(bId, {
                status: (ub.status as BookStatus) || 'Da leggere',
                pagesRead: ub.pages_read || 0,
                startDate: ub.start_date || '',
                endDate: ub.end_date || '',
                rating: ub.rating || undefined
              });
            }
          });
        }
      } catch (relErr) {
        console.warn('Query relazionale user_books join:', relErr);
      }

      // 2. RECUPERO LIBRI MANCANTI DA TABELLA `books` PER ID
      if (bookIdMap.size > 0) {
        try {
          const idsToFetch = Array.from(bookIdMap.keys());
          const { data: booksData } = await supabase
            .from('books')
            .select('*')
            .in('id', idsToFetch);

          if (booksData && Array.isArray(booksData)) {
            booksData.forEach((b: any) => {
              const rel = bookIdMap.get(b.id.toString()) || {};
              fetchedRemoteBooks.push({
                id: b.id.toString(),
                title: b.title || 'Senza titolo',
                author: b.author || 'Autore sconosciuto',
                coverUrl: b.cover_url || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400',
                status: rel.status || 'Da leggere',
                startDate: rel.startDate || '',
                endDate: rel.endDate || '',
                totalPages: b.total_pages || undefined,
                pagesRead: rel.pagesRead || 0,
                genre: b.genre || 'Narrativa',
                rating: rel.rating || undefined,
                isbn: b.isbn || undefined
              });
            });
          }
        } catch (booksErr) {
          console.warn('Recupero metadati books per ID:', booksErr);
        }
      }

      // 3. RECUPERO DA TABELLA `libreria_personale` (usata da MAIN sia relazionale che flat)
      try {
        let lpQuery = supabase.from('libreria_personale').select('*');
        if (userId && activeEmail) {
          lpQuery = lpQuery.or(`user_id.eq.${userId},user_email.eq.${activeEmail}`);
        } else if (userId) {
          lpQuery = lpQuery.eq('user_id', userId);
        } else if (activeEmail) {
          lpQuery = lpQuery.eq('user_email', activeEmail);
        }

        const { data: lpData, error: lpErr } = await lpQuery;
        if (!lpErr && lpData && Array.isArray(lpData)) {
          const missingBookIds: string[] = [];

          lpData.forEach((lp: any) => {
            // Se ha campi diretti titolo/autore (schema flat)
            if (lp.title || lp.titolo) {
              const parsed = mapDbRecordToBook(lp);
              if (!fetchedRemoteBooks.some(b => b.id === parsed.id || (b.title === parsed.title && b.author === parsed.author))) {
                fetchedRemoteBooks.push(parsed);
              }
            } else if (lp.book_id) {
              const bId = lp.book_id.toString();
              if (!fetchedRemoteBooks.some(b => b.id === bId)) {
                missingBookIds.push(bId);
              }
            }
          });

          if (missingBookIds.length > 0) {
            const { data: missingBooks } = await supabase
              .from('books')
              .select('*')
              .in('id', missingBookIds);

            if (missingBooks && Array.isArray(missingBooks)) {
              missingBooks.forEach((mb: any) => {
                const parsed = mapDbRecordToBook(mb);
                if (!fetchedRemoteBooks.some(b => b.id === parsed.id)) {
                  fetchedRemoteBooks.push(parsed);
                }
              });
            }
          }
        }
      } catch (lpErr) {
        console.warn('Recupero libreria_personale legacy fallback:', lpErr);
      }

      // 4. MERGE INTELLIGENTE CON CACHE LOCALE (Nessuna perdita di dati)
      const localBooks = getLatestLocalBooks();
      const mergedMap = new Map<string, Book>();

      // A. Inserisci i libri remoti dal Cloud
      fetchedRemoteBooks.forEach(b => mergedMap.set(b.id, b));

      // B. Preserva e sincronizza libri locali non ancora presenti sul cloud
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
                user_email: activeEmail || null,
                book_id: bookInsertData[0].id,
                status: localB.status || 'Da leggere',
                pages_read: localB.pagesRead || 0,
                start_date: localB.startDate || null,
                end_date: localB.endDate || null
              }]);
              try {
                await supabase.from('libreria_personale').insert([{
                  user_id: userId,
                  user_email: activeEmail || null,
                  book_id: bookInsertData[0].id,
                  title: localB.title,
                  author: localB.author,
                  cover_url: localB.coverUrl,
                  status: localB.status || 'Da leggere'
                }]);
              } catch (_) {}
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
      const sessionEmail = session?.user?.email?.trim().toLowerCase();
      const localEmail = getUserEmail();
      const activeEmail = sessionEmail || localEmail;

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
            user_email: activeEmail || null,
            book_id: bookInsertData[0].id,
            status: newBook.status || 'Da leggere',
            pages_read: newBook.pagesRead || 0,
            start_date: newBook.startDate || null,
            end_date: newBook.endDate || null
          }]);

          // 3. Inserisci anche in `libreria_personale` per retrocompatibilità con MAIN
          try {
            await supabase.from('libreria_personale').insert([{
              user_id: userId,
              user_email: activeEmail || null,
              book_id: bookInsertData[0].id,
              title: newBook.title,
              author: newBook.author,
              cover_url: newBook.coverUrl,
              status: newBook.status || 'Da leggere'
            }]);
          } catch (_) {}

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

        try {
          await supabase
            .from('libreria_personale')
            .delete()
            .or(`book_id.eq.${id},id.eq.${id}`);
        } catch (_) {}
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

          try {
            await supabase
              .from('libreria_personale')
              .update({
                status: (updatedBookRef as Book).status
              })
              .or(`book_id.eq.${id},id.eq.${id}`);
          } catch (_) {}
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

          try {
            await supabase
              .from('libreria_personale')
              .update({
                status: (updatedBookRef as Book).status
              })
              .or(`book_id.eq.${id},id.eq.${id}`);
          } catch (_) {}
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

          try {
            await supabase
              .from('libreria_personale')
              .update({
                title: updatedBook.title,
                author: updatedBook.author,
                cover_url: updatedBook.coverUrl,
                status: updatedBook.status
              })
              .or(`book_id.eq.${updatedBook.id},id.eq.${updatedBook.id}`);
          } catch (_) {}
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
