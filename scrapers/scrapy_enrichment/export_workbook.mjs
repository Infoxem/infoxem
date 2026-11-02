import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
const require = createRequire(new URL('../openserp/export.mjs', import.meta.url));
const { Workbook, SpreadsheetFile } = await import(
  pathToFileURL(require.resolve('@oai/artifact-tool')).href
);
const out = new URL('../outputs/01a19071-infoxem-restart/', import.meta.url);
const data = JSON.parse(await fs.readFile(new URL('workbook-data.json', out), 'utf8'));
const wb = Workbook.create();
const overview = wb.worksheets.add('Overview');
const specs = [
  [
    'Companies',
    data.companies,
    [
      'No.',
      'Company',
      'Business type',
      'Restart status',
      'All phone numbers',
      'All emails',
      'All website URLs',
      'Imported location',
      'Published addresses',
      'Additional published locations',
      'Review notes',
      'Contact count',
      'Last collected (UTC)',
      'Record link',
    ],
    [7, 45, 16, 24, 29, 36, 42, 42, 48, 48, 46, 13, 23, 20],
    [12],
  ],
  [
    'Contacts',
    data.contacts,
    [
      'No.',
      'Company',
      'Contact type',
      'Published value',
      'Phone key',
      'Office or branch scope',
      'Review status',
      'Source URL',
      'Collected (UTC)',
      'Collection method',
      'Published formats',
      'Record link',
    ],
    [7, 43, 17, 42, 23, 48, 30, 70, 23, 24, 35, 20],
    [8],
  ],
  [
    'Locations',
    data.locations,
    [
      'No.',
      'Company',
      'Location type',
      'Published address or location',
      'Location label',
      'Imported street',
      'Imported county',
      'Source URL',
      'Collected (UTC)',
      'Collection method',
      'Record link',
    ],
    [7, 43, 23, 62, 52, 36, 23, 70, 23, 25, 20],
    [8],
  ],
  [
    'Searches',
    data.searches,
    [
      'No.',
      'Company',
      'Search query',
      'Engine',
      'Search status',
      'Result count',
      'Source URL',
      'Collected (UTC)',
      'Failure details',
      'Record link',
    ],
    [7, 43, 75, 16, 20, 14, 70, 23, 70, 20],
    [7],
  ],
  [
    'Failed lookups',
    data.failures,
    [
      'No.',
      'Company',
      'Stage',
      'Status',
      'Failure details',
      'Source URL',
      'Logged (UTC)',
      'Record link',
    ],
    [7, 43, 24, 20, 80, 70, 23, 20],
    [6],
  ],
  [
    'Excluded evidence',
    data.quarantine,
    [
      'No.',
      'Company',
      'Field',
      'Excluded value',
      'Reason excluded',
      'Source URL',
      'Collected (UTC)',
      'Record link',
    ],
    [7, 43, 17, 32, 80, 70, 23, 20],
    [6],
  ],
  [
    'Original records',
    data.originals,
    [
      'No.',
      'Facility ID',
      'Company',
      'Business type',
      'Original street',
      'Original county',
      'Licence status',
      'Original source',
      'Record link',
    ],
    [7, 17, 46, 18, 45, 24, 24, 60, 20],
    [],
  ],
];
const literal = (value) =>
  typeof value === 'string' && value.startsWith('=') ? "'" + value : value;
