'use client';

import { ui } from '@/lib/ui';
import {
  Building2,
  MapPin,
  BriefcaseBusiness,
  Users,
  Search,
  ChevronDown,
  SlidersHorizontal,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { companies } from '@/lib/demo-data';
import type { DirectoryRefinements } from './filter-records';

export function DirectoryFilters({
  isPeople,
  values,
  onChange,
  onClear,
  onApply,
  canApply,
}: {
  isPeople: boolean;
  values: DirectoryRefinements;
  onChange: (field: keyof DirectoryRefinements, value: string) => void;
  onClear: () => void;
  onApply: () => void;
  canApply: boolean;
}) {
  const input = (key: keyof DirectoryRefinements, label: string, placeholder: string) => (
    <label className={ui('refinement-field')}>
      <span>{label}</span>
      <input
        value={values[key]}
        placeholder={placeholder}
        onChange={(event) => onChange(key, event.target.value)}
      />
    </label>
  );
  const select = (
    key: keyof DirectoryRefinements,
    label: string,
    options: string[],
    placeholder = 'Any',
  ) => (
    <label className={ui('refinement-field')}>
      <span>{label}</span>
      <select value={values[key]} onChange={(event) => onChange(key, event.target.value)}>
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
  const groups: {
    label: string;
    icon: LucideIcon;
    keys: (keyof DirectoryRefinements)[];
    content: React.ReactNode;
    open?: boolean;
  }[] = [
    {
      label: 'Company',
      icon: Building2,
      keys: ['company'],
      open: true,
      content: input('company', 'Company name or website', 'e.g. Meridian Healthcare'),
    },
    ...(isPeople
      ? [
          {
            label: 'Job title',
            icon: BriefcaseBusiness,
            keys: ['title', 'seniority'] as (keyof DirectoryRefinements)[],
            content: (
              <>
                {input('title', 'Job title', 'e.g. Procurement Manager')}
                {select('seniority', 'Seniority', ['Head', 'Director', 'Manager'], 'Any seniority')}
              </>
            ),
          },
        ]
      : []),
    {
      label: 'Location',
      icon: MapPin,
      keys: ['country', 'location'],
      open: true,
      content: (
        <>
          {select(
            'country',
            'Country',
            [...new Set(companies.map((company) => company.country))].sort(),
            'Any country',
          )}
          {input('location', 'City or region', 'e.g. Nairobi')}
        </>
      ),
    },
    {
      label: 'Company size',
      icon: Users,
      keys: ['size'],
      content: select(
        'size',
        'Number of employees',
        [...new Set(companies.map((company) => company.size))],
        'Any employee range',
      ),
    },
    {
      label: 'Keywords',
      icon: Search,
      keys: ['keywords'],
      content: (
        <>
          {input('keywords', 'Company keywords', 'e.g. distribution, hospitals')}
          <p className={ui('refinement-help')}>Separate keywords with commas to match any.</p>
        </>
      ),
    },
  ];
  return (
    <aside id="directory-filters" className={ui('apollo-filter-panel')} aria-label="Search filters">
      <header>
        <strong>
          <SlidersHorizontal size={16} /> Filters{' '}
          <span className={ui('filter-count')}>
            {Object.values(values).filter((value) => value.trim()).length}
          </span>
        </strong>
        <button type="button" onClick={onClear}>
          Clear all
        </button>
      </header>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onApply();
        }}
      >
        <div
          className={ui('apollo-filter-groups')}
          role="region"
          aria-label="Filter options"
          tabIndex={0}
        >
          {groups.map(({ label, icon: Icon, keys, content, open }) => (
            <details key={label} className={ui('apollo-filter-group')} open={open}>
              <summary>
                <Icon size={16} />
                <span>{label}</span>
                {keys.some((key) => values[key].trim()) && <i className={ui('refinement-dot')} />}
                <ChevronDown size={14} className={ui('refinement-chevron')} />
              </summary>
              <div className={ui('apollo-filter-content')}>{content}</div>
            </details>
          ))}
        </div>
        <footer>
          <button className={ui('button primary')} type="submit" disabled={!canApply}>
            Apply filters
          </button>
          <p className={ui('refinement-help')}>
            {canApply
              ? 'Apply filters to refine your search.'
              : 'Enter a product, company, or country to start.'}
          </p>
        </footer>
      </form>
    </aside>
  );
}
