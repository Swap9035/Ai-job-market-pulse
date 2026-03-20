// JobList.jsx — shows all jobs with filtering

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import JobCard from '../components/JobCard';

const API_URL = 'http://localhost:5000';

function JobList() {
  const [jobs, setJobs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    axios.get(`${API_URL}/api/jobs`)
      .then(res => {
        setJobs(res.data.data);
        setFiltered(res.data.data);
        setLoading(false);
      });
  }, []);

  // Filter jobs whenever search or category changes
  useEffect(() => {
    let result = jobs;

    if (selectedCategory !== 'All') {
      result = result.filter(job => job.category === selectedCategory);
    }

    if (search) {
      result = result.filter(job =>
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.company.toLowerCase().includes(search.toLowerCase()) ||
        job.skills.some(s => s.toLowerCase().includes(search.toLowerCase()))
      );
    }

    setFiltered(result);
  }, [search, selectedCategory, jobs]);

  const categories = ['All', ...new Set(jobs.map(j => j.category))];

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Job Listings</h1>
        <p className="text-gray-500 mt-1">{filtered.length} jobs found</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <input
          type="text"
          placeholder="Search by title, company or skill..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Job Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((job, index) => (
          <JobCard key={index} job={job} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          No jobs found matching your search.
        </div>
      )}

    </div>
  );
}

export default JobList;
