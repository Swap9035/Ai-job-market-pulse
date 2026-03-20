// Skills.jsx — dedicated skills analysis page

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';

const API_URL = 'http://localhost:5000';

// Color based on skill category
const CATEGORY_COLORS = {
  'Programming': '#3b82f6',
  'Database': '#8b5cf6',
  'AI/ML': '#ec4899',
  'Visualization': '#f59e0b',
  'Tools': '#10b981',
  'Cloud': '#06b6d4',
  'DevOps': '#f97316',
  'Big Data': '#6366f1',
  'Mathematics': '#14b8a6',
  'Other': '#94a3b8'
};

function Skills() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_URL}/api/skills`)
      .then(res => {
        setSkills(res.data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Skills Analysis</h1>
        <p className="text-gray-500 mt-1">Most in-demand skills across data science roles</p>
      </div>

      {/* Bar Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Skill Demand Frequency</h2>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={skills} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="skill" angle={-45} textAnchor="end" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={{ borderRadius: '8px' }} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {skills.map((entry, index) => (
                <Cell
                  key={index}
                  fill={CATEGORY_COLORS[entry.category] || '#94a3b8'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {skills.map((skill, index) => (
          <div key={index} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{skill.skill}</p>
              <p className="text-xs text-gray-400 mt-0.5">{skill.category}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">{skill.count}</p>
              <p className="text-xs text-gray-400">job postings</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

export default Skills;
