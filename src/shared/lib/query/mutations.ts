import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';

import { fetchAuth } from '../api';
import { ApiError } from '../api/utils';
import { fetchGoals, GoalListResponse, PatchGoalResponse, PostGoalRequest } from '../api/fetchGoals';
import { ConnectGithubRepositoryRequest, fetchGithubIntegrations } from '../api/fetchGithubIntegrations';
import { fetchNotes, PatchNoteRequest } from '../api/fetchNotes';
import {
  fetchTodos,
  PatchTodoFavoriteResponse,
  PatchTodoRequest,
  PatchTodoResponse,
  PostTodoRequest,
  TodoListResponse,
} from '../api/fetchTodos';
import { fetchUsers, PatchCurrentUserPasswordRequest, PatchCurrentUserRequest } from '../api/fetchUsers';
import { githubKeys, goalKeys, noteKeys, todoKeys, userKeys } from './keyFactory';
import { noteQueries } from './queryKeys';
import { useToastStore } from '@/shared/stores/useToastStore';
import { useLanguage } from '@/shared/contexts/LanguageContext';

// goal
export const usePostGoal = () => {
  const { showToast } = useToastStore();
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: PostGoalRequest) => {
      if (!data) {
        throw new Error('PostGoalRequest data is required');
      }

      return fetchGoals.postGoal(data);
    },
    onMutate: async (data: PostGoalRequest) => {
      await queryClient.cancelQueries({ queryKey: goalKeys.lists() });
      const previousGoals = queryClient.getQueryData(goalKeys.list());

      queryClient.setQueryData(goalKeys.list(), (old: GoalListResponse | undefined) => ({
        ...old,
        items: [
          {
            id: Math.random(),
            title: data.title,
            todos: [],
          },
          ...(old?.goals ?? []),
        ],
      }));

      return { previousGoals };
    },
    onSuccess: () => {
      showToast(t.mutations.goalCreated);
      queryClient.invalidateQueries({ queryKey: goalKeys.lists() });
    },
  });
};

export const useDeleteGoal = (goalId?: number) => {
  const router = useRouter();
  const { showToast } = useToastStore();
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (goalId === undefined) {
        throw new Error('Goal id is required');
      }
      return fetchGoals.deleteGoal(goalId);
    },
    onMutate: async () => {
      if (goalId === undefined) {
        throw new Error('Goal id is required');
      }

      await queryClient.cancelQueries({ queryKey: goalKeys.detail(goalId) });
      const previousGoal = queryClient.getQueryData(goalKeys.detail(goalId));
      queryClient.setQueryData(goalKeys.detail(goalId), undefined);

      return { previousGoal };
    },
    onSuccess: () => {
      showToast(t.mutations.goalDeleted);
      queryClient.invalidateQueries({ queryKey: goalKeys.lists() });
      router.push('/dashboard');
    },
    onError: () => {
      showToast(t.mutations.goalDeleteFail, 'fail');
    },
  });
};

export const usePatchGoal = (goalId?: number) => {
  const { showToast } = useToastStore();
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { title: string }) => {
      if (goalId === undefined) {
        throw new Error('Goal id is required');
      }
      return fetchGoals.patchGoal(goalId, data);
    },
    onMutate: async (data: { title: string }) => {
      if (goalId === undefined) {
        throw new Error('Goal id is required');
      }

      await queryClient.cancelQueries({ queryKey: goalKeys.detail(goalId) });
      const previousGoal = queryClient.getQueryData(goalKeys.detail(goalId));

      queryClient.setQueryData(goalKeys.detail(goalId), (old: PatchGoalResponse | undefined) => ({
        ...old,
        title: data.title,
      }));

      return { previousGoal };
    },
    onSuccess: () => {
      showToast(t.mutations.goalUpdated);

      if (goalId !== undefined) {
        queryClient.invalidateQueries({ queryKey: goalKeys.detail(goalId) });
      }

      queryClient.invalidateQueries({ queryKey: goalKeys.lists() });
    },
    onError: () => {
      showToast(t.mutations.goalUpdateFail, 'fail');
    },
  });
};

export const useConnectGithubRepository = () => {
  const { showToast } = useToastStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ConnectGithubRepositoryRequest) => fetchGithubIntegrations.postConnectRepository(data),
    onSuccess: () => {
      showToast('GitHub 저장소가 목표로 연결되었습니다.');
      queryClient.invalidateQueries({ queryKey: goalKeys.lists() });
      queryClient.invalidateQueries({ queryKey: githubKeys.repositories() });
      queryClient.invalidateQueries({ queryKey: userKeys.progress() });
    },
    onError: () => {
      showToast('GitHub 저장소 연결에 실패했습니다.', 'fail');
    },
  });
};

