// JobList.jsx — shows all jobs with filtering + dark mode

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import JobCard from '../components/JobCard';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

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
    <div className="space-y-4">
      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1,2,3,4].map(i => (
          <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 animate-pulse h-40"></div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Job Listings
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {filtered.length} jobs found
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search Input */}
        <input
          type="text"
          placeholder="Search by title, company or skill..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Category Filter Buttons */}
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
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

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400 dark:text-gray-600">
          <p className="text-lg mb-2">No jobs found</p>
          <p className="text-sm">Try a different search or category filter</p>
        </div>
      )}

    </div>
  );
}

export default JobList;