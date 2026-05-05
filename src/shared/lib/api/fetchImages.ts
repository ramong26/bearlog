import type { operations } from '@/shared/types/api/schemas/api.types';
import { apiRequest } from './utils';

export type PostImageUploadUrlRequest =
  operations['createUploadUrl']['requestBody']['content']['application/json'];
export type ImageUploadUrlResponse =
  operations['createUploadUrl']['responses'][200]['content']['application/json'];

class FetchImages {
  postImageUploadUrl = (body: PostImageUploadUrlRequest) =>
    apiRequest<ImageUploadUrlResponse, PostImageUploadUrlRequest>('/api/v1/images', {
      method: 'POST',
      body,
    });
}

const fetchImages = new FetchImages();
export { fetchImages };
