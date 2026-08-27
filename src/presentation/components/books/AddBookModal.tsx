import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Book, BookStatus } from '../../../domain/models/Book';
import { GENRES_MAP } from '../../../domain/constants/genres';
import { X, BookPlus } from 'lucide-react';

import { useRegisterModal } from '../../context/ModalContext';

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBook: (book: Omit<Book, 'id'>) => void;
}

export const AddBookModal: React.FC<AddBookModalProps> = ({ isOpen, onClose, onAddBook }) => {
  useRegisterModal(isOpen);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [status, setStatus] = useState<BookStatus>('Da leggere');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalPages, setTotalPages] = useState<string>('');
  const [pagesRead, setPagesRead] = useState<string>('');
  const [genre, setGenre] = useState('');
  const [customGenre, setCustomGenre] = useState('');
  const [subgenre, setSubgenre] = useState('');
  const [customSubgenre, setCustomSubgenre] = useState('');

  const handleGenreChange = (newGenre: string) => {
    setGenre(newGenre);
    setCustomGenre('');
    setSubgenre(''); // Reset subgenre when main genre changes
    setCustomSubgenre('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) return;

    const finalGenre = genre === 'ALTRO_CUSTOM' ? customGenre.trim() : genre.trim();
    const finalSubgenre = subgenre === 'ALTRO_CUSTOM' ? customSubgenre.trim() : subgenre.trim();

    onAddBook({
      title: title.trim(),
      author: author.trim(),
      coverUrl: coverUrl.trim(),
      status,
      startDate: startDate || (status !== 'Da leggere' ? new Date().toISOString().split('T')[0] : ''),
      endDate: endDate || (status === 'Letto' ? new Date().toISOString().split('T')[0] : ''),
      totalPages: totalPages ? parseInt(totalPages, 10) : undefined,
      pagesRead: pagesRead ? parseInt(pagesRead, 10) : undefined,
      genre: finalGenre || 'Narrativa & Classici',
      subgenre: finalSubgenre || undefined
    });

    // Reset form
    setTitle('');
    setAuthor('');
    setCoverUrl('');
    setStatus('Da leggere');
    setStartDate('');
    setEndDate('');
    setTotalPages('');
    setPagesRead('');
    setGenre('');
    setCustomGenre('');
    setSubgenre('');
    setCustomSubgenre('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
            className="bg-[#FCFBF8] dark:bg-[#33302D] text-[#4A4743] dark:text-[#E0DCD3] w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto border border-[#EBE5D9] dark:border-[#4A4743]/60 transition-colors"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#EBE5D9] dark:border-[#4A4743]/50 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#B0BEA9] dark:bg-[#5C6B55] text-[#31362F] dark:text-[#E0DCD3] flex items-center justify-center">
                  <BookPlus className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#4A4743] dark:text-[#E0DCD3]">Aggiungi nuovo libro</h2>
                  <p className="text-[11px] text-[#7A756D] dark:text-[#A09A90]">Inserisci i dettagli della tua lettura</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-[#EBE5D9] dark:bg-[#383532] text-[#4A4743] dark:text-[#E0DCD3] hover:bg-[#DCD5C6] flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#4A4743] dark:text-[#E0DCD3] mb-1">
                  Titolo Libro *
                </label>
                <input
                  type="text"
                  required
                  placeholder="es. Il Nome della Rosa"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F4F1EA] dark:bg-[#2A2826] border border-[#DCD5C6] dark:border-[#4A4743]/60 rounded-xl text-sm text-[#4A4743] dark:text-[#E0DCD3] focus:outline-none focus:border-[#B0BEA9] dark:focus:border-[#5C6B55]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4A4743] dark:text-[#E0DCD3] mb-1">
                  Autore *
                </label>
                <input
                  type="text"
                  required
                  placeholder="es. Umberto Eco"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F4F1EA] dark:bg-[#2A2826] border border-[#DCD5C6] dark:border-[#4A4743]/60 rounded-xl text-sm text-[#4A4743] dark:text-[#E0DCD3] focus:outline-none focus:border-[#B0BEA9] dark:focus:border-[#5C6B55]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4A4743] dark:text-[#E0DCD3] mb-1">
                  Stato Lettura
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as BookStatus)}
                  className="w-full px-3.5 py-2.5 bg-[#FCFBF8] dark:bg-[#33302D] border border-[#DCD5C6] dark:border-[#4A4743]/50 rounded-xl text-xs text-[#4A4743] dark:text-[#E0DCD3] focus:outline-none focus:ring-2 focus:ring-[#B0BEA9]"
                >
                  <option value="Da leggere">Da leggere</option>
                  <option value="In lettura">In lettura</option>
                  <option value="Letto">Letto</option>
                </select>
              </div>

              {/* Genre and Subgenre Select Dropdowns */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#4A4743] dark:text-[#E0DCD3] mb-1">
                    Genere Principale
                  </label>
                  <select
                    value={genre}
                    onChange={(e) => handleGenreChange(e.target.value)}
                    className="w-full bg-[#FCFBF8] dark:bg-[#33302D] border border-[#DCD5C6] dark:border-[#4A4743]/50 rounded-xl p-2.5 text-xs text-[#4A4743] dark:text-[#E0DCD3] focus:outline-none focus:ring-2 focus:ring-[#B0BEA9]"
                  >
                    <option value="">Seleziona Genere...</option>
                    {Object.keys(GENRES_MAP).map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                    <option value="ALTRO_CUSTOM">✏️ Altro / Personalizzato...</option>
                  </select>

                  {genre === 'ALTRO_CUSTOM' && (
                    <input
                      type="text"
                      placeholder="Scrivi genere personalizzato..."
                      value={customGenre}
                      onChange={(e) => setCustomGenre(e.target.value)}
                      required
                      className="w-full mt-2 px-3 py-2 bg-[#F4F1EA] dark:bg-[#2A2826] border border-[#DCD5C6] dark:border-[#4A4743]/60 rounded-xl text-xs text-[#4A4743] dark:text-[#E0DCD3] outline-none focus:border-[#5C6B55]"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4A4743] dark:text-[#E0DCD3] mb-1">
                    Sottogenere
                  </label>
                  <select
                    disabled={!genre}
                    value={subgenre}
                    onChange={(e) => setSubgenre(e.target.value)}
                    className="w-full bg-[#FCFBF8] dark:bg-[#33302D] border border-[#DCD5C6] dark:border-[#4A4743]/50 rounded-xl p-2.5 text-xs text-[#4A4743] dark:text-[#E0DCD3] focus:outline-none focus:ring-2 focus:ring-[#B0BEA9] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">{genre ? "Seleziona Sottogenere..." : "Scegli prima un Genere"}</option>
                    {genre && genre !== 'ALTRO_CUSTOM' && GENRES_MAP[genre]?.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                    {genre && <option value="ALTRO_CUSTOM">✏️ Altro / Personalizzato...</option>}
                  </select>

                  {subgenre === 'ALTRO_CUSTOM' && (
                    <input
                      type="text"
                      placeholder="Scrivi sottogenere personalizzato..."
                      value={customSubgenre}
                      onChange={(e) => setCustomSubgenre(e.target.value)}
                      required
                      className="w-full mt-2 px-3 py-2 bg-[#F4F1EA] dark:bg-[#2A2826] border border-[#DCD5C6] dark:border-[#4A4743]/60 rounded-xl text-xs text-[#4A4743] dark:text-[#E0DCD3] outline-none focus:border-[#5C6B55]"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4A4743] dark:text-[#E0DCD3] mb-1 flex items-center justify-between">
                  <span>URL Copertina (Opzionale)</span>
                  <span className="text-[10px] text-[#7A756D] dark:text-[#A09A90] font-normal">URL immagine web</span>
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F4F1EA] dark:bg-[#2A2826] border border-[#DCD5C6] dark:border-[#4A4743]/60 rounded-xl text-sm text-[#4A4743] dark:text-[#E0DCD3] focus:outline-none focus:border-[#B0BEA9] dark:focus:border-[#5C6B55]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#4A4743] dark:text-[#E0DCD3] mb-1">
                    Data Inizio
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F4F1EA] dark:bg-[#2A2826] border border-[#DCD5C6] dark:border-[#4A4743]/60 rounded-xl text-xs text-[#4A4743] dark:text-[#E0DCD3] focus:outline-none focus:border-[#B0BEA9] dark:focus:border-[#5C6B55]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4A4743] dark:text-[#E0DCD3] mb-1">
                    Data Fine
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F4F1EA] dark:bg-[#2A2826] border border-[#DCD5C6] dark:border-[#4A4743]/60 rounded-xl text-xs text-[#4A4743] dark:text-[#E0DCD3] focus:outline-none focus:border-[#B0BEA9] dark:focus:border-[#5C6B55]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#4A4743] dark:text-[#E0DCD3] mb-1">
                    Pagine Totali
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    min="1"
                    placeholder="es. 350"
                    value={totalPages}
                    onChange={(e) => setTotalPages(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F4F1EA] dark:bg-[#2A2826] border border-[#DCD5C6] dark:border-[#4A4743]/60 rounded-xl text-xs text-[#4A4743] dark:text-[#E0DCD3] focus:outline-none focus:border-[#B0BEA9] dark:focus:border-[#5C6B55]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4A4743] dark:text-[#E0DCD3] mb-1">
                    Pagine Lette
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    min="0"
                    placeholder="es. 120"
                    value={pagesRead}
                    onChange={(e) => setPagesRead(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F4F1EA] dark:bg-[#2A2826] border border-[#DCD5C6] dark:border-[#4A4743]/60 rounded-xl text-xs text-[#4A4743] dark:text-[#E0DCD3] focus:outline-none focus:border-[#B0BEA9] dark:focus:border-[#5C6B55]"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-[#DCD5C6] dark:border-[#4A4743]/60 text-[#4A4743] dark:text-[#E0DCD3] font-semibold text-xs hover:bg-[#EBE5D9] dark:hover:bg-[#383532] transition-colors"
                >
                  Annulla
                </button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#B0BEA9] dark:bg-[#5C6B55] text-[#31362F] dark:text-[#E0DCD3] shadow-md shadow-[#B0BEA9]/30 hover:bg-[#A0AF99] active:scale-95 transition-all border border-[#A0AF99] dark:border-[#4D5A46]"
                >
                  Salva Libro
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
