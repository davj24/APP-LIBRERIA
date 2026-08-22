export interface WebBook {
  id: string;
  title: string;
  author: string;
  coverUrl: string | null;
  description?: string | null;
  totalPages?: number | null;
  genre?: string | null;
  isbn?: string | null;
  publishedYear?: string | null;
  source: 'google' | 'openlibrary';
}

/**
  * federatedBookSearch - Ricerca ibrida nei cataloghi web (Google Books + Open Library)
  * Esegue le query in parallelo, fonde ed elimina i duplicati.
  */
export async function federatedBookSearch(query: string): Promise<WebBook[]> {
  const searchTerm = query.trim();
  if (!searchTerm || searchTerm.length < 2) return [];

  const encodedQuery = encodeURIComponent(searchTerm);

  // Esegui in parallelo le chiamate a Google Books e Open Library
  const [googlePromise, openLibPromise] = await Promise.allSettled([
    fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodedQuery}&maxResults=10`),
    fetch(`https://openlibrary.org/search.json?q=${encodedQuery}&limit=10`)
  ]);

  const results: WebBook[] = [];

  // 1. Processa risultati Google Books
  if (googlePromise.status === 'fulfilled' && googlePromise.value.ok) {
    try {
      const data = await googlePromise.value.json();
      if (data.items && Array.isArray(data.items)) {
        for (const item of data.items) {
          const info = item.volumeInfo || {};
          const title = info.title || 'Titolo sconosciuto';
          const author = info.authors ? info.authors.join(', ') : 'Autore sconosciuto';
          const coverUrl = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || null;
          const isbnObj = info.industryIdentifiers?.find((id: any) => id.type === 'ISBN_13' || id.type === 'ISBN_10');
          const isbn = isbnObj ? isbnObj.identifier : null;

          results.push({
            id: `gb-${item.id}`,
            title,
            author,
            coverUrl: coverUrl ? coverUrl.replace('http:', 'https:') : null,
            description: info.description || null,
            totalPages: info.pageCount || null,
            genre: info.categories ? info.categories[0] : null,
            isbn,
            publishedYear: info.publishedDate ? info.publishedDate.substring(0, 4) : null,
            source: 'google'
          });
        }
      }
    } catch (e) {
      console.warn('Errore parsing Google Books:', e);
    }
  }

  // 2. Processa risultati Open Library
  if (openLibPromise.status === 'fulfilled' && openLibPromise.value.ok) {
    try {
      const data = await openLibPromise.value.json();
      if (data.docs && Array.isArray(data.docs)) {
        for (const doc of data.docs) {
          const title = doc.title || 'Titolo sconosciuto';
          const author = doc.author_name ? doc.author_name.join(', ') : 'Autore sconosciuto';
          const coverUrl = doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : null;
          const isbn = doc.isbn ? doc.isbn[0] : null;

          // Evita duplicati da Google Books basandosi su titolo o ISBN
          const isDuplicate = results.some(r => 
            (isbn && r.isbn === isbn) || 
            (r.title.toLowerCase() === title.toLowerCase() && r.author.toLowerCase() === author.toLowerCase())
          );

          if (!isDuplicate) {
            results.push({
              id: `ol-${doc.key.replace(/\//g, '-')}`,
              title,
              author,
              coverUrl,
              description: doc.first_sentence ? (Array.isArray(doc.first_sentence) ? doc.first_sentence[0] : doc.first_sentence) : null,
              totalPages: doc.number_of_pages_median || null,
              genre: doc.subject ? doc.subject[0] : null,
              isbn,
              publishedYear: doc.first_publish_year ? doc.first_publish_year.toString() : null,
              source: 'openlibrary'
            });
          }
        }
      }
    } catch (e) {
      console.warn('Errore parsing Open Library:', e);
    }
  }

  return results;
}
