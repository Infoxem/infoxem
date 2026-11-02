import { readPages } from './read-pages';
import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { companyFromRow, findingsFromRow, stringFields } from './company-data';
import type { Company, Finding } from '@/types/records';
import type { Database } from '@/types/database';

function database() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error('Database connection is not configured');
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }) },
  });
}

export async function catalogueVersion(id?: string): Promise<string> {
  const db = database();
  let companies = db
    .from('imported_companies')
    .select('updated_at')
    .order('updated_at', { ascending: false })
    .limit(1);
  let findings = db
    .from('finding_companies')
    .select('updated_at')
    .order('updated_at', { ascending: false })
    .limit(1);
  if (id) {
    companies = companies.eq('id', id);
    findings = findings.eq('id', id);
  }
  const [a, b] = await Promise.all([companies, findings]);
  if (a.error || b.error) throw new Error('Unable to check company updates');
  return `"${a.data?.[0]?.updated_at ?? 'empty'}_${b.data?.[0]?.updated_at ?? 'empty'}"`;
}

export async function getCatalogue(): Promise<{ companies: Company[]; people: [] }> {
  const db = database();
  const [companies, findings] = await Promise.all([
    readPages(async (from, to) => {
      const { data, error } = await db
        .from('imported_companies')
        .select('id,name,country,county,business_type,collection_status')
        .order('source_order')
        .range(from, to);
      if (error) throw new Error('Unable to load companies');
      return data;
    }),
    readPages(async (from, to) => {
      const { data, error } = await db
        .from('finding_companies')
        .select('*')
        .order('id')
        .range(from, to);
      if (error) throw new Error('Unable to load findings');
      return data.flatMap(findingsFromRow);
    }),
  ]);
  const byCompany = new Map<string, Finding[]>();
  for (const item of findings)
    byCompany.set(item.companyId, [...(byCompany.get(item.companyId) ?? []), item]);
  return {
    companies: companies.map((row) => companyFromRow(row, byCompany.get(row.id) ?? [])),
    people: [],
  };
}

export async function getCompanyById(id: string): Promise<Company | null> {
  const db = database();
  const { data: company, error } = await db
    .from('imported_companies')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error('Unable to load company');
  if (!company) return null;
  const findings = await readPages(async (from, to) => {
    const { data, error: failure } = await db
      .from('finding_companies')
      .select('*')
      .eq('id', id)
      .order('id')
      .range(from, to);
    if (failure) throw new Error('Unable to load company findings');
    return data.flatMap(findingsFromRow);
  });
  return companyFromRow(company, findings, stringFields(company.original_fields));
}
