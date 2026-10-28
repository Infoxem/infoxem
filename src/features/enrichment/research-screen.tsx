'use client';

import { ui } from '@/lib/ui';
import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  ChevronRight,
  Clock3,
  FileText,
  Globe,
  LoaderCircle,
  Mail,
  Package,
  PauseCircle,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import { RESEARCH_STAGES, RESULT_PATH, researchProgress } from './research-workflow';
import { saveResearchJob, useResearchClock, useResearchJob } from './research-store';

export function ResearchScreen({ id }: { id: string }) {
  const router = useRouter();
  const job = useResearchJob();
  const now = useResearchClock();
  const progress = job ? researchProgress(job, now || job.startedAt) : null;
  useEffect(() => {
    if (job?.id !== id || !progress?.finished || job.status === 'cancelled') return;
    if (job.status !== 'complete') saveResearchJob({ ...job, status: 'complete' });
    router.replace(RESULT_PATH);
  }, [id, job, progress?.finished, router]);
  if (!now)
    return (
      <div className={ui('research-loading')} role="status">
        <LoaderCircle className={ui('enrich-spin')} size={24} />
        <p>Opening research workspace…</p>
      </div>
    );
  if (!job || job.id !== id || !progress)
    return (
      <div className={ui('research-empty')}>
        <FileText size={35} />
        <h1>Research session unavailable</h1>
        <p>This preview may belong to another browser or an older session.</p>
        <Link className={ui('button primary')} href="/enrichment">
          Start a new search
          <ArrowRight size={15} />
        </Link>
      </div>
    );
  if (job.status === 'cancelled')
    return (
      <div className={ui('research-empty')}>
        <PauseCircle size={42} />
        <span className={ui('workflow-demo-pill')}>WORKFLOW PREVIEW</span>
        <h1>Research cancelled</h1>
        <p>
          Your existing company record is unchanged. You can restart the preview whenever you’re
          ready.
        </p>
        <div>
          <button
            className={ui('button primary')}
            onClick={() => saveResearchJob({ ...job, startedAt: Date.now(), status: 'running' })}
          >
            <RotateCcw size={15} />
            Restart research
          </button>
          <Link className={ui('button')} href="/enrichment">
            Back to enrichment
          </Link>
        </div>
      </div>
    );
  const elapsed = Math.floor(progress.elapsed / 1000);
  const current = RESEARCH_STAGES[progress.stage];
  return (
    <div className={ui('research-page')}>
      <nav className={ui('workflow-breadcrumb')} aria-label="Breadcrumb">
        <Link href="/enrichment">Data enrichment</Link>
        <ChevronRight size={12} />
        <span>Company research</span>
      </nav>
      <header className={ui('research-page-heading')}>
        <div>
          <span className={ui('workflow-eyebrow')}>
            <Sparkles size={13} />
            INFOXEM AI
          </span>
          <h1>From company name to company intelligence.</h1>
          <p>We’re preparing a complete picture of your next potential partner.</p>
        </div>
        <button
          className={ui('button research-cancel')}
          onClick={() => saveResearchJob({ ...job, status: 'cancelled' })}
        >
          <X size={14} />
          Cancel research
        </button>
      </header>
      <div className={ui('research-company-strip')}>
        <span className={ui('research-company-avatar')}>
          <Building2 size={20} />
        </span>
        <div>
          <strong>{job.name}</strong>
          <span>
            <Globe size={11} />
            {new URL(job.website).hostname}
          </span>
        </div>
        <span className={ui('workflow-demo-pill')}>Demo research</span>
        <span className={ui('research-elapsed')}>
          <Clock3 size={13} />
          {String(Math.floor(elapsed / 60)).padStart(2, '0')}:
          {String(elapsed % 60).padStart(2, '0')} elapsed
        </span>
      </div>
      <div className={ui('research-workspace')}>
        <section className={ui('research-visual')} aria-label="Research visualization">
          <div className={ui('research-orbit-scene')} aria-hidden="true">
            <div className={ui('research-orbit orbit-one')} />
            <div className={ui('research-orbit orbit-two')} />
            <div className={ui('research-scan')} />
            <div className={ui('research-core')}>
              <Sparkles size={34} />
              <span>AI</span>
            </div>
            <div
              className={ui(`research-node node-website ${progress.stage >= 1 ? 'revealed' : ''}`)}
            >
              <Globe size={17} />
              <span>Company website</span>
              <Check size={11} />
            </div>
            <div
              className={ui(`research-node node-business ${progress.stage >= 2 ? 'revealed' : ''}`)}
            >
              <Package size={17} />
              <span>Products & markets</span>
              <Check size={11} />
            </div>
            <div
              className={ui(`research-node node-contacts ${progress.stage >= 3 ? 'revealed' : ''}`)}
            >
              <Mail size={17} />
              <span>Contact information</span>
              <Check size={11} />
            </div>
            <div
              className={ui(`research-node node-record ${progress.stage >= 4 ? 'revealed' : ''}`)}
            >
              <FileText size={17} />
              <span>Company record</span>
              <Check size={11} />
            </div>
          </div>
          <div className={ui('research-current-status')} role="status" aria-live="polite">
            <span className={ui('research-live-dot')} />
            <span>{current.activity}</span>
          </div>
          <h2>Every detail, connected.</h2>
          <p>
            Background, business focus, and the people behind the company — brought together in one
            place.
          </p>
          <div
            className={ui('research-step-meter')}
            aria-label={`${progress.completedSteps} of ${RESEARCH_STAGES.length} preview stages completed`}
          >
            {RESEARCH_STAGES.map((item, index) => (
              <span
                key={item.title}
                className={ui(
                  index < progress.completedSteps
                    ? 'done'
                    : index === progress.stage
                      ? 'current'
                      : '',
                )}
              />
            ))}
          </div>
          <small>
            Step {progress.stage + 1} of {RESEARCH_STAGES.length} · Workflow preview
          </small>
        </section>
        <section className={ui('research-stage-panel')} aria-labelledby="research-stage-title">
          <header>
            <h2 id="research-stage-title">Your research, taking shape</h2>
            <span>
              {progress.completedSteps}/{RESEARCH_STAGES.length} complete
            </span>
          </header>
          <ol>
            {RESEARCH_STAGES.map((stage, index) => (
              <li
                key={stage.title}
                className={ui(
                  index < progress.stage
                    ? 'complete'
                    : index === progress.stage
                      ? 'active'
                      : 'pending',
                )}
                aria-current={index === progress.stage ? 'step' : undefined}
              >
                <span className={ui('research-stage-marker')}>
                  {index < progress.stage ? (
                    <Check size={15} />
                  ) : index === progress.stage ? (
                    <LoaderCircle className={ui('enrich-spin')} size={16} />
                  ) : (
                    index + 1
                  )}
                </span>
                <div>
                  <h3>{stage.title}</h3>
                  <p>{stage.description}</p>
                  {index === progress.stage && <small>In progress</small>}
                </div>
              </li>
            ))}
          </ol>
          <footer>
            <ShieldCheck size={15} />
            <p>
              Demo mode uses sample information. No live websites or AI services are being accessed.
            </p>
          </footer>
        </section>
      </div>
      <section className={ui('research-activity')}>
        <header>
          <span className={ui('research-live-dot')} />
          <h2>Research activity</h2>
          <span>Preview activity</span>
        </header>
        <div aria-live="off">
          {RESEARCH_STAGES.slice(0, progress.stage + 1).map((stage, index) => (
            <p key={stage.title}>
              <time>00:{String(Math.floor(stage.at / 1000)).padStart(2, '0')}</time>
              {index < progress.stage ? (
                <Check size={12} />
              ) : (
                <LoaderCircle className={ui('enrich-spin')} size={12} />
              )}
              <span>{stage.activity}</span>
              {index === progress.stage && <span className={ui('research-log-active')}>Now</span>}
            </p>
          ))}
        </div>
      </section>
      <footer className={ui('research-page-footer')}>
        <Link href="/enrichment">
          <ArrowLeft size={13} />
          Back to enrichment
        </Link>
        <span>
          <ShieldCheck size={13} />
          Progress stays in this browser. Refreshing resumes the preview.
        </span>
      </footer>
    </div>
  );
}
