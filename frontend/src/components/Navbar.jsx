import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">📊</span>
            <span className="font-bold text-xl text-gray-900">
              AI Job Market Pulse
            </span>
          </Link>

          <div className="flex items-center gap-1">
            {[
              { path: '/', label: 'Dashboard' },
              { path: '/skills', label: 'Skills' },
              { path: '/jobs', label: 'Jobs' },
              { path: '/skill-gap', label: ' Skill Gap' },
              { path: '/predictions', label: ' Predictions' },
            ].map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(path)
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-sm text-gray-500">Live Data</span>
          </div>

        </div>
      </div>
    </nav>
  );
}

export default Navbar;
