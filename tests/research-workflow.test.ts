import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  DEMO_DURATION,
  normalizeWebsite,
  parseResearchJob,
  researchProgress,
  type ResearchJob,
} from '../src/features/enrichment/research-workflow';

const job: ResearchJob = {
  id: 'test-job',
  name: 'Meridian Healthcare',
  website: 'https://meridian.example/',
  startedAt: 1000,
  status: 'running',
};

test('research input normalizes domains and rejects unsafe or invalid websites', () => {
  assert.equal(normalizeWebsite(' meridian.example '), 'https://meridian.example/');
  for (const value of [
    '',
    'javascript:alert(1)',
    'ftp://example.com',
    'https://user:pass@example.com',
    'not a domain',
    'localhost',
  ])
    assert.throws(() => normalizeWebsite(value));
});

test('research resumes from its start time and completes after all preview stages', () => {
  assert.equal(researchProgress(job, 1000).stage, 0);
  assert.equal(researchProgress(job, 7000).stage, 2);
  assert.equal(researchProgress(job, 7000).finished, false);
  assert.equal(researchProgress(job, 1000 + DEMO_DURATION).finished, true);
  assert.equal(researchProgress(job, 1000 + DEMO_DURATION).completedSteps, 5);
  assert.equal(researchProgress(job, 500).elapsed, 0);
});

test('cancelled research never auto-completes and retry starts fresh', () => {
  assert.equal(researchProgress({ ...job, status: 'cancelled' }, 50000).finished, false);
  assert.equal(researchProgress({ ...job, startedAt: 50000 }, 50000).completedSteps, 0);
});

test('saved research is validated before restoring browser state', () => {
  assert.deepEqual(parseResearchJob(JSON.stringify(job)), job);
  for (const value of [
    null,
    '{broken',
    JSON.stringify({ ...job, status: 'unknown' }),
    JSON.stringify({ ...job, startedAt: null }),
    JSON.stringify({ ...job, id: '../bad' }),
    JSON.stringify({ ...job, website: 'javascript:alert(1)' }),
  ])
    assert.equal(parseResearchJob(value), null);
});
