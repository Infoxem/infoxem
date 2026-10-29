import type { Company, Person } from '@/types/records';
import records from './facilities.json';
const missing = 'Not Available';
export const companies: Company[] = records.map((r) => ({
  id: `${r['Business Type'].toLowerCase()}-${r['Facility ID']}`,
  name: r['Facility Name'],
  initials: r['Facility Name'].slice(0, 2),
  domain: '',
  country: 'Kenya',
  flag: '🇰🇪',
  city: r.County || missing,
  type: r['Business Type'],
  size: missing,
  products: [],
  match: 0,
  color: 'blue',
  description:
    'Imported facility record. Licence information reflects the supplied file, not a live verification.',
  contacts: r['HTML comment: Superintendent'] ? 1 : 0,
  sourceFields: r,
}));
export const people: Person[] = records.flatMap((r, i) => {
  const name = r['HTML comment: Superintendent'];
  return name
    ? [
        {
          id: `superintendent-${companies[i].id}`,
          name,
          role: `Superintendent · ${r['HTML comment: Cadre'] || missing}`,
          company: companies[i].id,
          initials: name
            .split(/\s+/)
            .map((p) => p[0])
            .slice(0, 2)
            .join(''),
          seniority: missing,
          email: false,
        },
      ]
    : [];
});
const companyMap = new Map(companies.map((c) => [c.id, c]));
const personMap = new Map(people.map((p) => [p.id, p]));
export const getCompanyById = (id: string) => companyMap.get(id);
export const getPersonById = (id: string) => personMap.get(id);
export function byId(id: string): Company {
  const company = getCompanyById(id);
  if (!company) throw new Error('Unknown company: ' + id);
  return company;
}
