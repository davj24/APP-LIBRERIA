import React, { useState } from 'react';
import { 
  Users, MessageSquare, Plus, Trophy, Rocket, 
  Sparkles, UserPlus, UserCheck, Search
} from 'lucide-react';
import { SocialFeedCard } from '../components/social/SocialFeedCard';
import { BookClubsCard } from '../components/social/BookClubsCard';
import { CreatePostModal } from '../components/social/CreatePostModal';
import { 
  INITIAL_SOCIAL_POSTS, 
  INITIAL_BOOK_CLUBS, 
  MOCK_COMMUNITY_LEADERBOARD 
} from '../../infrastructure/mock/mockSocialData';
import type { SocialPost, BookClub, ReaderLeaderboardUser, ReactionType, PostType } from '../../domain/models/social';
import { useBooks } from '../hooks/useBooks';

export type SocialSubTab = 'feed' | 'clubs' | 'leaderboard';

export const SocialPage: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<SocialSubTab>('feed');
  const [filterType, setFilterType] = useState<'all' | 'review' | 'quote' | 'update'>('all');
  const [posts, setPosts] = useState<SocialPost[]>(INITIAL_SOCIAL_POSTS);
  const [bookClubs, setBookClubs] = useState<BookClub[]>(INITIAL_BOOK_CLUBS);
  const [leaderboard, setLeaderboard] = useState<ReaderLeaderboardUser[]>(MOCK_COMMUNITY_LEADERBOARD);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { books: userBooks } = useBooks();

  // Gestione Reazioni sui Post
  const handleReaction = (postId: string, type: ReactionType) => {
    setPosts(prev => prev.map(post => {
      if (post.id !== postId) return post;

      const currentlyReacted = post.userReactions[type];
      const currentCount = post.reactions[type] || 0;

      return {
        ...post,
        reactions: {
          ...post.reactions,
          [type]: currentlyReacted ? Math.max(0, currentCount - 1) : currentCount + 1
        },
        userReactions: {
          ...post.userReactions,
          [type]: !currentlyReacted
        }
      };
    }));
  };

  // Gestione Aggiunta Commenti
  const handleAddComment = (postId: string, text: string) => {
    const newComment = {
      id: `comment-${Date.now()}`,
      userId: 'user-davide',
      userName: 'Davide Belluzzo',
      userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
      content: text,
      createdAt: 'Proprio ora'
    };

    setPosts(prev => prev.map(post => {
      if (post.id !== postId) return post;
      return {
        ...post,
        comments: [...post.comments, newComment]
      };
    }));
  };

  // Gestione Iscrizione ai Club di Lettura
  const handleToggleJoinClub = (clubId: string) => {
    setBookClubs(prev => prev.map(club => {
      if (club.id !== clubId) return club;
      const willJoin = !club.isJoined;
      return {
        ...club,
        isJoined: willJoin,
        membersCount: willJoin ? club.membersCount + 1 : club.membersCount - 1
      };
    }));
  };

  // Gestione Segui/Non segui lettori
  const handleToggleFollow = (userId: string) => {
    setLeaderboard(prev => prev.map(u => {
      if (u.id !== userId) return u;
      return { ...u, isFollowing: !u.isFollowing };
    }));
  };

  // Gestione Invio Nuovo Post
  const handleCreatePost = (postData: {
    type: PostType;
    bookTitle?: string;
    bookAuthor?: string;
    bookCover?: string;
    rating?: number;
    progressPage?: number;
    totalPages?: number;
    content: string;
    quoteAuthor?: string;
  }) => {
    const newPost: SocialPost = {
      id: `post-${Date.now()}`,
      type: postData.type,
      userId: 'user-davide',
      userName: 'Davide Belluzzo',
      userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
      userBadge: 'BiblioDesk Club',
      bookTitle: postData.bookTitle,
      bookAuthor: postData.bookAuthor,
      bookCover: postData.bookCover,
      rating: postData.rating,
      progressPage: postData.progressPage,
      totalPages: postData.totalPages,
      content: postData.content,
      quoteAuthor: postData.quoteAuthor,
      createdAt: 'Proprio ora',
      reactions: { like: 1, fire: 0, claps: 0, bookmark: 0 },
      userReactions: { like: true, fire: false, claps: false, bookmark: false },
      comments: []
    };

    setPosts(prev => [newPost, ...prev]);
  };

  // Filtra post in base al tipo e alla ricerca
  const filteredPosts = posts.filter(post => {
    if (filterType !== 'all' && post.type !== filterType) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const contentMatch = post.content.toLowerCase().includes(q);
    const authorMatch = post.userName.toLowerCase().includes(q);
    const bookMatch = post.bookTitle?.toLowerCase().includes(q) || false;
    return contentMatch || authorMatch || bookMatch;
  });

  return (
    <div className="space-y-4 animate-in fade-in duration-200 pb-20">
      {/* Header Sezione Social */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-[#31362F] dark:text-[#E0DCD3] flex items-center gap-2">
            <Users className="w-6 h-6 text-[#5C6B55] dark:text-[#B0BEA9]" />
            BiblioSocial
          </h2>
          <p className="text-xs text-[#7A756D] dark:text-[#A09A90]">
            Condividi letture, scopri consigli e partecipa alla community
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-3.5 py-2 rounded-2xl bg-[#B0BEA9] dark:bg-[#5C6B55] text-[#31362F] dark:text-[#E0DCD3] text-xs font-extrabold flex items-center gap-1.5 shadow-md hover:bg-[#A0AF99] transition-transform active:scale-95 cursor-pointer shrink-0"
        >
          <Plus size={16} />
          <span>Crea Post</span>
        </button>
      </div>

      {/* Sub-Navigation Tabs (Feed, Club di Lettura, Classifica) */}
      <div className="bg-[#EBE5D9] dark:bg-[#383532] p-1 rounded-2xl flex items-center gap-1 border border-[#DCD5C6] dark:border-[#4A4743]/60 transition-colors">
        <button
          onClick={() => setActiveSubTab('feed')}
          className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === 'feed'
              ? 'bg-[#B0BEA9] dark:bg-[#5C6B55] text-[#31362F] dark:text-[#E0DCD3] shadow-xs'
              : 'text-[#7A756D] dark:text-[#A09A90] hover:text-[#31362F] dark:hover:text-[#E0DCD3]'
          }`}
        >
          <MessageSquare size={15} />
          <span>Feed Community</span>
        </button>

        <button
          onClick={() => setActiveSubTab('clubs')}
          className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === 'clubs'
              ? 'bg-[#B0BEA9] dark:bg-[#5C6B55] text-[#31362F] dark:text-[#E0DCD3] shadow-xs'
              : 'text-[#7A756D] dark:text-[#A09A90] hover:text-[#31362F] dark:hover:text-[#E0DCD3]'
          }`}
        >
          <Rocket size={15} />
          <span>Club di Lettura</span>
        </button>

        <button
          onClick={() => setActiveSubTab('leaderboard')}
          className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === 'leaderboard'
              ? 'bg-[#B0BEA9] dark:bg-[#5C6B55] text-[#31362F] dark:text-[#E0DCD3] shadow-xs'
              : 'text-[#7A756D] dark:text-[#A09A90] hover:text-[#31362F] dark:hover:text-[#E0DCD3]'
          }`}
        >
          <Trophy size={15} />
          <span>Classifica</span>
        </button>
      </div>

      {/* CONTENUTO TAB 1: FEED COMMUNITY */}
      {activeSubTab === 'feed' && (
        <div className="space-y-4">
          {/* Barra di ricerca + Filtri post */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A756D] dark:text-[#A09A90]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cerca post, lettori o libri..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs bg-[#EBE5D9]/60 dark:bg-[#383532]/60 text-[#31362F] dark:text-[#E0DCD3] border border-[#DCD5C6] dark:border-[#4A4743]/50 focus:outline-none"
              />
            </div>

            {/* Filtro Tipologia */}
            <div className="flex items-center gap-1 bg-[#EBE5D9]/40 dark:bg-[#383532]/40 p-1 rounded-2xl border border-[#DCD5C6] dark:border-[#4A4743]/40">
              <button
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold cursor-pointer transition-all ${
                  filterType === 'all'
                    ? 'bg-[#B0BEA9] dark:bg-[#5C6B55] text-[#31362F] dark:text-[#E0DCD3]'
                    : 'text-[#7A756D] dark:text-[#A09A90]'
                }`}
              >
                Tutti
              </button>
              <button
                onClick={() => setFilterType('review')}
                className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold cursor-pointer transition-all ${
                  filterType === 'review'
                    ? 'bg-[#B0BEA9] dark:bg-[#5C6B55] text-[#31362F] dark:text-[#E0DCD3]'
                    : 'text-[#7A756D] dark:text-[#A09A90]'
                }`}
              >
                Recensioni
              </button>
              <button
                onClick={() => setFilterType('quote')}
                className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold cursor-pointer transition-all ${
                  filterType === 'quote'
                    ? 'bg-[#B0BEA9] dark:bg-[#5C6B55] text-[#31362F] dark:text-[#E0DCD3]'
                    : 'text-[#7A756D] dark:text-[#A09A90]'
                }`}
              >
                Citazioni
              </button>
            </div>
          </div>

          {/* Elenco dei Post nel Feed */}
          <div className="space-y-4">
            {filteredPosts.length === 0 ? (
              <div className="bg-[#EBE5D9]/40 dark:bg-[#383532]/40 rounded-3xl p-8 text-center space-y-2 border border-[#DCD5C6] dark:border-[#4A4743]/40">
                <MessageSquare className="w-8 h-8 text-[#7A756D] dark:text-[#A09A90] mx-auto opacity-60" />
                <p className="text-xs font-bold text-[#7A756D] dark:text-[#A09A90]">
                  Nessun post trovato con questo filtro.
                </p>
              </div>
            ) : (
              filteredPosts.map((post) => (
                <SocialFeedCard
                  key={post.id}
                  post={post}
                  onReaction={handleReaction}
                  onAddComment={handleAddComment}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* CONTENUTO TAB 2: CLUB DI LETTURA */}
      {activeSubTab === 'clubs' && (
        <div className="space-y-4">
          <div className="bg-[#B0BEA9]/20 dark:bg-[#5C6B55]/20 p-4 rounded-3xl border border-[#B0BEA9]/30 dark:border-[#5C6B55]/30 space-y-1">
            <h3 className="text-sm font-extrabold text-[#31362F] dark:text-[#E0DCD3] flex items-center gap-1.5">
              <Sparkles size={16} className="text-[#5C6B55] dark:text-[#B0BEA9]" />
              Unisciti ai Club di Lettura del Mese
            </h3>
            <p className="text-xs text-[#7A756D] dark:text-[#A09A90]">
              Leggi insieme ad altri appassionati, rispondi alle domande settimanali e partecipa alle discussioni sugli ultimi capitoli.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bookClubs.map((club) => (
              <BookClubsCard
                key={club.id}
                club={club}
                onToggleJoin={handleToggleJoinClub}
              />
            ))}
          </div>
        </div>
      )}

      {/* CONTENUTO TAB 3: CLASSIFICA & COMMUNITY */}
      {activeSubTab === 'leaderboard' && (
        <div className="space-y-4">
          <div className="bg-[#EBE5D9]/60 dark:bg-[#383532]/60 p-5 rounded-3xl border border-[#DCD5C6] dark:border-[#4A4743]/50 space-y-3">
            <h3 className="text-sm font-extrabold text-[#31362F] dark:text-[#E0DCD3] flex items-center gap-2">
              <Trophy className="text-amber-500" size={18} />
              Classifica Lettori del Mese
            </h3>

            <div className="space-y-2">
              {leaderboard.map((user) => (
                <div
                  key={user.id}
                  className={`p-3.5 rounded-2xl flex items-center justify-between border transition-all ${
                    user.id === 'user-davide'
                      ? 'bg-[#B0BEA9]/30 dark:bg-[#5C6B55]/30 border-[#B0BEA9] dark:border-[#5C6B55]'
                      : 'bg-white/50 dark:bg-[#2C2926]/50 border-[#DCD5C6]/60 dark:border-[#4A4743]/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Rank Badge */}
                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-extrabold shrink-0 ${
                      user.rank === 1 ? 'bg-amber-500 text-white shadow-xs' :
                      user.rank === 2 ? 'bg-slate-400 text-white' :
                      user.rank === 3 ? 'bg-amber-700 text-white' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                    }`}>
                      #{user.rank}
                    </div>

                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />

                    <div>
                      <h4 className="text-xs font-extrabold text-[#31362F] dark:text-[#E0DCD3]">
                        {user.name}
                      </h4>
                      <p className="text-[11px] text-[#7A756D] dark:text-[#A09A90]">
                        {user.booksReadThisMonth} libri ({user.pagesReadThisMonth} pag.) • 🔥 {user.streakDays} gg
                      </p>
                    </div>
                  </div>

                  {user.id !== 'user-davide' && (
                    <button
                      onClick={() => handleToggleFollow(user.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        user.isFollowing
                          ? 'bg-[#E0DCD3] dark:bg-[#4A4743] text-[#31362F] dark:text-[#E0DCD3]'
                          : 'bg-[#B0BEA9] dark:bg-[#5C6B55] text-[#31362F] dark:text-[#E0DCD3] shadow-xs'
                      }`}
                    >
                      {user.isFollowing ? (
                        <>
                          <UserCheck size={14} /> Segui già
                        </>
                      ) : (
                        <>
                          <UserPlus size={14} /> Segui
                        </>
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modale Creazione Post */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        userBooks={userBooks}
        onSubmitPost={handleCreatePost}
      />
    </div>
  );
};
