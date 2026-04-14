'use client';
import { useRef, KeyboardEvent } from 'react';
import Tag from '@/shared/components/Tag';
import { useLanguage } from '@/shared/contexts/LanguageContext';

interface TagInputProps {
  tags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
}

export default function TagInput({ tags, onAddTag, onRemoveTag }: TagInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      if (e.nativeEvent.isComposing) return;

      const trimmed = inputRef.current?.value.trim();
      if (trimmed && !tags.includes(trimmed)) {
        onAddTag(trimmed);
        if (inputRef.current) {
          inputRef.current.value = '';
        }
      }
    }

    if (e.key === 'Backspace' && inputRef.current?.value === '' && tags.length > 0) {
      if (e.nativeEvent.isComposing) return;
      onRemoveTag(tags[tags.length - 1]);
    }
  };

  return (
    <div className="flex min-h-[44px] w-full flex-wrap items-center gap-2 rounded-xl border border-[#CCC] px-3 py-2 md:min-h-[56px] md:rounded-2xl md:px-4 md:py-3">
      {tags.map((tag) => (
        <Tag key={tag} string={tag} onClose={() => onRemoveTag(tag)} className="px-2 py-1 text-xs" />
      ))}

      <input
        type="text"
        ref={inputRef}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? t.todo.tagPlaceholder : ''}
        className="min-w-[80px] flex-1 border-none bg-transparent p-0 text-sm text-[#333] placeholder:text-[#737373] focus:outline-none md:text-base"
      />
    </div>
  );
}
