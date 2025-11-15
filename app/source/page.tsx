import Link from 'next/link';

export const metadata = {
  title: 'Weather — Source',
  description: 'Source code and repository information for the Weather App.',
};

export default function SourcePage() {
  return (
    <main className="min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Source Code</h1>
        <p className="text-gray-700 mb-6">The code for this project is hosted on GitHub.</p>

        <div className="bg-white dark:bg-neutral-800 p-6 rounded shadow">
          <h2 className="font-semibold mb-2">Repository</h2>
          <p className="mb-4 text-gray-700">Browse the source, open issues, or contribute on GitHub.</p>
          <Link href="https://github.com/NEO-Glitch-CC/weather-app">
            <div className="text-blue-600 hover:underline">https://github.com/NEO-Glitch-CC/weather-app</div>
          </Link>
        </div>
      </div>
    </main>
  );
}
