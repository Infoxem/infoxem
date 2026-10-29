'use client';

import { ui } from '@/lib/ui';
import { Search, X, ChevronLeft, ChevronRight, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import { DirectoryTable } from './directory-table';
import { useDirectory } from './use-directory';
import { DirectoryFilters } from './directory-filters';

export function DirectoryView({ kind }: { kind: 'buyers' | 'people' }) {
  const isPeople = kind === 'people';
  const {
    query,
    setQuery,
    search,
    appliedQuery,
    hasSearch,
    filtersVisible,
    setFiltersVisible,
    refinements,
    selected,
    setSelected,
    setRefinement,
    clearRefinements,
    sort,
    setSort,
    pageNum,
    setPageNum,
    filtered,
    visible,
    pages,
    reset,
  } = useDirectory(kind);

  return (
    <div className={ui('directory-page simple-directory')}>
      <div className={ui('page-heading')}>
        <div>
          <h1>{isPeople ? 'People' : 'Find buyers'}</h1>
          <p>
            Search by product, company, or country to find{' '}
            {isPeople ? 'the right people' : 'pharmaceutical buyers'}.
          </p>
        </div>
      </div>
      <form
        className={ui('directory-search-form')}
        onSubmit={(event) => {
          event.preventDefault();
          search();
        }}
        role="search"
        aria-label={isPeople ? 'Find people' : 'Find buyers'}
      >
        <label className={ui('list-search')}>
          <Search size={18} />
          <input
            aria-label={isPeople ? 'Search people' : 'Search buyers'}
            placeholder="Search by product, company, or country..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          {query && (
            <button type="button" aria-label="Clear search" onClick={reset}>
              <X size={16} />
            </button>
          )}
        </label>
        <button className={ui('button primary')} type="submit" disabled={!query.trim()}>
          <Search size={16} /> Search
        </button>
        <button
          className={ui(`button ${filtersVisible ? 'selected' : ''}`)}
          type="button"
          aria-expanded={filtersVisible}
          aria-controls="directory-filters"
          onClick={() => setFiltersVisible(!filtersVisible)}
        >
          <SlidersHorizontal size={16} /> {filtersVisible ? 'Hide' : 'Show'} filters
          {Object.values(refinements).some(Boolean) && (
            <span className={ui('filter-count')}>
              {Object.values(refinements).filter(Boolean).length}
            </span>
          )}
        </button>
      </form>
      <div className={ui(`directory-discovery-layout ${filtersVisible ? 'with-filters' : ''}`)}>
        {filtersVisible && (
          <DirectoryFilters
            isPeople={isPeople}
            values={refinements}
            onChange={setRefinement}
            onClear={clearRefinements}
            onApply={search}
            canApply={Boolean(query.trim())}
          />
        )}
        <div className={ui('directory-shell')}>
          <div className={ui('results-heading')} aria-live="polite">
            <span>
              {hasSearch ? (
                <>
                  <strong>{filtered.length}</strong> {isPeople ? 'people' : 'buyers'} found for “
                  {appliedQuery}”
                </>
              ) : (
                'Search to display matching results'
              )}
            </span>
            {hasSearch && filtered.length > 0 && (
              <label className={ui('sort-label')}>
                Sort by:{' '}
                <select
                  aria-label="Sort results"
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                >
                  <option value="match">Relevance</option>
                  <option value="name">Name A–Z</option>
                  <option value="country">Country</option>
                </select>
              </label>
            )}
          </div>
          <DirectoryTable
            isPeople={isPeople}
            records={visible}
            selected={selected}
            setSelected={setSelected}
            hasSearch={hasSearch}
            reset={reset}
          />
          {hasSearch && filtered.length > 0 && (
            <div className={ui('pagination')}>
              <span>
                {(pageNum - 1) * 8 + 1}–{Math.min(pageNum * 8, filtered.length)} of{' '}
                {filtered.length} {isPeople ? 'people' : 'buyers'}
              </span>
              <div>
                <button
                  className={ui('icon-button')}
                  aria-label="Previous page"
                  disabled={pageNum === 1}
                  onClick={() => setPageNum(pageNum - 1)}
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: pages }, (_, index) => index)
                  .filter(
                    (index) =>
                      Math.abs(index + 1 - pageNum) <= 2 || index === 0 || index === pages - 1,
                  )
                  .map((index) => (
                    <button
                      key={index}
                      className={ui(pageNum === index + 1 ? 'current' : '')}
                      onClick={() => setPageNum(index + 1)}
                    >
                      {index + 1}
                    </button>
                  ))}
                <button
                  className={ui('icon-button')}
                  aria-label="Next page"
                  disabled={pageNum >= pages}
                  onClick={() => setPageNum(pageNum + 1)}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className={ui('data-disclaimer')}>
        <ShieldCheck size={14} /> Imported facility records. Licence status is not live-verified.
        Missing details are Not Available.
      </div>
    </div>
  );
}
