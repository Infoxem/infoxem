'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import { updateWorkspace, useWorkspaceStore } from '@/hooks/use-workspace-store';
import type { DataRequest, DialogKind, Person, RecordList } from '@/types/records';

type WorkspaceContextValue = {
  saved: string[];
  lists: RecordList[];
  storedNotes: Record<string, string>;
  requestCount: number;
  modal: DialogKind;
  setModal: Dispatch<SetStateAction<DialogKind>>;
  toast: string;
  notify: (message: string) => void;
  listRecordIds: string[];
  contactPerson: Person | null;
  requestTarget: string;
  initialRequestFields: string[];
  toggleSave: (id: string) => void;
  openList: (ids: string[]) => void;
  openRequest: (target: string, fields?: string[]) => void;
  showContact: (person: Person) => void;
  setLists: (update: SetStateAction<RecordList[]>) => void;
  saveNotes: (id: string, note: string) => void;
  addRequest: (request: Omit<DataRequest, 'status'> & { status: string }) => void;
};
const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const state = useWorkspaceStore();
  const [modal, setModal] = useState<DialogKind>(null);
  const [toast, notify] = useState('');
  const [listRecordIds, setListRecordIds] = useState<string[]>([]);
  const [contactPerson, setContactPerson] = useState<Person | null>(null);
  const requestTarget = 'Selected records';
  const initialRequestFields = ['Work email'];

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => notify(''), 4500);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setModal(null);
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        setModal('search');
      }
    };
    document.addEventListener('keydown', shortcut);
    return () => document.removeEventListener('keydown', shortcut);
  }, []);

  const persist = (update: Parameters<typeof updateWorkspace>[0]) => {
    if (!updateWorkspace(update))
      notify('Browser storage is unavailable. Changes last for this session.');
  };
  const value: WorkspaceContextValue = {
    saved: state.saved,
    lists: state.lists,
    storedNotes: state.notes,
    requestCount: state.requests.length,
    modal,
    setModal,
    toast,
    notify,
    listRecordIds,
    contactPerson,
    requestTarget,
    initialRequestFields,
    toggleSave: (id) =>
      persist((current) => ({
        ...current,
        saved: current.saved.includes(id)
          ? current.saved.filter((item) => item !== id)
          : [...current.saved, id],
      })),
    openList: (ids) => {
      setListRecordIds(ids);
      setModal('list');
    },
    openRequest: () => {
      notify('Request Data is not available yet.');
    },
    showContact: (person) => {
      setContactPerson(person);
      setModal('contact');
    },
    setLists: (update) =>
      persist((current) => ({
        ...current,
        lists: typeof update === 'function' ? update(current.lists) : update,
      })),
    saveNotes: (id, note) =>
      persist((current) => ({ ...current, notes: { ...current.notes, [id]: note } })),
    addRequest: () => {
      notify('Request Data is not available yet.');
    },
  };
  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error('Workspace components must be inside WorkspaceProvider.');
  return context;
}
