/**
 * @example
 * <button onClick={openGithubTodoCreateModal}>GitHub 할 일 추가</button>
 */
import GithubTodoFormModal from '../components/github/GithubTodoFormModal';

import { useModalStore } from '@/shared/stores/useModalStore';

interface UseGithubTodoCreateModalParams {
  goalId: number;
  goalTitle?: string;
}

export function useGithubTodoCreateModal() {
  const { openModal } = useModalStore();

  const openGithubTodoCreateModal = ({ goalId, goalTitle }: UseGithubTodoCreateModalParams) => {
    openModal(<GithubTodoFormModal goalId={goalId} goalTitle={goalTitle} />, undefined, 'bottom');
  };

  return { openGithubTodoCreateModal };
}
