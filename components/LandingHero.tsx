"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function LandingHero() {
  return (
    <section className="max-w-5xl mx-auto p-8 text-center">
      <motion.h1
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-5xl md:text-6xl font-extrabold leading-tight mb-4"
      >
        Weather, reimagined — fast, beautiful, and private
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="text-gray-600 dark:text-gray-300 text-lg mb-8"
      >
        Get accurate local forecasts, save favorites, and access historical UV
        data — all powered by Open‑Meteo and stored securely with Prisma.
      </motion.p>

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex items-center justify-center gap-4"
      >
        <Link href="/">
          <div className="rounded-full bg-blue-600 text-white px-6 py-3 font-semibold shadow hover:shadow-lg transition">
            Try the App
          </div>
        </Link>
        <Link href="/docs">
          <div className="rounded-full border border-gray-200 dark:border-slate-700 px-6 py-3 hover:bg-gray-50 dark:hover:bg-slate-700 transition">
            Read Docs
          </div>
        </Link>
      </motion.div>

      <motion.div className="mt-16" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CardFeature title="Real-time" desc="Live forecasts and UV index updates." />
          <CardFeature title="Personal" desc="Save favorites and settings per user." />
          <CardFeature title="Open & Extensible" desc="Open-source and easy to integrate." />
        </div>
      </motion.div>
    </section>
  );
}

function CardFeature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow">
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-300">{desc}</p>
    </div>
  );
}
