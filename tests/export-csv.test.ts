import assert from 'node:assert/strict';
import { test } from 'node:test';
import { directoryCsv, encodeCsv } from '../src/lib/export-csv';
import { people } from '../src/lib/demo-data';

test('CSV handles commas, quotes, newlines, and spreadsheet formula-like cells', () => {
  assert.equal(
    encodeCsv([['a,b', 'say "hello"', 'a\nb', '=SUM(A1:A2)', ' @IMPORTDATA("url")']]),
    '\uFEFF"a,b","say ""hello""","a\nb","\'=SUM(A1:A2)","\' @IMPORTDATA(""url"")"',
  );
});
test('people exports resolve employer names and markets', () => {
  const csv = directoryCsv([people[0]], true);
  assert.ok(csv.includes('"Amina Otieno","Head of Procurement","Meridian Healthcare","Kenya"'));
  assert.equal(csv.split('\r\n').length, 2);
});
