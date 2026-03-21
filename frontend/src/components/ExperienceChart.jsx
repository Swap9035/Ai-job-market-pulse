// ExperienceChart.jsx — experience level vs salary

import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import useApi from '../hooks/useApi';

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'];

function ExperienceChart() {
  const { data, loading } = useApi('/api/analytics/experience');

  if (loading) return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-48 mb-4"></div>
        <div className="h-48 bg-gray-100 rounded"></div>
      </div>
    </div>
  );

  if (!data) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="font-semibold text-gray-900 mb-1">Experience vs Salary</h2>
      <p className="text-xs text-gray-400 mb-4">Average minimum salary by experience level</p>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="experience"
            angle={-25}
            textAnchor="end"
            tick={{ fontSize: 11 }}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{ borderRadius: '8px' }}
            formatter={(value) => [`${value} LPA`, 'Avg Min Salary']}
          />
          <Bar dataKey="avg_salary_lpa" radius={[4, 4, 0, 0]}>
            {data && data.map((entry, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ExperienceChart;