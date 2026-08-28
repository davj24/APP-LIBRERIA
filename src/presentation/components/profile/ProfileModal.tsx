import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Sparkles, Target, BookOpen, Check, Edit3 } from 'lucide-react';
import { useUserProfile } from '../../hooks/useUserProfile';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

import { useRegisterModal } from '../../context/ModalContext';

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  useRegisterModal(isOpen);
  const { profile, updateProfile, initials } = useUserProfile();
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: profile.name,
    bio: profile.bio,
    readingGoal: profile.readingGoal,
    avatarColor: profile.avatarColor
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: profile.name,
        bio: profile.bio,
        readingGoal: profile.readingGoal,
        avatarColor: profile.avatarColor
      });
      setIsEditing(false);
    }
  }, [isOpen, profile]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
    setIsEditing(false);
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
            className="bg-[#FCFBF8] dark:bg-[#33302D] text-[#4A4743] dark:text-[#E0DCD3] w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-[#EBE5D9] dark:border-[#4A4743]/60 max-h-[90vh] overflow-y-auto space-y-5 transition-colors"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#EBE5D9] dark:border-[#4A4743]/50 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#B0BEA9] dark:bg-[#5C6B55] text-[#31362F] dark:text-[#E0DCD3] flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#4A4743] dark:text-[#E0DCD3]">Profilo Utente</h2>
                  <p className="text-[11px] text-[#7A756D] dark:text-[#A09A90]">Visualizza e modifica le tue informazioni</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-[#EBE5D9] dark:bg-[#383532] text-[#4A4743] dark:text-[#E0DCD3] hover:bg-[#DCD5C6] flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Card / View Header */}
            <div className="relative rounded-2xl bg-[#31362F] dark:bg-[#252924] p-5 text-white shadow-lg overflow-hidden border border-[#252924]">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <Sparkles className="w-32 h-32 text-white" />
              </div>

              <div className="flex items-center gap-4 relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-[#B0BEA9] dark:bg-[#5C6B55] text-[#31362F] dark:text-[#E0DCD3] font-black text-2xl flex items-center justify-center shadow-lg border-2 border-white/20 shrink-0 transition-all">
                  {initials}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-extrabold tracking-tight truncate flex items-center gap-1.5 text-white">
                    <span>{isEditing ? formData.name || 'Nome' : profile.name}</span>
                  </h3>
                  <p className="text-xs text-[#EBE5D9] font-medium truncate mt-0.5">
                    {isEditing ? formData.bio || 'Bio' : profile.bio}
                  </p>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-[11px] font-semibold text-[#EBE5D9] border border-white/10 backdrop-blur-xs">
                    <Target className="w-3 h-3 text-amber-400" />
                    <span>Obiettivo: {isEditing ? formData.readingGoal : profile.readingGoal} libri/anno</span>
                  </div>
                </div>
              </div>
            </div>

            {!isEditing ? (
              /* View Mode */
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#F4F1EA] dark:bg-[#2A2826] border border-[#EBE5D9] dark:border-[#4A4743]/50 rounded-2xl p-3.5 text-center">
                    <div className="text-xs text-[#7A756D] dark:text-[#A09A90] font-medium mb-1 flex items-center justify-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-[#31362F] dark:text-[#E0DCD3]" />
                      <span>Obiettivo 2026</span>
                    </div>
                    <div className="text-xl font-black text-[#4A4743] dark:text-[#E0DCD3]">
                      {profile.readingGoal} <span className="text-xs font-semibold text-[#7A756D] dark:text-[#A09A90]">libri</span>
                    </div>
                  </div>

                  <div className="bg-[#F4F1EA] dark:bg-[#2A2826] border border-[#EBE5D9] dark:border-[#4A4743]/50 rounded-2xl p-3.5 text-center">
                    <div className="text-xs text-[#7A756D] dark:text-[#A09A90] font-medium mb-1 flex items-center justify-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Stato Account</span>
                    </div>
                    <div className="text-xs font-bold text-[#2D382B] dark:text-[#E0DCD3] mt-1 inline-flex items-center gap-1 bg-[#D8E2D5] dark:bg-[#3B4838] border border-[#B0BEA9] dark:border-[#5C6B55] px-2 py-0.5 rounded-full">
                      <Check className="w-3 h-3 text-[#4D6349] dark:text-[#788C71]" /> Attivo
                    </div>
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  onClick={() => setIsEditing(true)}
                  className="w-full py-3 rounded-2xl bg-[#B0BEA9] dark:bg-[#5C6B55] text-[#31362F] dark:text-[#E0DCD3] font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#B0BEA9]/30 hover:bg-[#A0AF99] active:scale-98 transition-all border border-[#A0AF99] dark:border-[#4D5A46]"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Modifica Profilo</span>
                </motion.button>
              </div>
            ) : (
              /* Edit Form Mode */
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#4A4743] dark:text-[#E0DCD3] mb-1">Nome Completo</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F1EA] dark:bg-[#2A2826] border border-[#DCD5C6] dark:border-[#4A4743]/60 text-xs text-[#4A4743] dark:text-[#E0DCD3] focus:outline-none focus:border-[#B0BEA9] dark:focus:border-[#5C6B55]"
                    placeholder="Inserisci il tuo nome"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A4743] dark:text-[#E0DCD3] mb-1">Descrizione / Bio</label>
                  <input
                    type="text"
                    value={formData.bio}
                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F1EA] dark:bg-[#2A2826] border border-[#DCD5C6] dark:border-[#4A4743]/60 text-xs text-[#4A4743] dark:text-[#E0DCD3] focus:outline-none focus:border-[#B0BEA9] dark:focus:border-[#5C6B55]"
                    placeholder="es. Lettore appassionato di saggi"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A4743] dark:text-[#E0DCD3] mb-1">Obiettivo Annuale Libri</label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={formData.readingGoal}
                    onChange={e => setFormData({ ...formData, readingGoal: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F1EA] dark:bg-[#2A2826] border border-[#DCD5C6] dark:border-[#4A4743]/60 text-xs text-[#4A4743] dark:text-[#E0DCD3] focus:outline-none focus:border-[#B0BEA9] dark:focus:border-[#5C6B55]"
                  />
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-2.5 rounded-xl border border-[#DCD5C6] dark:border-[#4A4743]/60 text-[#4A4743] dark:text-[#E0DCD3] font-semibold text-xs hover:bg-[#EBE5D9] dark:hover:bg-[#383532] transition-colors"
                  >
                    Annulla
                  </button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-[#B0BEA9] dark:bg-[#5C6B55] text-[#31362F] dark:text-[#E0DCD3] font-bold text-xs hover:bg-[#A0AF99] shadow-md shadow-[#B0BEA9]/30 transition-all border border-[#A0AF99] dark:border-[#4D5A46]"
                  >
                    Salva Modifiche
                  </motion.button>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
