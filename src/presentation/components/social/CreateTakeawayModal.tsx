import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Star, Globe, Users, Lock } from 'lucide-react';
import type { Book } from '../../../domain/models/Book';
import type { PrivacyLevel } from '../../../domain/models/social';
import { useRegisterModal } from '../../context/ModalContext';

interface CreateTakeawayModalProps {
  isOpen: boolean;
  onClose: () => void;
  userBooks: Book[];
  onSubmitTakeaway: (takeawayData: {
    bookTitle: string;
    bookAuthor: string;
    rating: number;
    content: string;
    privacy: PrivacyLevel;
  }) => void;
}

export const CreateTakeawayModal: React.FC<CreateTakeawayModalProps> = ({
  isOpen,
  onClose,
  userBooks,
  onSubmitTakeaway
}) => {
  useRegisterModal(isOpen);
  const [selectedBookId, setSelectedBookId] = useState<string>(userBooks[0]?.id || '');
  const [rating, setRating] = useState<number>(5);
  const [content, setContent] = useState('');
  const [privacy, setPrivacy] = useState<PrivacyLevel>('public');

  if (!isOpen) return null;

  const selectedBook = userBooks.find(b => b.id === selectedBookId) || userBooks[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    onSubmitTakeaway({
      bookTitle: selectedBook?.title || 'Libro Personale',
      bookAuthor: selectedBook?.author || 'Autore',
      rating,
      content: content.trim(),
      privacy
    });

    setContent('');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-xs"
        />

        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative z-10 w-full max-w-lg bg-[#F8F6F0] dark:bg-[#23211E] rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 shadow-2xl border border-[#DCD5C6] dark:border-[#4A4743]/60 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#DCD5C6] dark:border-[#4A4743]/50">
            <h3 className="text-base font-extrabold text-[#31362F] dark:text-[#E0DCD3]">
              Nuovo Takeaway & Rating
            </h3>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-[#EBE5D9] dark:bg-[#383532] text-[#7A756D] dark:text-[#A09A90] hover:text-[#31362F] dark:hover:text-[#E0DCD3] transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            {/* Selezione del Libro */}
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

            {/* Voto a Stelle 1-5 */}
            <div>
              <label className="block text-xs font-bold text-[#7A756D] dark:text-[#A09A90] mb-1">
                Valutazione Base
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

            {/* Testo del Takeaway */}
            <div>
              <label className="block text-xs font-bold text-[#7A756D] dark:text-[#A09A90] mb-1.5">
                Takeaway / Concetto Chiave
              </label>
              <textarea
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Scrivi qui la citazione, il concetto chiave o la regola pratica estratta dal libro..."
                className="w-full p-3.5 rounded-2xl text-xs bg-[#EBE5D9]/80 dark:bg-[#383532]/80 text-[#31362F] dark:text-[#E0DCD3] border border-[#DCD5C6] dark:border-[#4A4743] focus:outline-none resize-none font-serif"
              />
            </div>

            {/* Selettore Rigoroso di Privacy */}
            <div>
              <label className="block text-xs font-bold text-[#7A756D] dark:text-[#A09A90] mb-1.5">
                Visibilità / Privacy
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPrivacy('public')}
                  className={`p-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                    privacy === 'public'
                      ? 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/50 shadow-xs'
                      : 'bg-[#EBE5D9]/50 dark:bg-[#383532]/50 border-[#DCD5C6] dark:border-[#4A4743] text-[#7A756D] dark:text-[#A09A90]'
                  }`}
                >
                  <Globe size={14} /> Pubblico
                </button>
                <button
                  type="button"
                  onClick={() => setPrivacy('friends')}
                  className={`p-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                    privacy === 'friends'
                      ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/50 shadow-xs'
                      : 'bg-[#EBE5D9]/50 dark:bg-[#383532]/50 border-[#DCD5C6] dark:border-[#4A4743] text-[#7A756D] dark:text-[#A09A90]'
                  }`}
                >
                  <Users size={14} /> Solo Amici
                </button>
                <button
                  type="button"
                  onClick={() => setPrivacy('private')}
                  className={`p-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                    privacy === 'private'
                      ? 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/50 shadow-xs'
                      : 'bg-[#EBE5D9]/50 dark:bg-[#383532]/50 border-[#DCD5C6] dark:border-[#4A4743] text-[#7A756D] dark:text-[#A09A90]'
                  }`}
                >
                  <Lock size={14} /> Privato
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!content.trim()}
              className="w-full py-3.5 rounded-2xl bg-[#B0BEA9] dark:bg-[#5C6B55] text-[#31362F] dark:text-[#E0DCD3] font-extrabold text-sm flex items-center justify-center gap-2 shadow-md hover:bg-[#A0AF99] transition-all disabled:opacity-40 cursor-pointer"
            >
              <Send size={16} />
              Salva Takeaway
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
