'use client';

import { ui } from '@/lib/ui';
import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  Check,
  ChevronRight,
  CircleCheck,
  MapPin,
  Mail,
  Phone,
  Sparkles,
  BriefcaseBusiness,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { Logo } from '@/components/records/record-display';
import { mockEnrichment as record } from './mock-enrichment';

export function EnrichmentResult() {
  const [tab, setTab] = useState('Overview');
  const company = record.company;
  const facts = [
    ['Business type', company.type],
    ['Company size', `${company.size} employees`],
    ['Headquarters', `${company.city}, ${company.country}`],
    ['Industry', record.industry],
    ['Primary market', company.country],
    ['Experience', record.experience],
  ];
  return (
    <section className={ui('enrich-result')} aria-label="Enrichment result">
      <div className={ui('enrich-result-heading')}>
        <div className={ui('enrich-company-identity')}>
          <Logo company={company} />
          <div>
            <div>
              <h2>{company.name}</h2>
              <span className={ui('enrich-status')}>
                <Check size={11} />
                Complete
              </span>
            </div>
            <p>
              <MapPin size={12} />
              {company.city}, {company.country}
              <span>·</span>
              <a href={`https://${company.domain}`} target="_blank" rel="noopener noreferrer">
                {company.domain}
                <ArrowUpRight size={11} />
              </a>
            </p>
          </div>
        </div>
        <span className={ui('enrich-sample-label')}>
          <Sparkles size={12} />
          Sample enrichment
        </span>
      </div>
      <nav className={ui('enrich-result-tabs')} aria-label="Enrichment sections">
        {['Overview', 'Contact information', 'Research notes'].map((label) => (
          <button
            key={label}
            className={ui(tab === label ? 'active' : '')}
            aria-pressed={tab === label}
            onClick={() => setTab(label)}
          >
            {label}
            {label === 'Contact information' && <span>{record.contacts.length}</span>}
          </button>
        ))}
      </nav>
      {tab === 'Overview' && (
        <div className={ui('enrich-result-layout')}>
          <div className={ui('enrich-result-main')}>
            <article className={ui('enrich-info-section')}>
              <h3>
                <FileText size={16} />
                Company overview
              </h3>
              <p>{company.description}</p>
              <div className={ui('enrich-key-facts')}>
                {facts.map(([label, value]) => (
                  <div key={label}>
                    <small>{label}</small>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
            </article>
            <article className={ui('enrich-info-section')}>
              <h3>
                <Sparkles size={16} />
                Industry & keywords
              </h3>
              <p className={ui('enrich-section-caption')}>
                Business areas and products associated with this company.
              </p>
              <div className={ui('enrich-tags')}>
                {record.keywords.map((keyword) => (
                  <span key={keyword}>{keyword}</span>
                ))}
              </div>
            </article>
            <article className={ui('enrich-info-section')}>
              <h3>
                <BriefcaseBusiness size={16} />
                Experience & capabilities
              </h3>
              <div className={ui('enrich-experience')}>
                <strong>
                  {record.experience}
                  <small>Industry experience · sample</small>
                </strong>
                <p>{record.experienceDescription}</p>
              </div>
              <div className={ui('enrich-capabilities')}>
                {record.capabilities.map((value) => (
                  <span key={value}>
                    <CircleCheck size={14} />
                    {value}
                  </span>
                ))}
              </div>
            </article>
          </div>
          <aside className={ui('enrich-result-rail')}>
            <div className={ui('enrich-rail-card')}>
              <h3>
                <MapPin size={15} />
                Company location
              </h3>
              <div className={ui('enrich-location-visual')} aria-hidden="true">
                <div />
                <span>
                  <MapPin size={25} />
                </span>
              </div>
              <strong>
                {company.city}, {company.country}
              </strong>
              <p>
                Headquarters · {company.flag} {company.country}
              </p>
              <div className={ui('enrich-rail-divider')} />
              <small>MARKETS SERVED</small>
              <div className={ui('enrich-tags')}>
                {record.markets.map((market) => (
                  <span key={market}>{market}</span>
                ))}
              </div>
            </div>
            <div className={ui('enrich-rail-card')}>
              <h3>
                <Mail size={15} />
                Contact information
              </h3>
              <label>Company email</label>
              <a href={`mailto:${record.email}`}>
                {record.email}
                <ArrowUpRight size={12} />
              </a>
              <label>Website</label>
              <a href={`https://${company.domain}`} target="_blank" rel="noopener noreferrer">
                {company.domain}
                <ArrowUpRight size={12} />
              </a>
              <label>Phone number</label>
              <p>Not available in sample</p>
              <button
                className={ui('enrich-text-button')}
                onClick={() => setTab('Contact information')}
              >
                View {record.contacts.length} company contacts
                <ChevronRight size={13} />
              </button>
            </div>
            <div className={ui('enrich-coverage')}>
              <ShieldCheck size={17} />
              <div>
                <strong>Demo record</strong>
                <p>All details are illustrative and have not been verified by AI.</p>
              </div>
            </div>
          </aside>
        </div>
      )}
      {tab === 'Contact information' && (
        <div className={ui('enrich-contacts')}>
          <div className={ui('enrich-contact-intro')}>
            <h3>People at {company.name}</h3>
            <p>Illustrative contacts for a complete view of the company.</p>
          </div>
          <div className={ui('table-scroll')}>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Job title</th>
                  <th>Email</th>
                  <th>Phone number</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {record.contacts.map((person) => (
                  <tr key={person.id}>
                    <td>
                      <Link className={ui('enrich-contact-name')} href={`/people/${person.id}`}>
                        <span className={ui(`person-avatar ${company.color}`)}>
                          {person.initials}
                        </span>
                        {person.name}
                      </Link>
                    </td>
                    <td>{person.role}</td>
                    <td>
                      {person.email ? (
                        <a
                          href={`mailto:${person.name.toLowerCase().split(' ')[0]}@${company.domain}`}
                        >
                          <Mail size={12} />
                          {person.name.toLowerCase().split(' ')[0]}@{company.domain}
                        </a>
                      ) : (
                        <span className={ui('enrich-muted')}>Not available</span>
                      )}
                    </td>
                    <td className={ui('enrich-muted')}>
                      <Phone size={12} />
                      Not available
                    </td>
                    <td>
                      <Link
                        href={`/people/${person.id}`}
                        aria-label={`Open ${person.name} profile`}
                      >
                        <ArrowUpRight size={15} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {tab === 'Research notes' && (
        <div className={ui('enrich-research-notes')}>
          <div className={ui('enrich-research-icon')}>
            <FileText size={24} />
          </div>
          <h3>About this enrichment record</h3>
          <p>
            This fixed sample demonstrates how company research will be organized. No websites have
            been researched and no AI analysis has been performed.
          </p>
          <dl>
            <div>
              <dt>Record ID</dt>
              <dd>{record.id}</dd>
            </div>
            <div>
              <dt>Source</dt>
              <dd>{record.source}</dd>
            </div>
            <div>
              <dt>Record type</dt>
              <dd>Fictional demonstration company</dd>
            </div>
            <div>
              <dt>Verification</dt>
              <dd>Unverified sample data</dd>
            </div>
          </dl>
        </div>
      )}
    </section>
  );
}
