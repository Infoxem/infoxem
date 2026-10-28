import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCompanyById } from '@/lib/demo-data';
import { RecordProfile } from '@/features/profiles/record-profile';
type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ tab?: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: getCompanyById(id)?.name ?? 'Buyer not found' };
}
export default async function BuyerPage({ params, searchParams }: Props) {
  const { id } = await params;
  const company = getCompanyById(id);
  if (!company) notFound();
  const { tab } = await searchParams;
  return (
    <RecordProfile
      key={id}
      company={company}
      initialTab={tab === 'people' ? 'People' : 'Overview'}
    />
  );
}
