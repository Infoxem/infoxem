import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readPages } from '../src/lib/read-pages';
import {
  companyFromRow,
  findingValues,
  findingsFromRow,
  parseCatalogue,
  safeWebUrl,
  superintendentsFor,
} from '../src/lib/company-data';
import { companies } from '../src/lib/demo-data';
import type { Finding } from '../src/types/records';

test('address and legacy location merge without losing values or source evidence', () => {
  const base = {
    id: 'c',
    phone_mobile: [],
    email: [],
    website: [],
    address: ['Nairobi'],
    location: ['Nairobi', 'Main Street'],
  };
  const evidence = {
    id: 'source',
    company_id: 'c',
    field: 'location',
    value: 'Main Street',
    normalized_value: 'main street',
    source_url: 'https://example.com',
    collected_at: null,
    date_precision: 'date',
    collector: 'scrapy',
  };
  const merged = findingsFromRow({ ...base, evidence: [evidence] });
  assert.deepEqual(
    merged.map((item) => item.value),
    ['Nairobi', 'Main Street'],
  );
  assert.ok(merged.every((item) => item.field === 'address'));
  assert.equal(merged[1].sourceUrl, 'https://example.com');
  assert.equal(findingsFromRow({ ...base, location: undefined, evidence: [] }).length, 1);
});

test('one finding company row retains multiple sources and uses separate field columns', () => {
  const observation = {
    id: 'one',
    company_id: 'retail-1',
    field: 'phone',
    value: '0720 123456',
    normalized_value: '+254720123456',
    source_url: 'https://example.com/contact',
    collected_at: null,
    date_precision: 'date',
    scope: 'Branch unconfirmed',
    collector: 'scrapy',
    reason: '',
    excluded: false,
  };
  const row = {
    id: 'retail-1',
    phone_mobile: ['+254720123456'],
    email: ['hello@example.com'],
    website: [],
    location: [],
    address: [],
    evidence: [observation, { ...observation, id: 'two', source_url: 'https://example.com/about' }],
  };
  const values = findingsFromRow(row);
  assert.equal(values.filter((item) => item.field === 'phone').length, 2);
  assert.equal(values.find((item) => item.field === 'email')?.value, 'hello@example.com');
  assert.throws(() =>
    findingsFromRow({ ...row, evidence: [{ ...observation, company_id: 'other' }] }),
  );
  assert.throws(() => findingsFromRow({ ...row, evidence: [{ ...observation, excluded: true }] }));
});

test('database pagination retrieves more than 1,000 rows and the final partial page', async () => {
  const source = Array.from({ length: 8804 }, (_, index) => index);
  const result = await readPages(async (from, to) => source.slice(from, to + 1));
  assert.deepEqual(result, source);
});

test('links reject executable protocols and embedded credentials', () => {
  for (const url of [
    'javascript:alert(1)',
    'data:text/html,hello',
    'https://user:password@example.com',
    'not a url',
  ])
    assert.equal(safeWebUrl(url), null);
  assert.equal(safeWebUrl('https://example.com/contact'), 'https://example.com/contact');
});

test('all original superintendent entries remain separate from People', () => {
  assert.equal(companies.flatMap(superintendentsFor).length, 8790);
});

test('multiple sources are retained while contact formatting duplicates display once', () => {
  const first: Finding = {
    id: 'one',
    companyId: 'retail-1',
    field: 'phone',
    value: '0720 123456',
    normalizedValue: '+254720123456',
    sourceUrl: 'https://example.com/a',
    collectedAt: null,
    datePrecision: 'date',
    scope: 'Branch unconfirmed',
    collector: 'scrapy',
    reason: '',
  };
  const company = companyFromRow(
    {
      id: 'retail-1',
      name: 'Company',
      country: 'Kenya',
      county: null,
      business_type: 'RETAIL',
      collection_status: 'completed',
    },
    [
      first,
      { ...first, id: 'two', sourceUrl: 'https://example.com/b' },
      { ...first, id: 'three', value: '0730 123456', normalizedValue: '+254730123456' },
    ],
  );
  assert.equal(company.findings?.length, 3);
  assert.equal(findingValues(company, 'phone').length, 2);
  assert.equal(company.city, 'Not Available');
  assert.deepEqual(parseCatalogue({ companies: [company] }).companies, [company]);
  assert.throws(() => parseCatalogue({ companies: [{ id: 7 }] }));
});
