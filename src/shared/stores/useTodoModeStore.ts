import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type TodoMode = 'MANUAL' | 'GITHUB';

interface TodoModeStore {
  mode: TodoMode;
  hasHydrated: boolean;
  setMode: (mode: TodoMode) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
}

export const useTodoModeStore = create<TodoModeStore>()(
  persist(
    (set) => ({
      mode: 'MANUAL',
      hasHydrated: false,
      setMode: (mode) => set({ mode }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: 'todo-mode',
      storage: createJSONStorage(() => sessionStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
