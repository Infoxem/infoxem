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
