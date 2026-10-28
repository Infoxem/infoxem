import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ResearchReport } from '@/features/enrichment/research-report';
import { mockEnrichment } from '@/features/enrichment/mock-enrichment';
export const metadata: Metadata = { title: 'Company research report' };
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (id !== mockEnrichment.id) notFound();
  return <ResearchReport />;
}
