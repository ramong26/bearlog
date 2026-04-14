import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type TodoMode = 'MANUAL' | 'GITHUB';

interface TodoModeStore {
  mode: TodoMode;
  setMode: (mode: TodoMode) => void;
}

export const useTodoModeStore = create<TodoModeStore>()(
  persist(
    (set) => ({
      mode: 'MANUAL',
      setMode: (mode) => set({ mode }),
    }),
    {
      name: 'todo-mode',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
