import React from 'react';
import { ExternalLink, ShoppingBag, Sparkles, BookOpen, Store } from 'lucide-react';
import { getShopActions, type BookInputForShop, type ShopAction } from '../../../infrastructure/helpers/ShopLinksHelper';

export interface BookStoreActionsProps {
  book?: BookInputForShop;
  title?: string;
  author?: string | null;
  isbn?: string | null;
  className?: string;
  showTitle?: boolean;
}

export const BookStoreActions: React.FC<BookStoreActionsProps> = ({
  book,
  title = '',
  author = '',
  isbn = null,
  className = '',
  showTitle = true,
}) => {
  // Supporta sia l'oggetto `book` che le props singole
  const inputBook: BookInputForShop = book || {
    title: title || '',
    author: author || '',
    isbn: isbn || null,
  };

  const actions: ShopAction[] = getShopActions(inputBook);

  if (actions.length === 0) return null;

  const renderIcon = (iconType: string) => {
    switch (iconType) {
      case 'amazon':
        return <ShoppingBag className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />;
      case 'vinted':
        return <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />;
      case 'libraccio':
        return <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />;
      case 'feltrinelli':
      default:
        return <Store className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />;
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {showTitle && (
        <div className="flex items-center justify-between px-0.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#7A756D] dark:text-[#A09A90]">
            Acquisto & Usato Online
          </h4>
          <span className="text-[10px] font-medium text-[#9E988F] dark:text-[#88837A]">
            Link diretti
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {actions.map((action) => (
          <a
            key={action.url}
            href={action.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group p-3 rounded-2xl bg-[#FCFBF8] dark:bg-[#33302D] hover:bg-[#F4F1EA] dark:hover:bg-[#383532] text-[#4A4743] dark:text-[#E0DCD3] border border-[#DCD5C6] dark:border-[#4A4743]/60 shadow-xs hover:border-[#B0BEA9] dark:hover:border-[#5C6B55] flex items-center justify-between gap-2.5 transition-all active:scale-98 cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-[#EBE5D9]/60 dark:bg-[#2A2826] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                {renderIcon(action.iconType)}
              </div>
              <span className="text-xs font-bold truncate group-hover:text-[#31362F] dark:group-hover:text-white transition-colors">
                {action.label}
              </span>
            </div>

            <ExternalLink className="w-3.5 h-3.5 text-[#9E988F] dark:text-[#88837A] group-hover:text-[#5C6B55] dark:group-hover:text-[#A0AF99] shrink-0 transition-colors" />
          </a>
        ))}
      </div>
    </div>
  );
};
