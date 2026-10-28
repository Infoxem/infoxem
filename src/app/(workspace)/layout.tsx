import type { ReactNode } from 'react';
import { WorkspaceProvider } from '@/providers/workspace-provider';
import { AppShell } from '@/components/layout/app-shell';
import { WorkspaceDialogs } from '@/components/dialogs/workspace-dialogs';
import { Toast } from '@/components/ui/toast';
export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <WorkspaceProvider>
      <AppShell>{children}</AppShell>
      <WorkspaceDialogs />
      <Toast />
    </WorkspaceProvider>
  );
}
