'use client';

import { ui } from '@/lib/ui';
export function HelpDialog() {
  return (
    <>
      <h2 id="modal-title">A little guidance. A lot of possibility.</h2>
      <p>Your quick guide to the Infoxem workspace.</p>
      <div className={ui('help-items')}>
        {[
          [
            'Discover buyers',
            'Enter a product, company, or country and select Search to display matching buyers.',
          ],
          [
            'Meet decision-makers',
            'Explore People and open a profile to review professional details.',
          ],
          [
            'Build your pipeline',
            'Bookmark records, organize lists, and export your selection as CSV.',
          ],
          ['Fill the gaps', 'Create a local demo data request from a company or person profile.'],
        ].map(([title, text], i) => (
          <div key={title}>
            <span className={ui('step-number')}>{i + 1}</span>
            <div>
              <strong>{title}</strong>
              <p>{text}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
