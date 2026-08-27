import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, BookOpen, Clock, CheckCircle2, Calendar, Image as ImageIcon, PenTool } from 'lucide-react';
import type { Book, BookStatus } from '../../../domain/models/Book';
import { useRegisterModal } from '../../context/ModalContext';

interface RegisterBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBook: Partial<Book> | null;
  onConfirmSave: (customizedBook: Omit<Book, 'id'>) => void;
}

export const RegisterBookModal: React.FC<RegisterBookModalProps> = ({
  isOpen,
  onClose,
  initialBook,
  onConfirmSave,
}) => {
  useRegisterModal(isOpen);

  const [status, setStatus] = useState<BookStatus>('Da leggere');
  const [pagesRead, setPagesRead] = useState<string>('0');
  const [totalPages, setTotalPages] = useState<string>('300');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [coverUrl, setCoverUrl] = useState<string>('');

  useEffect(() => {
    if (initialBook && isOpen) {
      setStatus(initialBook.status || 'Da leggere');
      setPagesRead(initialBook.pagesRead ? String(initialBook.pagesRead) : '0');
      setTotalPages(initialBook.totalPages ? String(initialBook.totalPages) : '300');
      setStartDate(initialBook.startDate || '');
      setEndDate(initialBook.endDate || '');
      setCoverUrl(initialBook.coverUrl || '');
    }
  }, [initialBook, isOpen]);

  if (!initialBook) return null;

  const handleStatusChange = (newStatus: BookStatus) => {
    setStatus(newStatus);
    const today = new Date().toISOString().split('T')[0];
    if (newStatus === 'In lettura' && !startDate) {
      setStartDate(today);
    } else if (newStatus === 'Letto') {
      if (!startDate) setStartDate(today);
      if (!endDate) setEndDate(today);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmSave({
      title: initialBook.title || 'Senza titolo',
      author: initialBook.author || 'Autore sconosciuto',
      coverUrl: coverUrl.trim() || initialBook.coverUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400',
      status,
      startDate: startDate || '',
      endDate: endDate || '',
      totalPages: totalPages ? parseInt(totalPages, 10) : undefined,
      pagesRead: pagesRead ? parseInt(pagesRead, 10) : 0,
      genre: initialBook.genre || 'Narrativa',
      subgenre: initialBook.subgenre,
      isbn: initialBook.isbn,
      notes: initialBook.notes
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-md bg-[#FCFBF8] dark:bg-[#33302D] text-[#4A4743] dark:text-[#E0DCD3] rounded-3xl p-5 shadow-2xl border border-[#EBE5D9] dark:border-[#4A4743]/60 max-h-[90vh] overflow-y-auto flex flex-col space-y-4 select-none"
          >
            {/* Header Modale */}
            <div className="flex items-center justify-between pb-3 border-b border-[#EBE5D9] dark:border-[#4A4743]/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#5C6B55]/15 text-[#5C6B55] dark:text-[#A8BB9C] flex items-center justify-center border border-[#5C6B55]/30">
                  <PenTool className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#4A4743] dark:text-[#E0DCD3]">Registra & Personalizza</h3>
                  <p className="text-[11px] text-[#7A756D] dark:text-[#A09A90]">Imposta avanzamento, date o copertina</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-[#EBE5D9] dark:bg-[#383532] text-[#4A4743] dark:text-[#E0DCD3] hover:bg-[#DCD5C6] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Anteprima Libro */}
            <div className="flex items-center gap-3 bg-[#F4F1EA] dark:bg-[#2A2826] p-3 rounded-2xl border border-[#EBE5D9] dark:border-[#4A4743]/50">
              <img
                src={coverUrl.trim() || initialBook.coverUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400'}
                alt={initialBook.title}
                className="w-12 h-16 object-cover rounded-lg border border-[#DCD5C6] dark:border-[#4A4743]/60 shrink-0 shadow-xs"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400';
                }}
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-black text-[#31362F] dark:text-[#E0DCD3] truncate leading-tight">
                  {initialBook.title}
                </h4>
                <p className="text-[11px] font-medium text-[#7A756D] dark:text-[#9A9488] truncate mt-0.5">
                  {initialBook.author}
                </p>
              </div>
            </div>

            {/* Form Personalizzazione */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Selettore Stato Lettura */}
              <div>
                <label className="block text-xs font-extrabold text-[#4A4743] dark:text-[#E0DCD3] mb-1.5">
                  Stato Lettura
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'Da leggere', label: 'Da leggere', icon: BookOpen },
                    { id: 'In lettura', label: 'In lettura', icon: Clock },
                    { id: 'Letto', label: 'Letto', icon: CheckCircle2 }
                  ].map((tab) => {
                    const IconC = tab.icon;
                    const isSel = status === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => handleStatusChange(tab.id as BookStatus)}
                        className={`py-2 px-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 border transition-all cursor-pointer ${
                          isSel
                            ? 'bg-[#5C6B55] text-white border-[#5C6B55] shadow-xs'
                            : 'bg-[#F4F1EA] dark:bg-[#2A2826] text-[#7A756D] dark:text-[#9A9488] border-[#DCD5C6] dark:border-[#4A4743]/60 hover:text-[#31362F]'
                        }`}
                      >
                        <IconC size={15} />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Pagine Lette e Totali (se In lettura o per monitorare) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#4A4743] dark:text-[#E0DCD3] mb-1">
                    Pagina Attuale
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    min="0"
                    placeholder="es. 120"
                    value={pagesRead}
                    onChange={(e) => setPagesRead(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F4F1EA] dark:bg-[#2A2826] border border-[#DCD5C6] dark:border-[#4A4743]/60 rounded-xl text-xs text-[#4A4743] dark:text-[#E0DCD3] outline-none focus:border-[#5C6B55]"
                  />
                </div>
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
                    className="w-full px-3 py-2 bg-[#F4F1EA] dark:bg-[#2A2826] border border-[#DCD5C6] dark:border-[#4A4743]/60 rounded-xl text-xs text-[#4A4743] dark:text-[#E0DCD3] outline-none focus:border-[#5C6B55]"
                  />
                </div>
              </div>

              {/* Date Inizio e Fine */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#4A4743] dark:text-[#E0DCD3] mb-1 flex items-center gap-1">
                    <Calendar size={12} /> Data Inizio
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F4F1EA] dark:bg-[#2A2826] border border-[#DCD5C6] dark:border-[#4A4743]/60 rounded-xl text-xs text-[#4A4743] dark:text-[#E0DCD3] outline-none focus:border-[#5C6B55]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#4A4743] dark:text-[#E0DCD3] mb-1 flex items-center gap-1">
                    <Calendar size={12} /> Data Fine
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F4F1EA] dark:bg-[#2A2826] border border-[#DCD5C6] dark:border-[#4A4743]/60 rounded-xl text-xs text-[#4A4743] dark:text-[#E0DCD3] outline-none focus:border-[#5C6B55]"
                  />
                </div>
              </div>

              {/* URL Copertina Personalizzata */}
              <div>
                <label className="block text-xs font-semibold text-[#4A4743] dark:text-[#E0DCD3] mb-1 flex items-center gap-1">
                  <ImageIcon size={12} /> URL Copertina Personalizzata
                </label>
                <input
                  type="url"
                  placeholder="Incolla link immagine (https://...)"
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F4F1EA] dark:bg-[#2A2826] border border-[#DCD5C6] dark:border-[#4A4743]/60 rounded-xl text-xs text-[#4A4743] dark:text-[#E0DCD3] outline-none focus:border-[#5C6B55]"
                />
              </div>

              {/* Bottoni Azione */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-[#DCD5C6] dark:border-[#4A4743]/60 text-[#4A4743] dark:text-[#E0DCD3] font-semibold text-xs hover:bg-[#EBE5D9] dark:hover:bg-[#383532] transition-colors cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-[#5C6B55] hover:bg-[#4D5A46] text-white shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Check size={14} />
                  <span>Conferma e Salva</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
