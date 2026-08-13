import React, { useState } from 'react';
import { 
  Users, MessageSquare, Plus, Flame, 
  HeartHandshake, Gift, Globe, Lock
} from 'lucide-react';
import { AccountabilityPartnerCard } from '../components/social/AccountabilityPartnerCard';
import { LivePresenceWidget } from '../components/social/LivePresenceWidget';
import { LoanInventoryCard } from '../components/social/LoanInventoryCard';
import { TakeawayCard } from '../components/social/TakeawayCard';
import { CreateTakeawayModal } from '../components/social/CreateTakeawayModal';
import { SecretWishlistCard } from '../components/social/SecretWishlistCard';
import { 
  INITIAL_ACCOUNTABILITY_PARTNER,
  INITIAL_LIVE_PRESENCES,
  INITIAL_BOOK_LOANS,
  INITIAL_TAKEAWAYS,
  INITIAL_SECRET_WISHLIST
} from '../../infrastructure/mock/mockSocialData';
import type { 
  AccountabilityPartner, 
  BookLoan, 
  BookTakeaway, 
  LivePresence, 
  SecretWishlistItem, 
  PrivacyLevel 
} from '../../domain/models/social';
import { useBooks } from '../hooks/useBooks';

export type SocialSubTab = 'takeaways' | 'patto' | 'prestiti' | 'wishlist';

