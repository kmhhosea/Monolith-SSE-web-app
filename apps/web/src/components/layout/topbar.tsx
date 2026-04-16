'use client';

import { Bell, LogOut, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { InstallPrompt } from '@/components/pwa/install-prompt';
import { NotificationItem, User } from '@/types/api';

type TopbarProps = {
  user: User | null;
  notifications: NotificationItem[];
};

export function Topbar({ user, notifications }: TopbarProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-4 rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-soft">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-medium text-campus">Your academic command center</p>
          <h1 className="mt-1 font-serif text-3xl text-ink">
            {user ? `Welcome back, ${user.fullName.split(' ')[0]}` : 'Welcome to SSE'}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <InstallPrompt />
          <button className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-mist text-ink">
            <Bell size={18} />
          </button>
          <button
            type="button"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-ink/10 px-4 text-sm font-semibold text-ink"
            onClick={async () => {
              await authApi.logout();
              router.push('/login');
            }}
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-3 rounded-2xl bg-mist/90 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="inline-flex items-center gap-3 rounded-full bg-white px-4 py-3 text-sm text-ink/60">
          <Search size={16} />
          Search peers, projects, and resources
        </div>
        <div className="text-sm text-ink/70">
          {notifications.length ? `${notifications.length} useful notifications waiting` : 'You are all caught up.'}
        </div>
      </div>
    </div>
  );
}
