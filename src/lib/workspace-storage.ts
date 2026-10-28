import type { WorkspaceState } from '@/types/records';

export const STORAGE_KEY = 'infoxem-workspace-v1';
export const EMPTY_WORKSPACE: WorkspaceState = { saved: [], lists: [], notes: {}, requests: [] };

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function strings(value: unknown): string[] {
  return Array.isArray(value)
    ? [...new Set(value.filter((item): item is string => typeof item === 'string'))]
    : [];
}

/** Validate browser data rather than trusting a JSON cast or stale prototype data. */
export function parseWorkspace(raw: string | null): WorkspaceState {
  if (!raw) return EMPTY_WORKSPACE;
  try {
    const value: unknown = JSON.parse(raw);
    if (!isObject(value)) return EMPTY_WORKSPACE;
    return {
      saved: strings(value.saved),
      lists: Array.isArray(value.lists)
        ? value.lists
            .filter(isObject)
            .filter((item) => typeof item.name === 'string')
            .map((item) => ({ name: String(item.name), ids: strings(item.ids) }))
        : [],
      notes: isObject(value.notes)
        ? Object.fromEntries(
            Object.entries(value.notes).filter(
              (entry): entry is [string, string] => typeof entry[1] === 'string',
            ),
          )
        : {},
      requests: Array.isArray(value.requests)
        ? value.requests
            .filter(isObject)
            .filter(
              (item) =>
                ['id', 'target', 'note', 'createdAt'].every(
                  (key) => typeof item[key] === 'string',
                ) && item.status === 'Pending',
            )
            .map((item) => ({
              id: String(item.id),
              target: String(item.target),
              fields: strings(item.fields),
              note: String(item.note),
              status: 'Pending' as const,
              createdAt: String(item.createdAt),
            }))
        : [],
    };
  } catch {
    return EMPTY_WORKSPACE;
  }
}

export function loadWorkspace(storage: Pick<Storage, 'getItem'>): WorkspaceState {
  const current = storage.getItem(STORAGE_KEY);
  if (current) return parseWorkspace(current);
  // Preserve bookmarks, notes, requests, and lists from the earlier Next.js UI.
  const readLegacy = (key: string, fallback: string) => {
    try {
      return JSON.parse(storage.getItem(key) || fallback) as unknown;
    } catch {
      return JSON.parse(fallback) as unknown;
    }
  };
  return parseWorkspace(
    JSON.stringify({
      saved: readLegacy('infoxem-saved', '[]'),
      lists: readLegacy('infoxem-lists', '[]'),
      notes: readLegacy('infoxem-notes', '{}'),
      requests: readLegacy('infoxem-requests', '[]'),
    }),
  );
}
