// Navbar.jsx — the top navigation bar
// Shows on every page via App.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  // useLocation tells us which page we're on
  // so we can highlight the active nav link
  const location = useLocation();

  // Helper function — returns true if this path is active
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* Logo / Brand */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">📊</span>
            <span className="font-bold text-xl text-gray-900">
              AI Job Market Pulse
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/')
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Dashboard
            </Link>

            <Link
              to="/skills"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/skills')
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Skills
            </Link>

            <Link
              to="/jobs"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/jobs')
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Jobs
            </Link>
          </div>

          {/* Status Badge */}
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