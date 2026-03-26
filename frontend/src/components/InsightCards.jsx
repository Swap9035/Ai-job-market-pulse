// InsightCards.jsx — Auto-generated statistical insights
// These cards show on the Dashboard homepage
// Data comes from scipy statistical tests in Python

import React from 'react';
import useApi from '../hooks/useApi';

// Color styling based on insight type
const typeStyles = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    sub: 'text-green-600'
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    sub: 'text-blue-600'
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-800',
    sub: 'text-yellow-600'
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    sub: 'text-red-600'
  }
};

function InsightCards() {
  const { data: insights, loading } = useApi('/api/analytics/insights');

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="animate-pulse bg-white rounded-xl border border-gray-200 p-4">
          <div className="h-3 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-4 bg-gray-100 rounded w-full"></div>
        </div>
      ))}
    </div>
  );

  if (!insights) return null;

  return (
    <div>
      <h2 className="font-semibold text-gray-900 mb-3">
        📊 Data-Driven Insights
        <span className="ml-2 text-xs font-normal text-gray-400">
          Generated using statistical analysis
        </span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {insights.map((insight, index) => {
          const style = typeStyles[insight.type] || typeStyles.info;
          return (
            <div
              key={index}
              className={`rounded-xl border p-4 ${style.bg} ${style.border}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{insight.icon}</span>
                <p className={`text-xs font-semibold ${style.sub}`}>
                  {insight.title}
                </p>
              </div>
              <p className={`text-sm ${style.text}`}>
                {insight.text}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default InsightCards;