import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import JobCard from '../components/JobCard';
import SalaryChart from '../components/SalaryChart';
import LocationChart from '../components/LocationChart';
import ExperienceChart from '../components/ExperienceChart';

const API_URL = 'http://localhost:5000';

function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [skills, setSkills] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [jobsRes, skillsRes, categoriesRes] = await Promise.all([
        axios.get(`${API_URL}/api/jobs`),
        axios.get(`${API_URL}/api/skills`),
        axios.get(`${API_URL}/api/jobs/categories`)
      ]);
      setJobs(jobsRes.data.data);
      setSkills(skillsRes.data.data);
      setCategories(categoriesRes.data.data);
    } catch (err) {
      setError('Failed to fetch data. Make sure Flask is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-gray-500">Loading job market data...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
      <p className="text-red-600">⚠️ {error}</p>
    </div>
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Job Market Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Real-time analysis of data science job trends in India
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Total Jobs</p>
          <p className="text-3xl font-bold text-gray-900">{jobs.length}</p>
          <p className="text-xs text-green-600 mt-1">↑ Updated today</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Unique Skills</p>
          <p className="text-3xl font-bold text-gray-900">{skills.length}</p>
          <p className="text-xs text-blue-600 mt-1">Across all roles</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Job Categories</p>
          <p className="text-3xl font-bold text-gray-900">{categories.length}</p>
          <p className="text-xs text-purple-600 mt-1">Specializations tracked</p>
        </div>
      </div>

      {/* Top Skills Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 mb-1">
          Top 10 Most Demanded Skills
        </h2>
        <p className="text-xs text-gray-400 mb-4">
          Based on job posting frequency
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={skills}
            margin={{ top: 5, right: 20, left: 0, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="skill"
              angle={-45}
              textAnchor="end"
              tick={{ fontSize: 12 }}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}
            />
            <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Salary + Location Charts side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SalaryChart />
        <LocationChart />
      </div>

      {/* Experience Chart */}
      <ExperienceChart />

      {/* Recent Jobs */}
      <div>
        <h2 className="font-semibold text-gray-900 mb-4">
          Recent Job Postings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.slice(0, 4).map((job, index) => (
            <JobCard key={index} job={job} />
          ))}
        </div>
      </div>

    </div>
  );
}

export default Dashboard;
