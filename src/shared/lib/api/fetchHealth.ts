import type { operations } from '@/shared/types/api/schemas/api.types';
import { apiRequest } from './utils';

export type HealthResponse = operations['health']['responses'][200]['content']['application/json'];

class FetchHealth {
  getHealth = () => apiRequest<HealthResponse>('/health');
}

const fetchHealth = new FetchHealth();
export { fetchHealth };
