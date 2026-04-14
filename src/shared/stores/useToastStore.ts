import { create } from 'zustand';

interface ToastStore {
  show: boolean;
  message: string;
  variant: 'success' | 'fail';
  showToast: (message: string, variant?: 'success' | 'fail') => void;
  hideToast: () => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  show: false,
  message: '',
  variant: 'success',
  showToast: (message, variant = 'success') => set({ show: true, message, variant }),
  hideToast: () => set({ show: false }),
}));
