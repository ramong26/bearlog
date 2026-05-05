'use client';

import SinglePostModal from '@/shared/components/Modal/SinglePostModal';
import { useModalStore } from '@/shared/stores/useModalStore';
import clsx from 'clsx';
import { AlignCenter, AlignLeft, AlignRight, Bold, Italic, Link2, List, Underline } from 'lucide-react';
import { Editor } from '@tiptap/react';
import { useBreakpoint } from '@/shared/hooks/useBreakPoint';

interface EditorToolbarProps {
  editor: Editor | null;
  onLinkUrlChange?: (value: string | null) => void;
}

const prevent = (e: React.MouseEvent) => e.preventDefault();

export default function EditorToolbar({ editor, onLinkUrlChange }: EditorToolbarProps) {
  const { openModal } = useModalStore();
  const isMobile = useBreakpoint() === 'mobile';

  const handleLinkUploadClick = () => {
    openModal(<SinglePostModal onConfirm={(url) => onLinkUrlChange?.(url)} />, () => {});
  };

  return (
    <div
      className={clsx(
        'flex h-11 w-full items-center bg-[#FAFAFA] dark:bg-[#3E3E3E] px-4 py-1.5 text-slate-500 dark:text-gray-500',
        !isMobile && 'rounded-[18px]',
      )}
    >
      <button
        onMouseDown={prevent}
        onClick={() => editor?.chain().focus().toggleBold().run()}
        className={clsx(
          'cursor-pointer rounded-lg p-1.5 hover:bg-[#DDD]',
          editor?.isActive('bold') && 'bg-[#DDD] text-slate-700',
        )}
      >
        <Bold size={20} />
      </button>

      <button
        onMouseDown={prevent}
        onClick={() => editor?.chain().focus().toggleItalic().run()}
        className={clsx(
          'cursor-pointer rounded-lg p-1.5 hover:bg-[#DDD]',
          editor?.isActive('italic') && 'bg-[#DDD] text-slate-700',
        )}
      >
        <Italic size={20} />
      </button>

      <button
        onMouseDown={prevent}
        onClick={() => editor?.chain().focus().toggleUnderline().run()}
        className={clsx(
          'cursor-pointer rounded-lg p-1.5 hover:bg-[#DDD]',
          editor?.isActive('underline') && 'bg-[#DDD] text-slate-700',
        )}
      >
        <Underline size={20} />
      </button>

      <button
        onMouseDown={prevent}
        onClick={() => editor?.chain().focus().setTextAlign('left').run()}
        className={clsx(
          'cursor-pointer rounded-lg p-1.5 hover:bg-[#DDD]',
          editor?.isActive({ textAlign: 'left' }) && 'bg-[#DDD] text-slate-700',
        )}
      >
        <AlignLeft size={20} />
      </button>

      <button
        onMouseDown={prevent}
        onClick={() => editor?.chain().focus().setTextAlign('center').run()}
        className={clsx(
          'cursor-pointer rounded-lg p-1.5 hover:bg-[#DDD]',
          editor?.isActive({ textAlign: 'center' }) && 'bg-[#DDD] text-slate-700',
        )}
      >
        <AlignCenter size={20} />
      </button>

      <button
        onMouseDown={prevent}
        onClick={() => editor?.chain().focus().setTextAlign('right').run()}
        className={clsx(
          'cursor-pointer rounded-lg p-1.5 hover:bg-[#DDD]',
          editor?.isActive({ textAlign: 'right' }) && 'bg-[#DDD] text-slate-700',
        )}
      >
        <AlignRight size={20} />
      </button>

      <button
        onMouseDown={prevent}
        onClick={() => editor?.chain().focus().toggleBulletList().run()}
        className={clsx(
          'cursor-pointer rounded-lg p-1.5 hover:bg-[#DDD]',
          editor?.isActive('bulletList') && 'bg-[#DDD] text-slate-700',
        )}
      >
        <List size={20} />
      </button>

      <button onClick={handleLinkUploadClick} className="cursor-pointer rounded-lg p-1.5 hover:bg-[#DDD]">
        <Link2 size={20} className="rotate-135" />
      </button>
    </div>
  );
}
