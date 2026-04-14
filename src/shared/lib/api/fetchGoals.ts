import type { operations } from '@/shared/types/api/schemas/api.types';
import { apiRequest } from './utils';

export type GetGoalsParams = operations['getList_2']['parameters']['query'];
export type GoalListResponse = operations['getList_2']['responses'][200]['content']['application/json'];
export type PostGoalResponse = operations['create_2']['responses'][201]['content']['application/json'];
export type GoalDetailResponse = operations['getDetail_2']['responses'][200]['content']['application/json'];
export type PostGoalRequest = operations['create_2']['requestBody']['content']['application/json'];
export type PatchGoalRequest = operations['update_2']['requestBody']['content']['application/json'];
export type PatchGoalResponse = operations['update_2']['responses'][200]['content']['application/json'];

class FetchGoals {
  getGoals = (params?: GetGoalsParams) => apiRequest<GoalListResponse>('/api/v1/goals', { params });

  getGoal = (goalId: number) => apiRequest<GoalDetailResponse>(`/api/v1/goals/${goalId}`);

  postGoal = (body: PostGoalRequest) =>
    apiRequest<PostGoalResponse, PostGoalRequest>('/api/v1/goals', {
      method: 'POST',
      body,
    });

  patchGoal = (goalId: number, body: PatchGoalRequest) =>
    apiRequest<PatchGoalResponse, PatchGoalRequest>(`/api/v1/goals/${goalId}`, {
      method: 'PATCH',
      body,
    });

  deleteGoal = (goalId: number) =>
    apiRequest<void>(`/api/v1/goals/${goalId}`, {
      method: 'DELETE',
    });
}

const fetchGoals = new FetchGoals();
export { fetchGoals };
