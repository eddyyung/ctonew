export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            YouTube Hot Content Analytics
          </h1>
          <p className="mb-8 text-lg text-gray-600 dark:text-gray-300">
            Welcome to the web application for analyzing trending YouTube content
          </p>
          <div className="inline-block rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
              Getting Started
            </h2>
            <ul className="space-y-2 text-left text-gray-700 dark:text-gray-300">
              <li>✓ Next.js 14 with TypeScript</li>
              <li>✓ Tailwind CSS for styling</li>
              <li>✓ ESLint and Prettier for code quality</li>
              <li>✓ Ready for data visualization with Recharts</li>
              <li>✓ Form validation with react-hook-form and Zod</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
