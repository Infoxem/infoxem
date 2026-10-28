'use client';

import { ui } from '@/lib/ui';
import { Globe, Mail, Phone, Plus, CircleCheck } from 'lucide-react';
import type { Company, Person } from '@/types/records';
import { useWorkspace } from '@/providers/workspace-provider';

export function ContactInformation({
  company,
  person,
}: {
  company: Company;
  person: Person | null;
}) {
  const { openRequest, showContact } = useWorkspace();
  const email = `${person ? person.name.toLowerCase().split(' ')[0] : 'hello'}@${company.domain}`;
  return (
    <div className={ui('detail-contact-list')}>
      <div>
        <span className={ui('detail-contact-symbol')}>
          <Mail size={16} />
        </span>
        <div>
          <small>{person ? 'Work email' : 'Company email'}</small>
          {person && !person.email ? (
            <button
              className={ui('detail-text-button')}
              onClick={() => openRequest(person.name, ['Work email'])}
            >
              Request email <Plus size={12} />
            </button>
          ) : (
            <>
              <a href={`mailto:${email}`}>{email}</a>
              <span className={ui('detail-sample')}>
                <CircleCheck size={11} /> Sample address
              </span>
            </>
          )}
        </div>
      </div>
      <div>
        <span className={ui('detail-contact-symbol')}>
          <Phone size={16} />
        </span>
        <div>
          <small>Phone number</small>
          <span className={ui('detail-muted')}>No phone number</span>
          <button
            className={ui('detail-text-button')}
            onClick={() => openRequest(person?.name ?? company.name, ['Phone number'])}
          >
            Request phone <Plus size={12} />
          </button>
        </div>
      </div>
      {person ? (
        <button
          className={ui('detail-access-button')}
          onClick={() =>
            person.email ? showContact(person) : openRequest(person.name, ['Work email'])
          }
        >
          <Mail size={14} />
          {person.email ? 'View contact details' : 'Request contact details'}
        </button>
      ) : (
        <div>
          <span className={ui('detail-contact-symbol')}>
            <Globe size={16} />
          </span>
          <div>
            <small>Website</small>
            <a href={`https://${company.domain}`} target="_blank" rel="noopener noreferrer">
              {company.domain}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
