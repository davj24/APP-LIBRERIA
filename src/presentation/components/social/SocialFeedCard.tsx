import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Flame, Sparkles, Bookmark, MessageSquare, Star, 
  Send, BookOpen, Quote, CheckCircle2, Award
} from 'lucide-react';
import type { SocialPost, ReactionType } from '../../../domain/models/social';

interface SocialFeedCardProps {
  post: SocialPost;
  onReaction: (postId: string, type: ReactionType) => void;
  onAddComment: (postId: string, text: string) => void;
}

export const SocialFeedCard: React.FC<SocialFeedCardProps> = ({
  post,
  onReaction,
  onAddComment
}) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(post.id, commentText.trim());
    setCommentText('');
  };

  const reactionButtons: { type: ReactionType; icon: any; label: string; activeColor: string }[] = [
    { type: 'like', icon: Heart, label: 'Like', activeColor: 'text-rose-500 fill-rose-500' },
    { type: 'fire', icon: Flame, label: 'Fire', activeColor: 'text-amber-500 fill-amber-500' },
    { type: 'claps', icon: Sparkles, label: 'Bravo', activeColor: 'text-emerald-500 fill-emerald-500' },
    { type: 'bookmark', icon: Bookmark, label: 'Salva', activeColor: 'text-indigo-500 fill-indigo-500' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-[#EBE5D9]/60 dark:bg-[#383532]/60 rounded-3xl p-5 border border-[#DCD5C6] dark:border-[#4A4743]/50 shadow-xs space-y-4 transition-colors"
    >
      {/* Header del post (Autore + Badges + Data) */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={post.userAvatar}
            alt={post.userName}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-[#B0BEA9] dark:ring-[#5C6B55]"
          />
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-extrabold text-[#31362F] dark:text-[#E0DCD3]">
                {post.userName}
              </h4>
              {post.userBadge && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#B0BEA9]/40 dark:bg-[#5C6B55]/40 text-[#31362F] dark:text-[#E0DCD3] flex items-center gap-1">
                  <Award size={10} />
                  {post.userBadge}
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#7A756D] dark:text-[#A09A90]">
              {post.createdAt}
            </p>
          </div>
        </div>

        {/* Tag del tipo di post */}
        <div className="shrink-0">
          {post.type === 'review' && (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <Star size={12} className="fill-amber-500" /> Recensione
            </span>
          )}
          {post.type === 'quote' && (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center gap-1">
              <Quote size={12} /> Citazione
            </span>
          )}
          {post.type === 'update' && (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center gap-1">
              <BookOpen size={12} /> In Lettura
            </span>
          )}
          {post.type === 'milestone' && (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 size={12} /> Traguardo
            </span>
          )}
        </div>
      </div>

      {/* Riferimento al Libro (se presente) */}
      {post.bookTitle && (
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#E0DCD3]/50 dark:bg-[#2C2926]/50 border border-[#DCD5C6]/60 dark:border-[#4A4743]/30">
          {post.bookCover ? (
            <img
              src={post.bookCover}
              alt={post.bookTitle}
              className="w-12 h-16 rounded-xl object-cover shadow-xs shrink-0"
            />
          ) : (
            <div className="w-12 h-16 rounded-xl bg-[#B0BEA9] dark:bg-[#5C6B55] flex items-center justify-center text-[#31362F] dark:text-[#E0DCD3] shrink-0 font-bold text-xs">
              <BookOpen size={20} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h5 className="text-xs font-bold text-[#31362F] dark:text-[#E0DCD3] truncate">
              {post.bookTitle}
            </h5>
            <p className="text-[11px] text-[#7A756D] dark:text-[#A09A90] truncate">
              {post.bookAuthor}
            </p>

            {/* Voto Recensione */}
            {post.rating && (
              <div className="flex items-center gap-0.5 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={12}
                    className={star <= post.rating! ? 'text-amber-500 fill-amber-500' : 'text-neutral-300 dark:text-neutral-700'}
                  />
                ))}
              </div>
            )}

            {/* Progresso Lettura */}
            {post.progressPage && post.totalPages && (
              <div className="mt-1.5 space-y-1">
                <div className="flex items-center justify-between text-[10px] font-bold text-[#7A756D] dark:text-[#A09A90]">
                  <span>Pag. {post.progressPage} di {post.totalPages}</span>
                  <span>{Math.round((post.progressPage / post.totalPages) * 100)}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#DCD5C6] dark:bg-[#4A4743] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#B0BEA9] dark:bg-[#5C6B55] rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (post.progressPage / post.totalPages) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contenuto del Post (Testo o Citazione Grafica) */}
      {post.type === 'quote' ? (
        <div className="p-4 rounded-2xl bg-purple-500/5 dark:bg-purple-500/10 border-l-4 border-purple-500 italic text-sm text-[#31362F] dark:text-[#E0DCD3] leading-relaxed relative">
          <Quote className="absolute top-2 right-2 text-purple-500/20 w-8 h-8 pointer-events-none" />
          <p className="relative z-10 font-serif">"{post.content}"</p>
          {post.quoteAuthor && (
            <p className="mt-2 text-right text-xs font-bold not-italic text-[#7A756D] dark:text-[#A09A90]">
              — {post.quoteAuthor}
            </p>
          )}
        </div>
      ) : (
        <p className="text-xs text-[#31362F] dark:text-[#E0DCD3] leading-relaxed whitespace-pre-line">
          {post.content}
        </p>
      )}

      {/* Bar delle Reazioni & Commenti */}
      <div className="flex items-center justify-between pt-2 border-t border-[#DCD5C6]/60 dark:border-[#4A4743]/40">
        <div className="flex items-center gap-1 sm:gap-2">
          {reactionButtons.map(({ type, icon: Icon, activeColor }) => {
            const count = post.reactions[type] || 0;
            const isReacted = post.userReactions[type];

            return (
              <button
                key={type}
                onClick={() => onReaction(post.id, type)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isReacted
                    ? 'bg-white/80 dark:bg-neutral-800/80 shadow-xs'
                    : 'hover:bg-white/40 dark:hover:bg-neutral-800/40 text-[#7A756D] dark:text-[#A09A90]'
                }`}
              >
                <Icon size={14} className={isReacted ? activeColor : ''} />
                <span>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Pulsante Commenti */}
        <button
          onClick={() => setShowComments(!showComments)}
          className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#7A756D] dark:text-[#A09A90] hover:text-[#31362F] dark:hover:text-[#E0DCD3] flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <MessageSquare size={14} />
          <span>{post.comments.length}</span>
        </button>
      </div>

      {/* Sezione Commenti Espandibile */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="pt-3 border-t border-[#DCD5C6]/60 dark:border-[#4A4743]/40 space-y-3 overflow-hidden"
          >
            {/* Lista Commenti */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {post.comments.length === 0 ? (
                <p className="text-center text-[11px] text-[#7A756D] dark:text-[#A09A90] py-2">
                  Nessun commento ancora. Scrivi il primo!
                </p>
              ) : (
                post.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-2.5 rounded-2xl bg-[#E0DCD3]/40 dark:bg-[#2C2926]/40 flex items-start gap-2.5 text-xs"
                  >
                    <img
                      src={comment.userAvatar}
                      alt={comment.userName}
                      className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#31362F] dark:text-[#E0DCD3]">
                          {comment.userName}
                        </span>
                        <span className="text-[10px] text-[#7A756D] dark:text-[#A09A90]">
                          {comment.createdAt}
                        </span>
                      </div>
                      <p className="text-[#4A4743] dark:text-[#C5C0B6] text-[11px] mt-0.5">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input Nuovo Commento */}
            <form onSubmit={handleCommentSubmit} className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Scrivi un commento..."
                className="flex-1 px-3.5 py-2 rounded-xl text-xs bg-white dark:bg-[#2C2926] text-[#31362F] dark:text-[#E0DCD3] border border-[#DCD5C6] dark:border-[#4A4743] focus:outline-none focus:ring-1 focus:ring-[#B0BEA9] dark:focus:ring-[#5C6B55]"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="p-2 rounded-xl bg-[#B0BEA9] dark:bg-[#5C6B55] text-[#31362F] dark:text-[#E0DCD3] disabled:opacity-40 transition-all cursor-pointer"
              >
                <Send size={14} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
