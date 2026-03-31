// LocationChart.jsx — shows job count by city
// Uses a pie chart to show distribution

import React from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer
} from 'recharts';
import useApi from '../hooks/useApi';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

function LocationChart() {
  const { data, loading } = useApi('/api/analytics/locations');

  if (loading) return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-48 mb-4"></div>
        <div className="h-64 bg-gray-100 rounded"></div>
      </div>
    </div>
  );

  if (!data) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="font-semibold text-gray-900 mb-1">Jobs by Location</h2>
      <p className="text-xs text-gray-400 mb-4">Distribution across Indian cities</p>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="location"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label={({ location, percent }) =>
              `${location} ${(percent * 100).toFixed(0)}%`
            }
            labelLine={true}
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ borderRadius: '8px' }}
            formatter={(value, name) => [value, 'Jobs']}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default LocationChart;