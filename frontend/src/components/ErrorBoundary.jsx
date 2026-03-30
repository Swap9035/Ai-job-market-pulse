// ErrorBoundary.jsx — catches React rendering errors
// Without this, one component error crashes the WHOLE app
// With this, only the broken component shows an error
// This is a CLASS component — only class components can be
// error boundaries in React (hooks don't support this yet)

import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  // Called when a child component throws an error
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  // Called after error is caught — good for logging
  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center my-4">
          <p className="text-red-600 dark:text-red-300 font-medium mb-2">
            ⚠️ Something went wrong
          </p>
          <p className="text-red-500 dark:text-red-400 text-sm mb-4">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;