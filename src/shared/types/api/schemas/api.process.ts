import { CurrentUserResponse, TodoListResponse, UserProgressResponse } from '@/shared/lib/api';

type DashboardUser = Pick<CurrentUserResponse, 'nickname' | 'githubConnected' | 'id'>;
type DashboardProgress = Pick<UserProgressResponse, 'totalProgress'>;
type DashboardTodo = TodoListResponse['todos'][number];

export interface DashboardSummaryResponse {
  user: DashboardUser | null;
  progress: DashboardProgress | null;
  todos: DashboardTodo[];
}
