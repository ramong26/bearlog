import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';
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
import {
  fetchUsers,
  CurrentUserResponse,
  PatchCurrentUserPasswordRequest,
  PatchCurrentUserRequest,
} from '../api/fetchUsers';
import { dashboardKeys, githubKeys, goalKeys, noteKeys, todoKeys, userKeys } from './keyFactory';
import { noteQueries } from './queryKeys';
import { useToastStore } from '@/shared/stores/useToastStore';
import { useLanguage } from '@/shared/contexts/LanguageContext';
import { useTodoModeStore } from '@/shared/stores/useTodoModeStore';
import { GITHUB_DISCONNECTED_SESSION_KEY } from '@/shared/constants/github';

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
      queryClient.invalidateQueries({ queryKey: dashboardKeys.summary() });
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
      queryClient.invalidateQueries({ queryKey: dashboardKeys.summary() });
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
      queryClient.invalidateQueries({ queryKey: dashboardKeys.summary() });
    },
    onError: () => {
      showToast(t.mutations.goalUpdateFail, 'fail');
    },
  });
};

export const useConnectGithubRepository = () => {
  const { showToast } = useToastStore();
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ConnectGithubRepositoryRequest) => fetchGithubIntegrations.postConnectRepository(data),
    onSuccess: () => {
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(GITHUB_DISCONNECTED_SESSION_KEY);
      }
      showToast(t.mutations.githubRepositoryConnected);
      queryClient.invalidateQueries({ queryKey: goalKeys.lists() });
      queryClient.invalidateQueries({ queryKey: githubKeys.repositories() });
      queryClient.invalidateQueries({ queryKey: userKeys.progress() });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.summary() });
    },
    onError: () => {
      showToast(t.mutations.githubRepositoryConnectFail, 'fail');
    },
  });
};

export const useDisconnectGithubGoal = (goalId?: number) => {
  const router = useRouter();
  const { showToast } = useToastStore();
  const { t } = useLanguage();
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
      showToast(t.mutations.githubGoalDisconnected);
      queryClient.invalidateQueries({ queryKey: goalKeys.lists() });
      queryClient.invalidateQueries({ queryKey: goalKeys.details() });
      queryClient.invalidateQueries({ queryKey: githubKeys.repositories() });
      queryClient.invalidateQueries({ queryKey: userKeys.progress() });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.summary() });
      router.push('/dashboard');
    },
    onError: (_error, _variables, context) => {
      // optimistic update 롤백
      if (context?.previousGoals !== undefined) {
        queryClient.setQueryData(goalKeys.list(), context.previousGoals);
      }
      showToast(t.mutations.githubGoalDisconnectFail, 'fail');
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
        todos: [
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
      queryClient.invalidateQueries({ queryKey: dashboardKeys.summary() });
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
      queryClient.invalidateQueries({ queryKey: dashboardKeys.summary() });
    },
    onError: () => {
      showToast(t.mutations.todoDeleteFail, 'fail');
    },
  });
};

