<<<<<<< HEAD
import { CurrentUserResponse, TodoListResponse, UserProgressResponse } from '@/shared/lib/api';
=======
import { CurrentUserResponse, GoalDetailResponse, TodoListResponse, UserProgressResponse } from '@/shared/lib/api';
>>>>>>> 97ec23b9b02894d7b559c607539a8f29546a813a

type DashboardUser = Pick<CurrentUserResponse, 'nickname' | 'githubConnected' | 'id'>;
type DashboardProgress = Pick<UserProgressResponse, 'totalProgress'>;
type DashboardTodo = TodoListResponse['todos'][number];

export interface DashboardSummaryResponse {
  user: DashboardUser | null;
  progress: DashboardProgress | null;
  todos: DashboardTodo[];
}
<<<<<<< HEAD
=======

type DashboardDetailInGoalDetail = Pick<GoalDetailResponse, 'id' | 'title' | 'source' | 'progress'>;
type DashboardDetailInTodoDetail = TodoListResponse['todos'][number];

export interface DashboardDetailTodosResponse {
  goal: DashboardDetailInGoalDetail;
  openTodos: DashboardDetailInTodoDetail[];
  doneTodos: DashboardDetailInTodoDetail[];
}
>>>>>>> 97ec23b9b02894d7b559c607539a8f29546a813a
