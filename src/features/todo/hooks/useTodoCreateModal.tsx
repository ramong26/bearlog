/**
 * @example
 * <button onClick={openTodoCreateModal}>모달 버튼</button>
 */
import TodoFormModal from '../components/manual/TodoFormModal';

import { useModalStore } from '@/shared/stores/useModalStore';
import { PostTodoRequest } from '@/shared/lib/api';

interface UseTodoCreateModalResult {
  goalDetailId: number;
  todo: PostTodoRequest;
}
export function useTodoCreateModal() {
  const { openModal } = useModalStore();

  const openTodoCreateModal = ({ goalDetailId, todo }: UseTodoCreateModalResult) => {
    openModal(<TodoFormModal mode="create" goalDetailId={goalDetailId} todo={todo} />, undefined, 'bottom');
  };

  return { openTodoCreateModal };
}
