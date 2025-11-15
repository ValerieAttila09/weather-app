"use client";

import { useEffect, useState } from 'react';
import { useUIStore } from '@/store/uiStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUserStore } from '@/store/userStore';
import { signIn, signOut, useSession } from 'next-auth/react';


export default function SettingsPage() {
  const { unit, theme, forecastDays, refreshIntervalMinutes, animationsEnabled, setUnit, setTheme, setForecastDays, setRefreshInterval, setAnimationsEnabled } = useUIStore();
  const setUser = useUserStore((s) => s.setUser);
  const user = useUserStore((s) => s.user);
  const { data: session, status } = useSession();

  const [email, setEmail] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [localUnit, setLocalUnit] = useState(unit);
  const [localTheme, setLocalTheme] = useState(theme);
  const [localForecastDays, setLocalForecastDays] = useState(forecastDays);
  const [localRefresh, setLocalRefresh] = useState(refreshIntervalMinutes);
  const [localAnimations, setLocalAnimations] = useState(animationsEnabled);

  const apply = () => {
    setUnit(localUnit);
    setTheme(localTheme);
    setForecastDays(localForecastDays);
    setRefreshInterval(localRefresh);
    setAnimationsEnabled(localAnimations);
  };

  useEffect(() => {
    if (session?.user) {
      // mirror into userStore for legacy components
      setUser({ id: (session.user as any).id, email: session.user.email || '', firstName: '', lastName: '' });
    } else {
      setUser(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const handleLogin = async () => {
    if (!email) return;
    setLoginLoading(true);
    try {
      // use NextAuth credentials provider
      await signIn('credentials', { email, redirect: false });
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    setUser(null);
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Settings</h1>

        <Card className="p-6 mb-4">
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">Account</h3>
            {session?.user ? (
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{session.user.email}</div>
                </div>
                <div>
                  <Button size="sm" variant="outline" onClick={handleLogout}>Logout</Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2 items-center">
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="px-3 py-2 border rounded" />
                <Button onClick={handleLogin} disabled={loginLoading}>Login</Button>
              </div>
            )}
          </div>
          {/* Profile edit area */}
          {session?.user && (
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Profile</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-neutral-700 mb-1">First name</label>
                  <input value={(session.user as any).firstName || ''} onChange={() => { }} disabled className="px-3 py-2 border rounded w-full" />
                </div>
                <div>
                  <label className="block text-sm text-neutral-700 mb-1">Last name</label>
                  <input value={(session.user as any).lastName || ''} onChange={() => { }} disabled className="px-3 py-2 border rounded w-full" />
                </div>
              </div>
              <p className="text-sm text-neutral-500 mt-2">Use the Profile editor below to change your name and email on record.</p>
            </div>
          )}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Unit</label>
            <select value={localUnit} onChange={(e) => setLocalUnit(e.target.value as 'c' | 'f')} className="px-3 py-2 border rounded">
              <option value="c">°C</option>
              <option value="f">°F</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Theme</label>
            <select value={localTheme} onChange={(e) => setLocalTheme(e.target.value as any)} className="px-3 py-2 border rounded">
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Forecast days</label>
            <input type="number" min={1} max={14} value={localForecastDays} onChange={(e) => setLocalForecastDays(parseInt(e.target.value || '0', 10) || 1)} className="px-3 py-2 border rounded w-32" />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Refresh interval (minutes)</label>
            <input type="number" min={1} value={localRefresh} onChange={(e) => setLocalRefresh(parseInt(e.target.value || '0', 10) || 1)} className="px-3 py-2 border rounded w-32" />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Animations</label>
            <select value={localAnimations ? 'on' : 'off'} onChange={(e) => setLocalAnimations(e.target.value === 'on')} className="px-3 py-2 border rounded">
              <option value="on">On</option>
              <option value="off">Off</option>
            </select>
          </div>

          <div className="flex gap-2">
            <Button onClick={apply}>Apply</Button>
          </div>
        </Card>
        {/* Profile form that edits via API */}
        {session?.user && (
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Edit profile</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-neutral-700 mb-1">First name</label>
                <input id="pf-first" defaultValue={(session.user as any).firstName || ''} className="px-3 py-2 border rounded w-full" />
              </div>
              <div>
                <label className="block text-sm text-neutral-700 mb-1">Last name</label>
                <input id="pf-last" defaultValue={(session.user as any).lastName || ''} className="px-3 py-2 border rounded w-full" />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm text-neutral-700 mb-1">Email</label>
              <input id="pf-email" defaultValue={session.user.email || ''} className="px-3 py-2 border rounded w-full" />
            </div>
            <div className="mt-4 flex items-center gap-3">
              <Button onClick={async () => {
                const firstName = (document.getElementById('pf-first') as HTMLInputElement).value;
                const lastName = (document.getElementById('pf-last') as HTMLInputElement).value;
                const emailVal = (document.getElementById('pf-email') as HTMLInputElement).value;
                try {
                  const res = await fetch('/api/user/update', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ firstName, lastName, email: emailVal }),
                  });
                  const data = await res.json();
                  if (!res.ok) throw new Error(data.error || 'Failed');
                  alert('Profile updated');
                  location.reload();
                } catch (err: any) {
                  alert(err.message || 'Error');
                }
              }}>Save profile</Button>
            </div>
          </Card>
        )}
      </div>
    </main>
  );
}
