/**
 * @example
 * <button onClick={openTodoEditModal}>모달 버튼</button>
 */
import { useModalStore } from '@/shared/stores/useModalStore';
import TodoFormModal from '../components/manual/TodoFormModal';
import { PatchTodoRequest } from '@/shared/lib/api';

interface UseTodoEditModalResult {
  goalDetailId: number;
  todo: PatchTodoRequest & { id: number };
}
export function useTodoEditModal() {
  const { openModal } = useModalStore();

  const openTodoEditModal = ({ goalDetailId, todo }: UseTodoEditModalResult) => {
    openModal(<TodoFormModal mode="edit" todo={todo} goalDetailId={goalDetailId} />, undefined, 'bottom');
  };

  return { openTodoEditModal };
}
