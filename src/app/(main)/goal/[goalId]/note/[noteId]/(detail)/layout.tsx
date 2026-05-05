'use client';

import { useRouter, useParams } from 'next/navigation';
import clsx from 'clsx';
import NoteCloseButton from '@/features/note/components/NoteEditor/EditorTitle/NoteCloseButton';

export default function NoteDetailLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { goalId } = useParams<{ goalId: string }>();

  const handleClose = () => {
    router.push('/goal/' + goalId + '/note');
  };

  return (
    <div className={clsx('fixed inset-0 z-50 overflow-y-auto bg-white dark:bg-gray-850')}>
      {children}
      <NoteCloseButton onClose={handleClose} />
    </div>
  );
}
