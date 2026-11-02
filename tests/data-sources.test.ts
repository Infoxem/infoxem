import assert from 'node:assert/strict';
import { test } from 'node:test';
import { companyDataSources } from '../src/lib/data-sources';
import { companies } from '../src/lib/demo-data';
import type { Finding } from '../src/types/records';

test('sources are grouped by category and repeated contact URLs are shown once', () => {
  const finding: Finding = {
    id: 'one',
    companyId: companies[0].id,
    field: 'phone',
    value: '0720123456',
    normalizedValue: '+254720123456',
    sourceUrl: 'https://example.com/contact',
    collectedAt: null,
    datePrecision: 'date',
    scope: '',
    collector: 'scrapy',
    reason: '',
  };
  const sourceGroups = companyDataSources({
    ...companies[0],
    findings: [
      finding,
      { ...finding, id: 'two', field: 'email' },
      { ...finding, id: 'three', field: 'website', sourceUrl: 'https://example.com/about' },
      { ...finding, id: 'four', field: 'address', sourceUrl: 'https://example.com/locations' },
      { ...finding, id: 'unsafe', sourceUrl: 'javascript:alert(1)' },
      {
        ...finding,
        id: 'publisher',
        sourceUrl: 'https://example.com/contact',
        publisherUrl: 'https://publisher.example/business',
      },
    ],
  });
  assert.deepEqual(sourceGroups, [
    { category: 'Website', urls: ['https://example.com/about'] },
    {
      category: 'Contact',
      urls: ['https://example.com/contact', 'https://publisher.example/business'],
    },
    { category: 'Location', urls: ['https://example.com/locations'] },
  ]);
  assert.deepEqual(companyDataSources(companies[0]), []);
});
