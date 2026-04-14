import type { operations } from '@/shared/types/api/schemas/api.types';
import { apiRequest } from './utils';

export type GetNotesParams = operations['getList_1']['parameters']['query'];
export type NoteListResponse = operations['getList_1']['responses'][200]['content']['application/json'];
export type NoteResponse = operations['getDetail_1']['responses'][200]['content']['application/json'];
export type PostNoteRequest = operations['create_1']['requestBody']['content']['application/json'];
export type PostNoteResponse = operations['create_1']['responses'][201]['content']['application/json'];
export type PatchNoteRequest = operations['update_1']['requestBody']['content']['application/json'];
export type PatchNoteResponse = operations['update_1']['responses'][200]['content']['application/json'];

// 서버 컴포넌트 전용 - Next.js fetch 캐시 사용 (React Query와 공유 X)
class FetchNotes {
  getNotes = (params?: GetNotesParams) => apiRequest<NoteListResponse>('/api/v1/notes', { params });

  getNote = (noteId: number) => apiRequest<NoteResponse>(`/api/v1/notes/${noteId}`);

  postNote = (body: PostNoteRequest) =>
    apiRequest<PostNoteResponse, PostNoteRequest>('/api/v1/notes', {
      method: 'POST',
      body,
    });

  patchNote = (noteId: number, body: PatchNoteRequest) =>
    apiRequest<PatchNoteResponse, PatchNoteRequest>(`/api/v1/notes/${noteId}`, {
      method: 'PATCH',
      body,
    });

  deleteNote = (noteId: number) =>
    apiRequest<void>(`/api/v1/notes/${noteId}`, {
      method: 'DELETE',
    });
}

const fetchNotes = new FetchNotes();
export { fetchNotes };
