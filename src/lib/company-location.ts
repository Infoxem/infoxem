import { findingValues } from './company-data';
import type { Company } from '@/types/records';

function available(value: string | undefined): string {
  const text = value?.trim() ?? '';
  return /^(not available|not found)$/i.test(text) ? '' : text;
}

export function importedCounty(company: Company): string {
  return available(company.sourceFields?.County) || available(company.city) || 'Not Available';
}

export function importedLocation(company: Company): string {
  const parts = [company.sourceFields?.Street, importedCounty(company), company.country]
    .map(available)
    .filter(Boolean);
  return (
    [...new Map(parts.map((part) => [part.toLowerCase(), part])).values()].join(', ') ||
    'Not Available'
  );
}

export function companyLocation(company: Company): string {
  const addresses = findingValues(company, 'address').map(available).filter(Boolean);
  return addresses.join('; ') || importedLocation(company);
}
