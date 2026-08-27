import React, { useState, useEffect } from 'react';
import type { Book, BookStatus } from '../../../domain/models/Book';
import { GENRES_MAP } from '../../../domain/constants/genres';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Star,
  Calendar,
  BookOpen,
  Edit3,
  Trash2,
  CheckCircle2,
  Clock,
  Save,
  FileText,
  Tag,
  ImageIcon
} from 'lucide-react';

import { useRegisterModal } from '../../context/ModalContext';

interface BookDetailModalProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateBook: (updatedBook: Book) => void;
  onDeleteBook: (id: string) => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({
  book,
  isOpen,
  onClose,
  onUpdateBook,
  onDeleteBook
}) => {
  useRegisterModal(isOpen);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState<Partial<Book>>({});

  useEffect(() => {
    if (book && isOpen) {
      setFormData({
        title: book.title,
        author: book.author,
        coverUrl: book.coverUrl,
        status: book.status,
        totalPages: book.totalPages || 300,
        pagesRead: book.pagesRead || 0,
        genre: book.genre || '',
        subgenre: book.subgenre || '',
        rating: book.rating || 0,
        startDate: book.startDate || '',
        endDate: book.endDate || '',
        notes: book.notes || ''
      });
      setIsEditing(false);
      setShowDeleteConfirm(false);
    }
  }, [book, isOpen]);

  const handleRatingChange = (newRating: number) => {
    if (isEditing) {
      setFormData(prev => ({ ...prev, rating: newRating }));
    } else if (book) {
      onUpdateBook({ ...book, rating: newRating });
    }
  };

  const handleGenreChange = (newGenre: string) => {
    setFormData(prev => ({
      ...prev,
      genre: newGenre,
      subgenre: '' // Reset subgenre when main genre changes
    }));
  };

  const handleQuickPageUpdate = (newPages: number) => {
    if (!book) return;
    const validPages = Math.max(0, Math.min(book.totalPages || 300, newPages));
    const newStatus: BookStatus = validPages >= (book.totalPages || 300) ? 'Letto' : validPages > 0 ? 'In lettura' : book.status;
    onUpdateBook({
      ...book,
      pagesRead: validPages,
      status: newStatus
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!book) return;
    const updated: Book = {
      ...book,
      title: formData.title || book.title,
      author: formData.author || book.author,
      coverUrl: formData.coverUrl || book.coverUrl,
      status: (formData.status as BookStatus) || book.status,
      totalPages: Number(formData.totalPages) || book.totalPages,
      pagesRead: Number(formData.pagesRead) || book.pagesRead,
      genre: formData.genre,
      subgenre: formData.subgenre || undefined,
      rating: formData.rating,
      startDate: formData.startDate || book.startDate,
      endDate: formData.endDate,
      notes: formData.notes
    };
    onUpdateBook(updated);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (book) {
      onDeleteBook(book.id);
      onClose();
    }
  };

  const getStatusBadge = (status: BookStatus) => {
    switch (status) {
      case 'In lettura':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#EBE5D9] dark:bg-[#383532] text-[#4A4743] dark:text-[#E0DCD3] border border-[#DCD5C6] dark:border-[#4A4743]/60">
            <Clock className="w-3.5 h-3.5 text-[#7A756D] dark:text-[#A09A90]" /> In lettura
          </span>
        );
      case 'Letto':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#D8E2D5] dark:bg-[#3B4838] text-[#2D382B] dark:text-[#E0DCD3] border border-[#B0BEA9] dark:border-[#5C6B55]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#4D6349] dark:text-[#788C71]" /> Letto
          </span>
        );
      case 'Da leggere':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#F4F1EA] dark:bg-[#2A2826] text-[#7A756D] dark:text-[#A09A90] border border-[#EBE5D9] dark:border-[#4A4743]/50">
            <BookOpen className="w-3.5 h-3.5 text-[#9E988F] dark:text-[#88837A]" /> Da leggere
          </span>
        );
    }
  };

  const progressPercent = book?.totalPages && book?.pagesRead
    ? Math.min(100, Math.round((book.pagesRead / book.totalPages) * 100))
    : 0;

  return (
    <AnimatePresence>
      {isOpen && book && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#31362F]/60 dark:bg-black/80 backdrop-blur-xs p-0 sm:p-4"
        >
          <motion.div
            initial={{ y: "100%", opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: "100%", opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-[#FCFBF8] dark:bg-[#33302D] text-[#4A4743] dark:text-[#E0DCD3] w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#EBE5D9] dark:border-[#4A4743]/60 max-h-[92vh] overflow-y-auto flex flex-col transition-colors"
          >
            {/* Header Hero Cover Banner */}
            <div className="relative bg-[#31362F] dark:bg-[#252924] text-white min-h-[160px] p-5 flex items-end justify-between overflow-hidden">
              <img
                src={isEditing ? formData.coverUrl : book.coverUrl}
                alt={book.title}
                className="absolute inset-0 w-full h-full object-cover opacity-25 blur-md scale-110"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#252924] via-[#31362F]/60 to-transparent" />

              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-3.5 right-3.5 z-20 w-8 h-8 rounded-full bg-[#31362F]/60 text-white hover:bg-[#31362F] flex items-center justify-center backdrop-blur-xs transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="relative z-10 flex items-end gap-4 w-full">
                <img
                  src={isEditing ? formData.coverUrl : book.coverUrl}
                  alt={book.title}
                  className="w-20 h-28 object-cover rounded-xl border-2 border-white/30 shadow-2xl shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400';
                  }}
                />

                <div className="flex-1 min-w-0 pb-1">
                  <div className="mb-1.5">{getStatusBadge(isEditing ? (formData.status as BookStatus) : book.status)}</div>
                  <h2 className="text-lg font-black leading-tight text-white line-clamp-2">
                    {isEditing ? formData.title || book.title : book.title}
                  </h2>
                  <p className="text-xs text-[#EBE5D9] font-medium line-clamp-1 mt-0.5">
                    {isEditing ? formData.author || book.author : book.author}
                  </p>
                </div>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-5 space-y-5 flex-1 text-[#4A4743] dark:text-[#E0DCD3]">
              
              {!isEditing ? (
                /* VIEW MODE */
                <div className="space-y-5">
                  {/* Rating & Genre */}
                  <div className="flex items-center justify-between bg-[#F4F1EA] dark:bg-[#2A2826] p-3 rounded-2xl border border-[#EBE5D9] dark:border-[#4A4743]/50">
                    <div>
                      <span className="text-[11px] font-bold text-[#7A756D] dark:text-[#A09A90] uppercase tracking-wider block mb-1">
                        Valutazione
                      </span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => handleRatingChange(star)}
                            className="focus:outline-none hover:scale-115 transition-transform"
                          >
                            <Star
                              className={`w-5 h-5 ${
                                star <= (book.rating || 0)
                                  ? 'text-amber-500 fill-amber-500'
                                  : 'text-[#DCD5C6] dark:text-[#4A4743] fill-[#DCD5C6] dark:fill-[#4A4743]'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {book.genre && (
                      <div className="text-right">
                        <span className="text-[11px] font-bold text-[#7A756D] dark:text-[#A09A90] uppercase tracking-wider block mb-1">
                          Genere / Sottogenere
                        </span>
                        <div className="flex flex-col items-end gap-1">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#31362F] dark:text-[#E0DCD3] bg-[#B0BEA9]/40 dark:bg-[#5C6B55]/40 border border-[#B0BEA9] dark:border-[#5C6B55] px-2.5 py-0.5 rounded-xl">
                            <Tag className="w-3 h-3 text-[#4A4743] dark:text-[#E0DCD3]" />
                            {book.genre}
                          </span>
                          {book.subgenre && (
                            <span className="text-[10px] font-bold text-[#4A3331] dark:text-[#E0DCD3] bg-[#D8A49B]/40 dark:bg-[#8B5D57]/40 border border-[#D8A49B] dark:border-[#8B5D57] px-2 py-0.2 rounded-lg">
                              ↳ {book.subgenre}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Progress Slider / Quick Buttons */}
                  {book.totalPages ? (
                    <div className="bg-[#FCFBF8] dark:bg-[#33302D] rounded-2xl p-4 border border-[#EBE5D9] dark:border-[#4A4743]/60 shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#4A4743] dark:text-[#E0DCD3] flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4 text-[#31362F] dark:text-[#E0DCD3]" />
                          Progresso di Lettura
                        </span>
                        <span className="text-xs font-extrabold text-[#31362F] dark:text-[#E0DCD3] bg-[#B0BEA9]/40 dark:bg-[#5C6B55]/40 px-2 py-0.5 rounded-lg border border-[#B0BEA9] dark:border-[#5C6B55]">
                          {progressPercent}%
                        </span>
                      </div>

                      <div className="w-full bg-[#EBE5D9] dark:bg-[#2A2826] rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-[#B0BEA9] dark:bg-[#5C6B55] h-2.5 rounded-full transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs text-[#7A756D] dark:text-[#A09A90] font-medium">
                        <span>{book.pagesRead || 0} pagine lette</span>
                        <span>{book.totalPages} pagine totali</span>
                      </div>

                      {/* Quick increment buttons */}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleQuickPageUpdate((book.pagesRead || 0) + 10)}
                          className="flex-1 py-1.5 bg-[#EBE5D9] dark:bg-[#383532] hover:bg-[#DCD5C6] dark:hover:bg-[#4A4743] text-[#4A4743] dark:text-[#E0DCD3] rounded-xl text-xs font-bold transition-colors"
                        >
                          +10 Pag.
                        </button>
                        <button
                          onClick={() => handleQuickPageUpdate((book.pagesRead || 0) + 25)}
                          className="flex-1 py-1.5 bg-[#EBE5D9] dark:bg-[#383532] hover:bg-[#DCD5C6] dark:hover:bg-[#4A4743] text-[#4A4743] dark:text-[#E0DCD3] rounded-xl text-xs font-bold transition-colors"
                        >
                          +25 Pag.
                        </button>
                        <button
                          onClick={() => handleQuickPageUpdate(book.totalPages || 300)}
                          className="flex-1 py-1.5 bg-[#B0BEA9] dark:bg-[#5C6B55] hover:bg-[#A0AF99] text-[#31362F] dark:text-[#E0DCD3] border border-[#A0AF99] dark:border-[#4D5A46] rounded-xl text-xs font-bold transition-colors"
                        >
                          Completato ✓
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-[#F4F1EA] dark:bg-[#2A2826] p-3 rounded-2xl border border-[#EBE5D9] dark:border-[#4A4743]/50 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#EBE5D9] dark:bg-[#383532] text-[#4A4743] dark:text-[#E0DCD3] flex items-center justify-center shrink-0">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] text-[#7A756D] dark:text-[#A09A90] font-bold uppercase block">Inizio Lettura</span>
                        <span className="font-bold text-[#4A4743] dark:text-[#E0DCD3] text-xs">{book.startDate || 'Non impostata'}</span>
                      </div>
                    </div>

                    <div className="bg-[#F4F1EA] dark:bg-[#2A2826] p-3 rounded-2xl border border-[#EBE5D9] dark:border-[#4A4743]/50 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#D8E2D5] dark:bg-[#3B4838] text-[#2D382B] dark:text-[#E0DCD3] flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-[#4D6349] dark:text-[#788C71]" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] text-[#7A756D] dark:text-[#A09A90] font-bold uppercase block">Fine Lettura</span>
                        <span className="font-bold text-[#4A4743] dark:text-[#E0DCD3] text-xs">{book.endDate || 'In corso'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Notes / Thoughts */}
                  {book.notes ? (
                    <div className="bg-[#EBE5D9]/70 dark:bg-[#383532]/80 rounded-2xl p-3.5 border border-[#DCD5C6] dark:border-[#4A4743]/60 space-y-1">
                      <span className="text-[11px] font-bold text-[#4A4743] dark:text-[#E0DCD3] flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-[#7A756D] dark:text-[#A09A90]" />
                        Note & Riflessioni
                      </span>
                      <p className="text-xs text-[#4A4743] dark:text-[#E0DCD3] font-medium leading-relaxed">
                        {book.notes}
                      </p>
                    </div>
                  ) : null}

                  {/* Primary Action Button (View Mode) */}
                  <div className="pt-2">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="w-full py-3 rounded-2xl bg-[#B0BEA9] dark:bg-[#5C6B55] text-[#31362F] dark:text-[#E0DCD3] font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#B0BEA9]/30 hover:bg-[#A0AF99] active:scale-98 transition-all border border-[#A0AF99] dark:border-[#4D5A46]"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Modifica Libro</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* EDIT FORM MODE */
                <form onSubmit={handleSaveEdit} className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#EBE5D9] dark:border-[#4A4743]/50 pb-2">
                    <h3 className="text-sm font-bold text-[#4A4743] dark:text-[#E0DCD3] flex items-center gap-1.5">
                      <Edit3 className="w-4 h-4 text-[#31362F] dark:text-[#E0DCD3]" /> Modifica Dettagli Libro
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="text-xs text-[#7A756D] dark:text-[#A09A90] font-semibold hover:text-[#4A4743] dark:hover:text-[#E0DCD3]"
                    >
                      Annulla
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4A4743] dark:text-[#E0DCD3] mb-1">Titolo</label>
                    <input
                      type="text"
                      value={formData.title || ''}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-[#F4F1EA] dark:bg-[#2A2826] border border-[#DCD5C6] dark:border-[#4A4743]/60 text-xs text-[#4A4743] dark:text-[#E0DCD3] focus:outline-none focus:border-[#B0BEA9] dark:focus:border-[#5C6B55]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4A4743] dark:text-[#E0DCD3] mb-1">Autore</label>
                    <input
                      type="text"
                      value={formData.author || ''}
                      onChange={e => setFormData({ ...formData, author: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-[#F4F1EA] dark:bg-[#2A2826] border border-[#DCD5C6] dark:border-[#4A4743]/60 text-xs text-[#4A4743] dark:text-[#E0DCD3] focus:outline-none focus:border-[#B0BEA9] dark:focus:border-[#5C6B55]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4A4743] dark:text-[#E0DCD3] mb-1">Stato Lettura</label>
                    <select
                      value={formData.status || 'Da leggere'}
                      onChange={e => {
                        const newStatus = e.target.value as BookStatus;
                        const today = new Date().toISOString().split('T')[0];
                        if (newStatus === 'Da leggere') {
                          setFormData({ ...formData, status: newStatus, pagesRead: 0, startDate: '', endDate: '' });
                        } else if (newStatus === 'In lettura') {
                          setFormData({ ...formData, status: newStatus, startDate: formData.startDate || today, endDate: '' });
                        } else if (newStatus === 'Letto') {
                          setFormData({ ...formData, status: newStatus, startDate: formData.startDate || today, endDate: formData.endDate || today });
                        }
                      }}
                      className="w-full bg-[#FCFBF8] dark:bg-[#33302D] border border-[#DCD5C6] dark:border-[#4A4743]/50 rounded-xl p-3 text-xs text-[#4A4743] dark:text-[#E0DCD3] focus:outline-none focus:ring-2 focus:ring-[#B0BEA9]"
                    >
                      <option value="Da leggere">Da leggere</option>
                      <option value="In lettura">In lettura</option>
                      <option value="Letto">Letto</option>
                    </select>
                  </div>

                  {/* Genre and Subgenre Select Dropdowns */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#4A4743] dark:text-[#E0DCD3] mb-1">Genere Principale</label>
                      <select
                        value={formData.genre || ''}
                        onChange={e => handleGenreChange(e.target.value)}
                        className="w-full bg-[#FCFBF8] dark:bg-[#33302D] border border-[#DCD5C6] dark:border-[#4A4743]/50 rounded-xl p-3 text-xs text-[#4A4743] dark:text-[#E0DCD3] focus:outline-none focus:ring-2 focus:ring-[#B0BEA9]"
                      >
                        <option value="">Seleziona Genere...</option>
                        {Object.keys(GENRES_MAP).map(g => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                        <option value="ALTRO_CUSTOM">✏️ Altro / Personalizzato...</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#4A4743] dark:text-[#E0DCD3] mb-1">Sottogenere</label>
                      <select
                        disabled={!formData.genre}
                        value={formData.subgenre || ''}
                        onChange={e => setFormData({ ...formData, subgenre: e.target.value })}
                        className="w-full bg-[#FCFBF8] dark:bg-[#33302D] border border-[#DCD5C6] dark:border-[#4A4743]/50 rounded-xl p-3 text-xs text-[#4A4743] dark:text-[#E0DCD3] focus:outline-none focus:ring-2 focus:ring-[#B0BEA9] disabled:opacity-50"
                      >
                        <option value="">Seleziona Sottogenere...</option>
                        {formData.genre && GENRES_MAP[formData.genre]?.map(sub => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                        {formData.genre && <option value="ALTRO_CUSTOM">✏️ Altro / Personalizzato...</option>}
                      </select>
                    </div>
                  </div>

                  <div className={`grid gap-3 ${formData.status !== 'Da leggere' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {formData.status !== 'Da leggere' && (
                      <div>
                        <label className="block text-xs font-bold text-[#4A4743] dark:text-[#E0DCD3] mb-1">Pagine Lette</label>
                        <input
                          type="number"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          min="0"
                          value={formData.pagesRead ?? 0}
                          onChange={e => setFormData({ ...formData, pagesRead: Number(e.target.value) })}
                          className="w-full px-3 py-2 rounded-xl bg-[#F4F1EA] dark:bg-[#2A2826] border border-[#DCD5C6] dark:border-[#4A4743]/60 text-xs text-[#4A4743] dark:text-[#E0DCD3] focus:outline-none focus:border-[#B0BEA9] dark:focus:border-[#5C6B55]"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-[#4A4743] dark:text-[#E0DCD3] mb-1">Pagine Totali</label>
                      <input
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        min="1"
                        value={formData.totalPages ?? 300}
                        onChange={e => setFormData({ ...formData, totalPages: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl bg-[#F4F1EA] dark:bg-[#2A2826] border border-[#DCD5C6] dark:border-[#4A4743]/60 text-xs text-[#4A4743] dark:text-[#E0DCD3] focus:outline-none focus:border-[#B0BEA9] dark:focus:border-[#5C6B55]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#4A4743] dark:text-[#E0DCD3] mb-1">Data Inizio</label>
                      <input
                        type="date"
                        value={formData.startDate || ''}
                        onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[#F4F1EA] dark:bg-[#2A2826] border border-[#DCD5C6] dark:border-[#4A4743]/60 text-xs text-[#4A4743] dark:text-[#E0DCD3] focus:outline-none focus:border-[#B0BEA9] dark:focus:border-[#5C6B55]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#4A4743] dark:text-[#E0DCD3] mb-1">Data Fine</label>
                      <input
                        type="date"
                        value={formData.endDate || ''}
                        onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[#F4F1EA] dark:bg-[#2A2826] border border-[#DCD5C6] dark:border-[#4A4743]/60 text-xs text-[#4A4743] dark:text-[#E0DCD3] focus:outline-none focus:border-[#B0BEA9] dark:focus:border-[#5C6B55]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4A4743] dark:text-[#E0DCD3] mb-1 flex items-center gap-1">
                      <ImageIcon className="w-3.5 h-3.5 text-[#7A756D] dark:text-[#A09A90]" /> URL Copertina
                    </label>
                    <input
                      type="url"
                      value={formData.coverUrl || ''}
                      onChange={e => setFormData({ ...formData, coverUrl: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#F4F1EA] dark:bg-[#2A2826] border border-[#DCD5C6] dark:border-[#4A4743]/60 text-xs text-[#4A4743] dark:text-[#E0DCD3] focus:outline-none focus:border-[#B0BEA9] dark:focus:border-[#5C6B55]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4A4743] dark:text-[#E0DCD3] mb-1">Note & Recensione</label>
                    <textarea
                      rows={2}
                      value={formData.notes || ''}
                      onChange={e => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#F4F1EA] dark:bg-[#2A2826] border border-[#DCD5C6] dark:border-[#4A4743]/60 text-xs text-[#4A4743] dark:text-[#E0DCD3] focus:outline-none focus:border-[#B0BEA9] dark:focus:border-[#5C6B55]"
                      placeholder="Scrivi le tue impressioni..."
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="flex-1 py-2.5 rounded-xl border border-[#DCD5C6] dark:border-[#4A4743]/60 text-[#4A4743] dark:text-[#E0DCD3] font-semibold text-xs hover:bg-[#EBE5D9] dark:hover:bg-[#383532] transition-colors"
                    >
                      Annulla
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-xl bg-[#B0BEA9] dark:bg-[#5C6B55] text-[#31362F] dark:text-[#E0DCD3] font-bold text-xs hover:bg-[#A0AF99] shadow-md shadow-[#B0BEA9]/30 transition-all flex items-center justify-center gap-1.5 border border-[#A0AF99] dark:border-[#4D5A46]"
                    >
                      <Save className="w-4 h-4" />
                      <span>Salva Modifiche</span>
                    </button>
                  </div>

                  <div className="pt-4 border-t border-[#EBE5D9] dark:border-[#4A4743]/50 mt-4">
                    {!showDeleteConfirm ? (
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="w-full py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-800 dark:text-rose-300 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Elimina</span>
                      </button>
                    ) : (
                      <div className="bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/80 rounded-xl p-3 text-center space-y-2 animate-in fade-in">
                        <p className="text-xs font-bold text-rose-900 dark:text-rose-200">Sei sicuro di voler eliminare questo libro?</p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setShowDeleteConfirm(false)}
                            className="flex-1 py-1.5 rounded-lg bg-white dark:bg-[#2A2826] border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-semibold"
                          >
                            No, annulla
                          </button>
                          <button
                            type="button"
                            onClick={handleDelete}
                            className="flex-1 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold shadow-sm"
                          >
                            Sì, elimina definitivamente
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </form>
              )}

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
