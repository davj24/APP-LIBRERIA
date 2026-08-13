import React from 'react';
import { motion } from 'framer-motion';
import { ScanLine } from 'lucide-react';

interface FABProps {
  onClick: () => void;
  ariaLabel?: string;
}

export const FAB: React.FC<FABProps> = ({ onClick, ariaLabel = 'Scansiona o aggiungi libro' }) => {
  return (
    <motion.button
      onClick={onClick}
      aria-label={ariaLabel}
      title="Scansiona o aggiungi libro"
      whileTap={{ scale: 0.90 }}
      whileHover={{ scale: 1.08 }}
      transition={{ type: 'spring', damping: 18, stiffness: 400 }}
      className="fixed bottom-20 right-5 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/40 flex items-center justify-center group"
    >
      <ScanLine className="w-7 h-7 stroke-[2.2] group-hover:scale-110 transition-transform duration-300" />
    </motion.button>
  );
};
