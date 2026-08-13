import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, BookOpen, Star, Quote, MessageSquare } from 'lucide-react';
import type { Book } from '../../../domain/models/Book';
import type { PostType } from '../../../domain/models/social';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  userBooks: Book[];
  onSubmitPost: (postData: {
    type: PostType;
    bookTitle?: string;
    bookAuthor?: string;
    bookCover?: string;
    rating?: number;
    progressPage?: number;
    totalPages?: number;
    content: string;
    quoteAuthor?: string;
  }) => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  userBooks,
  onSubmitPost
}) => {
  const [postType, setPostType] = useState<PostType>('review');
  const [selectedBookId, setSelectedBookId] = useState<string>(userBooks[0]?.id || '');
  const [rating, setRating] = useState<number>(5);
  const [progressPage, setProgressPage] = useState<number>(100);
  const [content, setContent] = useState('');
  const [quoteAuthor, setQuoteAuthor] = useState('');

  if (!isOpen) return null;

  const selectedBook = userBooks.find(b => b.id === selectedBookId) || userBooks[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    onSubmitPost({
      type: postType,
      bookTitle: selectedBook?.title || 'Libro Personale',
      bookAuthor: selectedBook?.author || 'Autore',
      bookCover: selectedBook?.coverUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400',
      rating: postType === 'review' ? rating : undefined,
      progressPage: postType === 'update' ? progressPage : undefined,
      totalPages: postType === 'update' ? (selectedBook?.totalPages || 300) : undefined,
      content: content.trim(),
      quoteAuthor: postType === 'quote' ? (quoteAuthor.trim() || selectedBook?.author) : undefined
    });

    // Reset & Close
    setContent('');
    setQuoteAuthor('');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Overlay Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Card Content */}
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative z-10 w-full max-w-lg bg-[#F8F6F0] dark:bg-[#23211E] rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 shadow-2xl border border-[#DCD5C6] dark:border-[#4A4743]/60 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#DCD5C6] dark:border-[#4A4743]/50">
            <h3 className="text-base font-extrabold text-[#31362F] dark:text-[#E0DCD3] flex items-center gap-2">
              <MessageSquare size={18} className="text-[#B0BEA9] dark:text-[#5C6B55]" />
              Condividi con la Community
            </h3>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-[#EBE5D9] dark:bg-[#383532] text-[#7A756D] dark:text-[#A09A90] hover:text-[#31362F] dark:hover:text-[#E0DCD3] transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            {/* Scelta del Tipo di Post */}
            <div>
              <label className="block text-xs font-bold text-[#7A756D] dark:text-[#A09A90] mb-2">
                Tipo di Aggiornamento
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPostType('review')}
                  className={`p-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                    postType === 'review'
                      ? 'bg-[#B0BEA9] dark:bg-[#5C6B55] text-[#31362F] dark:text-[#E0DCD3] border-transparent shadow-xs'
                      : 'bg-[#EBE5D9]/50 dark:bg-[#383532]/50 border-[#DCD5C6] dark:border-[#4A4743] text-[#7A756D] dark:text-[#A09A90]'
                  }`}
                >
                  <Star size={14} /> Recensione
                </button>
                <button
                  type="button"
                  onClick={() => setPostType('update')}
                  className={`p-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                    postType === 'update'
                      ? 'bg-[#B0BEA9] dark:bg-[#5C6B55] text-[#31362F] dark:text-[#E0DCD3] border-transparent shadow-xs'
                      : 'bg-[#EBE5D9]/50 dark:bg-[#383532]/50 border-[#DCD5C6] dark:border-[#4A4743] text-[#7A756D] dark:text-[#A09A90]'
                  }`}
                >
                  <BookOpen size={14} /> Progresso
                </button>
                <button
                  type="button"
                  onClick={() => setPostType('quote')}
                  className={`p-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                    postType === 'quote'
                      ? 'bg-[#B0BEA9] dark:bg-[#5C6B55] text-[#31362F] dark:text-[#E0DCD3] border-transparent shadow-xs'
                      : 'bg-[#EBE5D9]/50 dark:bg-[#383532]/50 border-[#DCD5C6] dark:border-[#4A4743] text-[#7A756D] dark:text-[#A09A90]'
                  }`}
                >
                  <Quote size={14} /> Citazione
                </button>
              </div>
            </div>

            {/* Selezione del Libro dalla Libreria */}
            {userBooks.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-[#7A756D] dark:text-[#A09A90] mb-1.5">
                  Seleziona Libro
                </label>
                <select
                  value={selectedBookId}
                  onChange={(e) => setSelectedBookId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl text-xs bg-[#EBE5D9]/80 dark:bg-[#383532]/80 text-[#31362F] dark:text-[#E0DCD3] border border-[#DCD5C6] dark:border-[#4A4743] focus:outline-none"
                >
                  {userBooks.map((book) => (
                    <option key={book.id} value={book.id}>
                      {book.title} — {book.author}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Voto a stelle per le Recensioni */}
            {postType === 'review' && (
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#7A756D] dark:text-[#A09A90]">
                  Valutazione
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 cursor-pointer transition-transform active:scale-90"
                    >
                      <Star
                        size={24}
                        className={star <= rating ? 'text-amber-500 fill-amber-500' : 'text-neutral-300 dark:text-neutral-700'}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Progresso pagina per gli aggiornamenti */}
            {postType === 'update' && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-[#7A756D] dark:text-[#A09A90]">
                  <span>Pagina Attuale</span>
                  <span>Pagina {progressPage} di {selectedBook?.totalPages || 300}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max={selectedBook?.totalPages || 300}
                  value={progressPage}
                  onChange={(e) => setProgressPage(Number(e.target.value))}
                  className="w-full accent-[#5C6B55]"
                />
              </div>
            )}

            {/* Testo del Post o della Citazione */}
            <div>
              <label className="block text-xs font-bold text-[#7A756D] dark:text-[#A09A90] mb-1.5">
                {postType === 'quote' ? 'Testo della Citazione' : 'Cosa stai pensando?'}
              </label>
              <textarea
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={
                  postType === 'quote'
                    ? 'Scrivi qui la tua citazione preferita...'
                    : 'Condividi le tue impressioni con la community di lettori...'
                }
                className="w-full p-3.5 rounded-2xl text-xs bg-[#EBE5D9]/80 dark:bg-[#383532]/80 text-[#31362F] dark:text-[#E0DCD3] border border-[#DCD5C6] dark:border-[#4A4743] focus:outline-none resize-none"
              />
            </div>

            {postType === 'quote' && (
              <div>
                <label className="block text-xs font-bold text-[#7A756D] dark:text-[#A09A90] mb-1.5">
                  Autore della Citazione (Opzionale)
                </label>
                <input
                  type="text"
                  value={quoteAuthor}
                  onChange={(e) => setQuoteAuthor(e.target.value)}
                  placeholder={selectedBook?.author || 'Autore...'}
                  className="w-full px-3.5 py-2.5 rounded-2xl text-xs bg-[#EBE5D9]/80 dark:bg-[#383532]/80 text-[#31362F] dark:text-[#E0DCD3] border border-[#DCD5C6] dark:border-[#4A4743] focus:outline-none"
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!content.trim()}
              className="w-full py-3.5 rounded-2xl bg-[#B0BEA9] dark:bg-[#5C6B55] text-[#31362F] dark:text-[#E0DCD3] font-extrabold text-sm flex items-center justify-center gap-2 shadow-md hover:bg-[#A0AF99] transition-all disabled:opacity-40 cursor-pointer"
            >
              <Send size={16} />
              Pubblica nel Feed Community
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
