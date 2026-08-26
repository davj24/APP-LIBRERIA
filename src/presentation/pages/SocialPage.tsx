import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Search,
  UserPlus,
  Check,
  PlusCircle,
  MessageSquareQuote,
  Sparkles,
  BookOpen,
  X,
  Send,
  Loader2,
  BookmarkCheck,
  BookmarkPlus
} from 'lucide-react';
import {
  socialService,
  type UserProfileSocial,
  type SpuntoSocial
} from '../../infrastructure/services/socialService';
import { useBooks } from '../hooks/useBooks';
import { useRegisterModal } from '../context/ModalContext';

export const SocialPage: React.FC = () => {
  // Stati Amici e Ricerca Utenti
  const [friendsList, setFriendsList] = useState<UserProfileSocial[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfileSocial[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [sendingRequestTo, setSendingRequestTo] = useState<string | null>(null);

  // Stati Feed Spunti Social
  const [spuntiFeed, setSpuntiFeed] = useState<SpuntoSocial[]>([]);
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);
  const [savedSpuntiIds, setSavedSpuntiIds] = useState<string[]>([]);

  // Modale "Condividi Spunto"
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookAuthor, setNewBookAuthor] = useState('');
  const [newBookCover, setNewBookCover] = useState('');
  const [newTipoSpunto, setNewTipoSpunto] = useState<'Takeaway' | 'Citazione' | 'Recensione' | 'Riflessione'>('Takeaway');
  const [newTestoSpunto, setNewTestoSpunto] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);

  const { books: myBooks } = useBooks();
  useRegisterModal(isCreateModalOpen);

  // 1. Caricamento Iniziale Amici e Feed da Supabase
  useEffect(() => {
    loadSocialData();
  }, []);

  const loadSocialData = async () => {
    setIsLoadingFeed(true);
    try {
      const [friendsData, feedData] = await Promise.all([
        socialService.getFriends(),
        socialService.getSpuntiFeed()
      ]);
      setFriendsList(friendsData);
      setSpuntiFeed(feedData);
    } catch (err) {
      console.warn('Errore durante il caricamento dei dati social Supabase:', err);
    } finally {
      setIsLoadingFeed(false);
    }
  };

  // 2. Ricerca Utenti in tempo reale
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await socialService.searchUsers(searchQuery);
        setSearchResults(results);
      } catch (e) {
        console.error('Errore ricerca utenti:', e);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 3. Invio Richiesta Amicizia
  const handleSendFriendRequest = async (targetUserId: string) => {
    setSendingRequestTo(targetUserId);
    try {
      await socialService.sendFriendRequest(targetUserId);
      setSearchResults(prev =>
        prev.map(u => (u.id === targetUserId ? { ...u, friendshipState: 'in_attesa' } : u))
      );
    } catch (err: any) {
      alert(err.message || 'Impossibile inviare la richiesta di amicizia.');
    } finally {
      setSendingRequestTo(null);
    }
  };

  // 4. Pubblicazione Nuovo Spunto Social
  const handlePublishSpunto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBookTitle.trim() || !newTestoSpunto.trim()) {
      setPublishError('Inserisci il titolo del libro e il testo dello spunto.');
      return;
    }

    setIsPublishing(true);
    setPublishError(null);

    try {
      const created = await socialService.createSpunto({
        libro_titolo: newBookTitle,
        libro_autore: newBookAuthor,
        libro_copertina: newBookCover,
        tipo_spunto: newTipoSpunto,
        testo_spunto: newTestoSpunto
      });

      setSpuntiFeed(prev => [created, ...prev]);
      setIsCreateModalOpen(false);

      // Reset form
      setNewBookTitle('');
      setNewBookAuthor('');
      setNewBookCover('');
      setNewTipoSpunto('Takeaway');
      setNewTestoSpunto('');
    } catch (err: any) {
      console.error('Errore pubblicazione spunto:', err);
      setPublishError(err.message || 'Errore durante la pubblicazione dello spunto.');
    } finally {
      setIsPublishing(false);
    }
  };

  const toggleSaveSpunto = (id: string) => {
    setSavedSpuntiIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const formatTimeAgo = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins < 60) return `${Math.max(1, diffMins)}m fa`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h fa`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d fa`;
    } catch {
      return 'Recente';
    }
  };

  return (
    <div className="min-h-screen px-4 sm:px-6 pt-6 pb-28 max-w-xl mx-auto text-[#31362F] dark:text-[#E0DCD3] font-sans space-y-6">

      {/* HEADER DELLA PAGINA SOCIAL */}
      <header className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#2E332B] dark:text-[#ECE7DE]">
            BiblioSocial
          </h1>
          <p className="text-xs text-[#7A756D] dark:text-[#9E988F] font-medium">
            La tua community di lettori, amici e spunti di lettura
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="py-2.5 px-3.5 bg-[#5C6B55] hover:bg-[#4D5A46] text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer border border-[#788C71]"
        >
          <PlusCircle size={16} />
          <span>Condividi Spunto</span>
        </button>
      </header>

      {/* BARRA & SCHEDA "CERCA AMICI" */}
      <section className="bg-[#EFECE6] dark:bg-[#272422] p-4 sm:p-5 rounded-3xl border border-[#E2DDD2] dark:border-[#36322E] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#7A756D] dark:text-[#9A9488] flex items-center gap-1.5">
            <Users size={15} className="text-[#5C6B55] dark:text-[#A8BB9C]" />
            Cerca Nuovi Amici
          </h2>
          {friendsList.length > 0 && (
            <span className="text-[11px] text-[#5C6B55] dark:text-[#A8BB9C] font-bold">
              {friendsList.length} {friendsList.length === 1 ? 'amico' : 'amici'}
            </span>
          )}
        </div>

        {/* Input di Ricerca */}
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-[#7A756D] dark:text-[#9A9488] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cerca utenti per username o nome completo..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#F7F4EE] dark:bg-[#201E1C] text-xs font-semibold text-[#31362F] dark:text-[#E0DCD3] placeholder-[#9E988F] rounded-2xl border border-[#E2DDD2] dark:border-[#36322E] focus:outline-none focus:ring-2 focus:ring-[#5C6B55] transition-all"
          />
          {isSearching && (
            <Loader2 className="absolute right-3.5 w-4 h-4 text-[#5C6B55] animate-spin" />
          )}
        </div>

        {/* Risultati della Ricerca */}
        {searchQuery.trim().length > 0 && (
          <div className="space-y-2 pt-1 border-t border-[#E2DDD2] dark:border-[#36322E]">
            {searchResults.length === 0 && !isSearching ? (
              <p className="text-xs text-[#7A756D] dark:text-[#9A9488] text-center py-2 italic">
                Nessun utente trovato per "{searchQuery}".
              </p>
            ) : (
              searchResults.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-[#F7F4EE] dark:bg-[#201E1C] border border-[#E8E3D8] dark:border-[#312E2A]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={user.avatar_url}
                      alt={user.nome_completo}
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-[#5C6B55]/30 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-[#31362F] dark:text-[#E0DCD3] truncate">
                        {user.nome_completo}
                      </h4>
                      <p className="text-[11px] text-[#7A756D] dark:text-[#9A9488] truncate">
                        @{user.username}
                      </p>
                    </div>
                  </div>

                  {user.friendshipState === 'accettata' ? (
                    <span className="px-3 py-1.5 bg-[#D8E2D5] dark:bg-[#3B4838] text-[#2D382B] dark:text-[#E0DCD3] rounded-xl text-[11px] font-bold flex items-center gap-1 border border-[#B0BEA9]">
                      <Check size={13} />
                      Amico
                    </span>
                  ) : user.friendshipState === 'in_attesa' ? (
                    <span className="px-3 py-1.5 bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-xl text-[11px] font-bold border border-amber-500/30">
                      Richiesta inviata
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSendFriendRequest(user.id)}
                      disabled={sendingRequestTo === user.id}
                      className="px-3 py-1.5 bg-[#5C6B55] hover:bg-[#4D5A46] text-white rounded-xl text-[11px] font-bold flex items-center gap-1 shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {sendingRequestTo === user.id ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <UserPlus size={13} />
                      )}
                      <span>Aggiungi amico</span>
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </section>

      {/* AMICI CONNESSI (Avatar Row) */}
      {friendsList.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#7A756D] dark:text-[#9A9488]">
            I Tuoi Amici
          </h2>
          <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar">
            {friendsList.map((friend) => (
              <div key={friend.id} className="flex flex-col items-center gap-1 shrink-0">
                <img
                  src={friend.avatar_url}
                  alt={friend.nome_completo}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-[#5C6B55]/50 shadow-xs"
                />
                <span className="text-[11px] font-bold text-[#31362F] dark:text-[#E0DCD3] truncate max-w-[65px]">
                  {friend.nome_completo.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FEED DEGLI SPUNTI */}
      <section className="space-y-4 pt-1">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#7A756D] dark:text-[#9A9488] flex items-center gap-1.5">
            <MessageSquareQuote size={15} className="text-[#5C6B55] dark:text-[#A8BB9C]" />
            Feed Spunti & Riflessioni
          </h2>
          <span className="text-[11px] text-[#7A756D] dark:text-[#9A9488] font-medium">
            {spuntiFeed.length} pubblicati
          </span>
        </div>

        {isLoadingFeed ? (
          <div className="flex flex-col items-center justify-center py-10 text-[#7A756D] space-y-2">
            <Loader2 size={28} className="animate-spin text-[#5C6B55]" />
            <p className="text-xs font-semibold">Caricamento dello spunto feed...</p>
          </div>
        ) : spuntiFeed.length === 0 ? (
          <div className="bg-[#EFECE6] dark:bg-[#272422] p-8 rounded-3xl border border-[#E2DDD2] dark:border-[#36322E] text-center space-y-3">
            <Sparkles size={32} className="mx-auto text-[#5C6B55]" />
            <h3 className="text-sm font-bold text-[#31362F] dark:text-[#E0DCD3]">Nessuno spunto pubblicato ancora</h3>
            <p className="text-xs text-[#7A756D] dark:text-[#9A9488] max-w-xs mx-auto">
              Sii il primo a condividere una citazione, un takeaway o una riflessione su un libro!
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-[#5C6B55] text-white text-xs font-bold rounded-xl shadow-md hover:bg-[#4D5A46] transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <PlusCircle size={14} />
              Condividi uno Spunto
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {spuntiFeed.map((spunto) => {
              const isSaved = savedSpuntiIds.includes(spunto.id);

              return (
                <article
                  key={spunto.id}
                  className="bg-[#EFECE6] dark:bg-[#272422] p-4 sm:p-5 rounded-3xl border border-[#E2DDD2] dark:border-[#36322E] shadow-xs space-y-3.5"
                >
                  {/* Header Autore */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={spunto.autore_avatar}
                        alt={spunto.autore_nome}
                        className="w-9 h-9 rounded-full object-cover ring-2 ring-[#5C6B55]/40"
                      />
                      <div>
                        <h4 className="text-xs font-extrabold text-[#31362F] dark:text-[#E0DCD3]">
                          {spunto.autore_nome}
                        </h4>
                        <span className="text-[10px] text-[#7A756D] dark:text-[#9A9488]">
                          {formatTimeAgo(spunto.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Badge Tipo Spunto */}
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#5C6B55]/15 border border-[#5C6B55]/30 text-[#3B4838] dark:text-[#A8BB9C]">
                      {spunto.tipo_spunto === 'Takeaway' && '💡 Takeaway'}
                      {spunto.tipo_spunto === 'Citazione' && '💬 Citazione'}
                      {spunto.tipo_spunto === 'Recensione' && '⭐ Recensione'}
                      {spunto.tipo_spunto === 'Riflessione' && '🧠 Riflessione'}
                      {!['Takeaway', 'Citazione', 'Recensione', 'Riflessione'].includes(spunto.tipo_spunto) && spunto.tipo_spunto}
                    </span>
                  </div>

                  {/* Libro miniaturizzato */}
                  <div className="p-3 rounded-2xl bg-[#F7F4EE] dark:bg-[#201E1C] border border-[#E8E3D8] dark:border-[#312E2A] flex items-center gap-3">
                    <img
                      src={spunto.libro_copertina || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400'}
                      alt={spunto.libro_titolo}
                      className="w-10 h-14 rounded-lg object-cover border border-[#DCD5C6] dark:border-[#4A4743]/60 shrink-0 shadow-xs"
                    />
                    <div className="min-w-0 flex-1">
                      <h5 className="text-xs font-bold text-[#31362F] dark:text-[#E0DCD3] truncate">
                        {spunto.libro_titolo}
                      </h5>
                      {spunto.libro_autore && (
                        <p className="text-[11px] text-[#7A756D] dark:text-[#9A9488] truncate mt-0.5">
                          {spunto.libro_autore}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Testo dello Spunto */}
                  <p className="text-xs sm:text-sm text-[#4A4743] dark:text-[#D5D0C5] leading-relaxed italic font-serif bg-[#F7F4EE]/50 dark:bg-[#201E1C]/50 p-3 rounded-2xl border border-[#E8E3D8]/50 dark:border-[#312E2A]/50">
                    "{spunto.testo_spunto}"
                  </p>

                  {/* Footer Azioni */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => toggleSaveSpunto(spunto.id)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-[#7A756D] dark:text-[#9A9488] hover:text-[#31362F] dark:hover:text-[#E0DCD3] transition-colors cursor-pointer"
                    >
                      {isSaved ? (
                        <>
                          <BookmarkCheck size={15} className="text-emerald-600 dark:text-emerald-400" />
                          <span className="text-emerald-700 dark:text-emerald-400 font-bold">Salvato</span>
                        </>
                      ) : (
                        <>
                          <BookmarkPlus size={15} />
                          <span>Salva negli appunti</span>
                        </>
                      )}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* MODALE PER "CONDIVIDI UNO SPUNTO" */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative z-10 w-full max-w-lg bg-[#FCFBF8] dark:bg-[#2A2826] rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl border border-[#EBE5D9] dark:border-[#4A4743]/60 max-h-[90vh] overflow-y-auto space-y-4"
            >
              {/* Header Modale */}
              <div className="flex items-center justify-between pb-3 border-b border-[#EBE5D9] dark:border-[#4A4743]/50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#B0BEA9] dark:bg-[#5C6B55] text-[#31362F] dark:text-[#E0DCD3] flex items-center justify-center">
                    <BookOpen size={16} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#4A4743] dark:text-[#E0DCD3]">
                      Condividi uno Spunto
                    </h3>
                    <p className="text-[11px] text-[#7A756D] dark:text-[#A09A90]">
                      Pubblica un takeaway o una citazione per i tuoi amici
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#EBE5D9] dark:bg-[#383532] text-[#4A4743] dark:text-[#E0DCD3] hover:bg-[#DCD5C6] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {publishError && (
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs font-semibold">
                  {publishError}
                </div>
              )}

              <form onSubmit={handlePublishSpunto} className="space-y-4">
                {/* Selezione da Libreria o Inserimento Manuale */}
                {myBooks.length > 0 && (
                  <div>
                    <label className="block text-xs font-bold text-[#7A756D] dark:text-[#A09A90] mb-1">
                      Scegli dalla tua Libreria
                    </label>
                    <select
                      onChange={(e) => {
                        const book = myBooks.find(b => b.id === e.target.value);
                        if (book) {
                          setNewBookTitle(book.title);
                          setNewBookAuthor(book.author);
                          setNewBookCover(book.coverUrl || '');
                        }
                      }}
                      className="w-full px-3.5 py-2.5 rounded-2xl text-xs bg-[#F4F1EA] dark:bg-[#201E1C] text-[#4A4743] dark:text-[#E0DCD3] border border-[#DCD5C6] dark:border-[#4A4743]/60 focus:outline-none"
                    >
                      <option value="">-- Seleziona un tuo libro --</option>
                      {myBooks.map(b => (
                        <option key={b.id} value={b.id}>
                          {b.title} — {b.author}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Titolo Libro */}
                <div>
                  <label className="block text-xs font-bold text-[#7A756D] dark:text-[#A09A90] mb-1">
                    Titolo Libro *
                  </label>
                  <input
                    type="text"
                    required
                    value={newBookTitle}
                    onChange={(e) => setNewBookTitle(e.target.value)}
                    placeholder="es. Dune"
                    className="w-full px-3.5 py-2.5 rounded-2xl text-xs bg-[#F4F1EA] dark:bg-[#201E1C] text-[#4A4743] dark:text-[#E0DCD3] border border-[#DCD5C6] dark:border-[#4A4743]/60 focus:outline-none"
                  />
                </div>

                {/* Autore Libro */}
                <div>
                  <label className="block text-xs font-bold text-[#7A756D] dark:text-[#A09A90] mb-1">
                    Autore (opzionale)
                  </label>
                  <input
                    type="text"
                    value={newBookAuthor}
                    onChange={(e) => setNewBookAuthor(e.target.value)}
                    placeholder="es. Frank Herbert"
                    className="w-full px-3.5 py-2.5 rounded-2xl text-xs bg-[#F4F1EA] dark:bg-[#201E1C] text-[#4A4743] dark:text-[#E0DCD3] border border-[#DCD5C6] dark:border-[#4A4743]/60 focus:outline-none"
                  />
                </div>

                {/* Tipo Spunto */}
                <div>
                  <label className="block text-xs font-bold text-[#7A756D] dark:text-[#A09A90] mb-1">
                    Tipo di Spunto
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(['Takeaway', 'Citazione', 'Recensione', 'Riflessione'] as const).map((tipo) => (
                      <button
                        key={tipo}
                        type="button"
                        onClick={() => setNewTipoSpunto(tipo)}
                        className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                          newTipoSpunto === tipo
                            ? 'bg-[#5C6B55] text-white border-[#5C6B55]'
                            : 'bg-[#F4F1EA] dark:bg-[#201E1C] text-[#7A756D] dark:text-[#A09A90] border-[#DCD5C6] dark:border-[#4A4743]/60'
                        }`}
                      >
                        {tipo}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Testo Spunto */}
                <div>
                  <label className="block text-xs font-bold text-[#7A756D] dark:text-[#A09A90] mb-1">
                    Testo dello Spunto / Riflessione *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={newTestoSpunto}
                    onChange={(e) => setNewTestoSpunto(e.target.value)}
                    placeholder="Scrivi qui la tua riflessione, la citazione che ti ha colpito o l'insegnamento estratto dal libro..."
                    className="w-full p-3.5 rounded-2xl text-xs bg-[#F4F1EA] dark:bg-[#201E1C] text-[#4A4743] dark:text-[#E0DCD3] border border-[#DCD5C6] dark:border-[#4A4743]/60 focus:outline-none resize-none font-serif"
                  />
                </div>

                {/* Tasto Invia */}
                <button
                  type="submit"
                  disabled={isPublishing || !newBookTitle.trim() || !newTestoSpunto.trim()}
                  className="w-full py-3 bg-[#5C6B55] hover:bg-[#4D5A46] disabled:opacity-50 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer border border-[#788C71]"
                >
                  {isPublishing ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Pubblicazione in corso...</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Pubblica Spunto</span>
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
