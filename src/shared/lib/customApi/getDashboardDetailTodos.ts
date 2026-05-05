import { DashboardDetailTodosResponse } from '@/shared/types/api/schemas/api.process';
import { fetchGoals, fetchTodos } from '../api';

export interface DashboardDetailTodosErrors {
  goal?: 'failed';
  todos?: 'failed';
}

export interface DashboardDetailTodosResult {
  data: { items: DashboardDetailTodosResponse[] };
  errors: DashboardDetailTodosErrors;
  hasAnySuccess: boolean;
}

const SAFE_LIMIT = 10;

const toProgressPercent = (completedCount: number, todoCount: number): number => {
  if (todoCount <= 0) return 0;
  return Math.round((completedCount / todoCount) * 100);
};

const normalizeGoalIds = (goalIds?: number[]): number[] => {
  if (!goalIds) return [];
  return [...new Set(goalIds.filter((id) => Number.isInteger(id) && id > 0))];
};

export const getDashboardDetailTodos = async (goalIds?: number[]): Promise<DashboardDetailTodosResult> => {
  const targetGoalIds = normalizeGoalIds(goalIds);
  const targetGoalIdSet = new Set(targetGoalIds);
  const todoFetchLimit = Math.max(SAFE_LIMIT * Math.max(targetGoalIds.length, 1), SAFE_LIMIT * 5);

  const [goalsRes, openTodosRes, doneTodosRes] = await Promise.allSettled([
    fetchGoals.getGoals({ limit: Math.max(targetGoalIds.length, 50) }),
    fetchTodos.getTodos({ sort: 'LATEST', search: '', limit: todoFetchLimit, done: false }),
    fetchTodos.getTodos({ sort: 'LATEST', search: '', limit: todoFetchLimit, done: true }),
  ]);

  const allGoals = goalsRes.status === 'fulfilled' ? goalsRes.value.goals : [];
  const goals =
    targetGoalIds.length > 0 ? allGoals.filter((goal) => targetGoalIdSet.has(goal.id)) : allGoals;
  const openTodos = openTodosRes.status === 'fulfilled' ? openTodosRes.value.todos : [];
  const doneTodos = doneTodosRes.status === 'fulfilled' ? doneTodosRes.value.todos : [];

  const items: DashboardDetailTodosResponse[] = goals.map((goal) => {
    return {
      goal: {
        id: goal.id,
        title: goal.title,
        source: goal.source,
        progress: toProgressPercent(goal.completedCount, goal.todoCount),
      },
      openTodos: openTodos.filter((todo) => todo.goal.id === goal.id).slice(0, SAFE_LIMIT),
      doneTodos: doneTodos.filter((todo) => todo.goal.id === goal.id).slice(0, SAFE_LIMIT),
    };
  });

  return {
    data: { items },
    errors: {
      goal: goalsRes.status === 'rejected' ? 'failed' : undefined,
      todos: openTodosRes.status === 'rejected' && doneTodosRes.status === 'rejected' ? 'failed' : undefined,
    },
    hasAnySuccess:
      goalsRes.status === 'fulfilled' || openTodosRes.status === 'fulfilled' || doneTodosRes.status === 'fulfilled',
  };
};
