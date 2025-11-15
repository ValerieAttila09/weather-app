export const metadata = {
  title: 'Weather — About',
  description: 'About the Weather App and the team behind it.',
};

export default function AboutPage() {
  return (
    <main className="min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">About</h1>
        <p className="text-gray-700 mb-4">This Weather App is a demo project showcasing a modern Next.js + Prisma + Open‑Meteo stack with a focus on UX and developer experience.</p>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Goals</h2>
          <ul className="list-disc list-inside text-gray-700">
            <li>Provide fast, accurate local weather</li>
            <li>Make it easy to save favorites and personalize settings</li>
            <li>Offer a developer-friendly codebase and docs</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">Credits</h2>
          <p className="text-gray-700">Built with Next.js, Tailwind, Prisma, and Open‑Meteo.</p>
        </section>
      </div>
    </main>
  );
}
