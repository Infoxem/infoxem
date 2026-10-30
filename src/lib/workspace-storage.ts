import type { DirectorySearchState, WorkspaceState } from '@/types/records';

export const STORAGE_KEY = 'infoxem-workspace-v1';
export const EMPTY_WORKSPACE: WorkspaceState = {
  saved: [],
  lists: [],
  notes: {},
  requests: [],
  directories: {},
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function strings(value: unknown): string[] {
  return Array.isArray(value)
    ? [...new Set(value.filter((item): item is string => typeof item === 'string'))]
    : [];
}

const refinementKeys = [
  'country',
  'type',
  'product',
  'seniority',
  'company',
  'title',
  'location',
  'size',
  'keywords',
] as const;
function refinements(value: unknown): DirectorySearchState['refinements'] {
  return Object.fromEntries(
    refinementKeys.map((key) => [
      key,
      isObject(value) && typeof value[key] === 'string' ? value[key] : '',
    ]),
  ) as DirectorySearchState['refinements'];
}
function parseDirectory(value: unknown): DirectorySearchState | undefined {
  if (!isObject(value) || typeof value.query !== 'string' || typeof value.appliedQuery !== 'string')
    return;
  return {
    scope: typeof value.scope === 'string' ? value.scope : '',
    query: value.query,
    appliedQuery: value.appliedQuery,
    page:
      typeof value.page === 'number' && Number.isSafeInteger(value.page) && value.page > 0
        ? value.page
        : 1,
    sort: ['match', 'name', 'country'].includes(String(value.sort)) ? String(value.sort) : 'match',
    selected: strings(value.selected),
    filtersVisible: value.filtersVisible === true,
    refinements: refinements(value.refinements),
    appliedRefinements: refinements(value.appliedRefinements),
  };
}

/** Validate browser data rather than trusting a JSON cast or stale prototype data. */
export function parseWorkspace(raw: string | null): WorkspaceState {
  if (!raw) return EMPTY_WORKSPACE;
  try {
    const value: unknown = JSON.parse(raw);
    if (!isObject(value)) return EMPTY_WORKSPACE;
    const directories: WorkspaceState['directories'] = {};
    if (isObject(value.directories)) {
      for (const kind of ['buyers', 'people'] as const) {
        const directory = parseDirectory(value.directories[kind]);
        if (directory) directories[kind] = directory;
      }
    }
    return {
      directories,
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
