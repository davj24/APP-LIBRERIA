import React, { createContext, useContext, useState, useEffect } from 'react';

interface ModalContextType {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  registerModalOpen: (isOpen: boolean) => () => void;
}

const ModalContext = createContext<ModalContextType>({
  isModalOpen: false,
  setIsModalOpen: () => {},
  registerModalOpen: () => () => {}
});

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modalCount, setModalCount] = useState(0);

  const setIsModalOpen = (open: boolean) => {
    setModalCount(prev => (open ? prev + 1 : Math.max(0, prev - 1)));
  };

  const registerModalOpen = (isOpen: boolean) => {
    if (isOpen) {
      setModalCount(prev => prev + 1);
    }
    return () => {
      if (isOpen) {
        setModalCount(prev => Math.max(0, prev - 1));
      }
    };
  };

  // Blocco dello scorrimento del background a livello globale quando una scheda/modale è aperta
  useEffect(() => {
    const isAnyModalOpen = modalCount > 0;
    if (isAnyModalOpen) {
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
  }, [modalCount > 0]);

  return (
    <ModalContext.Provider
      value={{
        isModalOpen: modalCount > 0,
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

  useEffect(() => {
    return registerModalOpen(isOpen);
  }, [isOpen]);
};