const dateValue = (value) => (value ? new Date(value) : null);
for (const [name, rows, headers, widths, dateCols] of specs) {
  const sheet = wb.worksheets.add(name);
  sheet.showGridLines = false;
  const formatted = rows.map((row) =>
    row.map((value, col) => (dateCols.includes(col) ? dateValue(value) : literal(value))),
  );
  sheet.getRangeByIndexes(4, 0, 1, headers.length).values = [headers];
  if (rows.length) sheet.getRangeByIndexes(5, 0, rows.length, headers.length).values = formatted;
  const body = sheet.getRangeByIndexes(4, 0, Math.max(1, rows.length + 1), headers.length);
  body.format.font = { name: 'Arial', size: 10, color: '#172333' };
  body.format.verticalAlignment = 'center';
  body.format.rowHeight = 26;
  sheet.getRange('A2').values = [[name === 'Companies' ? 'Infoxem company enrichment' : name]];
  sheet.getRange('A2').format.font = { name: 'Arial', size: 15, bold: true, color: '#172333' };
  sheet.getRange('A3').values = [
    [
      name === 'Companies'
        ? 'Contacts are candidates. Different published locations remain separate.'
        : 'Source links and collection dates are retained for review.',
    ],
  ];
  sheet.getRange('A3').format.font = { name: 'Arial', size: 10, color: '#516174' };
  for (let col = 0; col < headers.length; col++)
    sheet.getRangeByIndexes(0, col, rows.length + 5, 1).format.columnWidth = widths[col];
  for (const col of dateCols)
    if (rows.length) {
      sheet.getRangeByIndexes(5, col, rows.length, 1).setNumberFormat('yyyy-mm-dd hh:mm');
      for (let row = 0; row < rows.length; row++)
        if (String(rows[row][col]).length === 10)
          sheet.getRangeByIndexes(row + 5, col, 1, 1).setNumberFormat('yyyy-mm-dd');
    }
  if (rows.length) {
    const table = sheet.tables.add(body, true, name.replaceAll(' ', '') + 'Table');
    table.showFilterButton = true;
    sheet.getRangeByIndexes(5, 0, rows.length, headers.length).format.wrapText = true;
    if (name === 'Companies') {
      for (let i = 0; i < rows.length; i++)
        if (
          rows[i].slice(4, 11).some((v) => String(v).includes('\n')) ||
          rows[i][3] !== 'Not started in restart'
        )
          sheet.getRangeByIndexes(i + 5, 0, 1, headers.length).format.rowHeight = 78;
    } else if (name !== 'Original records')
      sheet.getRangeByIndexes(5, 0, rows.length, headers.length).format.rowHeight = 58;
  }
  const header = sheet.getRangeByIndexes(4, 0, 1, headers.length);
  header.format = {
    fill: '#223A55',
    font: { name: 'Arial', size: 10, bold: true, color: '#FFFFFF' },
    wrapText: true,
    horizontalAlignment: 'center',
    verticalAlignment: 'center',
    rowHeight: 34,
  };
  sheet.freezePanes.freezeRows(5);
  sheet.freezePanes.freezeColumns(2);
  if (name === 'Companies') {
    sheet.tabColor = '#223A55';
    sheet.getRangeByIndexes(5, 4, rows.length, 3).setNumberFormat('@');
    sheet
      .getRangeByIndexes(5, 3, rows.length, 1)
      .conditionalFormats.add('containsText', { text: 'Partial', format: { fill: '#FFF0CD' } });
  }
  if (name === 'Locations' && rows.length)
    sheet
      .getRangeByIndexes(5, 4, rows.length, 1)
      .conditionalFormats.add('containsText', { text: 'Additional', format: { fill: '#FFF0CD' } });
}
overview.showGridLines = false;
overview.tabColor = '#223A55';
overview.getRange('A1:H24').format.font = { name: 'Arial', size: 11, color: '#172333' };
overview.getRange('A2').values = [['Infoxem contact collection']];
overview.getRange('A2').format.font = { name: 'Arial', size: 16, bold: true };
overview.getRange('A4:B8').values = [
  ['Records in Infoxem', data.total],
  ['Restarted from record', 1],
  ['Records processed in restart', data.restart_completed],
  ['Pending in restart', data.total - data.restart_completed],
  ['Workbook updated (UTC)', new Date(data.updated_at_utc)],
];
overview.getRange('B8').setNumberFormat('yyyy-mm-dd hh:mm');
overview.getRange('B6').formulas = [
  [
    `=COUNTIF(Companies!D6:D${data.total + 5},"Completed")+COUNTIF(Companies!D6:D${data.total + 5},"Partial search")+COUNTIF(Companies!D6:D${data.total + 5},"Search failed")`,
  ],
];
overview.getRange('B7').formulas = [['=B4-B6']];
overview.getRange('A10:B17').values = [
  ['Sheet', 'What it contains'],
  [
    'Companies',
    'All collected phone numbers and emails together with imported and additional locations.',
  ],
  ['Contacts', 'Every contact value with its source, office/branch note and collection date.'],
  ['Locations', 'Published addresses and locations labelled separately from the imported address.'],
  ['Searches', 'Queries, source engines and successful or failed search responses.'],
  [
    'Failed lookups',
    'Unsuccessful searches and website requests. These are not proof that contacts do not exist.',
  ],
  [
    'Excluded evidence',
    'Unrelated or unsupported values kept outside the company contact summary.',
  ],
  ['Original records', 'Original company names, streets and counties, unchanged.'],
];
overview.getRange('A19:B22').values = [
  [
    'Reading the data',
    'All published numbers are retained. Several numbers can refer to different offices.',
  ],
  [
    'Additional locations',
    'Different address text is a review label, not proof of a wrong company.',
  ],
  [
    'Earlier findings',
    'Earlier sourced findings are preserved with their original collection dates.',
  ],
  ['Updates', 'This is a saved snapshot. Background batches create updated workbook snapshots.'],
];
overview.getRange('A1:A24').format.columnWidth = 31;
overview.getRange('B1:B24').format.columnWidth = 98;
overview.getRange('A4:B22').format.rowHeight = 28;
overview.getRange('B11:B22').format.wrapText = true;
overview.getRange('A11:B22').format.rowHeight = 40;
overview.getRange('A10:B10').format = {
  fill: '#223A55',
  font: { name: 'Arial', bold: true, color: '#FFFFFF' },
  rowHeight: 28,
};
wb.recalculate();
const inspection = await wb.inspect({
  kind: 'region',
  sheetId: 'Companies',
  range: 'A5:F10',
  maxChars: 2400,
  tableMaxRows: 6,
  tableMaxCols: 6,
});
await fs.writeFile(new URL('workbook-inspection.json', out), JSON.stringify(inspection));
if (process.env.INFOXEM_RENDER === '1') {
  for (const [sheetName, range, name] of [
    ['Overview', 'A1:B22', 'overview-preview.png'],
    ['Companies', 'A1:G11', 'companies-preview.png'],
    ['Locations', 'A1:F10', 'locations-preview.png'],
  ]) {
    const preview = await wb.render({ sheetName, range, scale: 1, format: 'png' });
    await fs.writeFile(new URL(name, out), new Uint8Array(await preview.arrayBuffer()));
  }
}
const file = await SpreadsheetFile.exportXlsx(wb);
const destination = new URL('Infoxem_Enrichment.xlsx', out);
let saved = destination;
const temporary = new URL('Infoxem_Enrichment.pending.xlsx', out);
await file.save(temporary.pathname.replace(/^\/([A-Za-z]:)/, '$1'));
try {
  await fs.rename(temporary, destination);
} catch (error) {
  if (!['EPERM', 'EBUSY', 'EACCES'].includes(error.code)) throw error;
  saved = new URL('Infoxem_Enrichment-' + Date.now() + '.xlsx', out);
  await fs.rename(temporary, saved);
}
await fs.writeFile(
  new URL('latest-workbook.json', out),
  JSON.stringify(
    {
      path: saved.pathname,
      updated_at_utc: data.updated_at_utc,
      restart_processed: data.restart_completed,
    },
    null,
    2,
  ),
);
console.log(
  JSON.stringify({
    xlsx: saved.pathname,
    records: data.total,
    restart_processed: data.restart_completed,
    contacts: data.contacts.length,
    locations: data.locations.length,
  }),
);
