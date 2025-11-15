"use client";

import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Button } from './ui/button';
import { motion } from 'framer-motion';
import { useUserStore } from '@/store/userSessionStore';

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="w-full border-b bg-white/60 dark:bg-slate-900/60 backdrop-blur sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-3"
        >
          <Link href="/landing">
            <div className="text-xl font-bold">Weather<span className="text-blue-500">.</span></div>
          </Link>
          <nav className="hidden md:flex items-center gap-3 text-sm text-gray-700 dark:text-gray-200">
            <Link href="/landing"><div className="hover:underline">Home</div></Link>
            <Link href="/docs"><div className="hover:underline">Docs</div></Link>
            <Link href="/about"><div className="hover:underline">About</div></Link>
            <Link href="/source"><div className="hover:underline">Source</div></Link>
          </nav>
        </motion.div>

        <div className="flex items-center gap-3">
          {session?.user ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <span className="text-sm mr-2 hidden sm:inline text-gray-700 dark:text-gray-200">{session.user.email}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  // clear local Zustand session first then sign out
                  try {
                    useUserStore.getState().logout();
                  } catch (e) {
                    // ignore
                  }
                  signOut({ callbackUrl: '/landing' });
                }}
              >
                Sign out
              </Button>
            </motion.div>
          ) : (
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={() => signIn()}>
                Sign in
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
