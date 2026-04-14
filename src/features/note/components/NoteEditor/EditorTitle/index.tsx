'use client';

import Image from 'next/image';
import Input from '@/shared/components/Input';
import clsx from 'clsx';
import { useLanguage } from '@/shared/contexts/LanguageContext';

type EditorTitleProps = {
  title: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readOnly?: boolean;
};

export default function EditorTitle({ title, onChange, readOnly = false }: EditorTitleProps) {
  const { t } = useLanguage();
  return (
    <section className="flex w-full items-center justify-between gap-3 pb-[30px]">
      <Image src={'/image/note.png'} width={40} height={40} alt="노트 아이콘" className="shrink-0" />
      <Input
        value={title}
        onChange={onChange}
        readOnly={readOnly}
        maxLength={30}
        placeholder={t.note.titlePlaceholder}
        className={clsx(
          'min-w-0 flex-1 border-none p-0 text-left text-slate-700 outline-none',
          'text-base font-semibold',
          'md:text-2xl md:font-semibold',
          readOnly && 'cursor-default',
        )}
      />
      {/* readOnly일 때 글자수 카운터 숨기고 x 표시 */}
      {!readOnly && (
        <p className="shrink-0 text-right text-xs font-medium text-slate-500">
          {title.length}/<span className="text-bearlog-500">30</span>
        </p>
      )}
    </section>
  );
}
