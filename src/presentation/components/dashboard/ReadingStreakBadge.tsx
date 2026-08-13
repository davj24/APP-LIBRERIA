import React from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

interface ReadingStreakBadgeProps {
  daysStreak?: number;
  onClick?: () => void;
}

export const ReadingStreakBadge: React.FC<ReadingStreakBadgeProps> = ({
  daysStreak = 14,
  onClick
}) => {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      whileTap={{ scale: 0.90 }}
      title={`${daysStreak} giorni consecutivi di lettura!`}
      className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D8A49B] dark:bg-[#8B5D57] text-[#4A3331] dark:text-[#E0DCD3] font-extrabold text-xs shadow-md shadow-[#D8A49B]/30 dark:shadow-[#8B5D57]/20 border border-[#C8948B] dark:border-[#7B4D47] transition-colors focus:outline-none"
    >
      <motion.div
        animate={{ rotate: [-4, 4, -4], scale: [1, 1.1, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <Flame className="w-4 h-4 fill-[#4A3331] dark:fill-[#E0DCD3] text-[#4A3331] dark:text-[#E0DCD3]" />
      </motion.div>
      <span className="tracking-tight">{daysStreak} Giorni</span>
    </motion.button>
  );
};
