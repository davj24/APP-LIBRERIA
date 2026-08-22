export interface ShopLink {
  name: string;
  url: string;
  iconName?: string;
}

/**
 * Genera link di ricerca dinamici per l'acquisto di un libro sui principali store (Amazon IT, IBS, Vinted).
 * Utilizza l'ISBN come parametro di ricerca primario, oppure la combinazione Titolo + Autore come fallback.
 */
export function generateShopLinks(
  isbn?: string | null,
  title?: string | null,
  author?: string | null
): ShopLink[] {
  let searchTerm = '';

  if (isbn && isbn.trim().length >= 8) {
    searchTerm = isbn.trim();
  } else {
    const cleanTitle = title ? title.trim() : '';
    const cleanAuthor = author ? author.trim() : '';
    searchTerm = `${cleanTitle} ${cleanAuthor}`.trim();
  }

  if (!searchTerm) {
    searchTerm = 'libri';
  }

  const encodedSearch = encodeURIComponent(searchTerm);

  return [
    {
      name: 'Amazon IT',
      url: `https://www.amazon.it/s?k=${encodedSearch}`,
      iconName: 'ShoppingBag',
    },
    {
      name: 'IBS',
      url: `https://www.ibs.it/ricerca?ts=as&q=${encodedSearch}`,
      iconName: 'BookOpen',
    },
    {
      name: 'Vinted',
      url: `https://www.vinted.it/vetrina?search_text=${encodedSearch}`,
      iconName: 'Tag',
    },
  ];
}