export const SocialPage: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<SocialSubTab>('takeaways');

  // Stato 1: Patto di Costanza
  const [partnerData, setPartnerData] = useState<AccountabilityPartner>(INITIAL_ACCOUNTABILITY_PARTNER);

  // Stato 2: Presenza Live & Ping
  const [presences, setPresences] = useState<LivePresence[]>(INITIAL_LIVE_PRESENCES);

  // Stato 3: Prestiti
  const [loans, setLoans] = useState<BookLoan[]>(INITIAL_BOOK_LOANS);

  // Stato 4: Takeaways & Rating
  const [takeaways, setTakeaways] = useState<BookTakeaway[]>(INITIAL_TAKEAWAYS);
  const [privacyFilter, setPrivacyFilter] = useState<'all' | 'public' | 'friends' | 'private'>('all');
  const [isCreateTakeawayOpen, setIsCreateTakeawayOpen] = useState(false);

  // Stato 5: Wishlist Regali Segreti
  const [wishlist, setWishlist] = useState<SecretWishlistItem[]>(INITIAL_SECRET_WISHLIST);
  const [isFriendViewMode, setIsFriendViewMode] = useState(true);

  const { books: userBooks } = useBooks();

  // Handlers
  const handleCheckInToday = () => {
    setPartnerData(prev => ({
      ...prev,
      userReadToday: true,
      streakDays: prev.partnerReadToday ? prev.streakDays + 1 : prev.streakDays
    }));
  };

  const handleSendPing = (presenceId: string, emoji: string) => {
    setPresences(prev => prev.map(p => {
      if (p.id !== presenceId) return p;
      return { ...p, lastPingEmoji: emoji, lastPingFrom: 'Davide' };
    }));
  };

  const handleUpdateLoanStatus = (loanId: string, newStatus: 'in_prestito' | 'restituito') => {
    setLoans(prev => prev.map(l => {
      if (l.id !== loanId) return l;
      return { ...l, status: newStatus };
    }));
  };

  const handleLikeTakeaway = (takeawayId: string) => {
    setTakeaways(prev => prev.map(t => {
      if (t.id !== takeawayId) return t;
      return {
        ...t,
        isLiked: !t.isLiked,
        likesCount: t.isLiked ? t.likesCount - 1 : t.likesCount + 1
      };
    }));
  };

  const handleCreateTakeaway = (takeawayData: {
    bookTitle: string;
    bookAuthor: string;
    rating: number;
    content: string;
    privacy: PrivacyLevel;
  }) => {
    const newTakeaway: BookTakeaway = {
      id: `takeaway-${Date.now()}`,
      userId: 'user-davide',
      userName: 'Davide Belluzzo (Tu)',
      userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
      bookTitle: takeawayData.bookTitle,
      bookAuthor: takeawayData.bookAuthor,
      rating: takeawayData.rating,
      content: takeawayData.content,
      privacy: takeawayData.privacy,
      likesCount: 0,
      isLiked: false,
      createdAt: 'Proprio ora'
    };

    setTakeaways(prev => [newTakeaway, ...prev]);
  };

  const handleToggleReserveWishlist = (itemId: string) => {
    setWishlist(prev => prev.map(w => {
      if (w.id !== itemId) return w;
      const nextReserved = !w.isReservedByFriend;
      return {
        ...w,
        isReservedByFriend: nextReserved,
        reservedByUserName: nextReserved ? 'Elena Rostagno' : undefined
      };
    }));
  };

  // Filtra Takeaways
  const filteredTakeaways = takeaways.filter(t => {
    if (privacyFilter === 'all') return true;
    return t.privacy === privacyFilter;
  });

  return (
    <div className="space-y-4 animate-in fade-in duration-200 pb-24">
      {/* Header BiblioSocial */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-[#31362F] dark:text-[#E0DCD3] flex items-center gap-2">
            <Users className="w-6 h-6 text-[#5C6B55] dark:text-[#B0BEA9]" />
            BiblioSocial
          </h2>
          <p className="text-xs text-[#7A756D] dark:text-[#A09A90]">
            Interazione pragmatica, patto di costanza e prestiti
          </p>
        </div>

        {activeSubTab === 'takeaways' && (
          <button
            onClick={() => setIsCreateTakeawayOpen(true)}
            className="px-3.5 py-2 rounded-2xl bg-[#B0BEA9] dark:bg-[#5C6B55] text-[#31362F] dark:text-[#E0DCD3] text-xs font-extrabold flex items-center gap-1.5 shadow-md hover:bg-[#A0AF99] transition-transform active:scale-95 cursor-pointer shrink-0"
          >
            <Plus size={16} />
            <span>Nuovo Takeaway</span>
          </button>
        )}
      </div>

      {/* Sub-Navigation Tabs (4 Moduli Pragmatici) */}
      <div className="bg-[#EBE5D9] dark:bg-[#383532] p-1 rounded-2xl flex items-center gap-1 border border-[#DCD5C6] dark:border-[#4A4743]/60 transition-colors overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveSubTab('takeaways')}
          className={`flex-1 py-2 px-3 rounded-xl text-[11px] font-extrabold transition-all flex items-center justify-center gap-1 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'takeaways'
              ? 'bg-[#B0BEA9] dark:bg-[#5C6B55] text-[#31362F] dark:text-[#E0DCD3] shadow-xs'
              : 'text-[#7A756D] dark:text-[#A09A90] hover:text-[#31362F] dark:hover:text-[#E0DCD3]'
          }`}
        >
          <MessageSquare size={14} />
          <span>Takeaway & Rating</span>
        </button>

        <button
          onClick={() => setActiveSubTab('patto')}
          className={`flex-1 py-2 px-3 rounded-xl text-[11px] font-extrabold transition-all flex items-center justify-center gap-1 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'patto'
              ? 'bg-[#B0BEA9] dark:bg-[#5C6B55] text-[#31362F] dark:text-[#E0DCD3] shadow-xs'
              : 'text-[#7A756D] dark:text-[#A09A90] hover:text-[#31362F] dark:hover:text-[#E0DCD3]'
          }`}
        >
          <Flame size={14} />
          <span>Patto & Live</span>
        </button>

        <button
          onClick={() => setActiveSubTab('prestiti')}
          className={`flex-1 py-2 px-3 rounded-xl text-[11px] font-extrabold transition-all flex items-center justify-center gap-1 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'prestiti'
              ? 'bg-[#B0BEA9] dark:bg-[#5C6B55] text-[#31362F] dark:text-[#E0DCD3] shadow-xs'
              : 'text-[#7A756D] dark:text-[#A09A90] hover:text-[#31362F] dark:hover:text-[#E0DCD3]'
          }`}
        >
          <HeartHandshake size={14} />
          <span>Prestiti</span>
        </button>

        <button
          onClick={() => setActiveSubTab('wishlist')}
          className={`flex-1 py-2 px-3 rounded-xl text-[11px] font-extrabold transition-all flex items-center justify-center gap-1 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'wishlist'
              ? 'bg-[#B0BEA9] dark:bg-[#5C6B55] text-[#31362F] dark:text-[#E0DCD3] shadow-xs'
              : 'text-[#7A756D] dark:text-[#A09A90] hover:text-[#31362F] dark:hover:text-[#E0DCD3]'
          }`}
        >
          <Gift size={14} />
          <span>Wishlist Segreta</span>
        </button>
      </div>

      {/* MODULO 1: FEED TAKEAWAY & RATING CON SELETTORE PRIVACY */}
      {activeSubTab === 'takeaways' && (
        <div className="space-y-4">
          {/* Filtri Privacy Takeaways */}
          <div className="flex items-center gap-1 bg-[#EBE5D9]/40 dark:bg-[#383532]/40 p-1 rounded-2xl border border-[#DCD5C6] dark:border-[#4A4743]/40">
            <button
              onClick={() => setPrivacyFilter('all')}
              className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                privacyFilter === 'all'
                  ? 'bg-[#B0BEA9] dark:bg-[#5C6B55] text-[#31362F] dark:text-[#E0DCD3] shadow-xs'
                  : 'text-[#7A756D] dark:text-[#A09A90]'
              }`}
            >
              Tutti i Takeaway
            </button>
            <button
              onClick={() => setPrivacyFilter('public')}
              className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                privacyFilter === 'public'
                  ? 'bg-[#B0BEA9] dark:bg-[#5C6B55] text-[#31362F] dark:text-[#E0DCD3] shadow-xs'
                  : 'text-[#7A756D] dark:text-[#A09A90]'
              }`}
            >
              <Globe size={12} /> Pubblici
            </button>
            <button
              onClick={() => setPrivacyFilter('friends')}
              className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                privacyFilter === 'friends'
                  ? 'bg-[#B0BEA9] dark:bg-[#5C6B55] text-[#31362F] dark:text-[#E0DCD3] shadow-xs'
                  : 'text-[#7A756D] dark:text-[#A09A90]'
              }`}
            >
              <Users size={12} /> Amici
            </button>
            <button
              onClick={() => setPrivacyFilter('private')}
              className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                privacyFilter === 'private'
                  ? 'bg-[#B0BEA9] dark:bg-[#5C6B55] text-[#31362F] dark:text-[#E0DCD3] shadow-xs'
                  : 'text-[#7A756D] dark:text-[#A09A90]'
              }`}
            >
              <Lock size={12} /> Personali
            </button>
          </div>

          {/* Elenco Takeaways */}
          <div className="space-y-4">
            {filteredTakeaways.length === 0 ? (
              <div className="bg-[#EBE5D9]/40 dark:bg-[#383532]/40 rounded-3xl p-8 text-center space-y-2 border border-[#DCD5C6] dark:border-[#4A4743]/40">
                <MessageSquare className="w-8 h-8 text-[#7A756D] dark:text-[#A09A90] mx-auto opacity-60" />
                <p className="text-xs font-bold text-[#7A756D] dark:text-[#A09A90]">
                  Nessun Takeaway trovato per questo filtro di privacy.
                </p>
              </div>
            ) : (
              filteredTakeaways.map((takeaway) => (
                <TakeawayCard
                  key={takeaway.id}
                  takeaway={takeaway}
                  onLike={handleLikeTakeaway}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* MODULO 2: PATTO DI COSTANZA & PRESENZA LIVE */}
      {activeSubTab === 'patto' && (
        <div className="space-y-4">
          <AccountabilityPartnerCard
            partnerData={partnerData}
            onCheckInToday={handleCheckInToday}
          />

          <LivePresenceWidget
            presences={presences}
            onSendPing={handleSendPing}
          />
        </div>
      )}

      {/* MODULO 3: SCAFFALE DEI PRESTITI FISICI */}
      {activeSubTab === 'prestiti' && (
        <div className="space-y-4">
          <div className="bg-[#B0BEA9]/20 dark:bg-[#5C6B55]/20 p-4 rounded-3xl border border-[#B0BEA9]/30 dark:border-[#5C6B55]/30 space-y-1">
            <h3 className="text-sm font-extrabold text-[#31362F] dark:text-[#E0DCD3] flex items-center gap-1.5">
              <HeartHandshake size={16} className="text-[#5C6B55] dark:text-[#B0BEA9]" />
              Gestione Inventario Prestiti Fisici
            </h3>
            <p className="text-xs text-[#7A756D] dark:text-[#A09A90]">
              Tieni traccia precisa di tutti i libri della tua libreria che hai prestato agli amici o che hai in prestito.
            </p>
          </div>

          <div className="space-y-3">
            {loans.map((loan) => (
              <LoanInventoryCard
                key={loan.id}
                loan={loan}
                onUpdateStatus={handleUpdateLoanStatus}
              />
            ))}
          </div>
        </div>
      )}

      {/* MODULO 4: WISHLIST REGALI SEGRETI (ANTI-DOPPIONI) */}
      {activeSubTab === 'wishlist' && (
        <div className="space-y-4">
          {/* Switch Modalità di Visualizzazione (Vista Amico vs Mia Lista) */}
          <div className="flex items-center justify-between bg-[#EBE5D9]/50 dark:bg-[#383532]/50 p-2 rounded-2xl border border-[#DCD5C6] dark:border-[#4A4743]">
            <span className="text-xs font-bold text-[#31362F] dark:text-[#E0DCD3] pl-2">
              Modalità Visualizzazione:
            </span>

            <div className="flex items-center gap-1 bg-white/60 dark:bg-neutral-800/60 p-1 rounded-xl">
              <button
                onClick={() => setIsFriendViewMode(true)}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  isFriendViewMode
                    ? 'bg-[#B0BEA9] dark:bg-[#5C6B55] text-[#31362F] dark:text-[#E0DCD3] shadow-xs'
                    : 'text-[#7A756D] dark:text-[#A09A90]'
                }`}
              >
                👀 Vista Amico (con Prenotazioni)
              </button>
              <button
                onClick={() => setIsFriendViewMode(false)}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  !isFriendViewMode
                    ? 'bg-[#B0BEA9] dark:bg-[#5C6B55] text-[#31362F] dark:text-[#E0DCD3] shadow-xs'
                    : 'text-[#7A756D] dark:text-[#A09A90]'
                }`}
              >
                🔒 Mia Lista (Sorprese Nascoste)
              </button>
            </div>
          </div>

          {/* Elenco Wishlist */}
          <div className="space-y-3">
            {wishlist.map((item) => (
              <SecretWishlistCard
                key={item.id}
                item={item}
                isOwnerView={!isFriendViewMode}
                onToggleReserve={handleToggleReserveWishlist}
              />
            ))}
          </div>
        </div>
      )}

      {/* Modale Creazione Takeaway */}
      <CreateTakeawayModal
        isOpen={isCreateTakeawayOpen}
        onClose={() => setIsCreateTakeawayOpen(false)}
        userBooks={userBooks}
        onSubmitTakeaway={handleCreateTakeaway}
      />
    </div>
  );
};
