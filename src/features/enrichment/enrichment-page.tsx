'use client';

import { ui } from '@/lib/ui';
import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  Check,
  ChevronRight,
  Database,
  FileSearch,
  Globe,
  Info,
  LoaderCircle,
  Search,
  Sparkles,
} from 'lucide-react';
import { Logo } from '@/components/records/record-display';
import { useWorkspace } from '@/providers/workspace-provider';
import { mockEnrichment as record } from './mock-enrichment';
import { normalizeWebsite, RESULT_PATH } from './research-workflow';
import { saveResearchJob, useResearchJob } from './research-store';

export function EnrichmentPage() {
  const router = useRouter();
  const { notify } = useWorkspace();
  const job = useResearchJob();
  const [name, setName] = useState('');
  const [website, setWebsite] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Enter a company name.');
      return;
    }
    let url: string;
    try {
      url = normalizeWebsite(website);
    } catch {
      setError('Enter a valid company website, such as company.com.');
      return;
    }
    setBusy(true);
    const nextJob = {
      id: crypto.randomUUID(),
      name: name.trim(),
      website: url,
      startedAt: Date.now(),
      status: 'running' as const,
    };
    if (!saveResearchJob(nextJob))
      notify('Browser storage is unavailable. Keep this tab open to finish the preview.');
    router.push(`/enrichment/research/${nextJob.id}`);
  }
  return (
    <div className={ui('enrichment-page')}>
      <div className={ui('enrich-page-heading')}>
        <div>
          <div className={ui('enrich-eyebrow')}>
            <Sparkles size={13} />
            COMPANY INTELLIGENCE
          </div>
          <h1>Data enrichment</h1>
          <p>Start with a company. Discover the details that matter.</p>
        </div>
        <span className={ui('enrich-demo-badge')}>
          <span />
          Workflow preview
        </span>
      </div>
      <section className={ui('enrich-search-card')} aria-labelledby="company-research-heading">
        <div className={ui('enrich-search-intro')}>
          <span className={ui('enrich-feature-icon')}>
            <Sparkles size={22} />
          </span>
          <div>
            <h2 id="company-research-heading">Get a complete picture of any company</h2>
            <p>Company background, market presence, and contact information — in one record.</p>
          </div>
        </div>
        <form
          className={ui('enrich-search-form')}
          onSubmit={search}
          aria-label="Research a company"
          aria-busy={busy}
        >
          <label>
            <span>
              Company name <small>*</small>
            </span>
            <div>
              <Building2 size={16} />
              <input
                name="company"
                autoComplete="organization"
                placeholder="e.g. Meridian Healthcare"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                disabled={busy}
                maxLength={160}
              />
            </div>
          </label>
          <label>
            <span>
              Company URL <small>*</small>
            </span>
            <div>
              <Globe size={16} />
              <input
                name="website"
                inputMode="url"
                autoComplete="url"
                placeholder="e.g. meridian.example"
                value={website}
                onChange={(event) => setWebsite(event.target.value)}
                required
                disabled={busy}
                maxLength={2000}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? 'enrich-search-error' : undefined}
              />
            </div>
          </label>
          <button className={ui('button primary')} type="submit" disabled={busy}>
            {busy ? <LoaderCircle className={ui('enrich-spin')} size={16} /> : <Search size={16} />}
            Search
          </button>
        </form>
        {error && (
          <p className={ui('enrich-search-error')} id="enrich-search-error" role="alert">
            {error}
          </p>
        )}
        <div className={ui('enrich-search-hint')}>
          <span>
            <Info size={13} />
            Interactive preview · Searches return the Meridian sample record. No live AI research.
          </span>
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              setName(record.company.name);
              setWebsite(record.company.domain);
              setError('');
            }}
          >
            Use sample company
            <ArrowRight size={13} />
          </button>
        </div>
      </section>
      {job?.status === 'running' && (
        <div className={ui('research-resume-banner')}>
          <span>
            <LoaderCircle size={15} />
            <strong>Research preview in progress</strong>
            <span>{job.name}</span>
          </span>
          <Link href={`/enrichment/research/${job.id}`}>
            Return to research
            <ArrowRight size={13} />
          </Link>
        </div>
      )}
      <div className={ui('enrich-process-strip')}>
        {[
          { icon: Globe, title: 'Discover', text: 'Company background & presence' },
          { icon: Sparkles, title: 'Analyze', text: 'Products, markets & contacts' },
          { icon: Database, title: 'Enrich', text: 'A detailed, reusable record' },
        ].map(({ icon: Icon, title, text }, index) => (
          <div key={title}>
            <span className={ui('enrich-process-icon')}>
              <Icon size={18} />
            </span>
            <div>
              <strong>{title}</strong>
              <small>{text}</small>
            </div>
            {index < 2 && <ChevronRight size={14} />}
          </div>
        ))}
      </div>
      <section className={ui('enrich-records')} aria-labelledby="enrichment-records-heading">
        <header>
          <div>
            <h2 id="enrichment-records-heading">
              Enrichment records <span>1</span>
            </h2>
            <p>Your company research, organized and ready to explore.</p>
          </div>
          <span className={ui('enrich-record-count')}>
            <Database size={13} />1 mock record
          </span>
        </header>
        <div className={ui('table-scroll')}>
          <table>
            <thead>
              <tr>
                <th>Company</th>
                <th>Website</th>
                <th>Location</th>
                <th>Status</th>
                <th>Record</th>
                <th />
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div className={ui('enrich-record-company')}>
                    <Logo company={record.company} />
                    <div>
                      <strong>{record.company.name}</strong>
                      <small>{record.industry}</small>
                    </div>
                  </div>
                </td>
                <td>
                  <a
                    href={`https://${record.company.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Sample company website"
                  >
                    <Globe size={13} />
                    {record.company.domain}
                    <ArrowUpRight size={11} />
                  </a>
                </td>
                <td>
                  {record.company.city}, {record.company.country}
                </td>
                <td>
                  <span className={ui('enrich-status')}>
                    <Check size={11} />
                    Complete
                  </span>
                </td>
                <td>
                  <span className={ui('enrich-record-id')}>{record.id}</span>
                </td>
                <td>
                  <Link className={ui('enrich-view-record')} href={RESULT_PATH}>
                    View record
                    <ArrowUpRight size={13} />
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <footer>
          <FileSearch size={13} />
          One illustrative record is included to demonstrate the complete workflow.
        </footer>
      </section>
    </div>
  );
}
