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

export const getDashboardDetailTodos = async (): Promise<DashboardDetailTodosResult> => {
  const [goalsRes, openTodosRes, doneTodosRes] = await Promise.allSettled([
    fetchGoals.getGoals(),
    fetchTodos.getTodos({ sort: 'LATEST', search: '', limit: 300, done: false }),
    fetchTodos.getTodos({ sort: 'LATEST', search: '', limit: 300, done: true }),
  ]);

  const goals = goalsRes.status === 'fulfilled' ? goalsRes.value.goals : [];
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
