import { create } from 'zustand';
import { ReactNode } from 'react';

interface ModalStore {
  isOpen: boolean;
  content: ReactNode | null;
  onClose?: () => void;
  variant: 'center' | 'bottom';
  openModal: (content: ReactNode, onClose?: () => void, variant?: 'center' | 'bottom') => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalStore>((set, get) => ({
  isOpen: false,
  content: null,
  onClose: undefined,
  variant: 'center',

  openModal: (content, onClose, variant = 'center') => set({ isOpen: true, content, onClose, variant }),
  closeModal: () => {
    get().onClose?.();
    set({ isOpen: false, content: null, onClose: undefined, variant: 'center' });
  },
}));
