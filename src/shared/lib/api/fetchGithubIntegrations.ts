import type { operations } from '@/shared/types/api/schemas/api.types';
import { apiRequest } from './utils';

export type GithubRepositoriesResponse =
  operations['listRepositories']['responses'][200]['content']['application/json'];
export type ConnectGithubRepositoryRequest =
  operations['connectRepository']['requestBody']['content']['application/json'];
export type ConnectGithubRepositoryResponse =
  operations['connectRepository']['responses'][201]['content']['application/json'];

class FetchGithubIntegrations {
  getRepositories = () => apiRequest<GithubRepositoriesResponse>('/api/v1/integrations/github/repositories');

  postConnectRepository = (body: ConnectGithubRepositoryRequest) =>
    apiRequest<ConnectGithubRepositoryResponse, ConnectGithubRepositoryRequest>(
      '/api/v1/integrations/github/repositories/connect',
      {
        method: 'POST',
        body,
      },
    );

  deleteConnectedGoal = (goalId: number) =>
    apiRequest<void>(`/api/v1/integrations/github/goals/${goalId}`, {
      method: 'DELETE',
    });
}

const fetchGithubIntegrations = new FetchGithubIntegrations();
export { fetchGithubIntegrations };
