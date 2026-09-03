import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

interface ModalContextType {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  registerModalOpen: (isOpen: boolean, id?: string) => () => void;
}

const ModalContext = createContext<ModalContextType>({
  isModalOpen: false,
  setIsModalOpen: () => {},
  registerModalOpen: () => () => {}
});

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeModalIds, setActiveModalIds] = useState<Set<string>>(() => new Set());
  const fallbackCounterRef = useRef(0);

  const setIsModalOpen = useCallback((open: boolean) => {
    setActiveModalIds(prev => {
      const next = new Set(prev);
      const fallbackId = '__manual_modal__';
      if (open) {
        next.add(fallbackId);
      } else {
        next.delete(fallbackId);
      }
      return next;
    });
  }, []);

  const registerModalOpen = useCallback((isOpen: boolean, customId?: string) => {
    const id = customId || `modal-${++fallbackCounterRef.current}`;
    if (isOpen) {
      setActiveModalIds(prev => {
        if (prev.has(id)) return prev;
        const next = new Set(prev);
        next.add(id);
        return next;
      });
    } else {
      setActiveModalIds(prev => {
        if (!prev.has(id)) return prev;
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }

    return () => {
      setActiveModalIds(prev => {
        if (!prev.has(id)) return prev;
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    };
  }, []);

  const isModalOpen = activeModalIds.size > 0;

  // Blocco dello scorrimento del background a livello globale quando una scheda/modale è aperta
  useEffect(() => {
    if (isModalOpen) {
      const originalBodyOverflow = document.body.style.overflow;
      const originalBodyTouchAction = document.body.style.touchAction;
      const originalDocOverflow = document.documentElement.style.overflow;

      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      document.documentElement.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = originalBodyOverflow;
        document.body.style.touchAction = originalBodyTouchAction;
        document.documentElement.style.overflow = originalDocOverflow;
      };
    }
  }, [isModalOpen]);

  return (
    <ModalContext.Provider
      value={{
        isModalOpen,
        setIsModalOpen,
        registerModalOpen
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => useContext(ModalContext);

/**
 * Custom hook for modals to automatically inform ModalContext when they are open
 */
export const useRegisterModal = (isOpen: boolean) => {
  const { registerModalOpen } = useModal();
  const idRef = useRef<string | null>(null);

  if (!idRef.current) {
    idRef.current = `modal-hook-${Math.random().toString(36).substring(2, 9)}`;
  }

  useEffect(() => {
    return registerModalOpen(isOpen, idRef.current || undefined);
  }, [isOpen, registerModalOpen]);
};
