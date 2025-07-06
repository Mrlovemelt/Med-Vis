import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            Medtronic WE Summit
          </h1>
          <p className="text-xl text-gray-600 mb-12">
            Data Visualization Platform
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Link
              href="/visualization"
              className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Visualizations</h2>
              <p className="text-gray-600">Explore relationships between multiple variables</p>
            </Link>
            
            <Link
              href="/survey"
              className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Survey Form</h2>
              <p className="text-gray-600">Submit your responses</p>
            </Link>
            
            <Link
              href="/admin/controls"
              className="block p-6 bg-blue-50 border-2 border-blue-200 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold text-blue-900 mb-2">Global Controls</h2>
              <p className="text-blue-700">Configure colors, themes, and settings (Admin Only)</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 