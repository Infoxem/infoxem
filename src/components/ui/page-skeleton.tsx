import { ui } from '@/lib/ui';
export function PageSkeleton() {
  return (
    <div className={ui('space-y-6 p-6 md:p-9')} role="status" aria-label="Loading workspace">
      <span className={ui('sr-only')}>Loading workspace…</span>
      <div className={ui('h-4 w-36 rounded bg-slate-200 motion-safe:animate-pulse')} />
      <div className={ui('h-8 w-2/3 rounded bg-slate-200 motion-safe:animate-pulse')} />
      <div className={ui('grid gap-4 md:grid-cols-3')}>
        {[0, 1, 2].map((key) => (
          <div
            key={key}
            className={ui(
              'h-28 rounded-lg border border-slate-200 bg-white motion-safe:animate-pulse',
            )}
          />
        ))}
      </div>
      <div className={ui('h-80 rounded-lg border border-slate-200 bg-white')} />
    </div>
  );
}
