'use client';

import PageHeader from '@/shared/components/PageHeader';
import NoteEditor from '@/features/note/components/NoteEditor';
import Button from '@/shared/components/Button';
import { useDraftNoteRestore } from '@/features/note/hooks/useDraftNoteRestore';
import { useCallback, useEffect, useState } from 'react';
import { useDraftNote } from '@/features/note/hooks/useDraftNote';
import { useToastStore } from '@/shared/stores/useToastStore';
import { useRouter } from 'next/navigation';
import DraftNoteToast from '@/features/note/components/DraftNoteToast';
import { useBreakpoint } from '@/shared/hooks/useBreakPoint';
import { useNoteEditor } from '@/features/note/hooks/useNoteEditor';
import EditorToolbar from '@/features/note/components/NoteEditor/EditorToolbar';
import { createPortal } from 'react-dom';
import { TodoResponse } from '@/shared/lib/api/fetchTodos';
import { GoalDetailResponse } from '@/shared/lib/api/fetchGoals';
import { useMobileHeaderStore } from '@/shared/stores/useMobileHeaderStore';
import { usePostNote } from '@/shared/lib/query/mutations';
import { useLanguage } from '@/shared/contexts/LanguageContext';

interface NoteCreateClientProps {
  goal: GoalDetailResponse;
  todo: TodoResponse | null;
}

export default function NoteCreateClient({ goal, todo }: NoteCreateClientProps) {
  const todoId = todo?.id ?? null;

  const router = useRouter();
  const { t } = useLanguage();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [createdAt, setCreatedAt] = useState('');
  const [linkUrl, setLinkUrl] = useState<string | null>(null);

  const draftKey = todoId != null ? `note_draft_todo_${todoId}` : `note_draft_goal_${goal.id}`;

  const { saveDraft } = useDraftNote(draftKey);
  const { showToast } = useToastStore();
  const setSlot = useMobileHeaderStore((s) => s.setSlot);

  const { mutate: createNote, isPending } = usePostNote();

  const breakpoint = useBreakpoint();

  const { showDraftToast, handleCloseToast, handleToastLoad } = useDraftNoteRestore({
    key: draftKey,
    onRestore: (saved) => {
      setTitle(saved.title);
      editor?.commands.setContent(saved.content);
      setCreatedAt(saved.savedAt);
      setLinkUrl(saved.linkUrl ?? null);
    },
  });

  const handleSaveDraft = useCallback(() => {
    try {
      const body = {
        todoId,
        title,
        content,
        ...(linkUrl ? { linkUrl } : {}),
      };
      saveDraft(body);
      showToast(t.note.tempSaveSuccess, 'success');
    } catch (error) {
      showToast(t.note.tempSaveFail, 'fail');
      console.error('임시 저장 실패:', error);
    }
  }, [todoId, title, content, linkUrl, saveDraft, showToast, t]);

  const handleSubmit = useCallback(() => {
    if (!todoId) {
      showToast(t.note.todoRequired, 'fail');
      router.push('/dashboard/all-todo');
      return;
    }

    const body = {
      todoId,
      title,
      content,
      ...(linkUrl ? { linkUrl } : {}),
    };
    createNote(body);
  }, [todoId, title, content, linkUrl, createNote, showToast, router, t]);

  useEffect(() => {
    if (breakpoint !== 'mobile') return;
    setSlot(
      <div className="flex items-center gap-1">
        <div className="relative">
          <button
            type="button"
            className="text-bearlog-500 hover:text-bearlog-600 cursor-pointer px-1.5 text-sm font-semibold transition-all duration-200"
            onClick={handleSaveDraft}
          >
            {t.note.tempSave}
          </button>
          {showDraftToast && <DraftNoteToast onLoad={handleToastLoad} onClose={handleCloseToast} />}
        </div>
        <button
          type="button"
          className="cursor-pointer px-1.5 text-sm font-semibold text-gray-500 transition-all duration-200 hover:text-gray-600"
          onClick={handleSubmit}
        >
          {t.note.register}
        </button>
      </div>,
    );
    return () => setSlot(null);
  }, [breakpoint, handleSaveDraft, handleSubmit, showDraftToast, handleToastLoad, handleCloseToast, setSlot, t]);

  const editor = useNoteEditor({ content, onContentChange: setContent });

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
              <Button onClick={handleSaveDraft} variant="secondary" className="px-[27px] py-[10px] text-sm">
                {t.note.tempSave}
              </Button>
              {showDraftToast && <DraftNoteToast onLoad={handleToastLoad} onClose={handleCloseToast} />}
            </div>
            <Button
              onClick={handleSubmit}
              disabled={isPending || title.trim() === '' || !editor || editor.isEmpty}
              variant="primary"
              className="px-[27px] py-[10px] text-sm"
            >
              <span className="md:hidden">{isPending ? t.note.registering : t.note.register}</span>
              <span className="hidden md:inline">{isPending ? t.note.registering : t.note.registerFull}</span>
            </Button>
          </div>
        </section>
      )}

      <section className="flex-1 lg:mb-[30px]">
        <NoteEditor
          editor={editor}
          title={title}
          onTitleChange={setTitle}
          createdAt={createdAt}
          linkUrl={linkUrl}
          onLinkUrlChange={setLinkUrl}
          goal={goal}
          todo={todo}
        />
      </section>
    </div>
  );
}
