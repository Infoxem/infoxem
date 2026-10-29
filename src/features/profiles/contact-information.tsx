import { ui } from '@/lib/ui';
import type { Company, Person } from '@/types/records';
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
        <span>Not Available</span>
      </div>
      <div>
        <small>Phone number</small>
        <span>Not Available</span>
      </div>
      <div>
        <small>Website</small>
        <span>{company.domain || 'Not Available'}</span>
      </div>
      <button disabled className={ui('detail-access-button')}>
        Request Data (not available yet)
      </button>
    </div>
  );
}