// TODO: 정리 필요
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
      const previousTodo = queryClient.getQueryData<PatchTodoResponse>(todoKeys.detail(todoId));
      await queryClient.cancelQueries({ queryKey: todoKeys.lists() });
      const previousTodoLists = queryClient.getQueriesData({ queryKey: todoKeys.lists() });
      await queryClient.cancelQueries({ queryKey: goalKeys.details() });
      const previousGoalDetails = queryClient.getQueriesData({ queryKey: goalKeys.details() });
      type OptimisticTodoItem = { id: number; done?: boolean | null } & Record<string, unknown>;
      const optimisticTodo: OptimisticTodoItem | null = previousTodo ? { ...previousTodo, ...data } : null;

      queryClient.setQueryData(todoKeys.detail(todoId), (old: PatchTodoResponse | undefined) => {
        if (!old) return old;

        return {
          ...old,
          ...data,
        };
      });

      const targetDone = typeof data.done === 'boolean' ? data.done : undefined;
      const patchTodos = (todos: OptimisticTodoItem[], filterDone: boolean | undefined) => {
        const updated = todos.map((todo) => (todo.id === todoId ? { ...todo, ...data } : todo));

        if (targetDone === undefined || filterDone === undefined) {
          return updated;
        }

        if (filterDone !== targetDone) {
          return updated.filter((todo) => todo.id !== todoId);
        }

        if (!updated.some((todo) => todo.id === todoId) && optimisticTodo) {
          return [optimisticTodo, ...updated];
        }

        return updated;
      };

      previousTodoLists.forEach(([queryKey, cached]) => {
        const key = Array.isArray(queryKey) ? queryKey : [];
        const params = (key.find((k) => typeof k === 'object' && k !== null) as Record<string, unknown>) ?? {};
        const filterDone = typeof params.done === 'boolean' ? params.done : undefined;

        queryClient.setQueryData(queryKey, () => {
          if (!cached) return cached;

          if (typeof cached === 'object' && cached !== null && 'pages' in cached) {
            const infiniteData = cached as InfiniteData<TodoListResponse>;

            return {
              ...infiniteData,
              pages: infiniteData.pages.map((page) => ({
                ...page,
                todos: patchTodos((page.todos ?? []) as OptimisticTodoItem[], filterDone),
              })),
            };
          }

          if (typeof cached === 'object' && cached !== null && 'todos' in cached) {
            const todoList = cached as TodoListResponse;
            return {
              ...todoList,
              todos: patchTodos((todoList.todos ?? []) as OptimisticTodoItem[], filterDone),
            };
          }

          return cached;
        });
      });

      queryClient.setQueriesData({ queryKey: goalKeys.details() }, (old: unknown) => {
        if (!old || typeof old !== 'object' || old === null) return old;
        if (!('todoList' in old) || !('doneList' in old)) return old;

        const target = old as { todoList?: OptimisticTodoItem[]; doneList?: OptimisticTodoItem[] };
        const targetDone = typeof data.done === 'boolean' ? data.done : undefined;
        let todoList = (target.todoList ?? []).map((todo) => (todo.id === todoId ? { ...todo, ...data } : todo));
        let doneList = (target.doneList ?? []).map((todo) => (todo.id === todoId ? { ...todo, ...data } : todo));

        if (targetDone === true) {
          const movingTodo = todoList.find((todo) => todo.id === todoId) ?? optimisticTodo;
          todoList = todoList.filter((todo) => todo.id !== todoId);
          if (movingTodo && !doneList.some((todo) => todo.id === todoId)) {
            doneList = [movingTodo, ...doneList];
          }
        }

        if (targetDone === false) {
          const movingTodo = doneList.find((todo) => todo.id === todoId) ?? optimisticTodo;
          doneList = doneList.filter((todo) => todo.id !== todoId);
          if (movingTodo && !todoList.some((todo) => todo.id === todoId)) {
            todoList = [movingTodo, ...todoList];
          }
        }

        return { ...target, todoList, doneList };
      });

      return { previousTodo, previousTodoLists, previousGoalDetails };
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
      queryClient.invalidateQueries({ queryKey: dashboardKeys.summary() });
    },

    onError: (_error, _variables, context) => {
      if (todoId !== undefined && context?.previousTodo !== undefined) {
        queryClient.setQueryData(todoKeys.detail(todoId), context.previousTodo);
      }

      if (context?.previousTodoLists) {
        context.previousTodoLists.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      if (context?.previousGoalDetails) {
        context.previousGoalDetails.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
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
      queryClient.invalidateQueries({ queryKey: dashboardKeys.summary() });
    },
    onError: (_error, _variables, context) => {
      if (todoId !== undefined && context?.previousTodo !== undefined) {
        queryClient.setQueryData(todoKeys.detail(todoId), context.previousTodo);
      }
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
      queryClient.invalidateQueries({ queryKey: dashboardKeys.summary() });
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

// TODO: 수정 필요
export const useDeleteGithubConnection = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();
  const { t } = useLanguage();

  return useMutation({
    mutationFn: () => fetchUsers.deleteGithubConnection(),
    onSuccess: () => {
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(GITHUB_DISCONNECTED_SESSION_KEY, 'true');
      }
      useTodoModeStore.getState().setMode('MANUAL');
      queryClient.setQueriesData({ queryKey: goalKeys.lists() }, (old: GoalListResponse | undefined) => {
        if (!old) return old;
        return {
          ...old,
          goals: (old.goals ?? []).filter((goal) => goal.source !== 'GITHUB'),
        };
      });
      queryClient.setQueryData(userKeys.me(), (old: CurrentUserResponse | undefined) => {
        if (!old) return old;
        return {
          ...old,
          githubConnected: false,
        };
      });
      queryClient.setQueryData(githubKeys.repositories(), []);
      showToast(t.mutations.githubIntegrationDisconnected);
      queryClient.invalidateQueries({ queryKey: userKeys.me() });
      queryClient.invalidateQueries({ queryKey: userKeys.githubConnection() });
      queryClient.invalidateQueries({ queryKey: goalKeys.lists() });
      queryClient.invalidateQueries({ queryKey: goalKeys.details() });
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
      queryClient.invalidateQueries({ queryKey: todoKeys.details() });
      queryClient.invalidateQueries({ queryKey: todoKeys.all });
      queryClient.invalidateQueries({ queryKey: githubKeys.repositories() });
      queryClient.invalidateQueries({ queryKey: userKeys.progress() });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.summary() });
      router.push('/dashboard');
    },
    onError: () => {
      showToast(t.mutations.githubIntegrationDisconnectFail, 'fail');
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
  const { t } = useLanguage();
  const router = useRouter();

  return useMutation({
    mutationFn: fetchNotes.postNote,
    onSuccess: (response) => {
      if (!response.id || !response.goalId) {
        console.error('[usePostNote] Unexpected API response: missing id or goalId', response);
        showToast(t.mutations.noteCreateFail, 'fail');
        return;
      }

      showToast(t.mutations.noteCreated);
      queryClient.setQueryData(noteQueries.detail(response.id).queryKey, response);
      queryClient.invalidateQueries({
        queryKey: noteKeys.lists(),
      });

      router.push(`/goal/${response.goalId}/note/${response.id}`);
    },
    onError: () => {
      showToast(t.mutations.noteCreateFail, 'fail');
    },
  });
};
export const usePatchNote = (noteId: number, goalId: number) => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();
  const { t } = useLanguage();
  const router = useRouter();

  return useMutation({
    mutationFn: (body: PatchNoteRequest) => fetchNotes.patchNote(noteId, body),
    onSuccess: (response) => {
      queryClient.setQueryData(noteQueries.detail(noteId).queryKey, response);
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
      router.push(`/goal/${goalId}/note/${noteId}`);
    },
    onError: () => showToast(t.mutations.noteUpdateFail, 'fail'),
  });
};
export const useDeleteNote = (noteId: number, goalId: number) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();
  const { t } = useLanguage();

  return useMutation({
    mutationFn: () => fetchNotes.deleteNote(noteId),
    onSuccess: () => {
      showToast(t.mutations.noteDeleted, 'success');
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
      showToast(t.mutations.noteDeleteFail, 'fail');
    },
  });
};
