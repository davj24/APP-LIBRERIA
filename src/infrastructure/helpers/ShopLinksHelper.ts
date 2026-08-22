export interface ShopLink {
  name: string;
  url: string;
  iconName?: string;
}

/**
 * Genera link di ricerca dinamici per l'acquisto di un libro su vari store online (Amazon IT, IBS, Vinted).
 * Utilizza l'ISBN come parametro di ricerca primario o il titolo come fallback.
 * 
 * @param isbn ISBN del libro (opzionale se è presente il titolo)
 * @param title Titolo del libro per fallback
 * @returns Array di oggetti contenenti il nome del negozio e l'URL dinamico
 */
export function generateShopLinks(isbn?: string | null, title?: string | null): ShopLink[] {
  const searchTerm = (isbn && isbn.trim()) ? isbn.trim() : (title && title.trim()) ? title.trim() : '';

  if (!searchTerm) return [];

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
