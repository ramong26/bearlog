import type { GetGoalsParams, GetNotesParams, GetTodosParams, GetTodoCalendarParams } from '@/shared/lib/api';

export const goalKeys = {
  all: ['goals'] as const,
  lists: () => [...goalKeys.all, 'list'] as const,
  list: (params?: GetGoalsParams) => [...goalKeys.lists(), params ?? {}] as const,
  details: () => [...goalKeys.all, 'detail'] as const,
  detail: (goalId: number) => [...goalKeys.details(), goalId] as const,
};

export const todoKeys = {
  all: ['todos'] as const,
  lists: () => [...todoKeys.all, 'list'] as const,
  list: (params?: GetTodosParams) => [...todoKeys.lists(), params ?? {}] as const,
  infiniteList: (params?: GetTodosParams) => [...todoKeys.lists(), 'infinite', params ?? {}] as const,
  details: () => [...todoKeys.all, 'detail'] as const,
  detail: (todoId: number) => [...todoKeys.details(), todoId] as const,
  calendar: (params: GetTodoCalendarParams) => [...todoKeys.all, 'calendar', params] as const,
};

export const noteKeys = {
  all: ['notes'] as const,
  lists: () => [...noteKeys.all, 'list'] as const,
  list: (params?: GetNotesParams) => [...noteKeys.lists(), params ?? {}] as const,
  details: () => [...noteKeys.all, 'detail'] as const,
  detail: (noteId: number) => [...noteKeys.details(), noteId] as const,
};

export const authKeys = {
  all: ['auth'] as const,
  googleAuthorizeUrl: () => [...authKeys.all, 'googleAuthorizeUrl'] as const,
  githubAuthorizeUrl: () => [...authKeys.all, 'githubAuthorizeUrl'] as const,
  githubConnectAuthorizeUrl: () => [...authKeys.all, 'githubConnectAuthorizeUrl'] as const,
};

export const githubKeys = {
  all: ['github'] as const,
  repositories: () => [...githubKeys.all, 'repositories'] as const,
};

export const userKeys = {
  all: ['users'] as const,
  me: () => [...userKeys.all, 'me'] as const,
  progress: () => [...userKeys.me(), 'progress'] as const,
  githubConnection: () => [...userKeys.me(), 'githubConnection'] as const,
};

export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
};

export const tagKeys = {
  all: ['tags'] as const,
  lists: () => [...tagKeys.all, 'list'] as const,
};

export const dashboardKeys = {
  all: ['dashboard'] as const,
  summary: () => [...dashboardKeys.all, 'summary'] as const,
};
