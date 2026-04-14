export type NoteSource = 'MANUAL' | 'GITHUB_ISSUE' | 'GITHUB_PR';
type TagItem = { id?: number | null; name?: string | null };

interface MapNoteTagsOptions {
  source?: string;
  tags?: TagItem[];
  sourceItemId?: number | null;
  status?: string | null;
}

export function mapNoteTagsFromSource({
  source,
  tags,
  sourceItemId,
  status,
}: MapNoteTagsOptions): { id: string; string: string }[] {
  const githubSourceLabel = source === 'GITHUB_ISSUE' ? 'ISSUES' : source === 'GITHUB_PR' ? 'PR' : null;

  if (githubSourceLabel) {
    const result = [{ id: 'source', string: githubSourceLabel }];
    if (sourceItemId != null) {
      result.push({ id: 'itemId', string: '#' + sourceItemId });
    }
    if (status != null) {
      result.push({ id: 'status', string: '•' + status });
    }
    return result;
  }

  return (tags ?? []).map((t, i) => ({ id: t.id != null ? String(t.id) : 'manual-tag-' + i, string: t.name ?? '' }));
}
