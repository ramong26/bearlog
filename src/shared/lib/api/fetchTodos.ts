import type { operations } from '@/shared/types/api/schemas/api.types';
import { apiRequest } from './utils';

export type GetTodosParams = operations['getList']['parameters']['query'];
export type TodoListResponse = operations['getList']['responses'][200]['content']['application/json'];
export type TodoResponse = operations['getDetail']['responses'][200]['content']['application/json'];
export type GetTodoCalendarParams = operations['getCalendar']['parameters']['query'];
export type TodoCalendarResponse = operations['getCalendar']['responses'][200]['content']['application/json'];
export type PostTodoRequest = operations['create']['requestBody']['content']['application/json'];
export type PostTodoResponse = operations['create']['responses'][201]['content']['application/json'];
export type PatchTodoRequest = operations['update']['requestBody']['content']['application/json'];
export type PatchTodoResponse = operations['update']['responses'][200]['content']['application/json'];
export type PatchTodoFavoriteResponse = operations['toggleFavorite']['responses'][200]['content']['application/json'];

class FetchTodos {
  getTodos = (params?: GetTodosParams) => apiRequest<TodoListResponse>('/api/v1/todos', { params });

  getTodoCalendar = (params: GetTodoCalendarParams) =>
    apiRequest<TodoCalendarResponse>('/api/v1/todos/calendar', { params });

  getTodo = (todoId: number) => apiRequest<TodoResponse>(`/api/v1/todos/${todoId}`);

  postTodo = (body: PostTodoRequest) =>
    apiRequest<PostTodoResponse, PostTodoRequest>('/api/v1/todos', {
      method: 'POST',
      body,
    });

  patchTodo = (todoId: number, body: PatchTodoRequest) =>
    apiRequest<PatchTodoResponse, PatchTodoRequest>(`/api/v1/todos/${todoId}`, {
      method: 'PATCH',
      body,
    });

  deleteTodo = (todoId: number) =>
    apiRequest<void>(`/api/v1/todos/${todoId}`, {
      method: 'DELETE',
    });

  patchTodoFavorite = (todoId: number) =>
    apiRequest<PatchTodoFavoriteResponse>(`/api/v1/todos/${todoId}/favorite`, {
      method: 'PATCH',
    });
}

const fetchTodos = new FetchTodos();
export { fetchTodos };
