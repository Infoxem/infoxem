import { safeWebUrl } from './company-data';
import type { Company, Finding } from '@/types/records';

export function companyDataSources(company: Company): { category: string; urls: string[] }[] {
  const categories: { category: string; fields: Finding['field'][] }[] = [
    { category: 'Website', fields: ['website'] },
    { category: 'Contact', fields: ['phone', 'email'] },
    { category: 'Location', fields: ['address', 'location'] },
  ];
  return categories
    .map(({ category, fields }) => ({
      category,
      urls: [
        ...new Set(
          (company.findings ?? [])
            .filter((item) => fields.includes(item.field))
            .flatMap((item) => [safeWebUrl(item.publisherUrl ?? ''), safeWebUrl(item.sourceUrl)])
            .filter((url): url is string => url !== null),
        ),
      ],
    }))
    .filter((group) => group.urls.length > 0);
}
