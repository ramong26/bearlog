import { create } from 'zustand';
import { ReactNode } from 'react';

interface MobileHeaderStore {
  slot: ReactNode | null;
  setSlot: (slot: ReactNode | null) => void;
}

export const useMobileHeaderStore = create<MobileHeaderStore>((set) => ({
  slot: null,
  setSlot: (slot) => set({ slot }),
}));
