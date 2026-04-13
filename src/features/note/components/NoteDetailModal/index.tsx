'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import clsx from 'clsx';
import NoteCloseButton from '@/features/note/components/NoteEditor/EditorTitle/NoteCloseButton';

const ANIMATION_DURATION = 300;

function Backdrop({ onClick, closing }: { onClick: () => void; closing: boolean }) {
  return (
    <div
      className={clsx('fixed inset-0 z-40 bg-black/50 transition-opacity duration-300', closing && 'opacity-0')}
      onClick={onClick}
    />
  );
}

export default function NoteDetailModal({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [closing, setClosing] = useState(false);
  const { goalId } = useParams();

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => router.push(`/goal/${goalId}/note`), ANIMATION_DURATION);
  };

  return (
    <>
      <Backdrop onClick={handleClose} closing={closing} />
      <div
        className={clsx(
          'fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white',
          'lg:w-[744px] lg:rounded-l-[40px]',
          closing ? 'note-panel-exit' : 'note-panel-enter',
        )}
      >
        {children}
        <NoteCloseButton onClose={handleClose} />
      </div>
    </>
  );
}
