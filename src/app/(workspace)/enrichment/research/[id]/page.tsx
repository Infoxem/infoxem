import type { Metadata } from 'next';
import { ResearchScreen } from '@/features/enrichment/research-screen';
export const metadata: Metadata = { title: 'Researching company' };
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ResearchScreen id={id} />;
}
