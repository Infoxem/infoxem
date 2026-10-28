import { ui } from '@/lib/ui';
import { Building2, MapPin, Pill, Users, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import type { Company, Person } from '@/types/records';

export function ProfileOverview({
  company,
  person,
  onViewPeople,
}: {
  company: Company;
  person: Person | null;
  onViewPeople: () => void;
}) {
  return (
    <div className={ui('detail-insights')}>
      <dl>
        <div>
          <dt>
            <MapPin size={14} />
            Primary market
          </dt>
          <dd>{company.country}</dd>
        </div>
        <div>
          <dt>
            <Building2 size={14} />
            Business model
          </dt>
          <dd>{company.type}</dd>
        </div>
        <div>
          <dt>
            <Pill size={14} />
            Product focus
          </dt>
          <dd className={ui('detail-pills')}>
            {company.products.map((product) => (
              <span className={ui('record-pill')} key={product}>
                {product}
              </span>
            ))}
          </dd>
        </div>
        <div>
          <dt>
            <Users size={14} />
            Company size
          </dt>
          <dd>{company.size} employees</dd>
        </div>
        {person && (
          <div>
            <dt>Current role</dt>
            <dd>{person.role}</dd>
          </div>
        )}
      </dl>
      <div className={ui('detail-insight-note')}>
        <span className={ui('detail-insight-icon')}>
          <Building2 size={24} />
        </span>
        <strong>{person ? 'Explore their company' : 'Pharmaceutical partner'}</strong>
        <p>{company.description}</p>
        {person ? (
          <Link href={`/buyers/${company.id}`}>
            View company profile
            <ArrowUpRight size={13} />
          </Link>
        ) : (
          <button onClick={onViewPeople}>
            Explore people at this company
            <ArrowUpRight size={13} />
          </button>
        )}
      </div>
    </div>
  );
}
