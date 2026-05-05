'use client';

import PageHeader from '@/shared/components/PageHeader';
import NoteEditor from '@/features/note/components/NoteEditor';
import Button from '@/shared/components/Button';
import { useCallback, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { noteQueries, goalQueries, todoQueries } from '@/shared/lib/query/queryKeys';
import { useDraftNote } from '@/features/note/hooks/useDraftNote';
import { useDraftNoteRestore } from '@/features/note/hooks/useDraftNoteRestore';
import DraftNoteToast from '@/features/note/components/DraftNoteToast';
import { useToastStore } from '@/shared/stores/useToastStore';
import { useMobileHeaderStore } from '@/shared/stores/useMobileHeaderStore';
import { useBreakpoint } from '@/shared/hooks/useBreakPoint';
import { useNoteEditor } from '@/features/note/hooks/useNoteEditor';
import EditorToolbar from '@/features/note/components/NoteEditor/EditorToolbar';
import { createPortal } from 'react-dom';
import { usePatchNote } from '@/shared/lib/query/mutations';
import { useLanguage } from '@/shared/contexts/LanguageContext';
import Empty from '@/shared/components/Empty';

interface NoteEditClientProps {
  noteId: number;
  goalId: number;
}

export default function NoteEditClient({ noteId, goalId }: NoteEditClientProps) {
  const { data: note, isError: isNoteReadError } = useQuery(noteQueries.detail(noteId));
  const { data: goal } = useQuery(goalQueries.detail(goalId));
  const { data: todo } = useQuery({
    ...todoQueries.detail(note?.todoId ?? 0),
    enabled: note?.todoId != null,
  });

  const [title, setTitle] = useState(note?.title ?? '');
  const [content, setContent] = useState(note?.content ?? '');
  const [linkUrl, setLinkUrl] = useState<string | null>(note?.linkUrl ?? null);

  const { showToast } = useToastStore();
  const { saveDraft } = useDraftNote(`note_draft_edit_${noteId}`);
  const setSlot = useMobileHeaderStore((s) => s.setSlot);
  const { t } = useLanguage();

  const { showDraftToast, handleCloseToast, handleToastLoad } = useDraftNoteRestore({
    key: `note_draft_edit_${noteId}`,
    onRestore: (saved) => {
      setTitle(saved.title);
      editor?.commands.setContent(saved.content);
      setLinkUrl(saved.linkUrl ?? null);
    },
  });

  const { mutate: patchNote, isPending } = usePatchNote(noteId, goalId);

  const breakpoint = useBreakpoint();

  const editor = useNoteEditor({ content, onContentChange: setContent });

  const handleSaveDraft = useCallback(() => {
    try {
      saveDraft({ title, content, ...(linkUrl ? { linkUrl } : {}) });
      showToast(t.note.tempSaveSuccess, 'success');
    } catch (error) {
      showToast(t.note.tempSaveFail, 'fail');
      console.error('임시 저장 실패:', error);
    }
  }, [title, content, linkUrl, saveDraft, showToast, t]);

  const handleSubmit = useCallback(() => {
    patchNote({
      title,
      content,
      ...(linkUrl ? { linkUrl } : {}),
    });
  }, [patchNote, title, content, linkUrl]);

  useEffect(() => {
    if (breakpoint !== 'mobile') return;
    setSlot(
      <div className="flex items-center gap-1">
        <div className="relative">
          <button
            type="button"
            className="px-1.5 text-[#737373] transition-all duration-200 hover:text-[#FF8442]"
            onClick={handleSaveDraft}
          >
            {t.note.tempSave}
          </button>
          {showDraftToast && <DraftNoteToast onLoad={handleToastLoad} onClose={handleCloseToast} />}
        </div>
        <button
          type="button"
          className="px-1.5 text-[#737373] transition-all duration-200 hover:text-[#FF8442]"
          onClick={handleSubmit}
        >
          {t.note.edit}
        </button>
      </div>,
    );
    return () => setSlot(null);
  }, [breakpoint, handleSaveDraft, handleSubmit, showDraftToast, handleToastLoad, handleCloseToast, setSlot, t]);

  if (isNoteReadError) return <Empty>노트를 불러오는 데 실패했습니다.</Empty>;

  return (
    <div className="mx-auto flex h-full w-full max-w-[768px] flex-col">
      {breakpoint === 'mobile' &&
        createPortal(
          <EditorToolbar editor={editor} onLinkUrlChange={setLinkUrl} />,
          document.getElementById('mobile-toolbar-slot') ?? document.body,
        )}
      {breakpoint !== 'mobile' && (
        <section className="mb-0 flex shrink-0 items-center justify-between md:mb-3 md:gap-4 lg:mb-[22px]">
          <PageHeader title={t.note.createTitle} />
          <div className="flex gap-2">
            <div className="relative">
              <Button
                onClick={handleSaveDraft}
                variant="secondary"
                className="cursor-pointer text-sm md:h-10 md:px-[27px]"
              >
                {t.note.tempSave}
              </Button>
              {showDraftToast && <DraftNoteToast onLoad={handleToastLoad} onClose={handleCloseToast} />}
            </div>
            <Button
              onClick={handleSubmit}
              disabled={isPending}
              variant="primary"
              className="cursor-pointer text-sm md:h-10 md:px-[27px]"
            >
              {isPending ? `${t.note.edit}...` : t.note.edit}
            </Button>
          </div>
        </section>
      )}

      <section className="flex-1 lg:mb-[30px]">
        <NoteEditor
          editor={editor}
          title={title}
          onTitleChange={setTitle}
          createdAt={note?.createdAt ?? ''}
          linkUrl={linkUrl}
          onLinkUrlChange={setLinkUrl}
          goal={goal}
          todo={todo}
        />
      </section>
    </div>
  );
}
