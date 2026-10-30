import assert from 'node:assert/strict';
import { test } from 'node:test';
import { directoryCsv, encodeCsv } from '../src/lib/export-csv';
import { companies } from '../src/lib/demo-data';
import type { Person } from '../src/types/records';

test('CSV handles commas, quotes, newlines, and spreadsheet formula-like cells', () => {
  assert.equal(
    encodeCsv([['a,b', 'say "hello"', 'a\nb', '=SUM(A1:A2)', ' @IMPORTDATA("url")']]),
    '\uFEFF"a,b","say ""hello""","a\nb","\'=SUM(A1:A2)","\' @IMPORTDATA(""url"")"',
  );
});
test('people exports resolve employer names and markets', () => {
  const fixture: Person = {
    id: 'test-only',
    name: 'Test Contact',
    role: 'Test role',
    company: companies[0].id,
    initials: 'TC',
    seniority: 'Not Available',
    email: false,
  };
  const csv = directoryCsv([fixture], true);
  assert.ok(csv.includes('"Test Contact","Test role","CUREWAVE PHARMACY","Kenya"'));
  assert.equal(csv.split('\r\n').length, 2);
});
