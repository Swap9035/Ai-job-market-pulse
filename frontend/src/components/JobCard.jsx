// JobCard.jsx — displays a single job posting
// Used in the JobList page and Dashboard

import React from 'react';

// Salary colors based on range
const getSalaryColor = (salary) => {
  if (salary.includes('20') || salary.includes('15')) return 'text-green-600 bg-green-50';
  if (salary.includes('8') || salary.includes('10')) return 'text-blue-600 bg-blue-50';
  return 'text-gray-600 bg-gray-50';
};

function JobCard({ job }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900 text-lg">{job.title}</h3>
          <p className="text-gray-500 text-sm mt-0.5">{job.company}</p>
        </div>
        {/* Salary badge */}
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getSalaryColor(job.salary_display)}`}>
          {job.salary_display}
        </span>
      </div>

      {/* Location + Type */}
      <div className="flex items-center gap-3 mb-3 text-sm text-gray-500">
        <span>📍 {job.location}</span>
        <span>💼 {job.job_type}</span>
        <span>⏱ {job.experience}</span>
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-1.5">
        {job.skills && job.skills.map((skill, index) => (
          <span
            key={index}
            className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full font-medium"
          >
            {skill}
          </span>
        ))}
      </div>

      {/* Category tag */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <span className="text-xs text-gray-400">{job.category}</span>
      </div>

    </div>
  );
}

export default JobCard;