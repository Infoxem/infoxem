import assert from 'node:assert/strict';
import { test } from 'node:test';
import { companyFromRow } from '../src/lib/company-data';
import { companyLocation, importedCounty, importedLocation } from '../src/lib/company-location';

test('collected address is displayed while imported location and county remain separate', () => {
  const company = companyFromRow(
    {
      id: 'c',
      name: 'Centella',
      country: 'Kenya',
      county: null,
      business_type: 'RETAIL',
      collection_status: 'completed',
    },
    [
      {
        id: 'a',
        companyId: 'c',
        field: 'address',
        value: 'KMA Centre, Nairobi',
        normalizedValue: 'kma centre, nairobi',
        sourceUrl: 'https://example.com',
        collectedAt: null,
        datePrecision: 'date',
        scope: '',
        collector: 'scrapy',
        reason: '',
      },
    ],
    { Street: 'MARA ROAD', County: '' },
  );
  assert.equal(companyLocation(company), 'KMA Centre, Nairobi');
  assert.equal(importedLocation(company), 'MARA ROAD, Kenya');
  assert.equal(importedCounty(company), 'Not Available');
  assert.equal(companyLocation({ ...company, findings: [] }), 'MARA ROAD, Kenya');
  assert.equal(companyLocation({ ...company, findings: [], sourceFields: {} }), 'Kenya');
  assert.equal(
    companyLocation({ ...company, findings: [], sourceFields: {}, country: '' }),
    'Not Available',
  );
  assert.equal(importedLocation({ ...company, city: 'Kiambu', sourceFields: {} }), 'Kiambu, Kenya');
});
