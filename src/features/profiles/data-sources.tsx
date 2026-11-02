'use client';

import { useState } from 'react';
import { ExternalLink, Globe, MapPin, Phone } from 'lucide-react';
import { companyDataSources } from '@/lib/data-sources';
import type { Company } from '@/types/records';

const icons = { Website: Globe, Contact: Phone, Location: MapPin };

export function DataSources({ company }: { company: Company }) {
  const groups = companyDataSources(company);
  const [selected, setSelected] = useState('Website');
  const active = groups.find((group) => group.category === selected) ?? groups[0];
  if (!active) return <span>Not Available</span>;
  return (
    <div className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2.5">
      <div role="group" aria-label="Source categories" className="flex gap-1.5">
        {groups.map(({ category, urls }) => {
          const Icon = icons[category as keyof typeof icons];
          const pressed = active.category === category;
          return (
            <button
              key={category}
              type="button"
              aria-pressed={pressed}
              onClick={() => setSelected(category)}
              className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-lg border px-1 py-2 text-[11px] font-medium focus-visible:outline-2 focus-visible:outline-blue-600 ${pressed ? 'border-blue-200 bg-white text-blue-700 shadow-sm' : 'border-transparent text-slate-500 hover:bg-white hover:text-slate-700'}`}
            >
              <span className="flex items-center gap-1.5">
                <Icon size={14} aria-hidden="true" />
                <span
                  className={`rounded-full px-1.5 text-[10px] leading-4 ${pressed ? 'bg-blue-50' : 'bg-slate-200/60'}`}
                >
                  {urls.length}
                </span>
              </span>
              <span>{category}</span>
            </button>
          );
        })}
      </div>
      <div
        className="mt-2.5 grid max-h-44 grid-cols-2 gap-1.5 overflow-y-auto"
        aria-label={`${active.category} sources`}
      >
        {active.urls.map((url, index) => (
          <a
            key={url}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${active.category.toLowerCase()} source ${index + 1} in a new tab`}
            className="inline-flex items-center justify-between gap-2 rounded-md border border-slate-200 bg-white px-2 py-2 text-[11px] font-medium text-slate-600 hover:border-blue-200 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-blue-600"
          >
            Source {index + 1}
            <ExternalLink size={12} aria-hidden="true" className="shrink-0" />
          </a>
        ))}
      </div>
    </div>
  );
}
