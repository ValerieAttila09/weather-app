import LandingHero from '@/components/LandingHero';

export const metadata = {
  title: 'Weather — Landing',
  description: 'Beautiful, real-time weather built with Next.js, Prisma, and Open-Meteo.',
};

export default function LandingPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-linear-to-b from-sky-50 to-white dark:from-neutral-900 dark:to-neutral-800">
      <LandingHero />
    </main>
  );
}
