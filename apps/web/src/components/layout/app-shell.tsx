'use client';

import { ReactNode } from 'react';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';
import { NotificationItem, User } from '@/types/api';

type AppShellProps = {
  children: ReactNode;
  user: User | null;
  notifications: NotificationItem[];
};

export function AppShell({ children, user, notifications }: AppShellProps) {
  return (
    <div className="min-h-screen bg-mesh px-4 py-4 text-ink md:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl gap-6">
        <Sidebar />
        <main className="flex-1 space-y-6">
          <Topbar user={user} notifications={notifications} />
          {children}
        </main>
      </div>
    </div>
  );
}
