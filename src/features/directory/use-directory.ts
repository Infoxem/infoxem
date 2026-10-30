'use client';

import { useEffect, type SetStateAction } from 'react';
import { updateWorkspace, useWorkspaceStore } from '@/hooks/use-workspace-store';
import type { DirectorySearchState as SearchState } from '@/types/records';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  DEFAULT_CRITERIA,
  EMPTY_REFINEMENTS,
  filterRecords,
  getSearchTerms,
  type DirectoryRefinements,
} from './filter-records';

export function useDirectory(kind: 'buyers' | 'people') {
  const router = useRouter();
  const params = useSearchParams();
  const scope = `${kind}?${params.toString()}`;
  const initialQuery = params.get('q') ?? params.get('country') ?? '';
  const defaults: SearchState = {
    scope,
    query: initialQuery,
    appliedQuery: initialQuery,
    page: 1,
    sort: 'match',
    selected: [],
    filtersVisible: false,
    refinements: EMPTY_REFINEMENTS,
    appliedRefinements: EMPTY_REFINEMENTS,
  };
  const workspace = useWorkspaceStore();
  const saved = workspace.directories[kind];
  const current = initialQuery && saved?.scope !== scope ? defaults : (saved ?? defaults);
  // Explicit search links replace the previous search. Bare directory navigation restores it.
  useEffect(() => {
    updateWorkspace((previous) => {
      const stored = previous.directories[kind];
      const next =
        initialQuery && stored?.scope !== scope
          ? { ...defaults, scope }
          : { ...(stored ?? defaults), scope };
      return { ...previous, directories: { ...previous.directories, [kind]: next } };
    });
    // Defaults are derived solely from these route inputs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, scope, initialQuery]);
  const update = (change: (value: SearchState) => SearchState) =>
    updateWorkspace((previous) => ({
      ...previous,
      directories: {
        ...previous.directories,
        [kind]: change(previous.directories[kind] ?? defaults),
      },
    }));
  const hasSearch = getSearchTerms(current.appliedQuery).length > 0;
  const filtered = hasSearch
    ? filterRecords(
        kind,
        {
          ...DEFAULT_CRITERIA,
          ...current.appliedRefinements,
          query: current.appliedQuery,
          sort: current.sort,
        },
        [],
      )
    : [];
  const pages = Math.max(1, Math.ceil(filtered.length / 8));
  const pageNum = Math.min(current.page, pages);
  const visible = filtered.slice((pageNum - 1) * 8, pageNum * 8);
  const setSelected = (value: SetStateAction<string[]>) =>
    update((previous) => ({
      ...previous,
      selected: typeof value === 'function' ? value(previous.selected) : value,
    }));
  const reset = () => {
    update(() => ({ ...defaults, query: '', appliedQuery: '' }));
    router.replace(`/${kind}`);
  };
  return {
    query: current.query,
    setQuery: (query: string) =>
      update((previous) => ({
        ...previous,
        query,
      })),
    search: () =>
      update((previous) => ({
        ...previous,
        appliedQuery: previous.query.trim(),
        appliedRefinements: previous.refinements,
        page: 1,
        selected: [],
      })),
    appliedQuery: current.appliedQuery,
    hasSearch,
    filtersVisible: current.filtersVisible,
    setFiltersVisible: (filtersVisible: boolean) =>
      update((previous) => ({ ...previous, filtersVisible })),
    refinements: current.refinements,
    appliedRefinements: current.appliedRefinements,
    setRefinement: (field: keyof DirectoryRefinements, value: string) =>
      update((previous) => ({
        ...previous,
        refinements: { ...previous.refinements, [field]: value },
      })),
    clearRefinements: () =>
      update((previous) => ({
        ...previous,
        refinements: EMPTY_REFINEMENTS,
        appliedRefinements: EMPTY_REFINEMENTS,
        page: 1,
        selected: [],
      })),
    selected: current.selected,
    setSelected,
    sort: current.sort,
    setSort: (sort: string) => update((previous) => ({ ...previous, sort, page: 1 })),
    pageNum,
    setPageNum: (page: number) => update((previous) => ({ ...previous, page })),
    filtered,
    visible,
    pages,
    reset,
  };
}
