import React, { useState, useRef } from 'react';
import { motion, type PanInfo } from 'framer-motion';
import { LayoutDashboard, BookOpen, BarChart2, User, ScanLine } from 'lucide-react';

export type TabType = 0 | 1 | 2 | 3;

interface BottomNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isModalOpen?: boolean;
  onOpenScanner?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  isModalOpen = false,
  onOpenScanner
}) => {
  const [hoveredTab, setHoveredTab] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const tabs = [
    { id: 0 as TabType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 1 as TabType, label: 'Libreria', icon: BookOpen },
    { id: 2 as TabType, label: 'Statistiche', icon: BarChart2 },
    { id: 3 as TabType, label: 'Profilo', icon: User },
  ];

  const handlePan = (_: any, info: PanInfo) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = info.point.x - rect.left;
      const zoneWidth = rect.width / tabs.length;
      const index = Math.floor(x / zoneWidth);
      if (index >= 0 && index < tabs.length) {
        setHoveredTab(index);
      } else {
        setHoveredTab(null);
      }
    }
  };

  const handlePanEnd = () => {
    if (hoveredTab !== null && hoveredTab >= 0 && hoveredTab < tabs.length) {
      setActiveTab(tabs[hoveredTab].id);
    }
    setHoveredTab(null);
  };

  return (
    <motion.div
      initial={{ y: 0, opacity: 1 }}
      animate={{
        y: isModalOpen ? 150 : 0,
        opacity: isModalOpen ? 0 : 1
      }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      style={{ pointerEvents: isModalOpen ? "none" : "auto" }}
      className="fixed bottom-6 left-4 right-4 pb-[env(safe-area-inset-bottom)] flex justify-between items-center z-50"
    >
      <div className="max-w-md mx-auto flex items-center justify-between gap-3 w-full">
        {/* Pillola Navigazione draggabile */}
        <motion.div
          ref={containerRef}
          onPan={handlePan}
          onPanEnd={handlePanEnd}
          className="relative pointer-events-auto flex items-center justify-around p-1.5 bg-[#EBE5D9]/80 dark:bg-[#383532]/80 backdrop-blur-2xl rounded-full border border-[#DCD5C6] dark:border-[#4A4743]/50 flex-1 touch-none select-none"
        >
          {tabs.map((tab, index) => {
            const isActive = activeTab === tab.id;
            const isHovered = hoveredTab === index;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center justify-center px-3.5 py-2.5 rounded-full transition-colors duration-300 focus:outline-none ${
                  isActive ? "text-[#31362F] dark:text-[#E0DCD3]" : "text-[#9E988F] dark:text-[#88837A]"
                }`}
              >
                {/* Bolla Verde Liquida */}
                {isActive && (
                  <motion.div
                    layoutId="activeBolla"
                    className="absolute inset-0 bg-[#B0BEA9] dark:bg-[#5C6B55] rounded-full shadow-md"
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  />
                )}

                {/* Icona con Proximity Hover */}
                <div className="relative z-10 flex items-center gap-2 pointer-events-none">
                  <motion.div
                    animate={{
                      y: isHovered && !isActive ? -4 : 0,
                      scale: isHovered && !isActive ? 1.2 : 1
                    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                  >
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  </motion.div>

                  <motion.div
                    animate={{ width: isActive ? "auto" : 0, opacity: isActive ? 1 : 0 }}
                    transition={{ type: "tween", ease: "circOut", duration: 0.3 }}
                    className="overflow-hidden whitespace-nowrap flex items-center"
                  >
                    <span className="text-xs font-extrabold tracking-tight">{tab.label}</span>
                  </motion.div>
                </div>
              </button>
            );
          })}
        </motion.div>

        {/* Scanner (Destra) */}
        <motion.button
          onClick={onOpenScanner}
          whileTap={{ scale: 0.85 }}
          aria-label="Scansiona libro"
          title="Scansiona codice a barre o copertina"
          className="pointer-events-auto w-14 h-14 flex items-center justify-center bg-[#B0BEA9] dark:bg-[#5C6B55] text-[#31362F] dark:text-[#E0DCD3] rounded-full shadow-lg shrink-0 border border-[#A0AF99] dark:border-[#4D5A46] active:scale-95 transition-all"
        >
          <ScanLine size={24} strokeWidth={2.5} />
        </motion.button>
      </div>
    </motion.div>
  );
};
