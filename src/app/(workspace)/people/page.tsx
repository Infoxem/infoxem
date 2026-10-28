import { Suspense } from 'react';
import type { Metadata } from 'next';
import { DirectoryView } from '@/features/directory/directory-view';
import { PageSkeleton } from '@/components/ui/page-skeleton';
export const metadata: Metadata = { title: 'People' };
export default function DirectoryPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <DirectoryView kind="people" />
    </Suspense>
  );
}
