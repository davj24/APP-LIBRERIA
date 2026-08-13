import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, PenTool, Sparkles, BookPlus } from 'lucide-react';

import { useRegisterModal } from '../../context/ModalContext';

interface AddBookChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCamera: () => void;
  onSelectManual: () => void;
}

export const AddBookChoiceModal: React.FC<AddBookChoiceModalProps> = ({
  isOpen,
  onClose,
  onSelectCamera,
  onSelectManual
}) => {
  useRegisterModal(isOpen);
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
            className="bg-[#FCFBF8] dark:bg-[#33302D] text-[#4A4743] dark:text-[#E0DCD3] w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-[#EBE5D9] dark:border-[#4A4743]/60 space-y-4 transition-colors"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#EBE5D9] dark:border-[#4A4743]/50 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#B0BEA9] dark:bg-[#5C6B55] text-[#31362F] dark:text-[#E0DCD3] flex items-center justify-center">
                  <BookPlus className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#4A4743] dark:text-[#E0DCD3]">Aggiungi un Libro</h2>
                  <p className="text-[11px] text-[#7A756D] dark:text-[#A09A90]">Scegli la modalità di inserimento</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-[#EBE5D9] dark:bg-[#383532] text-[#4A4743] dark:text-[#E0DCD3] hover:bg-[#DCD5C6] flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Action Choice Cards */}
            <div className="grid grid-cols-1 gap-3 pt-1">
              {/* Camera Option */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                onClick={() => {
                  onClose();
                  onSelectCamera();
                }}
                className="group text-left p-4 rounded-2xl bg-[#B0BEA9] dark:bg-[#5C6B55] text-[#31362F] dark:text-[#E0DCD3] shadow-md shadow-[#B0BEA9]/30 hover:bg-[#A0AF99] flex items-center gap-3.5 border border-[#A0AF99] dark:border-[#4D5A46]"
              >
                <div className="w-12 h-12 rounded-xl bg-[#31362F]/10 dark:bg-white/10 flex items-center justify-center text-[#31362F] dark:text-[#E0DCD3] shrink-0 group-hover:scale-110 transition-transform">
                  <Camera className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 font-bold text-sm">
                    <span>Fotocamera & Scanner</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-700 fill-amber-700" />
                  </div>
                  <p className="text-xs text-[#31362F]/80 dark:text-[#E0DCD3]/80 mt-0.5 font-medium">
                    Inquadra il codice a barre ISBN o la copertina per l'autocompilazione rapida.
                  </p>
                </div>
              </motion.button>

              {/* Manual Option */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                onClick={() => {
                  onClose();
                  onSelectManual();
                }}
                className="group text-left p-4 rounded-2xl bg-[#F4F1EA] dark:bg-[#2A2826] hover:bg-[#EBE5D9] dark:hover:bg-[#383532] border border-[#DCD5C6] dark:border-[#4A4743]/60 text-[#4A4743] dark:text-[#E0DCD3] flex items-center gap-3.5 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-[#EBE5D9] dark:bg-[#383532] text-[#4A4743] dark:text-[#E0DCD3] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <PenTool className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm">Inserimento Manuale</h3>
                  <p className="text-xs text-[#7A756D] dark:text-[#A09A90] mt-0.5">
                    Compila manualmente titolo, autore, stato lettura e date.
                  </p>
                </div>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
