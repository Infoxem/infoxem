export type ResearchJob = {
  id: string;
  name: string;
  website: string;
  startedAt: number;
  status: 'running' | 'cancelled' | 'complete';
};

export const RESULT_PATH = '/enrichment/records/ENR-0001';
export const RESEARCH_STAGES = [
  {
    title: 'Identify the company',
    description: 'Match the company name and website.',
    activity: 'Preparing company identity',
    at: 0,
  },
  {
    title: 'Explore company information',
    description: 'Review background, location, and market presence.',
    activity: 'Reviewing the sample company profile',
    at: 2000,
  },
  {
    title: 'Analyze business & products',
    description: 'Organize industry, products, and capabilities.',
    activity: 'Organizing sample business insights',
    at: 5000,
  },
  {
    title: 'Review contact information',
    description: 'Separate available details from missing information.',
    activity: 'Reviewing sample contact availability',
    at: 8500,
  },
  {
    title: 'Build your company record',
    description: 'Bring the findings together in a reusable report.',
    activity: 'Preparing the sample enrichment report',
    at: 11500,
  },
] as const;
export const DEMO_DURATION = 14500;

export function normalizeWebsite(value: string): string {
  const trimmed = value.trim();
  const url = new URL(/^[a-z][a-z\d+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`);
  if (
    !['https:', 'http:'].includes(url.protocol) ||
    !url.hostname.includes('.') ||
    url.username ||
    url.password ||
    /\s/.test(trimmed)
  )
    throw new Error('Enter a valid company website, such as company.com.');
  return url.href;
}

export function researchProgress(job: ResearchJob, now: number) {
  const elapsed = Math.max(0, now - job.startedAt);
  const finished =
    job.status === 'complete' || (job.status === 'running' && elapsed >= DEMO_DURATION);
  const stage = RESEARCH_STAGES.findLastIndex((item) => elapsed >= item.at);
  return {
    elapsed,
    stage: Math.max(0, stage),
    finished,
    completedSteps: finished ? RESEARCH_STAGES.length : Math.max(0, stage),
  };
}

export function parseResearchJob(raw: string | null): ResearchJob | null {
  if (!raw) return null;
  try {
    const job: unknown = JSON.parse(raw);
    if (!job || typeof job !== 'object') return null;
    const value = job as Record<string, unknown>;
    if (
      typeof value.id !== 'string' ||
      !/^[a-zA-Z0-9-]{1,64}$/.test(value.id) ||
      typeof value.name !== 'string' ||
      !value.name.trim() ||
      value.name.length > 160 ||
      typeof value.website !== 'string' ||
      typeof value.startedAt !== 'number' ||
      !Number.isFinite(value.startedAt) ||
      value.startedAt < 0 ||
      !['running', 'cancelled', 'complete'].includes(String(value.status))
    )
      return null;
    normalizeWebsite(value.website);
    return value as ResearchJob;
  } catch {
    return null;
  }
}
