import type { Book } from '../../domain/models/Book';

const READING_LOG_KEY = 'bibliodesk_reading_log_v1';

export interface ReadingLogEntry {
  id: string;
  bookId: string;
  date: string; // YYYY-MM-DD
  timestamp: number;
  pagesReadDelta: number;
  fromPage: number;
  toPage: number;
}

export function getReadingLogs(): ReadingLogEntry[] {
  try {
    const saved = localStorage.getItem(READING_LOG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Errore lettura reading logs:', e);
  }
  return [];
}

export function saveReadingLogs(logs: ReadingLogEntry[]) {
  try {
    localStorage.setItem(READING_LOG_KEY, JSON.stringify(logs));
  } catch (e) {
    console.warn('Errore salvataggio reading logs:', e);
  }
}

/**
 * Registra una sessione di lettura.
 * Se isStartingPoint è true, non aggiunge incremento di pagine lette alle statistiche del giorno odierno.
 */
export function recordReadingProgress(
  bookId: string,
  fromPage: number,
  toPage: number,
  isStartingPoint: boolean = false
) {
  if (isStartingPoint) {
    // Il punto di partenza iniziale non genera un incremento di lettura oggi.
    return;
  }

  const delta = toPage - fromPage;
  if (delta <= 0) return;

  const today = new Date().toISOString().split('T')[0];
  const logs = getReadingLogs();

  const newEntry: ReadingLogEntry = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    bookId,
    date: today,
    timestamp: Date.now(),
    pagesReadDelta: delta,
    fromPage,
    toPage
  };

  saveReadingLogs([...logs, newEntry]);
}

/**
 * Calcola quante pagine sono state lette nella giornata odierna.
 */
export function getTodayPagesRead(): number {
  const today = new Date().toISOString().split('T')[0];
  const logs = getReadingLogs();
  return logs
    .filter(log => log.date === today)
    .reduce((acc, log) => acc + log.pagesReadDelta, 0);
}

/**
 * Calcola i giorni consecutivi di lettura (Streak) basandosi sui log reali.
 */
export function calculateRealStreak(books: Book[]): number {
  const logs = getReadingLogs();
  
  // Raccogli tutte le date uniche con almeno 1 pagina letta
  const datesWithReading = Array.from(
    new Set(logs.filter(l => l.pagesReadDelta > 0).map(l => l.date))
  ).sort().reverse();

  if (datesWithReading.length === 0) {
    // Fallback: se non ci sono ancora log ma l'utente ha libri attivi
    const activeBooks = books.filter(b => b.status === 'In lettura' || b.status === 'Letto');
    return activeBooks.length > 0 ? 1 : 0;
  }

  let streak = 0;
  const now = new Date();
  
  // Crea data oggi senza ore
  const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Verifica se oggi o ieri ha letto
  const checkDate = new Date(todayDate);
  const todayStr = checkDate.toISOString().split('T')[0];
  
  checkDate.setDate(checkDate.getDate() - 1);
  const yesterdayStr = checkDate.toISOString().split('T')[0];

  const hasReadToday = datesWithReading.includes(todayStr);
  const hasReadYesterday = datesWithReading.includes(yesterdayStr);

  if (!hasReadToday && !hasReadYesterday) {
    return 0; // Streak interrotta
  }

  // Conta i giorni consecutivi a ritroso
  let currentCheck = hasReadToday ? new Date(todayDate) : checkDate;
  while (true) {
    const dStr = currentCheck.toISOString().split('T')[0];
    if (datesWithReading.includes(dStr)) {
      streak++;
      currentCheck.setDate(currentCheck.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Calcola il ritmo medio (pagine/giorno) basato sulle sessioni effettive o sui giorni attivi.
 */
export function calculateAveragePace(books: Book[]): number {
  const logs = getReadingLogs();
  const totalDeltaFromLogs = logs.reduce((sum, l) => sum + l.pagesReadDelta, 0);
  const uniqueDates = new Set(logs.map(l => l.date)).size;

  if (uniqueDates > 0 && totalDeltaFromLogs > 0) {
    return Math.round(totalDeltaFromLogs / uniqueDates);
  }

  // Fallback: calcola sulle pagine effettivamente tracciate oltre il punto di partenza
  let totalTrackedPages = 0;
  books.forEach(b => {
    const baseline = b.initialPagesRead || 0;
    const current = b.pagesRead || (b.status === 'Letto' ? (b.totalPages || 0) : 0);
    totalTrackedPages += Math.max(0, current - baseline);
  });

  if (totalTrackedPages <= 0) return 0;

  // Stima su 1 giorno se non ci sono ancora date
  return Math.min(totalTrackedPages, 20);
}
