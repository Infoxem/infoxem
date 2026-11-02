'use client';
import { createContext, useContext, type ReactNode } from 'react';
import { EMPTY_CATALOGUE, parseCatalogue } from '@/lib/company-data';
import { useLiveData } from '@/hooks/use-live-data';
import type { Company, Person } from '@/types/records';

type CompanyContext = {
  companies: Company[];
  people: Person[];
  byId: (id: string) => Company;
  loading: boolean;
  error: string;
};
const Context = createContext<CompanyContext | null>(null);
export function CompanyProvider({ children }: { children: ReactNode }) {
  const { data, loading, error } = useLiveData('/api/companies', parseCatalogue, EMPTY_CATALOGUE);
  const byId = (id: string) => {
    const company = data.companies.find((item) => item.id === id);
    if (!company) throw new Error('Company not found');
    return company;
  };
  return (
    <Context.Provider value={{ ...data, byId, loading, error }}>
      {error && (
        <div role="status" className="px-6 py-3 text-sm text-amber-800">
          {error}
        </div>
      )}
      {children}
    </Context.Provider>
  );
}
export function useCompanies() {
  const value = useContext(Context);
  if (!value) throw new Error('CompanyProvider is required');
  return value;
}
