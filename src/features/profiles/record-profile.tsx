'use client';

import { ui } from '@/lib/ui';
import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowUpRight,
  ChevronRight,
  Plus,
  Bookmark,
  Globe,
  MapPin,
  Check,
  ShieldCheck,
  Mail,
  Sparkles,
  Building2,
  Users,
  FileText,
} from 'lucide-react';
import { people, superintendents } from '@/lib/demo-data';
import type { Company, Person } from '@/types/records';
import { useWorkspace } from '@/providers/workspace-provider';
import { Logo } from '@/components/records/record-display';
import { DirectoryTable } from '@/features/directory/directory-table';
import { ProfileSidebar } from './profile-sidebar';
import { ProfileOverview } from './profile-overview';

export function RecordProfile({
  company,
  person = null,
  initialTab = 'Overview',
}: {
  company: Company;
  person?: Person | null;
  initialTab?: string;
}) {
  const id = person?.id ?? company.id;
  const { saved, storedNotes, saveNotes, toggleSave, openList, openRequest, notify } =
    useWorkspace();
  const [tab, setTab] = useState(initialTab);
  const [draft, setDraft] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const notes = draft ?? storedNotes[id] ?? '';
  const contacts = people.filter((contact) => contact.company === company.id);
  const companySuperintendents = superintendents.filter((record) => record.company === company.id);
  const tabs = person
    ? ['Overview', 'Company', 'Notes', 'All fields']
    : ['Overview', 'People', 'Locations', 'Notes', 'All fields'];
  const peopleTable = contacts.length ? (
    <DirectoryTable
      isPeople
      records={contacts}
      selected={selected}
      setSelected={setSelected}
      hasSearch
      reset={() => setTab('Overview')}
    />
  ) : (
    <p className="px-5 py-6 text-sm text-slate-500">People contact details are Not Available.</p>
  );
  const superintendentTable = (
    <section className={ui('detail-card detail-people-card')} aria-label="Superintendent section">
      <header>
        <Users size={17} />
        <h2>Superintendent</h2>
      </header>
      <div
        className="overflow-x-auto"
        role="region"
        aria-label="Superintendent records"
        tabIndex={0}
      >
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
            <tr>
              {['Name', 'Cadre', 'Registration number', 'Enrollment number'].map((label) => (
                <th key={label} scope="col" className="px-5 py-3 font-medium">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {companySuperintendents.map((record) => (
              <tr key={record.id} className="border-b border-slate-100">
                <td className="px-5 py-4 font-medium">{record.name}</td>
                <td className="px-5 py-4">{record.cadre}</td>
                <td className="px-5 py-4">{record.registrationNumber}</td>
                <td className="px-5 py-4">{record.enrollmentNumber}</td>
              </tr>
            ))}
            {!companySuperintendents.length && (
              <tr>
                <td colSpan={4} className="px-5 py-6 text-slate-500">
                  Not Available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
  const companyAbout = (
    <section className={ui('detail-card')}>
      <header>
        <Logo company={company} />
        <h2>{company.name}</h2>
        <Link
          className={ui('detail-text-button')}
          href={`/buyers/${company.id}`}
          title="View company profile"
        >
          <ArrowUpRight size={15} />
        </Link>
      </header>
      <div className={ui('detail-card-tabs')}>
        <span className={ui('active')}>About</span>
      </div>
      <div className={ui('detail-about')}>
        <p>{company.description}</p>
        <dl className={ui('detail-facts')}>
          <div>
            <dt>Industries</dt>
            <dd>
              <span className={ui('record-pill')}>Pharmaceuticals</span>
            </dd>
          </div>
          <div>
            <dt>Keywords</dt>
            <dd className={ui('detail-pills')}>
              {!company.products.length && <span>Not Available</span>}
              {company.products.map((value) => (
                <span key={value} className={ui('record-pill')}>
                  {value}
                </span>
              ))}
            </dd>
          </div>
          <div>
            <dt>Employees</dt>
            <dd>{company.size === 'Not Available' ? company.size : `${company.size} employees`}</dd>
          </div>
          <div>
            <dt>Location</dt>
            <dd>
              {company.city}, {company.country}
            </dd>
          </div>
          <div>
            <dt>Business type</dt>
            <dd>{company.type}</dd>
          </div>
          <div>
            <dt>Website</dt>
            <dd>
              {company.domain ? (
                <a href={`https://${company.domain}`} target="_blank" rel="noopener noreferrer">
                  {company.domain}
                </a>
              ) : (
                <span>Not Available</span>
              )}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
  return (
    <div className={ui('record-profile-page')}>
      <header className={ui('record-profile-header')}>
        <nav className={ui('detail-breadcrumb')} aria-label="Breadcrumb">
          <Link href={person ? '/people' : '/buyers'}>{person ? 'People' : 'Find buyers'}</Link>
          <ChevronRight size={12} />
          <span>{person?.name ?? company.name}</span>
        </nav>
        <div className={ui('record-profile-heading')}>
          <div className={ui('detail-identity')}>
            {person ? (
              <span className={ui(`person-avatar ${company.color}`)}>{person.initials}</span>
            ) : (
              <Logo company={company} />
            )}
            <div>
              <div className={ui('detail-title-row')}>
                <h1>{person?.name ?? company.name}</h1>
                {company.domain ? (
                  <a
                    href={`https://${company.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`Website · ${company.domain}`}
                    aria-label="Company website"
                  >
                    <Globe size={16} />
                  </a>
                ) : (
                  <span>Not Available</span>
                )}
              </div>
              <p>
                {person ? (
                  <>
                    {person.role} at <Link href={`/buyers/${company.id}`}>{company.name}</Link>
                  </>
                ) : (
                  <>Pharmaceuticals · {company.type}</>
                )}
                <span className={ui('detail-meta-divider')}>·</span>
                <span>
                  {company.city}, {company.country}
                </span>
              </p>
            </div>
          </div>
          <div className={ui('detail-header-actions')}>
            <button
              disabled
              className={ui('detail-square-button')}
              title="Request contact information"
              aria-label="Request contact information"
              onClick={() => openRequest(person?.name ?? company.name)}
            >
              <Mail size={17} />
            </button>
            <button className={ui('button')} onClick={() => openList([id])}>
              <Plus size={14} />
              Add to list
            </button>
            <button
              className={ui(`button ${saved.includes(id) ? '' : 'primary'}`)}
              onClick={() => toggleSave(id)}
            >
              {saved.includes(id) ? <Check size={14} /> : <Bookmark size={14} />}
              {saved.includes(id) ? 'Saved' : 'Save record'}
            </button>
          </div>
        </div>
      </header>
      <div className={ui('record-profile-layout')}>
        <ProfileSidebar company={company} person={person} />
        <div className={ui('record-profile-main')} aria-label="Profile content">
          <nav className={ui('detail-section-tabs')} aria-label="Profile sections">
            {tabs.map((label) => (
              <button
                key={label}
                aria-pressed={tab === label}
                className={ui(tab === label ? 'active' : '')}
                onClick={() => setTab(label)}
              >
                {label}
                {label === 'People' && <span>{contacts.length}</span>}
              </button>
            ))}
          </nav>
          {tab === 'Overview' && (
            <>
              <section className={ui('detail-card')}>
                <header>
                  <Sparkles size={17} />
                  <h2>Company insights</h2>
                  <span className={ui('detail-demo-label')}>Imported record</span>
                </header>
                <div className={ui('detail-card-tabs')}>
                  <span className={ui('active')}>Overview</span>
                </div>
                <ProfileOverview
                  company={company}
                  person={person}
                  onViewPeople={() => setTab('People')}
                />
              </section>
              {person ? (
                companyAbout
              ) : (
                <>
                  <section className={ui('detail-card detail-people-card')}>
                    <header>
                      <Users size={17} />
                      <h2>People at this company</h2>
                      <button className={ui('detail-text-button')} onClick={() => setTab('People')}>
                        View all <ArrowUpRight size={13} />
                      </button>
                    </header>
                    {peopleTable}
                  </section>
                  {superintendentTable}
                </>
              )}
            </>
          )}
          {tab === 'Company' && companyAbout}
          {tab === 'People' && (
            <>
              <section className={ui('detail-card detail-people-card')}>
                <header>
                  <Users size={17} />
                  <h2>People at {company.name}</h2>
                  <span className={ui('detail-demo-label')}>{contacts.length} contacts</span>
                </header>
                {peopleTable}
              </section>
              {superintendentTable}
            </>
          )}
          {tab === 'Locations' && (
            <section className={ui('detail-card')}>
              <header>
                <MapPin size={17} />
                <h2>Company locations</h2>
              </header>
              <div className={ui('detail-location-card')}>
                <span>
                  <MapPin size={25} />
                </span>
                <div>
                  <small>HEADQUARTERS</small>
                  <h3>
                    {company.city}, {company.country}
                  </h3>
                  <p>{company.name}</p>
                </div>
              </div>
              <dl className={ui('detail-facts detail-about')}>
                <div>
                  <dt>City</dt>
                  <dd>{company.city}</dd>
                </div>
                <div>
                  <dt>Country</dt>
                  <dd>
                    {company.flag} {company.country}
                  </dd>
                </div>
              </dl>
            </section>
          )}
          {tab === 'Notes' && (
            <section className={ui('detail-card')}>
              <header>
                <FileText size={17} />
                <h2>Notes</h2>
              </header>
              <form
                className={ui('detail-notes')}
                onSubmit={(event) => {
                  event.preventDefault();
                  saveNotes(id, notes);
                  notify('Note saved to this browser');
                }}
              >
                <label htmlFor="profile-note">Notes about {person?.name ?? company.name}</label>
                <textarea
                  id="profile-note"
                  value={notes}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Add partnership requirements or follow-up notes..."
                  rows={8}
                />
                <footer>
                  <small>Saved locally in this browser.</small>
                  <button className={ui('button primary')} type="submit">
                    <Check size={14} />
                    Save note
                  </button>
                </footer>
              </form>
            </section>
          )}
          {tab === 'All fields' && (
            <section className={ui('detail-card')}>
              <header>
                <Building2 size={17} />
                <h2>All fields</h2>
              </header>
              <dl className={ui('detail-facts detail-about')}>
                {Object.entries({
                  Name: person?.name ?? company.name,
                  ...(person ? { 'Job title': person.role, Seniority: person.seniority } : {}),
                  Company: company.name,
                  Industry: 'Pharmaceuticals',
                  'Business type': company.type,
                  Employees: company.size,
                  City: company.city,
                  Country: company.country,
                  Website: company.domain || 'Not Available',
                  Phone: 'Not Available',
                  Email: 'Not Available',
                  'Source URL': 'Not Available',
                  ...company.sourceFields,
                  Products: company.products.join(', ') || 'Not Available',
                }).map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value || 'Not Available'}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
          <p className={ui('detail-profile-disclaimer')}>
            <ShieldCheck size={12} />
            Imported source records. Licence status is not live-verified. No live enrichment is
            performed.
          </p>
        </div>
      </div>
    </div>
  );
}
