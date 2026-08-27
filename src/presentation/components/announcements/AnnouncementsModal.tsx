import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Megaphone,
  X,
  Plus,
  Trash2,
  Pin,
  Send,
  ShieldCheck,
  Bell,
  CheckCheck,
  Clock
} from 'lucide-react';
import {
  announcementService,
  getRelativeTime,
  type AppAnnouncement
} from '../../../infrastructure/services/announcementService';
import { useRegisterModal } from '../../context/ModalContext';

interface AnnouncementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDevUnlocked: boolean;
}

export const AnnouncementsModal: React.FC<AnnouncementsModalProps> = ({
  isOpen,
  onClose,
  isDevUnlocked
}) => {
  useRegisterModal(isOpen);

  const [announcements, setAnnouncements] = useState<AppAnnouncement[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [filterTab, setFilterTab] = useState<'all' | 'unread'>('all');
  const [isPublishingOpen, setIsPublishingOpen] = useState(false);

  // Form stato per sviluppatori
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newAuthor] = useState('Developer Team');
  const [newTag, setNewTag] = useState<'Nuovo' | 'Aggiornamento' | 'Avviso' | 'Manutenzione'>('Nuovo');
  const [newPinned, setNewPinned] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const list = announcementService.getAnnouncements();
      setAnnouncements(list);
      setReadIds(announcementService.getReadIds());

      // Tenta aggiornamento da Supabase remote
      announcementService.fetchAnnouncementsRemote().then((remoteList) => {
        setAnnouncements(remoteList);
      });
    }
  }, [isOpen]);

  const handleMarkAllAsRead = () => {
    const updatedIds = announcementService.markAllAsRead(announcements);
    setReadIds(updatedIds);
  };

  const handleMarkSingleAsRead = (id: string) => {
    const updatedIds = announcementService.markAsRead(id);
    setReadIds(updatedIds);
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    setIsSubmitting(true);
    try {
      const created = await announcementService.addAnnouncement({
        title: newTitle.trim(),
        content: newContent.trim(),
        author: newAuthor.trim() || 'Sviluppatore',
        tag: newTag,
        pinned: newPinned
      });

      setAnnouncements(prev => [created, ...prev]);
      setNewTitle('');
      setNewContent('');
      setIsPublishingOpen(false);
    } catch (err) {
      console.error('Errore pubblicazione comunicazione:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = announcementService.deleteAnnouncement(id);
    setAnnouncements(updated);
  };

  const unreadCount = announcements.filter(a => !readIds.includes(a.id)).length;

  const filteredAnnouncements = announcements.filter(a => {
    if (filterTab === 'unread') {
      return !readIds.includes(a.id);
    }
    return true;
  });

  const getTagBadgeStyle = (tag?: string) => {
    switch (tag) {
      case 'Nuovo':
        return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30';
      case 'Aggiornamento':
        return 'bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/30';
      case 'Avviso':
        return 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30';
      case 'Manutenzione':
        return 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30';
      default:
        return 'bg-[#5C6B55]/15 text-[#5C6B55] dark:text-[#A8BB9C] border-[#5C6B55]/30';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop con sfocatura */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
          />

          {/* Dialog Modale Comunicazioni dall'App */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="relative z-10 w-full max-w-md bg-[#FCFBF8] dark:bg-[#2A2826] rounded-3xl p-5 sm:p-6 shadow-2xl border border-[#EBE5D9] dark:border-[#4A4743]/60 max-h-[88vh] flex flex-col overflow-hidden"
          >
            {/* Header Modale */}
            <div className="flex items-center justify-between pb-3 border-b border-[#EBE5D9] dark:border-[#4A4743]/50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#5C6B55]/15 text-[#5C6B55] dark:text-[#A8BB9C] flex items-center justify-center border border-[#5C6B55]/30">
                  <Megaphone size={20} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#31362F] dark:text-[#E0DCD3] leading-tight flex items-center gap-1.5">
                    <span>Comunicazioni dall'App</span>
                  </h3>
                  <p className="text-xs text-[#7A756D] dark:text-[#9A9488] font-medium">
                    Notizie, aggiornamenti ed avvisi del team
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-[#EBE5D9] dark:bg-[#383532] text-[#4A4743] dark:text-[#E0DCD3] hover:bg-[#DCD5C6] flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            {/* Barra dei Filtri & Azioni (Tutti vs Non Letti + Segna Tutti Come Letti) */}
            <div className="flex items-center justify-between gap-2 pt-3 shrink-0">
              <div className="bg-[#EBE5D9] dark:bg-[#383532] p-1 rounded-xl flex items-center gap-1 border border-[#DCD5C6] dark:border-[#4A4743]/60">
                <button
                  onClick={() => setFilterTab('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                    filterTab === 'all'
                      ? 'bg-[#B0BEA9] dark:bg-[#5C6B55] text-[#31362F] dark:text-[#E0DCD3] shadow-xs'
                      : 'text-[#7A756D] dark:text-[#A09A90] hover:text-[#31362F]'
                  }`}
                >
                  Tutti ({announcements.length})
                </button>

                <button
                  onClick={() => setFilterTab('unread')}
                  className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1 ${
                    filterTab === 'unread'
                      ? 'bg-[#B0BEA9] dark:bg-[#5C6B55] text-[#31362F] dark:text-[#E0DCD3] shadow-xs'
                      : 'text-[#7A756D] dark:text-[#A09A90] hover:text-[#31362F]'
                  }`}
                >
                  <span>Non letti</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-black">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="px-2.5 py-1.5 bg-[#EBE5D9] dark:bg-[#383532] hover:bg-[#DCD5C6] text-[#31362F] dark:text-[#E0DCD3] rounded-xl text-[11px] font-extrabold flex items-center gap-1 cursor-pointer transition-colors shrink-0"
                  title="Segna tutte come lette"
                >
                  <CheckCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
                  <span>Segna letti</span>
                </button>
              )}
            </div>

            {/* Banner Stato Sviluppatore se sbloccato */}
            {isDevUnlocked && (
              <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-amber-600 dark:text-amber-400 shrink-0" />
                  <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                    Modalità Sviluppatore Attiva
                  </span>
                </div>
                <button
                  onClick={() => setIsPublishingOpen(!isPublishingOpen)}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-extrabold shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>{isPublishingOpen ? 'Annulla' : 'Scrivi Nuova'}</span>
                </button>
              </div>
            )}

            {/* Form Scrittura Comunicazione per Sviluppatore */}
            <AnimatePresence>
              {isDevUnlocked && isPublishingOpen && (
                <motion.form
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  onSubmit={handlePublish}
                  className="mt-3 p-4 bg-[#F7F4EE] dark:bg-[#201E1C] rounded-2xl border border-[#E8E3D8] dark:border-[#312E2A] space-y-3 shrink-0 overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#5C6B55] dark:text-[#A8BB9C]">
                      ✍️ Pubblica Comunicazione
                    </span>
                    <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md">
                      Dev Mode
                    </span>
                  </div>

                  <input
                    type="text"
                    placeholder="Titolo comunicazione (es. Aggiornamento v2.1)"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FCFBF8] dark:bg-[#2A2826] border border-[#E2DDD2] dark:border-[#36322E] text-xs font-bold text-[#31362F] dark:text-[#E0DCD3] outline-none focus:ring-2 focus:ring-[#5C6B55]"
                  />

                  <textarea
                    placeholder="Testo della comunicazione per tutti gli utenti dell'app..."
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    required
                    rows={3}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FCFBF8] dark:bg-[#2A2826] border border-[#E2DDD2] dark:border-[#36322E] text-xs text-[#31362F] dark:text-[#E0DCD3] outline-none focus:ring-2 focus:ring-[#5C6B55] resize-none"
                  />

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-2">
                      <select
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value as any)}
                        className="px-2.5 py-1.5 rounded-xl bg-[#FCFBF8] dark:bg-[#2A2826] border border-[#E2DDD2] dark:border-[#36322E] text-xs font-bold text-[#31362F] dark:text-[#E0DCD3] outline-none"
                      >
                        <option value="Nuovo">Tag: Nuovo</option>
                        <option value="Aggiornamento">Tag: Aggiornamento</option>
                        <option value="Avviso">Tag: Avviso</option>
                        <option value="Manutenzione">Tag: Manutenzione</option>
                      </select>

                      <label className="flex items-center gap-1.5 text-xs text-[#7A756D] dark:text-[#9A9488] font-bold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newPinned}
                          onChange={(e) => setNewPinned(e.target.checked)}
                          className="rounded text-[#5C6B55] focus:ring-0"
                        />
                        <span>In Evidenza</span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-[#5C6B55] hover:bg-[#4D5A46] text-white rounded-xl text-xs font-extrabold shadow-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Send size={13} />
                      <span>Pubblica</span>
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Lista Comunicazioni */}
            <div className="flex-1 overflow-y-auto space-y-3 my-3 pr-1">
              {filteredAnnouncements.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#7A756D] dark:text-[#9A9488] space-y-2">
                  <Bell size={28} className="mx-auto text-[#7A756D]" />
                  <p className="font-bold">
                    {filterTab === 'unread' ? 'Nessuna comunicazione non letta' : 'Nessuna comunicazione presente'}
                  </p>
                </div>
              ) : (
                filteredAnnouncements.map((ann) => {
                  const isRead = readIds.includes(ann.id);
                  const relativeTimeStr = getRelativeTime(ann.createdAt);

                  return (
                    <div
                      key={ann.id}
                      onClick={() => handleMarkSingleAsRead(ann.id)}
                      className={`p-4 rounded-2xl border space-y-2 relative transition-all cursor-pointer ${
                        isRead
                          ? 'bg-[#F7F4EE] dark:bg-[#201E1C] border-[#E8E3D8] dark:border-[#312E2A] opacity-90'
                          : 'bg-[#FCFBF8] dark:bg-[#2A2826] border-[#5C6B55]/50 shadow-xs ring-1 ring-[#5C6B55]/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          {!isRead && (
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" title="Non letta" />
                          )}

                          {ann.pinned && (
                            <span className="p-1 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-400">
                              <Pin size={12} />
                            </span>
                          )}

                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${getTagBadgeStyle(ann.tag)}`}>
                            {ann.tag || 'Comunicazione'}
                          </span>

                          <span className="text-[10px] text-[#7A756D] dark:text-[#9A9488] font-extrabold flex items-center gap-1">
                            <Clock size={11} />
                            <span>{relativeTimeStr}</span>
                          </span>
                        </div>

                        {/* Tasto per CANCELLARE la comunicazione dato a TUTTI GLI UTENTI */}
                        <button
                          onClick={(e) => handleDelete(ann.id, e)}
                          className="text-[#7A756D] hover:text-rose-500 transition-colors p-1 rounded-lg hover:bg-rose-500/10 cursor-pointer shrink-0"
                          title="Elimina comunicazione"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <h4 className="text-xs sm:text-sm font-black text-[#31362F] dark:text-[#E0DCD3] leading-snug">
                        {ann.title}
                      </h4>

                      <p className="text-xs text-[#4A4743] dark:text-[#C5C0B6] leading-relaxed whitespace-pre-line font-medium">
                        {ann.content}
                      </p>

                      <div className="pt-1 text-[10px] text-[#7A756D] dark:text-[#9A9488] font-semibold text-right">
                        Pubblicato da: {ann.author}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Modale */}
            <div className="pt-3 border-t border-[#EBE5D9] dark:border-[#4A4743]/50 text-center shrink-0">
              <p className="text-[10px] text-[#7A756D] dark:text-[#9A9488] font-medium flex items-center justify-center gap-1">
                <span>BiblioDesk Official Updates</span>
                {!isDevUnlocked && (
                  <span className="text-[#9A9488]">• Password Dev: <code className="bg-[#EBE5D9] dark:bg-[#383532] px-1 py-0.5 rounded font-mono text-[#31362F] dark:text-[#E0DCD3]">dev2026</code></span>
                )}
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