export const useDisconnectGithubGoal = (goalId?: number) => {
  const router = useRouter();
  const { showToast } = useToastStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (goalId === undefined) {
        throw new Error('Goal id is required');
      }

      return fetchGithubIntegrations.deleteConnectedGoal(goalId);
    },
    onMutate: async () => {
      if (goalId === undefined) throw new Error('Goal id is required');

      await queryClient.cancelQueries({ queryKey: goalKeys.lists() });
      const previousGoals = queryClient.getQueryData(goalKeys.list());

      // 즉시 UI 갱신: 해당 goal을 list에서 제거 (source가 MANUAL로 변경되어 GITHUB 모드에서 사라짐)
      queryClient.setQueryData(goalKeys.list(), (old: GoalListResponse | undefined) => ({
        ...old,
        goals: (old?.goals ?? []).filter((goal) => goal.id !== goalId),
      }));

      return { previousGoals };
    },
    onSuccess: () => {
      showToast('GitHub 저장소 연결이 해제되었습니다.');
      queryClient.invalidateQueries({ queryKey: goalKeys.lists() });
      queryClient.invalidateQueries({ queryKey: goalKeys.details() });
      queryClient.invalidateQueries({ queryKey: githubKeys.repositories() });
      queryClient.invalidateQueries({ queryKey: userKeys.progress() });
      router.push('/dashboard');
    },
    onError: (_error, _variables, context) => {
      // optimistic update 롤백
      if (context?.previousGoals !== undefined) {
        queryClient.setQueryData(goalKeys.list(), context.previousGoals);
      }
      showToast('GitHub 저장소 연결 해제에 실패했습니다.', 'fail');
    },
  });
};

// todo
export const usePostTodo = () => {
  const { showToast } = useToastStore();
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: PostTodoRequest) => {
      if (!data) {
        throw new Error('PostTodoRequest data is required');
      }
      return fetchTodos.postTodo(data);
    },
    onMutate: async (data: PostTodoRequest) => {
      await queryClient.cancelQueries({ queryKey: todoKeys.lists() });
      const previousTodos = queryClient.getQueryData(todoKeys.list());

      queryClient.setQueryData(todoKeys.list(), (old: TodoListResponse | undefined) => ({
        ...old,
        items: [
          {
            id: Math.random(),
            title: data.title,
            dueDate: data.dueDate,
            tags: data.tags ?? [],
            linkUrl: data.linkUrl ?? null,
            imageUrl: data.imageUrl ?? null,
            goalId: data.goalId,
            source: data.source ?? 'MANUAL',
          },
          ...(old?.todos ?? []),
        ],
      }));

      return { previousTodos };
    },
    onSuccess: () => {
      showToast(t.mutations.todoCreated);
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
      queryClient.invalidateQueries({ queryKey: goalKeys.details() });
      queryClient.invalidateQueries({ queryKey: userKeys.progress() });
    },
    onError: (error) => {
      console.error(error);
      const message = error instanceof ApiError ? error.message : t.mutations.todoCreateFail;
      showToast(message, 'fail');
    },
  });
};

export const useDeleteTodo = (todoId?: number) => {
  const { showToast } = useToastStore();
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (todoId === undefined) {
        throw new Error('Todo id is required');
      }
      return fetchTodos.deleteTodo(todoId);
    },
    onMutate: async () => {
      if (todoId === undefined) {
        throw new Error('Todo id is required');
      }

      await queryClient.cancelQueries({ queryKey: todoKeys.detail(todoId) });
      const previousTodo = queryClient.getQueryData(todoKeys.detail(todoId));
      queryClient.setQueryData(todoKeys.detail(todoId), undefined);

      return { previousTodo };
    },
    onSuccess: () => {
      showToast(t.mutations.todoDeleted);
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
      queryClient.invalidateQueries({ queryKey: goalKeys.details() });
      queryClient.invalidateQueries({ queryKey: userKeys.progress() });
    },
    onError: () => {
      showToast(t.mutations.todoDeleteFail, 'fail');
    },
  });
};

export const usePatchTodo = (todoId?: number) => {
  const { showToast } = useToastStore();
  const { t } = useLanguage();

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: PatchTodoRequest) => {
      if (todoId === undefined) {
        throw new Error('Todo id is required');
      }
      return fetchTodos.patchTodo(todoId, data);
    },
    onMutate: async (data: PatchTodoRequest) => {
      if (todoId === undefined) {
        throw new Error('Todo id is required');
      }

      await queryClient.cancelQueries({ queryKey: todoKeys.detail(todoId) });
      const previousTodo = queryClient.getQueryData(todoKeys.detail(todoId));

      queryClient.setQueryData(todoKeys.detail(todoId), (old: PatchTodoResponse | undefined) => {
        if (!old) return old;

        return {
          ...old,
          ...data,
        };
      });

      return { previousTodo };
    },
    onSuccess: () => {
      if (todoId !== undefined) {
        queryClient.invalidateQueries({ queryKey: todoKeys.detail(todoId) });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
      queryClient.invalidateQueries({ queryKey: goalKeys.details() });
      queryClient.invalidateQueries({ queryKey: userKeys.progress() });
    },

    onError: (_error, _variables, context) => {
      if (todoId !== undefined && context?.previousTodo !== undefined) {
        queryClient.setQueryData(todoKeys.detail(todoId), context.previousTodo);
      }
      showToast(t.mutations.todoUpdateFail, 'fail');
    },
  });
};

