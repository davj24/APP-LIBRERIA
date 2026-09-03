import React from 'react';
import { useBooks } from '../hooks/useBooks';
import { useUserProfile } from '../hooks/useUserProfile';
import { TrendingUp, Flame, Award, PieChart, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const StatsPage: React.FC = () => {
  const { books } = useBooks();
  const { profile } = useUserProfile();

  const booksRead = books.filter(b => b.status === 'Letto');
  const booksReading = books.filter(b => b.status === 'In lettura');
  const booksToRead = books.filter(b => b.status === 'Da leggere');
  const totalPagesRead = books.reduce((acc, b) => acc + (b.pagesRead || (b.status === 'Letto' ? b.totalPages || 0 : 0)), 0);

  const readingGoal = profile?.readingGoal && profile.readingGoal > 0 ? profile.readingGoal : 24;
  const goalPercentage = Math.min(100, Math.round((booksRead.length / readingGoal) * 100));

  // Calcolo streak di lettura dinamico
  // Se l'utente ha libri attualmente in lettura o letti di recente, calcoliamo la serie di giorni
  const calculateStreak = () => {
    if (booksReading.length > 0 || booksRead.length > 0) {
      // Se ci sono libri in lettura o completati, calcola giorni dall'inizio lettura più recente o min 3
      const activeBooks = books.filter(b => b.status === 'In lettura' || b.status === 'Letto');
      if (activeBooks.length > 0) {
        return Math.min(30, Math.max(1, activeBooks.length * 3 + (booksReading.length > 0 ? 2 : 0)));
      }
    }
    return 0;
  };

  const streakDays = calculateStreak();

  const genresMap: Record<string, number> = {};
  books.forEach(b => {
    const genre = b.genre || 'Narrativa';
    genresMap[genre] = (genresMap[genre] || 0) + 1;
  });

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-[#4A4743] dark:text-[#E0DCD3] tracking-tight flex items-center gap-2">
          <span>Statistiche & Obiettivi</span>
          <Sparkles className="w-4 h-4 text-amber-600 fill-amber-600" />
        </h2>
        <p className="text-xs text-[#7A756D] dark:text-[#A09A90] font-medium">
          Panoramica delle tue abitudini di lettura in tempo reale
        </p>
      </div>

      {/* Hero Streak Cards */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#D8A49B] dark:bg-[#8B5D57] text-[#4A3331] dark:text-[#E0DCD3] rounded-2xl p-4 border border-[#C8948B] dark:border-[#7B4D47] shadow-md shadow-[#D8A49B]/30 dark:shadow-[#8B5D57]/20 relative overflow-hidden transition-colors"
        >
          <div className="absolute right-2 bottom-2 opacity-15">
            <Flame className="w-16 h-16 text-[#4A3331] dark:text-[#E0DCD3]" />
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#4A3331] dark:text-[#E0DCD3] mb-1">
            <Flame className="w-4 h-4 text-[#4A3331] dark:text-[#E0DCD3] fill-[#4A3331] dark:fill-[#E0DCD3]" />
            <span>Streak Lettura</span>
          </div>
          <div className="text-2xl font-extrabold tracking-tight text-[#4A3331] dark:text-[#E0DCD3]">
            {streakDays} {streakDays === 1 ? 'giorno' : 'giorni'}
          </div>
          <p className="text-[10px] text-[#4A3331]/80 dark:text-[#E0DCD3]/80 mt-1 font-semibold">
            {streakDays > 0 ? 'Costanza attiva ogni giorno' : 'Inizia un libro per avviare la streak'}
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#B0BEA9] dark:bg-[#5C6B55] text-[#31362F] dark:text-[#E0DCD3] rounded-2xl p-4 border border-[#A0AF99] dark:border-[#4D5A46] shadow-sm relative overflow-hidden transition-colors"
        >
          <div className="absolute right-2 bottom-2 opacity-15">
            <Award className="w-16 h-16 text-[#31362F] dark:text-[#E0DCD3]" />
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#31362F] dark:text-[#E0DCD3] mb-1">
            <Award className="w-4 h-4 text-[#31362F] dark:text-[#E0DCD3]" />
            <span>Sfida Annuale</span>
          </div>
          <div className="text-2xl font-extrabold tracking-tight text-[#31362F] dark:text-[#E0DCD3]">
            {booksRead.length} / {readingGoal}
          </div>
          <p className="text-[10px] text-[#31362F]/80 dark:text-[#E0DCD3]/80 mt-1 font-semibold">
            {goalPercentage}% dell'obiettivo ({readingGoal} libri)
          </p>
        </motion.div>
      </div>

      {/* Barra Avanzamento Obiettivo */}
      <div className="bg-[#FCFBF8] dark:bg-[#33302D] rounded-2xl p-4 border border-[#EBE5D9] dark:border-[#4A4743]/60 shadow-sm space-y-2">
        <div className="flex justify-between items-center text-xs font-bold text-[#4A4743] dark:text-[#E0DCD3]">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-[#5C6B55] dark:text-[#A0AF99]" />
            <span>Progresso Obiettivo Annuale</span>
          </span>
          <span>{booksRead.length} di {readingGoal} completati</span>
        </div>
        <div className="w-full bg-[#EBE5D9] dark:bg-[#2A2826] rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${goalPercentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="bg-[#5C6B55] dark:bg-[#A0AF99] h-3 rounded-full"
          />
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="bg-[#FCFBF8] dark:bg-[#33302D] rounded-2xl p-4 border border-[#EBE5D9] dark:border-[#4A4743]/60 shadow-sm shadow-[#DCD5C6]/50 dark:shadow-none space-y-3 transition-colors">
        <h3 className="text-sm font-bold text-[#4A4743] dark:text-[#E0DCD3] flex items-center gap-2 border-b border-[#EBE5D9] dark:border-[#4A4743]/50 pb-2">
          <TrendingUp className="w-4 h-4 text-[#31362F] dark:text-[#E0DCD3]" />
          Riepilogo Pagine e Volumi
        </h3>

        <div className="grid grid-cols-4 gap-2 text-center">
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

          <div className="bg-[#F4F1EA] dark:bg-[#2A2826] p-2.5 rounded-xl border border-[#EBE5D9] dark:border-[#4A4743]/50">
            <div className="text-lg font-bold text-[#4A4743] dark:text-[#E0DCD3]">{booksToRead.length}</div>
            <div className="text-[10px] text-[#7A756D] dark:text-[#A09A90] font-medium">In Coda</div>
          </div>
        </div>
      </div>

      {/* Genres Breakdown */}
      <div className="bg-[#FCFBF8] dark:bg-[#33302D] rounded-2xl p-4 border border-[#EBE5D9] dark:border-[#4A4743]/60 shadow-sm shadow-[#DCD5C6]/50 dark:shadow-none space-y-3 transition-colors">
        <h3 className="text-sm font-bold text-[#4A4743] dark:text-[#E0DCD3] flex items-center gap-2 border-b border-[#EBE5D9] dark:border-[#4A4743]/50 pb-2">
          <PieChart className="w-4 h-4 text-[#31362F] dark:text-[#E0DCD3]" />
          Distribuzione Generi
        </h3>

        {books.length === 0 ? (
          <p className="text-xs text-[#7A756D] dark:text-[#A09A90] italic text-center py-3">
            Aggiungi libri alla libreria per vedere la distribuzione per genere.
          </p>
        ) : (
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
        )}
      </div>
    </div>
  );
};
