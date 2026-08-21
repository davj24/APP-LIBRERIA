import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookmarkPlus, BookmarkCheck, Users, ChevronRight, BookOpen, Star } from 'lucide-react';
import { MOCK_FRIENDS } from '../../infrastructure/mock/mockFriendsData';
import { INITIAL_ACCOUNTABILITY_PARTNER, INITIAL_LIVE_PRESENCES } from '../../infrastructure/mock/mockSocialData';
import { DoubleStreakCard } from '../components/social/DoubleStreakCard';
import { CompactLiveReadersWidget } from '../components/social/CompactLiveReadersWidget';
import { FriendProfileModal } from '../components/social/FriendProfileModal';
import type { AccountabilityPartner, LivePresence } from '../../domain/models/social';

export const SocialPage: React.FC = () => {
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const [initialModalTab, setInitialModalTab] = useState<'profile' | 'library'>('profile');

  // Patti di Costanza (Multi-streak support)
  const [pacts, setPacts] = useState<AccountabilityPartner[]>([
    INITIAL_ACCOUNTABILITY_PARTNER,
    {
      id: 'patto-damiano',
      partnerName: 'Damiano Rinaldi',
      partnerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      partnerBadge: 'Storico di Biblioteca',
      streakDays: 5,
      userReadToday: true,
      partnerReadToday: false
    }
  ]);

  // Presenze Live (Amici in lettura ora)
  const [livePresences, setLivePresences] = useState<LivePresence[]>(INITIAL_LIVE_PRESENCES);

  const [takeaways, setTakeaways] = useState([
    {
      id: 1,
      userId: 'user-elena',
      bookTitle: 'Dune',
      author: 'Frank Herbert',
      friend: 'Elena Rostagno',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      note: '«Non devo avere paura. La paura uccide la mente. La paura è la piccola morte che porta con sé l\'annientamento totale.» — La lezione sull\'autocontrollo emotivo è straordinaria.',
      date: '2 ore fa',
      rating: 5,
      saved: false
    },
    {
      id: 2,
      userId: 'user-matteo',
      bookTitle: 'L\'Ombra del Vento',
      author: 'Carlos Ruiz Zafón',
      friend: 'Matteo Ferrari',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
      note: '«Ogni libro possiede un\'anima. L\'anima di chi l\'ha scritto e l\'anima di coloro che l\'hanno letto e hanno vissuto e sognato con esso.»',
      date: 'Ieri',
      rating: 4,
      saved: true
    },
    {
      id: 3,
      userId: 'user-damiano',
      bookTitle: 'Pensieri',
      author: 'Marco Aurelio',
      friend: 'Damiano Rinaldi',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      note: '«La felicità della tua vita dipende dalla qualità dei tuoi pensieri.» Una guida etica senza tempo per la vita moderna.',
      date: '3 giorni fa',
      rating: 5,
      saved: false
    }
  ]);

  const handleOpenFriendProfile = (friendId: string, tab: 'profile' | 'library' = 'profile') => {
    setSelectedFriendId(friendId);
    setInitialModalTab(tab);
  };

  const handleCheckInPact = (pactId: string) => {
    setPacts(prev =>
      prev.map(p => p.id === pactId ? { ...p, userReadToday: true, streakDays: p.streakDays + 1 } : p)
    );
  };

  const handleSendPing = (presenceId: string, emoji: string) => {
    setLivePresences(prev =>
      prev.map(p => p.id === presenceId ? { ...p, lastPingEmoji: emoji } : p)
    );
  };

  const handleToggleSave = (id: number) => {
    setTakeaways(prev => prev.map(t => t.id === id ? { ...t, saved: !t.saved } : t));
  };

  const friendsList = Object.values(MOCK_FRIENDS);
  const selectedFriend = selectedFriendId ? MOCK_FRIENDS[selectedFriendId] || null : null;

  return (
    <div className="min-h-screen px-4 sm:px-6 pt-6 pb-28 max-w-xl mx-auto text-[#31362F] dark:text-[#E0DCD3] font-sans space-y-6">
      
      {/* 1. HEADER CON TITOLO */}
      <header className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#2E332B] dark:text-[#ECE7DE]">
            BiblioSocial
          </h1>
          <p className="text-xs text-[#7A756D] dark:text-[#9E988F] font-medium">
            La tua cerchia di lettori ed esperienze di lettura condivise
          </p>
        </div>
      </header>

      {/* 2. LISTA AMICI (SOPRA) */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#7A756D] dark:text-[#9A9488] flex items-center gap-1.5">
            <Users size={15} className="text-[#5C6B55] dark:text-[#A8BB9C]" />
            I Tuoi Amici ({friendsList.length})
          </h2>
          <span className="text-[11px] text-[#888277] dark:text-[#888277] font-semibold">
            Tocca per la scheda
          </span>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-1.5 no-scrollbar">
          {friendsList.map((friend) => (
            <motion.button
              key={friend.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleOpenFriendProfile(friend.id, 'profile')}
              className="flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer"
            >
              <div className="relative">
                <img
                  src={friend.avatar}
                  alt={friend.name}
                  className="w-13 h-13 sm:w-14 sm:h-14 rounded-full object-cover ring-2 ring-[#5C6B55]/40 group-hover:ring-[#5C6B55] transition-all shadow-sm"
                />
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-[#F7F4EE] dark:ring-[#201E1C]" />
              </div>
              <span className="text-xs font-bold text-[#31362F] dark:text-[#E0DCD3] truncate max-w-[70px] group-hover:underline">
                {friend.name.split(' ')[0]}
              </span>
            </motion.button>
          ))}
        </div>
      </section>

      {/* 3. AMICI IN LETTURA ORA (COMPATTO, DIRECTLY UNDER FRIENDS LIST) */}
      <CompactLiveReadersWidget
        presences={livePresences}
        onSendPing={handleSendPing}
        onOpenFriendProfile={(id) => handleOpenFriendProfile(id, 'profile')}
      />

      {/* 4. DESIGN DOPPIA STREAK (PATTI DI COSTANZA CON PALETTE COERENTE E TUTTI I PATTI VISIBILI SENZA SWIPE) */}
      <DoubleStreakCard
        pacts={pacts}
        onCheckInToday={handleCheckInPact}
        onOpenFriendProfile={(id) => handleOpenFriendProfile(id, 'profile')}
      />

      {/* 5. FEED SPUNTI E REVISIONI */}
      <section className="space-y-3.5 pt-2">
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#7A756D] dark:text-[#9A9488]">
          Spunti & Recenti dalla Cerchia
        </h2>

        <div className="space-y-4">
          {takeaways.map((takeaway) => (
            <article 
              key={takeaway.id}
              className="bg-[#EFECE6] dark:bg-[#272422] p-4 sm:p-5 rounded-3xl border border-[#E2DDD2] dark:border-[#36322E] shadow-xs space-y-3"
            >
              {/* Header Autore */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => handleOpenFriendProfile(takeaway.userId, 'profile')}
                  className="flex items-center gap-2.5 text-left cursor-pointer group"
                >
                  <img
                    src={takeaway.avatar}
                    alt={takeaway.friend}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-[#5C6B55]/40"
                  />
                  <div>
                    <h4 className="text-xs font-extrabold text-[#31362F] dark:text-[#E0DCD3] group-hover:underline">
                      {takeaway.friend}
                    </h4>
                    <span className="text-[10px] text-[#7A756D] dark:text-[#9A9488]">
                      {takeaway.date}
                    </span>
                  </div>
                </button>

                {/* Pulsante "Vai alla Libreria dell'amico" */}
                <button
                  onClick={() => handleOpenFriendProfile(takeaway.userId, 'library')}
                  className="px-2.5 py-1 rounded-full bg-[#5C6B55]/10 hover:bg-[#5C6B55]/20 text-[#4D5A46] dark:text-[#A8BB9C] text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <BookOpen size={12} />
                  <span>Libreria</span>
                </button>
              </div>

              {/* Libro + Valutazione */}
              <div className="p-3 rounded-2xl bg-[#F7F4EE] dark:bg-[#201E1C] border border-[#E8E3D8] dark:border-[#312E2A] flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-[#31362F] dark:text-[#E0DCD3]">
                    {takeaway.bookTitle}
                  </h5>
                  <p className="text-[11px] text-[#7A756D] dark:text-[#9A9488]">
                    {takeaway.author}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                  <Star size={13} fill="currentColor" />
                  <span>{takeaway.rating}/5</span>
                </div>
              </div>

              {/* Testo Takeaway */}
              <p className="text-xs text-[#524D44] dark:text-[#BFB9AC] leading-relaxed italic font-serif">
                "{takeaway.note}"
              </p>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => handleToggleSave(takeaway.id)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-[#7A756D] dark:text-[#9A9488] hover:text-[#31362F] dark:hover:text-[#E0DCD3] transition-colors cursor-pointer"
                >
                  {takeaway.saved ? (
                    <>
                      <BookmarkCheck size={15} className="text-amber-600 dark:text-amber-400" />
                      <span className="text-amber-700 dark:text-amber-400 font-bold">Salvato</span>
                    </>
                  ) : (
                    <>
                      <BookmarkPlus size={15} />
                      <span>Salva negli appunti</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleOpenFriendProfile(takeaway.userId, 'profile')}
                  className="text-xs font-bold text-[#5C6B55] dark:text-[#A8BB9C] hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  Profilo <ChevronRight size={14} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* FRIEND PROFILE MODAL */}
      <FriendProfileModal
        friend={selectedFriend}
        isOpen={!!selectedFriendId}
        onClose={() => setSelectedFriendId(null)}
        initialTab={initialModalTab}
      />

    </div>
  );
};
