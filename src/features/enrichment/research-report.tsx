'use client';

import { ui } from '@/lib/ui';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowUpRight,
  CircleCheck,
  FileText,
  Globe,
  Info,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { EnrichmentResult } from './enrichment-result';
import { mockEnrichment as record } from './mock-enrichment';
import { useResearchJob } from './research-store';

export function ResearchReport() {
  const job = useResearchJob();
  return (
    <div className={ui('enrichment-page research-report-page')}>
      <Link className={ui('workflow-back-link')} href="/enrichment">
        <ArrowLeft size={14} />
        All enrichment records
      </Link>
      <header className={ui('research-report-header')}>
        <div>
          <span className={ui('workflow-eyebrow')}>
            <CircleCheck size={13} />
            ENRICHMENT COMPLETE
          </span>
          <h1>Your company research, in one place.</h1>
          <p>Review the business, understand its market, and find your next connection.</p>
        </div>
        <Link className={ui('button')} href="/enrichment">
          <RotateCcw size={14} />
          New research
        </Link>
      </header>
      <div className={ui('research-report-notice')}>
        <Info size={16} />
        <p>
          <strong>You’re viewing a sample research report.</strong> No live web search or AI
          analysis was performed.
          {job?.status === 'complete' && job.name !== record.company.name && (
            <>
              {' '}
              Your preview was requested for <strong>{job.name}</strong>; the information below
              belongs to the fixed Meridian sample.
            </>
          )}
        </p>
        <span className={ui('workflow-demo-pill')}>DEMO RECORD</span>
      </div>
      <div className={ui('research-report-stats')}>
        <div>
          <FileText size={17} />
          <span>
            Record ID<strong>{record.id}</strong>
          </span>
        </div>
        <div>
          <Globe size={17} />
          <span>
            Research source<strong>Mock dataset</strong>
          </span>
        </div>
        <div>
          <CircleCheck size={17} />
          <span>
            Preview status<strong>Complete</strong>
          </span>
        </div>
        <div>
          <ShieldCheck size={17} />
          <span>
            Verification<strong>Sample · unverified</strong>
          </span>
        </div>
      </div>
      <EnrichmentResult />
      <section className={ui('research-evidence')}>
        <header>
          <ShieldCheck size={17} />
          <h2>Research evidence & data gaps</h2>
          <span>Transparency first</span>
        </header>
        <div>
          <article>
            <h3>Source information</h3>
            <p>
              This preview uses the Infoxem mock dataset. Live research will show clickable
              supporting sources for company findings.
            </p>
            <span className={ui('research-source-sample')}>
              <FileText size={14} />
              {record.source}
              <small>Illustrative source</small>
            </span>
          </article>
          <article>
            <h3>Information still to verify</h3>
            <ul>
              <li>Company phone number is not available.</li>
              <li>Industry experience is illustrative, not verified.</li>
              <li>Product registrations and licenses have not been assessed.</li>
            </ul>
          </article>
        </div>
      </section>
      <footer className={ui('research-report-footer')}>
        <span>
          <ShieldCheck size={13} />
          One sample record · No database connection
        </span>
        <Link href={`/buyers/${record.company.id}`}>
          Open company profile
          <ArrowUpRight size={13} />
        </Link>
      </footer>
    </div>
  );
}
