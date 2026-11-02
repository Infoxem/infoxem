import type { Company, Finding, Person, Superintendent } from '@/types/records';

export type Catalogue = { companies: Company[]; people: Person[] };
export const EMPTY_CATALOGUE: Catalogue = { companies: [], people: [] };

export function findingsFromRow(row: {
  id: string;
  phone_mobile: string[];
  email: string[];
  website: string[];
  location?: string[];
  address: string[];
  evidence: unknown;
}): Finding[] {
  if (!Array.isArray(row.evidence)) throw new Error('Invalid finding evidence');
  const evidence = row.evidence.map((item: unknown): Finding => {
    if (typeof item !== 'object' || item === null) throw new Error('Invalid evidence');
    const value = item as Record<string, unknown>;
    const result = {
      id: value.id,
      companyId: value.company_id,
      field: value.field === 'location' ? 'address' : value.field,
      value: value.value,
      normalizedValue: value.normalized_value,
      sourceUrl: value.source_url,
      publisherUrl:
        typeof value.publisher_url === 'string'
          ? (safeWebUrl(value.publisher_url) ?? undefined)
          : undefined,
      collectedAt: value.collected_at,
      datePrecision: value.date_precision,
      scope: '',
      collector: value.collector,
      reason: '',
    };
    if (!isFinding(result) || result.companyId !== row.id || value.excluded === true)
      throw new Error('Invalid finding evidence');
    return result;
  });
  const columns = {
    phone: row.phone_mobile,
    email: row.email,
    website: row.website,
    address: [...new Set([...row.address, ...(row.location ?? [])])],
  };
  return Object.entries(columns).flatMap(([field, values]) =>
    values.flatMap((value) => {
      const matches = evidence.filter(
        (item) => item.field === field && (item.value === value || item.normalizedValue === value),
      );
      return matches.length
        ? matches
        : [
            {
              id: `${row.id}:${field}:${value}`,
              companyId: row.id,
              field: field as Finding['field'],
              value,
              normalizedValue: value,
              sourceUrl: '',
              collectedAt: null,
              datePrecision: 'unknown',
              scope: '',
              collector: '',
              reason: '',
            },
          ];
    }),
  );
}

export function safeWebUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password
      ? url.href
      : null;
  } catch {
    return null;
  }
}

export function companyFromRow(
  row: {
    id: string;
    name: string;
    country: string;
    county: string | null;
    business_type: string;
    collection_status: string;
  },
  findings: Finding[],
  sourceFields?: Record<string, string>,
): Company {
  const website = findings.find((f) => f.field === 'website' && safeWebUrl(f.value));
  return {
    id: row.id,
    name: row.name,
    initials: row.name.slice(0, 2),
    domain: website ? new URL(website.value).hostname : '',
    country: row.country,
    flag: '🇰🇪',
    city: row.county || 'Not Available',
    type: row.business_type,
    size: 'Not Available',
    products: [],
    match: 0,
    color: 'blue',
    description: '',
    contacts: 0,
    findings,
    sourceFields,
    collectionStatus: row.collection_status,
  };
}

export function superintendentsFor(company: Company): Superintendent[] {
  const fields = company.sourceFields;
  if (!fields?.['HTML comment: Superintendent']) return [];
  return [
    {
      id: `superintendent-${company.id}`,
      name: fields['HTML comment: Superintendent'],
      company: company.id,
      cadre: fields['HTML comment: Cadre'] || 'Not Available',
      registrationNumber: fields['HTML comment: Registration Number'] || 'Not Available',
      enrollmentNumber: fields['HTML comment: Enrollment Number'] || 'Not Available',
    },
  ];
}

export function findingValues(company: Company, field: Finding['field']): string[] {
  return [
    ...new Map(
      (company.findings ?? [])
        .filter((f) => f.field === field)
        .map((f) => [f.normalizedValue, f.value]),
    ).values(),
  ];
}

export function stringFields(value: unknown): Record<string, string> {
  if (typeof value !== 'object' || value === null || Array.isArray(value))
    throw new Error('Invalid company fields');
  const entries = Object.entries(value);
  if (!entries.every(([, item]) => typeof item === 'string'))
    throw new Error('Invalid company field value');
  return Object.fromEntries(entries) as Record<string, string>;
}

export function websiteUrl(company: Company): string | null {
  for (const item of company.findings ?? []) {
    if (item.field === 'website' && safeWebUrl(item.value)) return safeWebUrl(item.value);
  }
  return company.domain ? safeWebUrl(`https://${company.domain}`) : null;
}

export function parseCatalogue(value: unknown): Catalogue {
  if (
    typeof value !== 'object' ||
    value === null ||
    !('companies' in value) ||
    !Array.isArray(value.companies)
  )
    throw new Error('Invalid company response');
  const companies = value.companies.map(parseCompany);
  return { companies, people: [] };
}

export function parseCompany(value: unknown): Company {
  if (typeof value !== 'object' || value === null || Array.isArray(value))
    throw new Error('Invalid company response');
  const row = value as Record<string, unknown>;
  for (const key of [
    'id',
    'name',
    'initials',
    'domain',
    'country',
    'flag',
    'city',
    'type',
    'size',
    'color',
    'description',
  ]) {
    if (typeof row[key] !== 'string') throw new Error('Invalid company response');
  }
  if (
    !Array.isArray(row.products) ||
    !row.products.every((p: unknown) => typeof p === 'string') ||
    typeof row.match !== 'number' ||
    typeof row.contacts !== 'number'
  )
    throw new Error('Invalid company response');
  if (!Array.isArray(row.findings) || !row.findings.every(isFinding))
    throw new Error('Invalid findings');
  if (row.sourceFields !== undefined) stringFields(row.sourceFields);
  return value as Company;
}

function isFinding(value: unknown): value is Finding {
  if (typeof value !== 'object' || value === null) return false;
  const row = value as Record<string, unknown>;
  return (
    ['phone', 'email', 'website', 'address', 'location'].includes(String(row.field)) &&
    [
      'id',
      'companyId',
      'value',
      'normalizedValue',
      'sourceUrl',
      'datePrecision',
      'scope',
      'collector',
      'reason',
    ].every((key) => typeof row[key] === 'string') &&
    (row.publisherUrl === undefined || typeof row.publisherUrl === 'string') &&
    (row.collectedAt === null || typeof row.collectedAt === 'string')
  );
}
