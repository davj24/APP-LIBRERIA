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
  BookmarkPlus,
  Globe,
  Share2,
  Link,
  HelpCircle,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import {
  socialService,
  type UserProfileSocial,
  type SpuntoSocial,
  type PendingFriendRequest
} from '../../infrastructure/services/socialService';
import { useBooks } from '../hooks/useBooks';
import { useUserProfile } from '../hooks/useUserProfile';
import { useRegisterModal } from '../context/ModalContext';

export const SocialPage: React.FC = () => {
  const { profile } = useUserProfile();
  const userFirstName = profile?.name ? profile.name.split(' ')[0] : 'Lettore';

  // Tab attivo: 'amici' (default e primario) oppure 'globale' (secondario)
  const [activeTab, setActiveTab] = useState<'amici' | 'globale'>('amici');

  // Stati Amici e Ricerca Utenti
  const [friendsList, setFriendsList] = useState<UserProfileSocial[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingFriendRequest[]>([]);
  const [suggestedReaders, setSuggestedReaders] = useState<UserProfileSocial[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfileSocial[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [sendingRequestTo, setSendingRequestTo] = useState<string | null>(null);

  // Stato Invito Amici
  const [inviteCopied, setInviteCopied] = useState(false);

  // Stato Modale "Chiedi un Consiglio"
  const [isAdviceModalOpen, setIsAdviceModalOpen] = useState(false);
  const [adviceGenre, setAdviceGenre] = useState('');
  const [adviceNote, setAdviceNote] = useState('');
  const [adviceSent, setAdviceSent] = useState(false);

  // Stati Feed Spunti Social
  const [spuntiFeed, setSpuntiFeed] = useState<SpuntoSocial[]>([]);
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);
  const [savedSpuntiIds, setSavedSpuntiIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('bibliodesk_saved_spunti_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

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
  useRegisterModal(isCreateModalOpen || isAdviceModalOpen);

  // Caricamento Iniziale Amici, Suggeriti, Richieste e Feed da Supabase
  useEffect(() => {
    loadSocialData();
  }, []);

  const loadSocialData = async () => {
    setIsLoadingFeed(true);
    try {
      const [friendsData, feedData, suggestedData, pendingData] = await Promise.all([
        socialService.getFriends(),
        socialService.getSpuntiFeed(),
        socialService.getSuggestedUsers(),
        socialService.getPendingFriendRequests()
      ]);
      setFriendsList(friendsData);
      setSpuntiFeed(feedData);
      setSuggestedReaders(suggestedData);
      setPendingRequests(pendingData);
    } catch (err) {
      console.warn('Errore durante il caricamento dei dati social Supabase:', err);
    } finally {
      setIsLoadingFeed(false);
    }
  };

  // Ricerca Utenti in tempo reale
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

  // Invio Richiesta Amicizia (Anti-crash / Aggiornamento ottimistico)
  const handleSendFriendRequest = async (targetUserId: string) => {
    setSendingRequestTo(targetUserId);
    try {
      await socialService.sendFriendRequest(targetUserId);
      setSearchResults(prev =>
        prev.map(u => (u.id === targetUserId ? { ...u, friendshipState: 'in_attesa' } : u))
      );
      // Ricarica la lista per verificare se è già auto-accettata
      setTimeout(() => loadSocialData(), 600);
    } catch (err: any) {
      console.warn('Errore non bloccante invio amicizia:', err);
      setSearchResults(prev =>
        prev.map(u => (u.id === targetUserId ? { ...u, friendshipState: 'in_attesa' } : u))
      );
    } finally {
      setSendingRequestTo(null);
    }
  };

  // Accetta Richiesta di Amicizia
  const handleAcceptFriendRequest = async (req: PendingFriendRequest) => {
    try {
      await socialService.acceptFriendRequest(req.id);
      setPendingRequests(prev => prev.filter(r => r.id !== req.id));
      await loadSocialData();
    } catch (err) {
      console.error('Errore accettazione amicizia:', err);
    }
  };

  // Rifiuta Richiesta di Amicizia
  const handleRejectFriendRequest = async (req: PendingFriendRequest) => {
    try {
      await socialService.rejectFriendRequest(req.id);
      setPendingRequests(prev => prev.filter(r => r.id !== req.id));
    } catch (err) {
      console.error('Errore rifiuto amicizia:', err);
    }
  };

  // Invita Amici con Web Share o Clipboard
  const handleInviteFriends = async () => {
    const shareText = "Unisciti a me su Libreria per condividere i nostri progressi di lettura, le sfide di streak e i migliori spunti dai libri! 📚✨";
    const shareUrl = window.location.origin;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Libreria — BiblioSocial',
          text: shareText,
          url: shareUrl,
        });
      } catch (e) {
        console.log('Share dismissed', e);
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        setInviteCopied(true);
        setTimeout(() => setInviteCopied(false), 2500);
      } catch (err) {
        alert('Impossibile copiare il link di invito.');
      }
    }
  };



  // Invia richiesta di consiglio
  const handleSendAdviceRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setAdviceSent(true);
    setTimeout(() => {
      setIsAdviceModalOpen(false);
      setAdviceSent(false);
      setAdviceGenre('');
      setAdviceNote('');
    }, 1800);
  };

  // Pubblicazione Nuovo Spunto Social
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
    setSavedSpuntiIds(prev => {
      const updated = prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id];
      try {
        localStorage.setItem('bibliodesk_saved_spunti_v1', JSON.stringify(updated));
      } catch (e) {
        console.warn('Errore salvataggio bookmark spunti:', e);
      }
      return updated;
    });
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
            La tua cerchia di lettori, amici e condivisione
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

      {/* SELETTORE TAB: I MIEI AMICI (PRIMARIO) vs COMMUNITY GLOBALE (SECONDARIO) */}
      <div className="flex items-center p-1 bg-[#EFECE6] dark:bg-[#272422] rounded-2xl border border-[#E2DDD2] dark:border-[#36322E] shadow-xs">
        <button
          onClick={() => setActiveTab('amici')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'amici'
              ? 'bg-[#5C6B55] text-white shadow-sm'
              : 'text-[#7A756D] dark:text-[#9A9488] hover:text-[#31362F] dark:hover:text-[#E0DCD3]'
          }`}
        >
          <Users size={15} />
          <span>I Miei Amici</span>
          {friendsList.length > 0 && (
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeTab === 'amici' ? 'bg-white/20 text-white' : 'bg-[#5C6B55]/15 text-[#5C6B55] dark:text-[#A8BB9C]'
            }`}>
              {friendsList.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('globale')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'globale'
              ? 'bg-[#5C6B55] text-white shadow-sm'
              : 'text-[#7A756D] dark:text-[#9A9488] hover:text-[#31362F] dark:hover:text-[#E0DCD3]'
          }`}
        >
          <Globe size={15} />
          <span>Community Globale</span>
        </button>
      </div>

      {/* TAB 1: I MIEI AMICI (FOCUS PRIMARIO) */}
      {activeTab === 'amici' && (
        <div className="space-y-6">

          {/* CASO A: ZERO AMICI (EMPTY STATE FOCALIZZATO SUGLI AMICI) */}
          {friendsList.length === 0 ? (
            <div className="space-y-5">

              {/* NOTIFICA RICHIESTE DI AMICIZIA RICEVUTE */}
              {pendingRequests.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-3xl border border-amber-200 dark:border-amber-800/50 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                      <UserCheck size={16} className="text-amber-600 dark:text-amber-400" />
                      <span>Richieste di Amicizia Ricevute ({pendingRequests.length})</span>
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {pendingRequests.map((req) => (
                      <div
                        key={req.id}
                        className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-[#201E1C] border border-amber-100 dark:border-neutral-800"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {req.fromUser.avatar_url ? (
                            <img
                              src={req.fromUser.avatar_url}
                              alt={req.fromUser.nome_completo}
                              className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-500/40 shrink-0"
                            />
                          ) : (
                            <div className={`w-10 h-10 rounded-full ${req.fromUser.avatar_color?.startsWith('bg-') ? req.fromUser.avatar_color : `bg-gradient-to-tr ${req.fromUser.avatar_color || 'from-indigo-600 to-violet-600'}`} flex items-center justify-center text-xs font-black text-white shrink-0 shadow-2xs`}>
                              {req.fromUser.nome_completo ? req.fromUser.nome_completo.trim().charAt(0).toUpperCase() : 'L'}
                            </div>
                          )}
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-[#31362F] dark:text-[#E0DCD3] truncate">
                              {req.fromUser.nome_completo}
                            </h4>
                            <p className="text-[10px] text-[#7A756D] dark:text-[#9A9488] truncate">
                              @{req.fromUser.username}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleAcceptFriendRequest(req)}
                            className="px-3 py-1.5 bg-[#5C6B55] hover:bg-[#4D5A46] text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition-all active:scale-95 cursor-pointer"
                            title="Accetta amicizia"
                          >
                            <Check size={14} />
                            <span>Accetta</span>
                          </button>
                          <button
                            onClick={() => handleRejectFriendRequest(req)}
                            className="p-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-neutral-700 dark:hover:text-white transition-colors cursor-pointer"
                            title="Rifiuta richiesta"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* HERO BANNER DI BENVENUTO PERSONALE */}
              <div className="relative overflow-hidden bg-gradient-to-br from-[#5C6B55] to-[#455240] dark:from-[#384334] dark:to-[#252C22] text-white p-5 sm:p-6 rounded-3xl shadow-xl space-y-2 border border-[#788C71]/40">
                <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
                    <Users size={16} />
                  </div>
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#E0E9DC]">
                    La tua cerchia social
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black leading-tight text-white">
                  Ciao, {userFirstName}! 👋
                </h2>
                <p className="text-xs text-[#E0E9DC] leading-relaxed">
                  Connetti i tuoi amici per scoprire cosa stanno leggendo in tempo reale, confrontare le streak di lettura e condividere i migliori spunti dai libri.
                </p>
              </div>

              {/* CARD INVITA AMICI (QUICK SHARE) */}
              <div className="bg-[#EFECE6] dark:bg-[#272422] p-5 rounded-3xl border border-[#E2DDD2] dark:border-[#36322E] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#5C6B55]/15 dark:bg-[#A8BB9C]/15 text-[#5C6B55] dark:text-[#A8BB9C] flex items-center justify-center shrink-0">
                    <Share2 size={20} />
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold text-[#31362F] dark:text-[#E0DCD3]">
                      Invita i tuoi amici di lettura
                    </h3>
                    <p className="text-[11px] text-[#7A756D] dark:text-[#9A9488]">
                      Invia un invito rapido via WhatsApp, Telegram o social
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleInviteFriends}
                  className="w-full sm:w-auto px-4 py-2.5 bg-[#5C6B55] hover:bg-[#4D5A46] text-white text-xs font-bold rounded-2xl shadow-sm transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 shrink-0 border border-[#788C71]"
                >
                  {inviteCopied ? (
                    <>
                      <Check size={15} />
                      <span>Link Copiato!</span>
                    </>
                  ) : (
                    <>
                      <Link size={15} />
                      <span>Condividi Invito</span>
                    </>
                  )}
                </button>
              </div>

              {/* SCHEDA "CERCA & LETTORI CONSIGLIATI" */}
              <section className="bg-[#EFECE6] dark:bg-[#272422] p-5 rounded-3xl border border-[#E2DDD2] dark:border-[#36322E] shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#7A756D] dark:text-[#9A9488] flex items-center gap-1.5">
                    <Search size={15} className="text-[#5C6B55] dark:text-[#A8BB9C]" />
                    Cerca o Aggiungi Lettori
                  </h3>
                </div>

                {/* Input Ricerca */}
                <div className="relative flex items-center">
                  <Search className="absolute left-3.5 w-4 h-4 text-[#7A756D] dark:text-[#9A9488] pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cerca per username o nome..."
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F7F4EE] dark:bg-[#201E1C] text-xs font-semibold text-[#31362F] dark:text-[#E0DCD3] placeholder-[#9E988F] rounded-2xl border border-[#E2DDD2] dark:border-[#36322E] focus:outline-none focus:ring-2 focus:ring-[#5C6B55] transition-all"
                  />
                  {isSearching && (
                    <Loader2 className="absolute right-3.5 w-4 h-4 text-[#5C6B55] animate-spin" />
                  )}
                </div>

                {/* Se search active: mostra risultati ricerca */}
                {searchQuery.trim().length > 0 ? (
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
                            {user.avatar_url ? (
                              <img
                                src={user.avatar_url}
                                alt={user.nome_completo}
                                className="w-9 h-9 rounded-full object-cover ring-2 ring-[#5C6B55]/30 shrink-0"
                              />
                            ) : (
                              <div className={`w-9 h-9 rounded-full ${user.avatar_color?.startsWith('bg-') ? user.avatar_color : `bg-gradient-to-tr ${user.avatar_color || 'from-indigo-600 to-violet-600'}`} flex items-center justify-center text-xs font-black text-white shrink-0 shadow-2xs`}>
                                {user.nome_completo ? user.nome_completo.trim().charAt(0).toUpperCase() : 'L'}
                              </div>
                            )}
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
                ) : (
                  /* Se search vuota: mostra LETTORI CONSIGLIATI (se presenti su Supabase) */
                  suggestedReaders.length > 0 ? (
                    <div className="space-y-3 pt-2">
                      <span className="text-[11px] font-extrabold text-[#5C6B55] dark:text-[#A8BB9C] uppercase tracking-wider block">
                        Lettori Consigliati per te
                      </span>
                      <div className="space-y-2.5">
                        {suggestedReaders.map((reader) => (
                          <div
                            key={reader.id}
                            className="flex items-center justify-between p-3 rounded-2xl bg-[#F7F4EE] dark:bg-[#201E1C] border border-[#E8E3D8] dark:border-[#312E2A]"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              {reader.avatar_url ? (
                                <img
                                  src={reader.avatar_url}
                                  alt={reader.nome_completo}
                                  className="w-10 h-10 rounded-full object-cover ring-2 ring-[#5C6B55]/40 shrink-0"
                                />
                              ) : (
                                <div className={`w-10 h-10 rounded-full ${reader.avatar_color?.startsWith('bg-') ? reader.avatar_color : `bg-gradient-to-tr ${reader.avatar_color || 'from-indigo-600 to-violet-600'}`} flex items-center justify-center text-xs font-black text-white shrink-0 shadow-2xs`}>
                                  {reader.nome_completo ? reader.nome_completo.trim().charAt(0).toUpperCase() : 'L'}
                                </div>
                              )}
                              <div className="min-w-0">
                                <h4 className="text-xs font-extrabold text-[#31362F] dark:text-[#E0DCD3] truncate">
                                  {reader.nome_completo}
                                </h4>
                                <p className="text-[10px] text-[#7A756D] dark:text-[#9A9488] truncate">
                                  @{reader.username}
                                </p>
                              </div>
                            </div>

                            {reader.friendshipState === 'accettata' ? (
                              <span className="px-3 py-1.5 bg-[#D8E2D5] dark:bg-[#3B4838] text-[#2D382B] dark:text-[#E0DCD3] rounded-xl text-[11px] font-bold border border-[#B0BEA9]">
                                <Check size={13} />
                                Amico
                              </span>
                            ) : reader.friendshipState === 'in_attesa' ? (
                              <span className="px-3 py-1.5 bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-xl text-[11px] font-bold border border-amber-500/30 flex items-center gap-1">
                                <Check size={13} />
                                Inviata
                              </span>
                            ) : (
                              <button
                                onClick={() => handleSendFriendRequest(reader.id)}
                                disabled={sendingRequestTo === reader.id}
                                className="px-3.5 py-1.5 bg-[#5C6B55] hover:bg-[#4D5A46] text-white rounded-xl text-[11px] font-bold flex items-center gap-1 shadow-xs active:scale-95 transition-all cursor-pointer shrink-0 disabled:opacity-50"
                              >
                                {sendingRequestTo === reader.id ? (
                                  <Loader2 size={13} className="animate-spin" />
                                ) : (
                                  <UserPlus size={13} />
                                )}
                                <span>Aggiungi</span>
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null
                )}
              </section>



              {/* CALLOUT AL FEED GLOBALE SECONDARIO */}
              <div className="bg-[#F7F4EE] dark:bg-[#201E1C] p-4 rounded-3xl border border-[#E2DDD2] dark:border-[#36322E] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Globe size={16} className="text-[#5C6B55] dark:text-[#A8BB9C]" />
                  <span className="text-xs text-[#7A756D] dark:text-[#9A9488] font-medium">
                    Vuoi sfogliare gli spunti di tutta la community?
                  </span>
                </div>
                <button
                  onClick={() => setActiveTab('globale')}
                  className="text-xs font-extrabold text-[#5C6B55] dark:text-[#A8BB9C] hover:underline flex items-center gap-0.5 cursor-pointer shrink-0"
                >
                  <span>Esplora Globale</span>
                  <ChevronRight size={14} />
                </button>
              </div>

            </div>
          ) : (
            /* CASO B: L'UTENTE HA AMICI CONNESSI */
            <div className="space-y-6">

              {/* NOTIFICA RICHIESTE DI AMICIZIA RICEVUTE */}
              {pendingRequests.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-3xl border border-amber-200 dark:border-amber-800/50 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                      <UserCheck size={16} className="text-amber-600 dark:text-amber-400" />
                      <span>Richieste di Amicizia Ricevute ({pendingRequests.length})</span>
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {pendingRequests.map((req) => (
                      <div
                        key={req.id}
                        className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-[#201E1C] border border-amber-100 dark:border-neutral-800"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {req.fromUser.avatar_url ? (
                            <img
                              src={req.fromUser.avatar_url}
                              alt={req.fromUser.nome_completo}
                              className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-500/40 shrink-0"
                            />
                          ) : (
                            <div className={`w-10 h-10 rounded-full ${req.fromUser.avatar_color?.startsWith('bg-') ? req.fromUser.avatar_color : `bg-gradient-to-tr ${req.fromUser.avatar_color || 'from-indigo-600 to-violet-600'}`} flex items-center justify-center text-xs font-black text-white shrink-0 shadow-2xs`}>
                              {req.fromUser.nome_completo ? req.fromUser.nome_completo.trim().charAt(0).toUpperCase() : 'L'}
                            </div>
                          )}
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-[#31362F] dark:text-[#E0DCD3] truncate">
                              {req.fromUser.nome_completo}
                            </h4>
                            <p className="text-[10px] text-[#7A756D] dark:text-[#9A9488] truncate">
                              @{req.fromUser.username}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleAcceptFriendRequest(req)}
                            className="px-3 py-1.5 bg-[#5C6B55] hover:bg-[#4D5A46] text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition-all active:scale-95 cursor-pointer"
                            title="Accetta amicizia"
                          >
                            <Check size={14} />
                            <span>Accetta</span>
                          </button>
                          <button
                            onClick={() => handleRejectFriendRequest(req)}
                            className="p-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-neutral-700 dark:hover:text-white transition-colors cursor-pointer"
                            title="Rifiuta richiesta"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* BARRA "CERCA AMICI" */}
              <section className="bg-[#EFECE6] dark:bg-[#272422] p-4 rounded-3xl border border-[#E2DDD2] dark:border-[#36322E] space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#7A756D] dark:text-[#9A9488] flex items-center gap-1.5">
                    <Users size={15} className="text-[#5C6B55] dark:text-[#A8BB9C]" />
                    I Tuoi Amici ({friendsList.length})
                  </h2>
                </div>

                <div className="relative flex items-center">
                  <Search className="absolute left-3.5 w-4 h-4 text-[#7A756D] dark:text-[#9A9488] pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cerca altri utenti per username o nome..."
                    className="w-full pl-10 pr-4 py-2 bg-[#F7F4EE] dark:bg-[#201E1C] text-xs font-semibold text-[#31362F] dark:text-[#E0DCD3] placeholder-[#9E988F] rounded-2xl border border-[#E2DDD2] dark:border-[#36322E] focus:outline-none"
                  />
                  {isSearching && (
                    <Loader2 className="absolute right-3.5 w-4 h-4 text-[#5C6B55] animate-spin" />
                  )}
                </div>

                {/* Risultati ricerca in Caso B */}
                {searchQuery.trim().length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-[#E2DDD2] dark:border-[#36322E]">
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
                            {user.avatar_url ? (
                              <img
                                src={user.avatar_url}
                                alt={user.nome_completo}
                                className="w-9 h-9 rounded-full object-cover ring-2 ring-[#5C6B55]/30 shrink-0"
                              />
                            ) : (
                              <div className={`w-9 h-9 rounded-full ${user.avatar_color?.startsWith('bg-') ? user.avatar_color : `bg-gradient-to-tr ${user.avatar_color || 'from-indigo-600 to-violet-600'}`} flex items-center justify-center text-xs font-black text-white shrink-0 shadow-2xs`}>
                                {user.nome_completo ? user.nome_completo.trim().charAt(0).toUpperCase() : 'L'}
                              </div>
                            )}
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

              {/* RIGA AMICI CONNESSI */}
              <section className="space-y-2">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#7A756D] dark:text-[#9A9488]">
                  Amici Connessi
                </h3>
                <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar">
                  {friendsList.map((friend) => (
                    <div key={friend.id} className="flex flex-col items-center gap-1 shrink-0">
                      {friend.avatar_url ? (
                        <img
                          src={friend.avatar_url}
                          alt={friend.nome_completo}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-[#5C6B55]/50 shadow-xs"
                        />
                      ) : (
                        <div className={`w-12 h-12 rounded-full ${friend.avatar_color?.startsWith('bg-') ? friend.avatar_color : `bg-gradient-to-tr ${friend.avatar_color || 'from-indigo-600 to-violet-600'}`} flex items-center justify-center text-sm font-black text-white ring-2 ring-[#5C6B55]/50 shadow-xs`}>
                          {friend.nome_completo ? friend.nome_completo.trim().charAt(0).toUpperCase() : 'A'}
                        </div>
                      )}
                      <span className="text-[11px] font-bold text-[#31362F] dark:text-[#E0DCD3] truncate max-w-[65px]">
                        {friend.nome_completo.split(' ')[0]}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {/* FEED SPUNTI DEGLI AMICI */}
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#7A756D] dark:text-[#9A9488] flex items-center gap-1.5">
                    <MessageSquareQuote size={15} className="text-[#5C6B55]" />
                    Attività e Spunti Amici
                  </h3>
                  <button
                    onClick={() => setIsAdviceModalOpen(true)}
                    className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-[11px] font-bold shadow-xs active:scale-95 transition-all cursor-pointer flex items-center gap-1"
                  >
                    <HelpCircle size={13} />
                    <span>Chiedi Consiglio</span>
                  </button>
                </div>
                {spuntiFeed.length === 0 ? (
                  <div className="p-6 rounded-3xl bg-[#EFECE6] dark:bg-[#272422] text-center text-xs text-[#7A756D]">
                    I tuoi amici non hanno ancora pubblicato spunti. Pubblicane uno tu!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {spuntiFeed.map((spunto) => (
                      <article
                        key={spunto.id}
                        className="bg-[#EFECE6] dark:bg-[#272422] p-4 sm:p-5 rounded-3xl border border-[#E2DDD2] dark:border-[#36322E] shadow-xs space-y-3"
                      >
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
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#5C6B55]/15 border border-[#5C6B55]/30 text-[#3B4838] dark:text-[#A8BB9C]">
                            {spunto.tipo_spunto}
                          </span>
                        </div>

                        <div className="p-3 rounded-2xl bg-[#F7F4EE] dark:bg-[#201E1C] border border-[#E8E3D8] dark:border-[#312E2A] flex items-center gap-3">
                          <img
                            src={spunto.libro_copertina || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400'}
                            alt={spunto.libro_titolo}
                            className="w-10 h-14 rounded-lg object-cover border border-[#DCD5C6] dark:border-[#4A4743]/60 shrink-0"
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

                        <p className="text-xs text-[#4A4743] dark:text-[#D5D0C5] leading-relaxed italic font-serif bg-[#F7F4EE]/50 dark:bg-[#201E1C]/50 p-3 rounded-2xl">
                          "{spunto.testo_spunto}"
                        </p>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

        </div>
      )}

      {/* TAB 2: COMMUNITY GLOBALE (SECONDARIO E SU RICHIESTA) */}
      {activeTab === 'globale' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#EFECE6] dark:bg-[#272422] border border-[#E2DDD2] dark:border-[#36322E]">
            <div className="flex items-center gap-2">
              <Globe size={16} className="text-[#5C6B55] dark:text-[#A8BB9C]" />
              <span className="text-xs font-extrabold text-[#31362F] dark:text-[#E0DCD3]">
                Feed Spunti della Community Globale
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAdviceModalOpen(true)}
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-[11px] font-bold shadow-xs active:scale-95 transition-all cursor-pointer flex items-center gap-1"
              >
                <HelpCircle size={13} />
                <span>Chiedi Consiglio</span>
              </button>
              <button
                onClick={() => setActiveTab('amici')}
                className="text-[11px] font-bold text-[#5C6B55] dark:text-[#A8BB9C] hover:underline cursor-pointer"
              >
                Torna ai miei amici
              </button>
            </div>
          </div>

          {isLoadingFeed ? (
            <div className="flex flex-col items-center justify-center py-10 text-[#7A756D] space-y-2">
              <Loader2 size={28} className="animate-spin text-[#5C6B55]" />
              <p className="text-xs font-semibold">Caricamento spunti della community...</p>
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

                    {/* Testo Spunto */}
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
      )}

      {/* MODALE "CHIEDI UN CONSIGLIO DI LETTURA" */}
      <AnimatePresence>
        {isAdviceModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdviceModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative z-10 w-full max-w-lg bg-[#FCFBF8] dark:bg-[#2A2826] rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl border border-[#EBE5D9] dark:border-[#4A4743]/60 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#EBE5D9] dark:border-[#4A4743]/50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                    <HelpCircle size={16} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#4A4743] dark:text-[#E0DCD3]">
                      Richiedi un Consiglio di Lettura
                    </h3>
                    <p className="text-[11px] text-[#7A756D] dark:text-[#A09A90]">
                      Fatti consigliare un buon libro dai tuoi compagni
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAdviceModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#EBE5D9] dark:bg-[#383532] text-[#4A4743] dark:text-[#E0DCD3] hover:bg-[#DCD5C6] flex items-center justify-center cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {adviceSent ? (
                <div className="py-8 text-center space-y-2">
                  <div className="w-12 h-12 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                    <Check size={24} />
                  </div>
                  <h4 className="text-sm font-bold text-[#31362F] dark:text-[#E0DCD3]">
                    Richiesta di Consiglio Inviata!
                  </h4>
                  <p className="text-xs text-[#7A756D] dark:text-[#9A9488]">
                    I tuoi amici e lettori vedranno la tua richiesta.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSendAdviceRequest} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#7A756D] dark:text-[#A09A90] mb-1">
                      Genere o Argomento desiderato
                    </label>
                    <input
                      type="text"
                      required
                      value={adviceGenre}
                      onChange={(e) => setAdviceGenre(e.target.value)}
                      placeholder="es. Sci-Fi, Saggistica, Gialli storici..."
                      className="w-full px-3.5 py-2.5 rounded-2xl text-xs bg-[#F4F1EA] dark:bg-[#201E1C] text-[#4A4743] dark:text-[#E0DCD3] border border-[#DCD5C6] dark:border-[#4A4743]/60 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#7A756D] dark:text-[#A09A90] mb-1">
                      Cosa stai cercando esattamente?
                    </label>
                    <textarea
                      rows={3}
                      value={adviceNote}
                      onChange={(e) => setAdviceNote(e.target.value)}
                      placeholder="es. Cerco un libro scorrevole da leggere durante le vacanze, simile agli ultimi romanzi di Ken Follett..."
                      className="w-full p-3.5 rounded-2xl text-xs bg-[#F4F1EA] dark:bg-[#201E1C] text-[#4A4743] dark:text-[#E0DCD3] border border-[#DCD5C6] dark:border-[#4A4743]/60 focus:outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer"
                  >
                    <Send size={16} />
                    <span>Invia Richiesta</span>
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
