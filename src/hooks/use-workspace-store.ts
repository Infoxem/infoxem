'use client';

import { useSyncExternalStore } from 'react';
import { EMPTY_WORKSPACE, loadWorkspace, STORAGE_KEY } from '@/lib/workspace-storage';
import type { WorkspaceState } from '@/types/records';

let snapshot = EMPTY_WORKSPACE;
let initialized = false;
const listeners = new Set<() => void>();
function initialize() {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;
  try {
    snapshot = loadWorkspace(window.localStorage);
  } catch {
    /* Keep a usable in-memory workspace when storage is restricted. */
  }
}
function getSnapshot() {
  initialize();
  return snapshot;
}
function getServerSnapshot() {
  return EMPTY_WORKSPACE;
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  const sync = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY && event.key !== null) return;
    try {
      snapshot = loadWorkspace(window.localStorage);
    } catch {
      return;
    }
    listeners.forEach((notify) => notify());
  };
  window.addEventListener('storage', sync);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', sync);
  };
}

/** Returns false when a mutation is session-only because persistence is unavailable. */
export function updateWorkspace(update: (state: WorkspaceState) => WorkspaceState): boolean {
  initialize();
  snapshot = update(snapshot);
  let persisted = true;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    persisted = false;
  }
  listeners.forEach((listener) => listener());
  return persisted;
}
export function useWorkspaceStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
