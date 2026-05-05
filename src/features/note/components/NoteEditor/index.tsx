'use client';

import clsx from 'clsx';
import EditorToolbar from './EditorToolbar';
import EditorTitle from './EditorTitle';
import EditorMeta from './EditorMeta';
import EditorContent from './EditorContent';
import { useBreakpoint } from '@/shared/hooks/useBreakPoint';
import { NoteEditorProps } from '../../types/types';
import { mapNoteTagsFromSource } from '../../utils/utils';

export default function NoteEditor({
  editor,
  title,
  onTitleChange,
  createdAt,
  linkUrl,
  onLinkUrlChange,
  goal,
  todo,
}: NoteEditorProps) {
  const isMobile = useBreakpoint() === 'mobile';

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 30) {
      onTitleChange(value);
    }
  };

  const tags = mapNoteTagsFromSource({
    source: todo?.source,
    tags: todo?.tags,
    sourceItemId: todo?.sourceItemId,
    status: todo?.status,
  });

  return (
    <div
      className={clsx(
        'flex h-full w-full min-w-0 flex-col bg-white dark:bg-gray-850',
        'gap-[10px] rounded-3xl p-4',
        'md:rounded-4xl md:px-[30px] md:py-8',
      )}
    >
      {!isMobile && <EditorToolbar editor={editor} onLinkUrlChange={onLinkUrlChange} />}

      <section className="border-b border-b-[#DDD] dark:border-b-[#555555] pb-4 md:pt-[19px] md:pb-5 lg:pb-7">
        <EditorTitle title={title} onChange={handleTitleChange} />
        <EditorMeta
          goal={{ title: goal?.title ?? todo?.goal?.title ?? '' }}
          todos={{ title: todo?.title ?? '', done: todo?.done ?? false }}
          tags={tags}
          createdAt={createdAt}
        />
      </section>
      <EditorContent editor={editor} linkUrl={linkUrl} onLinkUrlChange={onLinkUrlChange} />
    </div>
  );
}
