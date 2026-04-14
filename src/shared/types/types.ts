export type DropdownItemType = {
  value: string;
  label: string;
};

export interface Note {
  id: number;
  title: string;
  todoId: number;
  createdAt: string;
}

export type TodoOptions = 'ALL' | 'TO DO' | 'DONE';
