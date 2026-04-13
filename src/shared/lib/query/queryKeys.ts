import { queryOptions, infiniteQueryOptions } from '@tanstack/react-query';

import { fetchAuth } from '../api/fetchAuth';
import { fetchGoals, type GetGoalsParams } from '../api/fetchGoals';
import { fetchGithubIntegrations } from '../api/fetchGithubIntegrations';
import { fetchNotes, type GetNotesParams } from '../api/fetchNotes';
import { fetchNotifications } from '../api/fetchNotifications';
import { fetchTags } from '../api/fetchTags';
import { fetchTodos, type GetTodosParams, type GetTodoCalendarParams } from '../api/fetchTodos';
import { fetchUsers } from '../api/fetchUsers';
import { authKeys, githubKeys, goalKeys, noteKeys, notificationKeys, tagKeys, todoKeys, userKeys } from './keyFactory';

const DASHBOARD_STALE_TIME = 1000 * 60 * 5;
// goal queries
export const goalQueries = {
  list: (params?: GetGoalsParams) =>
    queryOptions({
      queryKey: goalKeys.list(params),
      queryFn: () => fetchGoals.getGoals(params),
    }),

  detail: (goalId: number) =>
    queryOptions({
      queryKey: goalKeys.detail(goalId),
      queryFn: () => fetchGoals.getGoal(goalId),
    }),
};

// todo queries
export const todoQueries = {
  list: (params?: GetTodosParams) =>
    queryOptions({
      queryKey: todoKeys.list(params),
      queryFn: () => fetchTodos.getTodos(params),
      staleTime: DASHBOARD_STALE_TIME,
    }),

  infiniteList: (params?: Omit<GetTodosParams, 'cursor'>) =>
    infiniteQueryOptions({
      queryKey: todoKeys.infiniteList(params),
      queryFn: ({ pageParam }) => fetchTodos.getTodos({ ...params, cursor: pageParam }),
      initialPageParam: undefined as number | undefined,
      getNextPageParam: (lastPage) => (lastPage.hasMore ? (lastPage.nextCursor ?? undefined) : undefined),
      staleTime: DASHBOARD_STALE_TIME,
    }),

  detail: (todoId: number) =>
    queryOptions({
      queryKey: todoKeys.detail(todoId),
      queryFn: () => fetchTodos.getTodo(todoId),
      staleTime: DASHBOARD_STALE_TIME,
    }),

  calendar: (params: GetTodoCalendarParams) =>
    queryOptions({
      queryKey: todoKeys.calendar(params),
      queryFn: () => fetchTodos.getTodoCalendar(params),
    }),
};

// note queries
export const noteQueries = {
  all: () => noteKeys.all,
  lists: () => noteKeys.lists(),

  list: (params?: GetNotesParams) =>
    queryOptions({
      queryKey: noteKeys.list(params),
      queryFn: () => fetchNotes.getNotes(params),
    }),

  detail: (noteId: number) =>
    queryOptions({
      queryKey: noteKeys.detail(noteId),
      queryFn: () => fetchNotes.getNote(noteId),
    }),
};

// auth queries
export const authQueries = {
  googleAuthorizeUrl: () =>
    queryOptions({
      queryKey: authKeys.googleAuthorizeUrl(),
      queryFn: fetchAuth.getGoogleAuthorizeUrl,
    }),

  githubAuthorizeUrl: () =>
    queryOptions({
      queryKey: authKeys.githubAuthorizeUrl(),
      queryFn: fetchAuth.getGithubAuthorizeUrl,
    }),

  githubConnectAuthorizeUrl: () =>
    queryOptions({
      queryKey: authKeys.githubConnectAuthorizeUrl(),
      queryFn: fetchAuth.getGithubConnectAuthorizeUrlByEnv,
    }),
};

export const githubQueries = {
  repositories: () =>
    queryOptions({
      queryKey: githubKeys.repositories(),
      queryFn: fetchGithubIntegrations.getRepositories,
    }),
};

// user queries
export const userQueries = {
  current: () =>
    queryOptions({
      queryKey: userKeys.me(),
      queryFn: fetchUsers.getCurrentUser,
      staleTime: DASHBOARD_STALE_TIME,
    }),

  progress: () =>
    queryOptions({
      queryKey: userKeys.progress(),
      queryFn: fetchUsers.getUserProgress,
      staleTime: DASHBOARD_STALE_TIME,
    }),

  githubConnection: () =>
    queryOptions({
      queryKey: userKeys.githubConnection(),
      queryFn: fetchUsers.getGithubConnection,
    }),
};

// notification queries
export const notificationQueries = {
  list: () =>
    queryOptions({
      queryKey: notificationKeys.lists(),
      queryFn: fetchNotifications.getNotifications,
    }),
};

// tag queries
export const tagQueries = {
  list: () =>
    queryOptions({
      queryKey: tagKeys.lists(),
      queryFn: fetchTags.getTags,
    }),
};
