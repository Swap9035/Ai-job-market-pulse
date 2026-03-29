// JobCard.jsx — with dark mode support

import React from 'react';

const getSalaryColor = (salary) => {
  if (salary && (salary.includes('20') || salary.includes('15')))
    return 'text-green-600 bg-green-50 dark:bg-green-900 dark:text-green-300';
  if (salary && (salary.includes('8') || salary.includes('10')))
    return 'text-blue-600 bg-blue-50 dark:bg-blue-900 dark:text-blue-300';
  return 'text-gray-600 bg-gray-50 dark:bg-gray-800 dark:text-gray-300';
};

function JobCard({ job }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 hover:shadow-md transition-shadow">

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
            {job.title}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
            {job.company}
          </p>
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getSalaryColor(job.salary_display)}`}>
          {job.salary_display}
        </span>
      </div>

      {/* Location + Type */}
      <div className="flex items-center gap-3 mb-3 text-sm text-gray-500 dark:text-gray-400">
        <span>📍 {job.location}</span>
        <span>💼 {job.job_type}</span>
        <span>⏱ {job.experience}</span>
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-1.5">
        {job.skills && job.skills.map((skill, index) => (
          <span
            key={index}
            className="text-xs px-2.5 py-1 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full font-medium"
          >
            {skill}
          </span>
        ))}
      </div>

      {/* Category */}
      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {job.category}
        </span>
      </div>

    </div>
  );
}

export default JobCard;