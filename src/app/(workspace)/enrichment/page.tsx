import type { Metadata } from 'next';
import { EnrichmentPage } from '@/features/enrichment/enrichment-page';

export const metadata: Metadata = { title: 'Data enrichment' };

export default function Page() {
  return <EnrichmentPage />;
}
