// SkillTrendsChart.jsx — shows top 5 skills over years
// Uses a LineChart with multiple lines, one per skill
// Data comes from pandas pivot_table in analytics.py

import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import useApi from '../hooks/useApi';

// Each skill gets its own color line
const SKILL_COLORS = [
  '#3b82f6',  // blue
  '#10b981',  // green
  '#f59e0b',  // amber
  '#ec4899',  // pink
  '#8b5cf6',  // purple
];

function SkillTrendsChart() {
  const { data, loading } = useApi('/api/analytics/skill-trends');

  if (loading) return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-48 mb-4"></div>
        <div className="h-64 bg-gray-100 rounded"></div>
      </div>
    </div>
  );

  if (!data || !data.data) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="font-semibold text-gray-900 mb-1">
        Skill Demand Trends Over Time
      </h2>
      <p className="text-xs text-gray-400 mb-4">
        Top 5 skills by year — basis for ML predictions
      </p>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data.data}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 12 }}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}
          />
          <Legend />
          {data.skills && data.skills.map((skill, index) => (
            <Line
              key={skill}
              type="monotone"
              dataKey={skill}
              stroke={SKILL_COLORS[index % SKILL_COLORS.length]}
              strokeWidth={2.5}
              dot={{ r: 5 }}
              activeDot={{ r: 7 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default SkillTrendsChart;