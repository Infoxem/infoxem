'use client';
import { useEffect, useState } from 'react';

export function useLiveData<T>(url: string, parse: (value: unknown) => T, initial: T) {
  const [state, setState] = useState({ data: initial, loading: true, error: '' });
  useEffect(() => {
    let active = true;
    let running = false;
    let version = '';
    const controller = new AbortController();
    async function refresh() {
      if (document.visibilityState === 'hidden' || running) return;
      running = true;
      try {
        const response = await fetch(url, {
          cache: 'no-store',
          signal: AbortSignal.any([controller.signal, AbortSignal.timeout(30_000)]),
          headers: version ? { 'If-None-Match': version } : {},
        });
        if (response.status === 304) {
          if (active) setState((previous) => ({ ...previous, loading: false, error: '' }));
          return;
        }
        if (!response.ok) throw new Error('Unable to refresh company data. Please try again.');
        const value: unknown = await response.json();
        const data = parse(value);
        version = response.headers.get('etag') ?? '';
        if (active) setState({ data, loading: false, error: '' });
      } catch {
        if (active)
          setState((previous) => ({
            ...previous,
            loading: false,
            error: 'Company data could not refresh. Please try again.',
          }));
      } finally {
        running = false;
      }
    }
    void refresh();
    const timer = window.setInterval(() => {
      void refresh();
    }, 60_000);
    const focused = () => {
      void refresh();
    };
    window.addEventListener('focus', focused);
    document.addEventListener('visibilitychange', focused);
    return () => {
      active = false;
      controller.abort();
      window.clearInterval(timer);
      window.removeEventListener('focus', focused);
      document.removeEventListener('visibilitychange', focused);
    };
  }, [url, parse]);
  return state;
}
