// SalaryChart.jsx — shows average salary by job category
// Uses a grouped bar chart — min salary vs max salary

import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import useApi from '../hooks/useApi';

function SalaryChart() {
  const { data, loading, error } = useApi('/api/analytics/salary');

  if (loading) return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-48 mb-4"></div>
        <div className="h-64 bg-gray-100 rounded"></div>
      </div>
    </div>
  );

  if (error || !data) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="font-semibold text-gray-900 mb-1">Salary by Job Category</h2>
      <p className="text-xs text-gray-400 mb-4">Average min/max salary in LPA</p>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="category"
            angle={-35}
            textAnchor="end"
            tick={{ fontSize: 11 }}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            label={{ value: 'LPA', angle: -90, position: 'insideLeft', fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
            formatter={(value) => [`${value} LPA`]}
          />
          <Legend verticalAlign="top" />
          <Bar dataKey="avg_min_lpa" name="Min Salary" fill="#93c5fd" radius={[4, 4, 0, 0]} />
          <Bar dataKey="avg_max_lpa" name="Max Salary" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default SalaryChart;