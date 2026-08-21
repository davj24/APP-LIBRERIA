import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, UserCheck, BookOpen, Star, Sparkles, MapPin, Calendar, 
  Search, ChevronRight, Share2, Handshake, CheckCircle2,
  BookMarked, Flame, ArrowLeft, Send
} from 'lucide-react';
import type { FriendProfile, FriendBookStatus } from '../../../domain/models/friend';

interface FriendProfileModalProps {
  friend: FriendProfile | null;
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'profile' | 'library';
}

export const FriendProfileModal: React.FC<FriendProfileModalProps> = ({
  friend,
  isOpen,
  onClose,
  initialTab = 'profile'
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'library'>(initialTab);
  const [statusFilter, setStatusFilter] = useState<FriendBookStatus | 'tutti'>('tutti');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFollowing, setIsFollowing] = useState(true);
  const [requestedLoanId, setRequestedLoanId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync initial tab when modal opens with a specific tab requirement
  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen || !friend) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleRequestLoan = (bookId: string, bookTitle: string) => {
    setRequestedLoanId(bookId);
    showToast(`Richiesta di prestito inviata a ${friend.name} per "${bookTitle}"!`);
  };

  const filteredLibrary = friend.library.filter((book) => {
    const matchesSearch = 
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (book.genre && book.genre.toLowerCase().includes(searchQuery.toLowerCase()));

    if (statusFilter === 'tutti') return matchesSearch;
    return matchesSearch && book.status === statusFilter;
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-md overflow-hidden">
        
        {/* Backdrop click */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose} 
          className="absolute inset-0 z-0" 
        />

        {/* Toast Notification */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="absolute top-6 left-4 right-4 z-[70] max-w-md mx-auto bg-emerald-700 dark:bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-500/30"
            >
              <CheckCircle2 size={22} className="shrink-0 text-emerald-200" />
              <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal Main Content Container */}
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
          className="relative z-10 w-full max-w-xl max-h-[90vh] bg-[#F7F4EE] dark:bg-[#201E1C] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-[#E2DDD2] dark:border-[#383430]"
        >
          {/* Header Bar */}
          <div className="sticky top-0 z-20 flex items-center justify-between px-5 py-4 bg-[#F7F4EE]/90 dark:bg-[#201E1C]/90 backdrop-blur-md border-b border-[#E8E3D8] dark:border-[#2F2C28]">
            <div className="flex items-center gap-2">
              {activeTab === 'library' && (
                <button
                  onClick={() => setActiveTab('profile')}
                  className="p-1.5 rounded-full hover:bg-[#EBE5D9] dark:hover:bg-[#2A2724] text-[#635E54] dark:text-[#A8A296] transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
              )}
              <h3 className="text-base sm:text-lg font-bold text-[#31362F] dark:text-[#E0DCD3] tracking-tight">
                {activeTab === 'profile' ? `Profilo di ${friend.name.split(' ')[0]}` : `Libreria di ${friend.name}`}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: `Profilo di ${friend.name}`,
                      url: window.location.href
                    }).catch(() => {});
                  } else {
                    showToast('Link al profilo copiato negli appunti!');
                  }
                }}
                className="p-2 rounded-full hover:bg-[#EBE5D9] dark:hover:bg-[#2A2724] text-[#787267] dark:text-[#9E988F] transition-colors"
                title="Condividi profilo"
              >
                <Share2 size={18} />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-[#EBE5D9] dark:bg-[#2C2926] text-[#555047] dark:text-[#BEB8AC] hover:opacity-80 transition-opacity"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex border-b border-[#E8E3D8] dark:border-[#2F2C28] bg-[#EFECE5] dark:bg-[#1A1817] px-4 pt-2">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center justify-center gap-2 ${
                activeTab === 'profile'
                  ? 'border-[#5C6B55] dark:border-[#86997B] text-[#31362F] dark:text-[#E0DCD3]'
                  : 'border-transparent text-[#888277] dark:text-[#7A746B] hover:text-[#4F4B43]'
              }`}
            >
              <UserCheck size={16} />
              <span>Scheda Profilo</span>
            </button>

            <button
              onClick={() => setActiveTab('library')}
              className={`flex-1 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center justify-center gap-2 ${
                activeTab === 'library'
                  ? 'border-[#5C6B55] dark:border-[#86997B] text-[#31362F] dark:text-[#E0DCD3]'
                  : 'border-transparent text-[#888277] dark:text-[#7A746B] hover:text-[#4F4B43]'
              }`}
            >
              <BookOpen size={16} />
              <span>Libreria ({friend.library.length})</span>
            </button>
          </div>

          {/* Modal Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">

            {/* TAB 1: SCHEDA PROFILO */}
            {activeTab === 'profile' && (
              <div className="space-y-6 animate-fadeIn">
                
                {/* Hero Header & Avatar */}
                <div className="relative rounded-3xl bg-gradient-to-br from-[#E6E0D4] via-[#F2EDE2] to-[#E3DCCF] dark:from-[#2B2825] dark:via-[#24211E] dark:to-[#1C1A18] p-5 border border-[#DFD8C9] dark:border-[#3B3733] shadow-sm overflow-hidden">
                  
                  {/* Background Ambient Glow */}
                  <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#86997B]/20 rounded-full blur-2xl pointer-events-none" />

                  <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                    
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <img 
                        src={friend.avatar} 
                        alt={friend.name}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-[#F7F4EE] dark:border-[#201E1C] shadow-md"
                      />
                      <div className="absolute -bottom-1 -right-1 bg-[#5C6B55] text-white p-1 rounded-full border-2 border-[#F7F4EE] dark:border-[#201E1C]">
                        <Sparkles size={14} />
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h2 className="text-xl sm:text-2xl font-black text-[#2E332B] dark:text-[#ECE7DE] leading-tight">
                            {friend.name}
                          </h2>
                          <p className="text-xs sm:text-sm font-medium text-[#736D62] dark:text-[#9C968B]">
                            {friend.handle}
                          </p>
                        </div>

                        {/* Follow Toggle Button */}
                        <button
                          onClick={() => {
                            setIsFollowing(!isFollowing);
                            showToast(isFollowing ? `Non segui più ${friend.name}` : `Ora segui ${friend.name}!`);
                          }}
                          className={`px-4 py-2 rounded-full text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 self-center sm:self-start ${
                            isFollowing
                              ? 'bg-[#E3DCCF] dark:bg-[#34302C] text-[#3D3A34] dark:text-[#D5CFB3] hover:bg-[#D8D0C0]'
                              : 'bg-[#5C6B55] text-white hover:bg-[#4D5A46]'
                          }`}
                        >
                          <UserCheck size={14} />
                          <span>{isFollowing ? 'Amici ✓' : '+ Segui'}</span>
                        </button>
                      </div>

                      {/* Badge Badge Pill */}
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#5C6B55]/10 text-[#4D5A46] dark:text-[#A8BB9C] text-xs font-bold rounded-full border border-[#5C6B55]/20">
                        <Star size={12} fill="currentColor" />
                        <span>{friend.badge}</span>
                      </div>

                      {/* Bio */}
                      <p className="text-xs sm:text-sm text-[#524D44] dark:text-[#BFB9AC] leading-relaxed pt-1">
                        {friend.bio}
                      </p>

                      {/* Location & Joined Date */}
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2 text-[11px] text-[#857F73] dark:text-[#807A70]">
                        {friend.location && (
                          <span className="flex items-center gap-1">
                            <MapPin size={12} />
                            {friend.location}
                          </span>
                        )}
                        {friend.joinedDate && (
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {friend.joinedDate}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* PROMINENT MAIN BUTTON: VAI AL PROFILO / LIBRERIA COMPLETA */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab('library')}
                  className="w-full py-4 px-5 bg-gradient-to-r from-[#5C6B55] to-[#475441] dark:from-[#6B7C63] dark:to-[#52614B] text-white rounded-2xl shadow-xl flex items-center justify-between border border-[#6E8064]/40 group transition-all"
                >
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                      <BookOpen size={22} className="text-white" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-extrabold tracking-tight">
                        Esplora Libreria di {friend.name.split(' ')[0]}
                      </h4>
                      <p className="text-xs text-white/80 font-medium">
                        Vedi tutti i {friend.library.length} libri, recensioni e chiedi in prestito
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={22} className="group-hover:translate-x-1 transition-transform shrink-0" />
                </motion.button>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-[#EFECE6] dark:bg-[#272422] p-3.5 rounded-2xl border border-[#E2DDD2] dark:border-[#36322E] text-center space-y-1">
                    <div className="flex items-center justify-center text-[#5C6B55] dark:text-[#A8BB9C]">
                      <BookMarked size={18} />
                    </div>
                    <p className="text-lg font-black text-[#2E332B] dark:text-[#ECE7DE]">
                      {friend.stats.booksRead}
                    </p>
                    <p className="text-[10px] sm:text-xs font-semibold text-[#857F73] dark:text-[#8E887C] uppercase tracking-wider">
                      Libri Letti
                    </p>
                  </div>

                  <div className="bg-[#EFECE6] dark:bg-[#272422] p-3.5 rounded-2xl border border-[#E2DDD2] dark:border-[#36322E] text-center space-y-1">
                    <div className="flex items-center justify-center text-[#D97706]">
                      <Flame size={18} />
                    </div>
                    <p className="text-lg font-black text-[#2E332B] dark:text-[#ECE7DE]">
                      {friend.stats.streakDays} gg
                    </p>
                    <p className="text-[10px] sm:text-xs font-semibold text-[#857F73] dark:text-[#8E887C] uppercase tracking-wider">
                      Streak Lettura
                    </p>
                  </div>

                  <div className="bg-[#EFECE6] dark:bg-[#272422] p-3.5 rounded-2xl border border-[#E2DDD2] dark:border-[#36322E] text-center space-y-1">
                    <div className="flex items-center justify-center text-[#2563EB]">
                      <Handshake size={18} />
                    </div>
                    <p className="text-lg font-black text-[#2E332B] dark:text-[#ECE7DE]">
                      {friend.stats.loanCount || 0}
                    </p>
                    <p className="text-[10px] sm:text-xs font-semibold text-[#857F73] dark:text-[#8E887C] uppercase tracking-wider">
                      Prestiti
                    </p>
                  </div>
                </div>

                {/* Currently Reading Card */}
                {friend.currentlyReading.length > 0 && (
                  <div className="bg-[#EFECE6] dark:bg-[#272422] p-4 rounded-2xl border border-[#E2DDD2] dark:border-[#36322E] space-y-3">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#736D62] dark:text-[#9E988F] flex items-center gap-1.5">
                      <BookOpen size={14} className="text-[#5C6B55] dark:text-[#A8BB9C]" />
                      Ora in Lettura
                    </h4>

                    {friend.currentlyReading.map((book) => {
                      const percent = Math.round((book.progressPage / book.totalPages) * 100);
                      return (
                        <div key={book.id} className="flex gap-3 items-center bg-[#F7F4EE] dark:bg-[#201E1C] p-3 rounded-xl border border-[#E8E3D8] dark:border-[#312E2A]">
                          <img 
                            src={book.coverUrl} 
                            alt={book.title}
                            className="w-12 h-16 rounded-lg object-cover shadow-sm shrink-0"
                          />
                          <div className="flex-1 min-w-0 space-y-1.5">
                            <h5 className="text-xs sm:text-sm font-bold text-[#31362F] dark:text-[#E0DCD3] truncate">
                              {book.title}
                            </h5>
                            <p className="text-[11px] text-[#787267] dark:text-[#9A9488] truncate">
                              {book.author}
                            </p>
                            
                            {/* Progress bar */}
                            <div className="space-y-1">
                              <div className="w-full bg-[#E2DDD2] dark:bg-[#383430] h-1.5 rounded-full overflow-hidden">
                                <div 
                                  className="bg-[#5C6B55] dark:bg-[#7D9172] h-full rounded-full transition-all duration-500" 
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                              <div className="flex justify-between text-[10px] font-semibold text-[#8C867B] dark:text-[#888277]">
                                <span>Pag. {book.progressPage} di {book.totalPages}</span>
                                <span>{percent}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Favorite Genres */}
                <div className="space-y-2">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#736D62] dark:text-[#9E988F]">
                    Generi Preferiti
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {friend.favoriteGenres.map((genre) => (
                      <span 
                        key={genre}
                        className="px-3 py-1 bg-[#EBE5D9] dark:bg-[#2E2B28] text-[#4A463F] dark:text-[#D1CBBF] text-xs font-semibold rounded-full border border-[#DCD5C6] dark:border-[#3D3A36]"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Recent Takeaways / Appunti */}
                {friend.recentTakeaways.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#736D62] dark:text-[#9E988F]">
                      Ultimi Takeaways & Note
                    </h4>
                    <div className="space-y-2.5">
                      {friend.recentTakeaways.map((tk) => (
                        <div key={tk.id} className="bg-[#EFECE6] dark:bg-[#272422] p-3.5 rounded-2xl border border-[#E2DDD2] dark:border-[#36322E] space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-[#31362F] dark:text-[#E0DCD3]">
                              {tk.bookTitle}
                            </span>
                            <div className="flex items-center gap-0.5 text-amber-500 text-xs font-bold">
                              <Star size={12} fill="currentColor" />
                              <span>{tk.rating}/5</span>
                            </div>
                          </div>
                          <p className="text-xs text-[#524D44] dark:text-[#BFB9AC] italic leading-relaxed">
                            {tk.content}
                          </p>
                          <span className="text-[10px] text-[#8C867B] dark:text-[#7A746B] block text-right">
                            {tk.createdAt}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* TAB 2: LIBRERIA DELL'AMICO */}
            {activeTab === 'library' && (
              <div className="space-y-4 animate-fadeIn">
                
                {/* Search & Filter bar */}
                <div className="space-y-3">
                  <div className="relative">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888277] dark:text-[#7D776C]" />
                    <input
                      type="text"
                      placeholder={`Cerca nei libri di ${friend.name.split(' ')[0]}...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-[#EFECE6] dark:bg-[#272422] border border-[#E2DDD2] dark:border-[#36322E] rounded-xl text-[#31362F] dark:text-[#E0DCD3] placeholder-[#9E988F] focus:outline-none focus:ring-2 focus:ring-[#5C6B55]"
                    />
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                    {(['tutti', 'letto', 'in_lettura', 'da_leggere'] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => setStatusFilter(st)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize whitespace-nowrap transition-all ${
                          statusFilter === st
                            ? 'bg-[#5C6B55] text-white shadow-sm'
                            : 'bg-[#EFECE6] dark:bg-[#272422] text-[#6E685E] dark:text-[#9A9488] hover:bg-[#E5E0D5]'
                        }`}
                      >
                        {st === 'tutti' ? 'Tutti i libri' : st === 'in_lettura' ? 'In Lettura' : st === 'da_leggere' ? 'Da Leggere' : 'Letti'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Books Grid */}
                {filteredLibrary.length === 0 ? (
                  <div className="text-center py-10 space-y-2">
                    <BookOpen size={36} className="mx-auto text-[#A39D91] dark:text-[#6E685E]" />
                    <p className="text-sm font-semibold text-[#6E685E] dark:text-[#9A9488]">
                      Nessun libro trovato per questo filtro.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredLibrary.map((book) => {
                      const isRequested = requestedLoanId === book.id;
                      return (
                        <div 
                          key={book.id}
                          className="bg-[#EFECE6] dark:bg-[#272422] p-3.5 rounded-2xl border border-[#E2DDD2] dark:border-[#36322E] flex gap-3 sm:gap-4 items-start shadow-sm"
                        >
                          <img 
                            src={book.coverUrl} 
                            alt={book.title}
                            className="w-16 h-22 sm:w-20 sm:h-28 rounded-xl object-cover shadow shrink-0"
                          />

                          <div className="flex-1 min-w-0 space-y-1.5">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="text-sm sm:text-base font-bold text-[#31362F] dark:text-[#E0DCD3] leading-snug">
                                  {book.title}
                                </h4>
                                <p className="text-xs text-[#787267] dark:text-[#9A9488]">
                                  {book.author}
                                </p>
                              </div>

                              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md shrink-0 uppercase tracking-wider ${
                                book.status === 'letto'
                                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                                  : book.status === 'in_lettura'
                                  ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                                  : 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border border-slate-500/20'
                              }`}>
                                {book.status === 'in_lettura' ? 'In Lettura' : book.status === 'da_leggere' ? 'Da Leggere' : 'Letto'}
                              </span>
                            </div>

                            {/* Genre & Stars */}
                            <div className="flex items-center gap-3 text-xs">
                              {book.genre && (
                                <span className="text-[11px] text-[#888277] dark:text-[#888277]">
                                  {book.genre}
                                </span>
                              )}
                              {book.rating && (
                                <div className="flex items-center gap-1 text-amber-500 font-bold">
                                  <Star size={12} fill="currentColor" />
                                  <span>{book.rating}/5</span>
                                </div>
                              )}
                            </div>

                            {/* Review snippet */}
                            {book.review && (
                              <p className="text-xs text-[#59544B] dark:text-[#B5AF9F] italic line-clamp-2 pt-0.5">
                                "{book.review}"
                              </p>
                            )}

                            {/* Request Loan Button */}
                            {book.canBorrow && (
                              <div className="pt-1">
                                <button
                                  onClick={() => handleRequestLoan(book.id, book.title)}
                                  disabled={isRequested}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                                    isRequested
                                      ? 'bg-emerald-600 text-white cursor-default'
                                      : 'bg-[#5C6B55] hover:bg-[#4D5A46] text-white shadow-sm active:scale-95'
                                  }`}
                                >
                                  {isRequested ? (
                                    <>
                                      <CheckCircle2 size={14} />
                                      <span>Richiesta Inviata</span>
                                    </>
                                  ) : (
                                    <>
                                      <Send size={14} />
                                      <span>Chiedi in Prestito</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

              </div>
            )}

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
