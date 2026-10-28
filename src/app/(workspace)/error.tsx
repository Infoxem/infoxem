'use client';
import { ui } from '@/lib/ui';
import Link from 'next/link';
export default function WorkspaceError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <div
      className={ui(
        'mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center gap-5 px-6 text-center',
      )}
    >
      <span className={ui('eyebrow')}>WORKSPACE INTERRUPTED</span>
      <h1 className={ui('text-2xl font-semibold text-slate-800')}>
        Let’s get you back to your next opportunity.
      </h1>
      <p className={ui('text-sm leading-7 text-slate-500')}>
        The workspace could not finish loading. Try again or return home.
      </p>
      <div className={ui('flex gap-3')}>
        <button className={ui('button primary')} onClick={retry}>
          Try again
        </button>
        <Link className={ui('button')} href="/">
          Back to home
        </Link>
      </div>
    </div>
  );
}
