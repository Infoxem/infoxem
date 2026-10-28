import { ui } from '@/lib/ui';
import Link from 'next/link';
export default function NotFound() {
  return (
    <main className={ui('not-found')}>
      <span className={ui('eyebrow')}>404 · RECORD NOT FOUND</span>
      <h1>Let’s find your next opportunity.</h1>
      <p>This profile isn’t in the demo directory.</p>
      <Link className={ui('button primary')} href="/buyers">
        Explore buyers
      </Link>
    </main>
  );
}
