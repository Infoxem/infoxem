import { companies, people } from '@/lib/demo-data';

/** A single fixed record for the enrichment design preview; no research has been performed. */
export const mockEnrichment = {
  id: 'ENR-0001',
  company: companies[0],
  status: 'Complete',
  industry: 'Pharmaceuticals',
  experience: '15+ years',
  experienceDescription:
    'Illustrative experience in pharmaceutical distribution, import coordination, and supply to hospitals and pharmacies.',
  markets: ['Kenya', 'East Africa'],
  capabilities: [
    'Pharmaceutical distribution',
    'Hospital & pharmacy supply',
    'International sourcing',
    'Partner onboarding',
  ],
  keywords: [
    'Pharmaceuticals',
    'Healthcare distribution',
    'Generics',
    'Antibiotics',
    'APIs',
    'Hospital supply',
    'Import & export',
  ],
  contacts: people.filter((person) => person.company === 'meridian'),
  email: 'hello@meridian.example',
  source: 'Infoxem mock dataset',
} as const;