export const usePatchTodoFavorite = (todoId?: number) => {
  const { showToast } = useToastStore();
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (todoId === undefined) {
        throw new Error('Todo id is required');
      }

      return fetchTodos.patchTodoFavorite(todoId);
    },
    onMutate: async () => {
      if (todoId === undefined) {
        throw new Error('Todo id is required');
      }

      await queryClient.cancelQueries({ queryKey: todoKeys.detail(todoId) });
      const previousTodo = queryClient.getQueryData(todoKeys.detail(todoId));

      queryClient.setQueryData(todoKeys.detail(todoId), (old: PatchTodoFavoriteResponse | undefined) => ({
        ...old,
        favorite: !old?.favorite,
      }));

      return { previousTodo };
    },
    onSuccess: () => {
      if (todoId !== undefined) {
        queryClient.invalidateQueries({ queryKey: todoKeys.detail(todoId) });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
      queryClient.invalidateQueries({ queryKey: goalKeys.details() });
      queryClient.invalidateQueries({ queryKey: userKeys.progress() });
    },
    onError: () => {
      showToast(t.mutations.favoriteFail, 'fail');
    },
  });
};

// users
export const usePatchCurrentUser = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();
  const { t } = useLanguage();

  return useMutation({
    mutationFn: (data: PatchCurrentUserRequest) => fetchUsers.patchCurrentUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.me() });
    },
    onError: () => {
      showToast(t.mutations.userUpdateFail, 'fail');
    },
  });
};

export const usePatchCurrentUserPassword = () => {
  const { showToast } = useToastStore();
  const { t } = useLanguage();

  return useMutation({
    mutationFn: (data: PatchCurrentUserPasswordRequest) => fetchUsers.patchCurrentUserPassword(data),
    onError: () => {
      showToast(t.mutations.passwordUpdateFail, 'fail');
    },
  });
};

// auth
export const usePostLogout = () => {
  const router = useRouter();
  const { showToast } = useToastStore();
  const { t } = useLanguage();

  return useMutation({
    mutationFn: () => fetchAuth.postLogoutByEnv(),
    onSuccess: () => {
      showToast(t.mutations.logoutSuccess);
      router.push('/login');
    },
    onError: () => {
      showToast(t.mutations.logoutFail, 'fail');
    },
  });
};

// note
export const usePostNote = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();
  const router = useRouter();

  return useMutation({
    mutationFn: fetchNotes.postNote,
    onSuccess: (response) => {
      if (!response.id || !response.goalId) {
        console.error('[usePostNote] Unexpected API response: missing id or goalId', response);
        showToast('노트 작성에 실패했습니다.', 'fail');
        return;
      }

      showToast('노트가 작성되었습니다.');
      queryClient.setQueryData(noteQueries.detail(response.id).queryKey, response);
      queryClient.invalidateQueries({
        queryKey: noteKeys.lists(),
      });

      router.push(`/goal/${response.goalId}/note/${response.id}`);
    },
    onError: () => {
      showToast('노트 작성에 실패했습니다.', 'fail');
    },
  });
};

export const usePatchNote = (noteId: number, goalId: number) => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();
  const router = useRouter();

  return useMutation({
    mutationFn: (body: PatchNoteRequest) => fetchNotes.patchNote(noteId, body),
    onSuccess: (response) => {
      queryClient.setQueryData(noteQueries.detail(noteId).queryKey, response);
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
      router.push(`/goal/${goalId}/note/${noteId}`);
    },
    onError: () => showToast('노트 수정에 실패했습니다', 'fail'),
  });
};

export const useDeleteNote = (noteId: number, goalId: number) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: () => fetchNotes.deleteNote(noteId),
    onSuccess: () => {
      showToast('노트가 삭제되었습니다.', 'success');
      queryClient.removeQueries({
        queryKey: noteQueries.detail(noteId).queryKey,
      });

      queryClient.invalidateQueries({
        queryKey: noteKeys.lists(),
      });

      const page = searchParams.get('page') ?? '1';
      router.push(`/goal/${goalId}/note?page=${page}`);
    },
    onError: () => {
      showToast('노트 삭제에 실패했습니다', 'fail');
    },
  });
};
