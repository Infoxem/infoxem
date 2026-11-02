import { safeWebUrl } from '@/lib/company-data';
import type { Company, Finding } from '@/types/records';

export function FindingList({ company, fields }: { company: Company; fields: Finding['field'][] }) {
  const grouped = new Map<string, Finding[]>();
  for (const item of company.findings ?? []) {
    if (!fields.includes(item.field)) continue;
    const key = `${item.field}:${item.normalizedValue}`;
    grouped.set(key, [...(grouped.get(key) ?? []), item]);
  }
  if (!grouped.size) return <span>Not Available</span>;
  return (
    <div className="space-y-4">
      {[...grouped].map(([key, items]) => {
        const first = items[0];
        const href = first.field === 'website' ? safeWebUrl(first.value) : null;
        return (
          <div key={key} className="space-y-1 break-words">
            {href ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 underline"
              >
                {first.value}
              </a>
            ) : (
              <span>{first.value}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
