import { findingValues } from '@/lib/company-data';
import type { Company, Person } from '@/types/records';

/** Escape quotes/newlines and prevent spreadsheet applications from evaluating cells as formulas. */
export function encodeCsv(rows: string[][]): string {
  return (
    '\uFEFF' +
    rows
      .map((row) =>
        row
          .map((value) => {
            const safe = /^[\s]*[=+@-]/.test(value) ? `'${value}` : value;
            return `"${safe.replaceAll('"', '""')}"`;
          })
          .join(','),
      )
      .join('\r\n')
  );
}
export function directoryCsv(
  records: (Company | Person)[],
  isPeople: boolean,
  companies: Company[] = [],
): string {
  return encodeCsv([
    isPeople
      ? ['Name', 'Job title', 'Company', 'Country']
      : [
          'Company',
          'Country',
          'Business type',
          'Products',
          'Phone / mobile',
          'Email',
          'Website',
          'Address / Location',
          'Evidence',
        ],
    ...records.map((record) => {
      if ('company' in record) {
        const company = companies.find((c) => c.id === record.company);
        return [record.name, record.role, company?.name ?? '', company?.country ?? ''];
      }
      return [
        record.name,
        record.country,
        record.type,
        record.products.join('; '),
        ...(['phone', 'email', 'website', 'address'] as const).map(
          (field) => findingValues(record, field).join('; ') || 'Not Available',
        ),
        JSON.stringify(
          (record.findings ?? []).map((item) => ({
            field: item.field,
            value: item.value,
            source: item.sourceUrl,
            publisher: item.publisherUrl,
            collectedAt: item.collectedAt,
          })),
        ),
      ];
    }),
  ]);
}
export function downloadDirectoryCsv(
  records: (Company | Person)[],
  isPeople: boolean,
  companies: Company[] = [],
): void {
  const url = URL.createObjectURL(
    new Blob([directoryCsv(records, isPeople, companies)], { type: 'text/csv;charset=utf-8;' }),
  );
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `infoxem-${isPeople ? 'people' : 'buyers'}.csv`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  // Keep the blob alive long enough for the browser to initiate the download.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
