import React, { useState, useEffect } from 'react';
import { useBooks } from '../hooks/useBooks';
import { TrendingUp, Flame, Award, PieChart, Sparkles, Lock, BarChart3, Clock, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export const StatsPage: React.FC = () => {
  const { books } = useBooks();

  // Verifica se la modalità sviluppatore è sbloccata in sessionStorage
  const [isDevUnlocked, setIsDevUnlocked] = useState<boolean>(() => {
    return sessionStorage.getItem('bibliodesk_dev_session') === 'true';
  });

  useEffect(() => {
    const checkDevStatus = () => {
      setIsDevUnlocked(sessionStorage.getItem('bibliodesk_dev_session') === 'true');
    };

    checkDevStatus();
    window.addEventListener('storage', checkDevStatus);
    return () => window.removeEventListener('storage', checkDevStatus);
  }, []);

  // Se l'utente NON ha sbloccato la modalità sviluppatore, mostra la schermata Coming Soon
  if (!isDevUnlocked) {
    return (
      <div className="space-y-4 animate-in fade-in duration-200">
        {/* Intestazione */}
        <div>
          <h2 className="text-xl font-bold text-[#4A4743] dark:text-[#E0DCD3] tracking-tight flex items-center gap-2">
            <span>Statistiche & Analytics</span>
            <Sparkles className="w-4 h-4 text-amber-600 fill-amber-600" />
          </h2>
          <p className="text-xs text-[#7A756D] dark:text-[#A09A90] font-medium">
            Panoramica delle tue abitudini di lettura
          </p>
        </div>

        {/* Card Coming Soon per Utenti Non Sviluppatori */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#FCFBF8] dark:bg-[#33302D] rounded-3xl p-8 border border-[#EBE5D9] dark:border-[#4A4743]/60 shadow-lg text-center space-y-5 relative overflow-hidden my-4"
        >
          {/* Ambient Glow */}
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#5C6B55]/15 dark:bg-[#A8BB9C]/10 rounded-full blur-2xl pointer-events-none" />

          {/* Badge In Arrivo */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black bg-[#EFECE6] dark:bg-[#272422] text-[#5C6B55] dark:text-[#A8BB9C] border border-[#DCD5C6] dark:border-[#4A4743]/60 shadow-xs">
            <Clock size={13} />
            <span>IN ARRIVO • COMING SOON</span>
          </div>

          {/* Icona Principale con Lucchetto */}
          <div className="w-24 h-24 mx-auto rounded-3xl bg-[#F4F1EA] dark:bg-[#2A2826] border-2 border-[#EBE5D9] dark:border-[#4A4743] text-[#5C6B55] dark:text-[#A8BB9C] flex items-center justify-center shadow-md relative">
            <BarChart3 className="w-12 h-12" />
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-sm">
              <Lock size={14} />
            </div>
          </div>

          {/* Titolo e Descrizione */}
          <div className="max-w-sm mx-auto space-y-2">
            <h3 className="text-xl font-black text-[#31362F] dark:text-[#ECE7DE] tracking-tight">
              Statistiche Avanzate in Arrivo
            </h3>
            <p className="text-xs text-[#7A756D] dark:text-[#9A9488] leading-relaxed font-medium">
              Stiamo perfezionando i nuovi grafici interattivi, l’analisi dettagliata dei generi letterari e la tracciatura avanzata della streak di lettura per i prossimi aggiornamenti.
            </p>
          </div>

          {/* Nota Modalità Sviluppatore */}
          <div className="pt-3 border-t border-[#EBE5D9] dark:border-[#4A4743]/40 max-w-xs mx-auto">
            <p className="text-[11px] text-[#8C867B] dark:text-[#888277] flex items-center justify-center gap-1.5 font-medium">
              <ShieldCheck size={14} className="text-[#5C6B55] dark:text-[#A8BB9C]" />
              <span>Sblocco Modalità Sviluppatore per l'anteprima</span>
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Se la Modalità Sviluppatore è SBLOCCATA, mostra l'intera dashboard delle statistiche
  const booksRead = books.filter(b => b.status === 'Letto');
  const booksReading = books.filter(b => b.status === 'In lettura');
  const totalPagesRead = books.reduce((acc, b) => acc + (b.pagesRead || (b.status === 'Letto' ? b.totalPages || 0 : 0)), 0);

  const genresMap: Record<string, number> = {};
  books.forEach(b => {
    const genre = b.genre || 'Altri';
    genresMap[genre] = (genresMap[genre] || 0) + 1;
  });

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-[#4A4743] dark:text-[#E0DCD3] tracking-tight flex items-center gap-2">
          <span>Statistiche & Analytics (Dev Preview)</span>
          <Sparkles className="w-4 h-4 text-amber-600 fill-amber-600" />
        </h2>
        <p className="text-xs text-[#7A756D] dark:text-[#A09A90] font-medium">
          Panoramica completa sviluppatore
        </p>
      </div>

      {/* Hero Streak Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#D8A49B] dark:bg-[#8B5D57] text-[#4A3331] dark:text-[#E0DCD3] rounded-2xl p-4 border border-[#C8948B] dark:border-[#7B4D47] shadow-md shadow-[#D8A49B]/30 dark:shadow-[#8B5D57]/20 relative overflow-hidden transition-colors">
          <div className="absolute right-2 bottom-2 opacity-15">
            <Flame className="w-16 h-16 text-[#4A3331] dark:text-[#E0DCD3]" />
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#4A3331] dark:text-[#E0DCD3] mb-1">
            <Flame className="w-4 h-4 text-[#4A3331] dark:text-[#E0DCD3] fill-[#4A3331] dark:fill-[#E0DCD3]" />
            <span>Streak Lettura</span>
          </div>
          <div className="text-2xl font-extrabold tracking-tight text-[#4A3331] dark:text-[#E0DCD3]">
            14 giorni
          </div>
          <p className="text-[10px] text-[#4A3331]/80 dark:text-[#E0DCD3]/80 mt-1 font-semibold">Obiettivo: 30 giorni consecutivi</p>
        </div>

        <div className="bg-[#B0BEA9] dark:bg-[#5C6B55] text-[#31362F] dark:text-[#E0DCD3] rounded-2xl p-4 border border-[#A0AF99] dark:border-[#4D5A46] shadow-sm relative overflow-hidden transition-colors">
          <div className="absolute right-2 bottom-2 opacity-15">
            <Award className="w-16 h-16 text-[#31362F] dark:text-[#E0DCD3]" />
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#31362F] dark:text-[#E0DCD3] mb-1">
            <Award className="w-4 h-4 text-[#31362F] dark:text-[#E0DCD3]" />
            <span>Libri Letti (2026)</span>
          </div>
          <div className="text-2xl font-extrabold tracking-tight text-[#31362F] dark:text-[#E0DCD3]">
            {booksRead.length} / 12
          </div>
          <p className="text-[10px] text-[#31362F]/80 dark:text-[#E0DCD3]/80 mt-1 font-semibold">
            {Math.round((booksRead.length / 12) * 100)}% della sfida annuale
          </p>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="bg-[#FCFBF8] dark:bg-[#33302D] rounded-2xl p-4 border border-[#EBE5D9] dark:border-[#4A4743]/60 shadow-sm shadow-[#DCD5C6]/50 dark:shadow-none space-y-3 transition-colors">
        <h3 className="text-sm font-bold text-[#4A4743] dark:text-[#E0DCD3] flex items-center gap-2 border-b border-[#EBE5D9] dark:border-[#4A4743]/50 pb-2">
          <TrendingUp className="w-4 h-4 text-[#31362F] dark:text-[#E0DCD3]" />
          Riepilogo Pagine e Volumi
        </h3>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-[#F4F1EA] dark:bg-[#2A2826] p-2.5 rounded-xl border border-[#EBE5D9] dark:border-[#4A4743]/50">
            <div className="text-lg font-bold text-[#4A4743] dark:text-[#E0DCD3]">{totalPagesRead}</div>
            <div className="text-[10px] text-[#7A756D] dark:text-[#A09A90] font-medium">Pagine Lette</div>
          </div>

          <div className="bg-[#EBE5D9] dark:bg-[#383532] p-2.5 rounded-xl border border-[#DCD5C6] dark:border-[#4A4743]/60">
            <div className="text-lg font-bold text-[#4A4743] dark:text-[#E0DCD3]">{booksReading.length}</div>
            <div className="text-[10px] text-[#7A756D] dark:text-[#A09A90] font-medium">In Lettura</div>
          </div>

          <div className="bg-[#D8E2D5] dark:bg-[#3B4838] p-2.5 rounded-xl border border-[#B0BEA9] dark:border-[#5C6B55]">
            <div className="text-lg font-bold text-[#2D382B] dark:text-[#E0DCD3]">{booksRead.length}</div>
            <div className="text-[10px] text-[#4D6349] dark:text-[#788C71] font-medium">Completati</div>
          </div>
        </div>
      </div>

      {/* Genres Breakdown */}
      <div className="bg-[#FCFBF8] dark:bg-[#33302D] rounded-2xl p-4 border border-[#EBE5D9] dark:border-[#4A4743]/60 shadow-sm shadow-[#DCD5C6]/50 dark:shadow-none space-y-3 transition-colors">
        <h3 className="text-sm font-bold text-[#4A4743] dark:text-[#E0DCD3] flex items-center gap-2 border-b border-[#EBE5D9] dark:border-[#4A4743]/50 pb-2">
          <PieChart className="w-4 h-4 text-[#31362F] dark:text-[#E0DCD3]" />
          Distribuzione Generi
        </h3>

        <div className="space-y-2.5">
          {Object.entries(genresMap).map(([genre, count]) => {
            const percentage = Math.round((count / books.length) * 100) || 0;
            return (
              <div key={genre} className="space-y-1">
                <div className="flex justify-between text-xs font-medium text-[#4A4743] dark:text-[#E0DCD3]">
                  <span>{genre}</span>
                  <span className="text-[#7A756D] dark:text-[#A09A90]">{count} {count === 1 ? 'libro' : 'libri'} ({percentage}%)</span>
                </div>
                <div className="w-full bg-[#EBE5D9] dark:bg-[#2A2826] rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#B0BEA9] dark:bg-[#5C6B55] h-2 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
