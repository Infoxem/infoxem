'use client';

import { ui } from '@/lib/ui';
import Link from 'next/link';
import { ChevronUp, Globe, MapPin, Building2, GripVertical, Bookmark } from 'lucide-react';
import type { Company, Person } from '@/types/records';
import { useWorkspace } from '@/providers/workspace-provider';
import { ContactInformation } from './contact-information';

export function ProfileSidebar({ company, person }: { company: Company; person: Person | null }) {
  const { saved, lists } = useWorkspace();
  const id = person?.id ?? company.id;
  const memberships = lists.filter((list) => list.ids.includes(id));
  return (
    <aside className={ui('record-profile-rail')} aria-label="Profile details">
      <details className={ui('detail-card')} open>
        <summary>
          <GripVertical size={15} />
          <span>Contact information</span>
          <ChevronUp size={15} />
        </summary>
        <ContactInformation company={company} person={person} />
      </details>
      <details className={ui('detail-card')} open>
        <summary>
          <GripVertical size={15} />
          <span>{person ? 'Person details' : 'Company details'}</span>
          <ChevronUp size={15} />
        </summary>
        <div className={ui('detail-rail-body')}>
          {!person && <p className={ui('detail-description')}>{company.description}</p>}
          <dl className={ui('detail-facts')}>
            {person && (
              <>
                <div>
                  <dt>Job title</dt>
                  <dd>{person.role}</dd>
                </div>
                <div>
                  <dt>Company</dt>
                  <dd>
                    <Link href={`/buyers/${company.id}`} className={ui('detail-inline-link')}>
                      <Building2 size={13} />
                      {company.name}
                    </Link>
                  </dd>
                </div>
                <div>
                  <dt>Seniority</dt>
                  <dd>{person.seniority}</dd>
                </div>
              </>
            )}
            <div>
              <dt>Industries</dt>
              <dd>
                <span className={ui('record-pill')}>Pharmaceuticals</span>
              </dd>
            </div>
            <div>
              <dt>Keywords</dt>
              <dd className={ui('detail-pills')}>
                {company.products.map((product) => (
                  <span key={product} className={ui('record-pill')}>
                    {product}
                  </span>
                ))}
              </dd>
            </div>
            <div>
              <dt>Business type</dt>
              <dd>{company.type}</dd>
            </div>
            <div>
              <dt>Employees</dt>
              <dd>{company.size}</dd>
            </div>
            <div>
              <dt>Location</dt>
              <dd>
                <MapPin size={13} />
                {company.city}, {company.country}
              </dd>
            </div>
            <div>
              <dt>Links</dt>
              <dd>
                <a
                  className={ui('detail-icon-link')}
                  href={`https://${company.domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={company.domain}
                  aria-label="Open company website"
                >
                  <Globe size={16} />
                </a>
              </dd>
            </div>
          </dl>
        </div>
      </details>
      <details className={ui('detail-card')} open>
        <summary>
          <GripVertical size={15} />
          <span>Record details</span>
          <ChevronUp size={15} />
        </summary>
        <dl className={ui('detail-facts detail-rail-body')}>
          <div>
            <dt>Saved status</dt>
            <dd>
              <Bookmark size={13} />
              {saved.includes(id) ? 'Saved' : 'Not saved'}
            </dd>
          </div>
          <div>
            <dt>Lists</dt>
            <dd>
              {memberships.length
                ? memberships.map((list) => list.name).join(', ')
                : 'Not present in any list.'}
            </dd>
          </div>
          <div>
            <dt>Data source</dt>
            <dd>Illustrative demo data</dd>
          </div>
        </dl>
      </details>
    </aside>
  );
}
