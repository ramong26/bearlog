import { TodoResponse } from '@/shared/lib/api/fetchTodos';
import { GoalDetailResponse } from '@/shared/lib/api/fetchGoals';
import { Editor } from '@tiptap/react';

/**
 * @TODO 노트 수정 기능 만든 후 수정
 */
export interface NoteEditorProps {
  editor: Editor | null;
  title: string;
  onTitleChange: (value: string) => void;
  createdAt: string;
  linkUrl?: string | null;
  onLinkUrlChange?: (value: string | null) => void;
  goal?: GoalDetailResponse | null;
  todo?: TodoResponse | null;
}
