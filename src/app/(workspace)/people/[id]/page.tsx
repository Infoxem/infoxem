import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Person not found' };
// No independently sourced People contacts exist in the imported dataset.
export default function PersonPage() {
  notFound();
}
