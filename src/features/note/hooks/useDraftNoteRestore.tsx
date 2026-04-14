'use client';

import { useState, useEffect } from 'react';
import { DraftNote, useDraftNote } from './useDraftNote';
import { useModalStore } from '@/shared/stores/useModalStore';
import { PopupModal } from '@/shared/components/Modal/PopupModal';

interface UseDraftNoteRestoreOptions {
  key?: string;
  onRestore: (draft: DraftNote) => void;
}

export function useDraftNoteRestore({ key, onRestore }: UseDraftNoteRestoreOptions) {
  const { getDraft, clearDraft } = useDraftNote(key);
  const { openModal, closeModal } = useModalStore();

  const [draftState, setDraftState] = useState<{
    draft: DraftNote | null;
    showDraftToast: boolean;
  }>({ draft: null, showDraftToast: false });

  useEffect(() => {
    const saved = getDraft();
    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDraftState({ draft: saved, showDraftToast: true });
    }
  }, [getDraft]);

  const { draft, showDraftToast } = draftState;

  const handleCloseToast = () => {
    setDraftState((prev) => ({ ...prev, showDraftToast: false }));
  };

  const handleConfirm = () => {
    if (!draft) return;
    onRestore(draft);
    clearDraft();
    closeModal();
  };

  const handleToastLoad = () => {
    if (!draft) return;
    setDraftState((prev) => ({ ...prev, showDraftToast: false }));
    openModal(<PopupModal variant={{ type: 'noteLoad', noteTitle: draft.title }} onConfirm={handleConfirm} />);
  };

  return {
    draft,
    savedAt: draft?.savedAt ?? null,
    showDraftToast,
    handleCloseToast,
    handleToastLoad,
  };
}
