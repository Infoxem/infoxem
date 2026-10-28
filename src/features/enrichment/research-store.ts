'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { parseResearchJob, type ResearchJob } from './research-workflow';

const KEY = 'infoxem-research-preview-v1';
let snapshot: ResearchJob | null = null;
let lastRaw: string | null | undefined;
const listeners = new Set<() => void>();
function read() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw !== lastRaw) {
      lastRaw = raw;
      snapshot = parseResearchJob(raw);
    }
  } catch {
    /* Keep the current job available in memory if storage is blocked. */
  }
  return snapshot;
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (!event.key || event.key === KEY) listener();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}
export function saveResearchJob(job: ResearchJob): boolean {
  snapshot = job;
  let persisted = true;
  try {
    const raw = JSON.stringify(job);
    localStorage.setItem(KEY, raw);
    lastRaw = raw;
  } catch {
    persisted = false;
  }
  listeners.forEach((listener) => listener());
  return persisted;
}
export function useResearchJob() {
  return useSyncExternalStore(subscribe, read, () => null);
}
export function useResearchClock() {
  const [now, setNow] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(timer);
  }, []);
  return now;
}
