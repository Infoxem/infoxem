import { companies, people } from '@/lib/demo-data';
import type { Company, Person } from '@/types/records';

export type DirectoryCriteria = {
  query: string;
  country: string;
  type: string;
  product: string;
  seniority: string;
  company: string;
  title: string;
  location: string;
  size: string;
  keywords: string;
  savedOnly: boolean;
  sort: string;
  listIds?: string[];
};
export type DirectoryRefinements = Pick<
  DirectoryCriteria,
  | 'country'
  | 'type'
  | 'product'
  | 'seniority'
  | 'company'
  | 'title'
  | 'location'
  | 'size'
  | 'keywords'
>;
export const EMPTY_REFINEMENTS: DirectoryRefinements = {
  country: '',
  type: '',
  product: '',
  seniority: '',
  company: '',
  title: '',
  location: '',
  size: '',
  keywords: '',
};
export const DEFAULT_CRITERIA: DirectoryCriteria = {
  ...EMPTY_REFINEMENTS,
  query: '',
  country: '',
  type: '',
  product: '',
  seniority: '',
  savedOnly: false,
  sort: 'match',
};

export function getSearchTerms(query: string): string[] {
  return query
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter((term) => term && !['in', 'and', 'for'].includes(term));
}

/** Discovery never exposes the full directory before a meaningful search. */
export function searchRecords(
  kind: 'buyers' | 'people',
  query: string,
  sort = 'match',
): (Company | Person)[] {
  if (!getSearchTerms(query).length) return [];
  return filterRecords(kind, { ...DEFAULT_CRITERIA, query, sort }, []);
}

export function filterRecords(
  kind: 'buyers' | 'people',
  criteria: DirectoryCriteria,
  saved: string[],
): (Company | Person)[] {
  const records = kind === 'people' ? people : companies;
  const terms = getSearchTerms(criteria.query);
  const companyFor = (record: Company | Person) =>
    'company' in record ? companies.find((c) => c.id === record.company) : record;
  return records
    .filter((record) => {
      const company = companyFor(record);
      if (!company) return false;
      const person = 'role' in record ? record : null;
      const haystack = [
        company.name,
        company.country,
        company.city,
        company.type,
        ...company.products,
        person?.name,
        person?.role,
      ]
        .join(' ')
        .toLowerCase();
      return (
        terms.every((term) => haystack.includes(term)) &&
        (!criteria.country || company.country === criteria.country) &&
        (!criteria.type || company.type === criteria.type) &&
        (!criteria.product || company.products.includes(criteria.product)) &&
        (!criteria.seniority || person?.seniority === criteria.seniority) &&
        (!criteria.company ||
          `${company.name} ${company.domain}`
            .toLowerCase()
            .includes(criteria.company.toLowerCase().trim())) &&
        (!criteria.title ||
          person?.role.toLowerCase().includes(criteria.title.toLowerCase().trim())) &&
        (!criteria.location ||
          company.city.toLowerCase().includes(criteria.location.toLowerCase().trim())) &&
        (!criteria.size || company.size === criteria.size) &&
        (!criteria.keywords ||
          criteria.keywords
            .toLowerCase()
            .split(',')
            .filter((term) => term.trim())
            .some((term) =>
              `${haystack} ${company.description.toLowerCase()}`.includes(term.trim()),
            )) &&
        (!criteria.savedOnly || saved.includes(record.id)) &&
        (criteria.listIds === undefined || criteria.listIds.includes(record.id))
      );
    })
    .sort((a, b) =>
      criteria.sort === 'name'
        ? a.name.localeCompare(b.name)
        : criteria.sort === 'country'
          ? (companyFor(a)?.country ?? '').localeCompare(companyFor(b)?.country ?? '')
          : (companyFor(b)?.match ?? 0) - (companyFor(a)?.match ?? 0),
    );
}
