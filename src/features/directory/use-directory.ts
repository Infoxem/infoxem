'use client';

import { useState, type SetStateAction } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  DEFAULT_CRITERIA,
  EMPTY_REFINEMENTS,
  filterRecords,
  getSearchTerms,
  type DirectoryRefinements,
} from './filter-records';

type SearchState = {
  scope: string;
  query: string;
  appliedQuery: string;
  page: number;
  sort: string;
  selected: string[];
  refinements: DirectoryRefinements;
  appliedRefinements: DirectoryRefinements;
};

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
    refinements: EMPTY_REFINEMENTS,
    appliedRefinements: EMPTY_REFINEMENTS,
  };
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [state, setState] = useState<SearchState>(defaults);
  const current = state.scope === scope ? state : defaults;
  const update = (change: (value: SearchState) => SearchState) =>
    setState((previous) => change(previous.scope === scope ? previous : defaults));
  const hasSearch =
    getSearchTerms(current.query).length > 0 && getSearchTerms(current.appliedQuery).length > 0;
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
    setState({ ...defaults, query: '', appliedQuery: '' });
    router.replace(`/${kind}`);
  };
  return {
    query: current.query,
    setQuery: (query: string) =>
      update((previous) => ({
        ...previous,
        query,
        appliedQuery: query.trim() ? previous.appliedQuery : '',
        page: 1,
        selected: [],
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
    filtersVisible,
    setFiltersVisible,
    refinements: current.refinements,
    appliedRefinements: current.appliedRefinements,
    setRefinement: (field: keyof DirectoryRefinements, value: string) =>
      update((previous) => ({
        ...previous,
        refinements: { ...previous.refinements, [field]: value },
        page: 1,
        selected: [],
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
