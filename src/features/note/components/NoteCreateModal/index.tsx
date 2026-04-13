'use client';

import { useState } from 'react';
import { XIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import { useModalStore } from '@/shared/stores/useModalStore';
import { useLanguage } from '@/shared/contexts/LanguageContext';
import { todoQueries } from '@/shared/lib/query/queryKeys';
import Button from '@/shared/components/Button';
import FormField from '@/shared/components/FormField';
import Dropdown from '@/shared/components/Dropdown';

interface NoteCreateModalProps {
  goalId: number;
  onConfirm: (todoId: number) => void;
}

export default function NoteCreateModal({ goalId, onConfirm }: NoteCreateModalProps) {
  const { closeModal } = useModalStore();
  const { t } = useLanguage();

  const [selectedTodoId, setSelectedTodoId] = useState<string>('');

  const { data: todoList } = useQuery(todoQueries.list({ goalId }));
  const todoItems = (todoList?.todos ?? []).map((todo) => ({
    label: todo.title,
    value: String(todo.id),
  }));

  return (
    <div className="w-85.75 rounded-3xl bg-white p-4 shadow-[0px_0px_60px_0px_rgba(0,0,0,0.05)] md:w-114 md:rounded-[40px] md:p-8">
      <div className="flex flex-col">
        <div className="mb-6 flex w-full items-center justify-between self-stretch md:mb-8">
          <h2 className="text-base font-semibold text-slate-800 md:text-xl">{t.note.todoSelectTitle}</h2>
          <XIcon className="cursor-pointer text-slate-400" size={24} onClick={closeModal} />
        </div>

        <FormField label={t.note.todoSelectLabel} required className="mb-8 md:mb-10">
          <Dropdown
            placeholder={t.note.todoSelectPlaceholder}
            items={todoItems}
            selectedValue={selectedTodoId}
            onSelectItem={(item) => setSelectedTodoId(item.value)}
          />
        </FormField>

        <div className="flex gap-3">
          <Button
            variant="cancel"
            className="flex-1 px-[18px] py-[10px] text-sm text-gray-500 md:py-[14px] md:text-[18px]"
            onClick={closeModal}
          >
            {t.modal.cancel}
          </Button>
          <Button
            variant="primary"
            className="flex-1 px-[18px] py-[10px] text-sm md:py-[14px] md:text-[18px]"
            disabled={!selectedTodoId}
            onClick={() => {
              onConfirm(Number(selectedTodoId));
              closeModal();
            }}
          >
            {t.modal.confirm}
          </Button>
        </div>
      </div>
    </div>
  );
}
