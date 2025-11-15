'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { SessionProvider } from 'next-auth/react';
import { useUserStore } from '@/store/userSessionStore';

function SessionSyncProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const { setUser, logout } = useUserStore();

  useEffect(() => {
    if (status === 'loading') return;

    if (session?.user) {
      setUser({
        id: session.user.id || '',
        email: session.user.email || '',
        firstName: (session.user as any).firstName || '',
        lastName: (session.user as any).lastName || '',
      });
    } else {
      logout();
    }
  }, [session, status, setUser, logout]);

  return children;
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SessionSyncProvider>{children}</SessionSyncProvider>
    </SessionProvider>
  );
}
