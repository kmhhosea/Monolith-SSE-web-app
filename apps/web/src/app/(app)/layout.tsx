'use client';

import { useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { apiRequest, refreshSession } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { NotificationItem, User } from '@/types/api';

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const storedUser = useAuthStore((state) => state.user);
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        let token = accessToken;
        if (!token) {
          const refreshed = await refreshSession();
          if (!refreshed) {
            clearSession();
            router.replace('/login');
            return;
          }
          token = useAuthStore.getState().accessToken;
        }

        const [user, notificationList] = await Promise.all([
          apiRequest<User>('/auth/me'),
          apiRequest<NotificationItem[]>('/notifications')
        ]);
        if (!token) {
          clearSession();
          router.replace('/login');
          return;
        }

        setSession({ accessToken: token, user });
        setNotifications(notificationList);
      } catch {
        clearSession();
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    };

    void bootstrap();
  }, [accessToken, clearSession, router, setSession]);

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-mesh px-4">
        <div className="rounded-[2rem] border border-white/70 bg-white/92 px-8 py-6 text-center shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-campus/70">SSE Campus</p>
          <h1 className="mt-3 font-serif text-2xl text-ink">Restoring your session...</h1>
        </div>
      </div>
    );
  }

  return (
    <AppShell user={storedUser} notifications={notifications}>
      {children}
    </AppShell>
  );
}
