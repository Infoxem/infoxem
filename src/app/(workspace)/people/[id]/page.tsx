import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCompanyById, getPersonById } from '@/lib/demo-data';
import { RecordProfile } from '@/features/profiles/record-profile';
type Props = { params: Promise<{ id: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: getPersonById(id)?.name ?? 'Person not found' };
}
export default async function PersonPage({ params }: Props) {
  const { id } = await params;
  const person = getPersonById(id);
  if (!person) notFound();
  const company = getCompanyById(person.company);
  if (!company) notFound();
  return <RecordProfile key={id} company={company} person={person} />;
}
