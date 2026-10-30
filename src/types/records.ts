export type Company = {
  sourceFields?: Record<string, string>;
  id: string;
  name: string;
  initials: string;
  domain: string;
  country: string;
  flag: string;
  city: string;
  type: string;
  size: string;
  products: string[];
  match: number;
  color: string;
  description: string;
  contacts: number;
};

export type Person = {
  id: string;
  name: string;
  role: string;
  company: string;
  initials: string;
  seniority: string;
  email: boolean;
};

export type Superintendent = {
  id: string;
  name: string;
  company: string;
  cadre: string;
  registrationNumber: string;
  enrollmentNumber: string;
};

export type DirectorySearchState = {
  scope: string;
  query: string;
  appliedQuery: string;
  page: number;
  sort: string;
  selected: string[];
  filtersVisible: boolean;
  refinements: Record<
    | 'country'
    | 'type'
    | 'product'
    | 'seniority'
    | 'company'
    | 'title'
    | 'location'
    | 'size'
    | 'keywords',
    string
  >;
  appliedRefinements: DirectorySearchState['refinements'];
};

export type RecordList = { name: string; ids: string[] };
export type DataRequest = {
  id: string;
  target: string;
  fields: string[];
  note: string;
  status: 'Pending';
  createdAt: string;
};
export type WorkspaceState = {
  directories: Partial<Record<'buyers' | 'people', DirectorySearchState>>;
  saved: string[];
  lists: RecordList[];
  notes: Record<string, string>;
  requests: DataRequest[];
};

export type DialogKind =
  | 'list'
  | 'request'
  | 'contact'
  | 'search'
  | 'notifications'
  | 'help'
  | 'settings'
  | 'campaigns'
  | null;
