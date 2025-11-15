export const metadata = {
  title: 'Weather — Docs',
  description: 'Documentation for the Weather App — API, setup, and usage.',
};

export default function DocsPage() {
  return (
    <main className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Documentation</h1>
        <p className="text-gray-600 mb-6">Quickstart and developer docs for the Weather App.</p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">Getting Started</h2>
          <p className="text-gray-700">See the <code className="bg-gray-100 px-1 rounded">README.md</code> in the repo for setup instructions, environment variables, and migration steps.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">API</h2>
          <p className="text-gray-700">The app exposes a few simple API routes under <code className="bg-gray-100 px-1 rounded">/api</code> like <code className="bg-gray-100 px-1 rounded">/api/weather</code> and <code className="bg-gray-100 px-1 rounded">/api/favorites</code>.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">Contributing</h2>
          <p className="text-gray-700">Open a PR or issue on the repo. Please follow the code style and run the test/build steps before submitting.</p>
        </section>
      </div>
    </main>
  );
}
