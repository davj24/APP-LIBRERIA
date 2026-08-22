export interface ShopAction {
  label: string;
  url: string;
  iconType: 'amazon' | 'vinted' | 'libraccio' | 'feltrinelli' | string;
}

export interface ShopLink {
  name: string;
  url: string;
  iconName?: string;
}

export interface BookInputForShop {
  title: string;
  author?: string | null;
  isbn?: string | null;
}

/**
 * Converte un ISBN-13 (in particolare quelli con prefisso 978) in ISBN-10 per generare link ASIN diretti su Amazon.
 */
export function convertIsbn13ToIsbn10(isbn13: string): string | null {
  const cleaned = isbn13.replace(/[-_ \s]/g, '');
  if (cleaned.length === 10) return cleaned;
  if (cleaned.length !== 13 || !cleaned.startsWith('978')) return null;

  // Prendi le 9 cifre centrali (dopo il 978)
  const core9 = cleaned.substring(3, 12);
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    const digit = parseInt(core9.charAt(i), 10);
    if (isNaN(digit)) return null;
    sum += digit * (10 - i);
  }

  const remainder = (11 - (sum % 11)) % 11;
  const checkDigit = remainder === 10 ? 'X' : remainder.toString();

  return `${core9}${checkDigit}`;
}

/**
 * Genera le azioni commerciali (link d'acquisto e ricerca usato) per un dato libro.
 */
export function getShopActions(book: BookInputForShop): ShopAction[] {
  const title = book.title ? book.title.trim() : '';
  const author = book.author ? book.author.trim() : '';
  const rawIsbn = book.isbn ? book.isbn.replace(/[-_ \s]/g, '') : '';
  const hasIsbn = rawIsbn.length >= 9;

  const actions: ShopAction[] = [];

  // 1. Amazon (ASIN se ISBN valido, altrimenti ricerca Titolo+Autore)
  let amazonUrl = '';
  if (hasIsbn) {
    const isbn10 = convertIsbn13ToIsbn10(rawIsbn);
    if (isbn10) {
      amazonUrl = `https://www.amazon.it/dp/${isbn10}`;
    } else {
      amazonUrl = `https://www.amazon.it/s?k=${encodeURIComponent(`${title} ${author}`.trim())}`;
    }
  } else {
    amazonUrl = `https://www.amazon.it/s?k=${encodeURIComponent(`${title} ${author}`.trim())}`;
  }
  actions.push({
    label: 'Cerca su Amazon',
    url: amazonUrl,
    iconType: 'amazon',
  });

  // 2. Vinted (Cerca usato: ISBN se presente, altrimenti Titolo+Autore)
  const vintedQuery = hasIsbn ? rawIsbn : `${title} ${author}`.trim();
  actions.push({
    label: 'Cerca usato su Vinted',
    url: `https://www.vinted.it/vetrina?search_text=${encodeURIComponent(vintedQuery)}`,
    iconType: 'vinted',
  });

  // 3. Libraccio (Mostrato SOLO se l'ISBN è presente)
  if (hasIsbn) {
    actions.push({
      label: 'Cerca su Libraccio',
      url: `https://www.libraccio.it/src/?q=${encodeURIComponent(rawIsbn)}`,
      iconType: 'libraccio',
    });
  }

  // 4. Feltrinelli (laFeltrinelli: ISBN se presente, altrimenti Titolo+Autore)
  const feltrinelliQuery = hasIsbn ? rawIsbn : `${title} ${author}`.trim();
  actions.push({
    label: 'Cerca su Feltrinelli',
    url: `https://www.lafeltrinelli.it/ricerca?keyword=${encodeURIComponent(feltrinelliQuery)}`,
    iconType: 'feltrinelli',
  });

  return actions;
}

/**
 * Wrapper per retrocompatibilità con chiamate legacy
 */
export function generateShopLinks(
  isbn?: string | null,
  title?: string | null,
  author?: string | null
): ShopLink[] {
  const actions = getShopActions({
    title: title || '',
    author: author || '',
    isbn: isbn || null,
  });

  return actions.map((act) => ({
    name: act.label,
    url: act.url,
    iconName: act.iconType,
  }));
}
