import { ui } from '@/lib/ui';
import type { Company, Person } from '@/types/records';
import { FindingList } from './finding-list';
export function ContactInformation({
  company,
  person,
}: {
  company: Company;
  person: Person | null;
}) {
  return (
    <div className={ui('detail-contact-list')}>
      <div>
        <small>{person ? 'Work email' : 'Company email'}</small>
        {person ? <span>Not Available</span> : <FindingList company={company} fields={['email']} />}
      </div>
      <div>
        <small>Phone / mobile numbers</small>
        {person ? <span>Not Available</span> : <FindingList company={company} fields={['phone']} />}
      </div>
      <div>
        <small>Website</small>
        <FindingList company={company} fields={['website']} />
      </div>
      <button disabled className={ui('detail-access-button')}>
        Request Data (not available yet)
      </button>
    </div>
  );
}
