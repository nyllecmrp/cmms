import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          CMMS
        </h1>
        <p className="text-xl text-gray-600 mb-2">
          Computerized Maintenance Management System
        </p>
        <p className="text-lg text-gray-500 mb-8">
          Enterprise-grade maintenance management with modular licensing for Philippine businesses
        </p>

        <div className="flex gap-4 justify-center mb-12">
          <Link
            href="/login"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="px-8 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition font-semibold"
          >
            Register
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-blue-600 text-3xl mb-3">🔧</div>
            <h3 className="font-semibold text-lg mb-2">Asset Management</h3>
            <p className="text-gray-600 text-sm">
              Track equipment, facilities, and vehicles with detailed maintenance history
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-blue-600 text-3xl mb-3">📋</div>
            <h3 className="font-semibold text-lg mb-2">Work Orders</h3>
            <p className="text-gray-600 text-sm">
              Create, assign, and track maintenance tasks with complete lifecycle management
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-blue-600 text-3xl mb-3">📊</div>
            <h3 className="font-semibold text-lg mb-2">Modular Licensing</h3>
            <p className="text-gray-600 text-sm">
              Pay only for the modules you need with flexible Philippine pricing
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-300">
          <p className="text-sm text-gray-500">
            Starting at <span className="font-semibold text-gray-700">₱4,750/month</span> for 5 users
          </p>
        </div>
      </div>
    </div>
  );
}
