import { ui } from '@/lib/ui';
import Link from 'next/link';
import { type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { byId } from '@/lib/demo-data';
import type { Company, Person } from '@/types/records';

export function Logo({ company, large = false }: { company: Company; large?: boolean }) {
  return (
    <span className={ui(`company-logo ${company.color} ${large ? 'large' : ''}`)}>
      {company.initials}
    </span>
  );
}

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: string }) {
  return <span className={ui(`badge ${tone}`)}>{children}</span>;
}

export function MiniChart({ color = '#2763e7' }: { color?: string }) {
  return (
    <svg viewBox="0 0 120 38" className={ui('sparkline')} aria-hidden="true">
      <path
        d="M1 34 L14 28 L23 30 L34 21 L43 24 L54 15 L65 18 L77 8 L87 13 L99 5 L109 9 L119 2"
        fill="none"
        stroke={color}
        strokeWidth="2"
      />
      <path
        d="M1 34 L14 28 L23 30 L34 21 L43 24 L54 15 L65 18 L77 8 L87 13 L99 5 L109 9 L119 2 V38 H1Z"
        fill={color}
        opacity=".06"
      />
    </svg>
  );
}

export function Fact({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className={ui('fact')}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export function FilterSelect({
  label,
  icon,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  icon: ReactNode;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
}) {
  return (
    <div className={ui('filter-group')}>
      <h3>
        {icon}
        {label}
        <ChevronDown size={14} />
      </h3>
      <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

export function companyLinkContent(c: Company) {
  return (
    <span className={ui('identity')}>
      <Logo company={c} />
      <span>
        <strong>{c.name}</strong>
        <small>
          {c.country} · {c.type}
        </small>
      </span>
    </span>
  );
}
export function CompanyLink({ company: c }: { company: Company }) {
  return (
    <Link className={ui('identity')} href={`/buyers/${c.id}`}>
      <Logo company={c} />
      <span>
        <strong>{c.name}</strong>
        <small>{c.domain}</small>
      </span>
    </Link>
  );
}
export function PersonLink({ person: p }: { person: Person }) {
  const c = byId(p.company);
  return (
    <Link className={ui('identity')} href={`/people/${p.id}`}>
      <span className={ui(`person-avatar ${c.color}`)}>{p.initials}</span>
      <span>
        <strong>{p.name}</strong>
        <small>{p.role}</small>
      </span>
    </Link>
  );
}
