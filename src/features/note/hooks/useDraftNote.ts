'use client';

import { useCallback } from 'react';

export interface DraftNote {
  title: string;
  content: string;
  linkUrl?: string;
  savedAt: string; // ISO string
}

const DEFAULT_DRAFT_KEY = 'note_draft';

export function useDraftNote(key: string = DEFAULT_DRAFT_KEY) {
  /** localStorage에 임시 저장 */
  const saveDraft = useCallback((draft: Omit<DraftNote, 'savedAt'>) => {
    const savedAt = new Date().toISOString();
    localStorage.setItem(key, JSON.stringify({ ...draft, savedAt }));
    return savedAt;
  }, [key]);

  /** localStorage에서 임시 저장본 불러오기 */
  const getDraft = useCallback((): DraftNote | null => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as DraftNote) : null;
    } catch {
      return null;
    }
  }, [key]);

  /** localStorage에서 임시 저장본 삭제 */
  const clearDraft = useCallback(() => {
    localStorage.removeItem(key);
  }, [key]);

  return { saveDraft, getDraft, clearDraft };
}
