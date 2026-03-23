// SkillGap.jsx — the most impressive feature
// User enters their skills + selects target role
// App shows exactly what they need to learn

import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000';

// All available roles matching our MongoDB categories
const ROLES = [
  "Data Analysis",
  "Machine Learning",
  "Data Science",
  "Data Engineering",
  "Business Intelligence"
];

// Common skills as quick-select chips
const COMMON_SKILLS = [
  "Python", "SQL", "Excel", "Power BI", "Tableau",
  "Machine Learning", "Statistics", "R", "TensorFlow",
  "AWS", "Docker", "Spark", "Hadoop", "NLP", "scikit-learn",
  "PyTorch", "Deep Learning", "Kafka", "Kubernetes", "MLflow"
];

function SkillGap() {
  // Step tracking — 1: select skills, 2: select role, 3: see results
  const [step, setStep] = useState(1);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [customSkill, setCustomSkill] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Toggle skill selection
  const toggleSkill = (skill) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  // Add custom skill typed by user
  const addCustomSkill = () => {
    const trimmed = customSkill.trim();
    if (trimmed && !selectedSkills.includes(trimmed)) {
      setSelectedSkills(prev => [...prev, trimmed]);
      setCustomSkill('');
    }
  };

  // Call the API
  const analyzeGap = async () => {
    if (!targetRole) {
      setError('Please select a target role');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await axios.post(`${API_URL}/api/skill-gap`, {
        skills: selectedSkills,
        target_role: targetRole
      });
      setResult(response.data);
      setStep(3);
    } catch (err) {
      setError('Failed to analyze. Make sure Flask is running.');
    } finally {
      setLoading(false);
    }
  };

  // Reset everything
  const reset = () => {
    setStep(1);
    setSelectedSkills([]);
    setTargetRole('');
    setResult(null);
    setError('');
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          🎯 Skill Gap Analyzer
        </h1>
        <p className="text-gray-500 mt-1">
          Find out exactly what skills you need to land your target role
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-3">
        {[1, 2, 3].map(s => (
          <React.Fragment key={s}>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
              step === s
                ? 'bg-blue-600 text-white'
                : step > s
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-400'
            }`}>
              <span>{step > s ? '✓' : s}</span>
              <span>{s === 1 ? 'Your Skills' : s === 2 ? 'Target Role' : 'Results'}</span>
            </div>
            {s < 3 && <div className="flex-1 h-0.5 bg-gray-200"></div>}
          </React.Fragment>
        ))}
      </div>

      {/* ── STEP 1: Select Your Skills ── */}
      {step === 1 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <div>
            <h2 className="font-semibold text-gray-900 mb-1">
              What skills do you currently have?
            </h2>
            <p className="text-sm text-gray-400">
              Click to select. Don't worry if you're missing some — that's the point!
            </p>
          </div>

          {/* Skill chips */}
          <div className="flex flex-wrap gap-2">
            {COMMON_SKILLS.map(skill => (
              <button
                key={skill}
                onClick={() => toggleSkill(skill)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  selectedSkills.includes(skill)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                }`}
              >
                {selectedSkills.includes(skill) ? '✓ ' : ''}{skill}
              </button>
            ))}
          </div>

          {/* Custom skill input */}
          <div>
            <p className="text-sm text-gray-500 mb-2">
              Add a skill not listed above:
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCustomSkill()}
                placeholder="e.g. Power Automate, MATLAB..."
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={addCustomSkill}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200"
              >
                Add
              </button>
            </div>
          </div>

          {/* Selected skills preview */}
          {selectedSkills.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-700 mb-2">
                Selected ({selectedSkills.length} skills):
              </p>
              <div className="flex flex-wrap gap-1.5">
                {selectedSkills.map(skill => (
                  <span
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className="px-2.5 py-1 bg-blue-600 text-white text-xs rounded-full cursor-pointer hover:bg-red-500 transition-colors"
                    title="Click to remove"
                  >
                    {skill} ×
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => setStep(2)}
            disabled={selectedSkills.length === 0}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next: Choose Target Role →
          </button>
        </div>
      )}

      {/* ── STEP 2: Select Target Role ── */}
      {step === 2 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <div>
            <h2 className="font-semibold text-gray-900 mb-1">
              What role are you targeting?
            </h2>
            <p className="text-sm text-gray-400">
              We'll analyze real job postings for this role
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ROLES.map(role => (
              <button
                key={role}
                onClick={() => setTargetRole(role)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  targetRole === role
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="font-medium text-gray-900">{role}</div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {role === 'Data Analysis' && 'SQL, Excel, Power BI, Python'}
                  {role === 'Machine Learning' && 'Python, TensorFlow, scikit-learn'}
                  {role === 'Data Science' && 'Python, Statistics, ML, SQL'}
                  {role === 'Data Engineering' && 'Spark, Kafka, AWS, Python'}
                  {role === 'Business Intelligence' && 'Tableau, Power BI, SQL'}
                </div>
              </button>
            ))}
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50"
            >
              ← Back
            </button>
            <button
              onClick={analyzeGap}
              disabled={loading || !targetRole}
              className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-40 transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Analyzing...
                </span>
              ) : (
                'Analyze My Skill Gap 🔍'
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: Results ── */}
      {step === 3 && result && (
        <div className="space-y-4">

          {/* Match Score Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-gray-900">
                  Your Match Score for {result.target_role}
                </h2>
                <p className="text-sm text-gray-400 mt-0.5">
                  Based on {result.total_jobs_analyzed} job postings
                </p>
              </div>
              {/* Big score circle */}
              <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold border-4 ${
                result.match_score >= 70
                  ? 'border-green-400 text-green-600 bg-green-50'
                  : result.match_score >= 40
                  ? 'border-yellow-400 text-yellow-600 bg-yellow-50'
                  : 'border-red-400 text-red-600 bg-red-50'
              }`}>
                {result.match_score}%
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${
                  result.match_score >= 70 ? 'bg-green-500'
                  : result.match_score >= 40 ? 'bg-yellow-500'
                  : 'bg-red-500'
                }`}
                style={{ width: `${result.match_score}%` }}
              ></div>
            </div>

            {/* Summary */}
            <div className="flex gap-4 mt-4">
              <div className="flex-1 bg-green-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-green-600">
                  {result.summary.have_count}
                </p>
                <p className="text-xs text-green-700">Skills you have</p>
              </div>
              <div className="flex-1 bg-red-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-red-500">
                  {result.summary.missing_count}
                </p>
                <p className="text-xs text-red-700">Skills to learn</p>
              </div>
              <div className="flex-1 bg-blue-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {result.summary.total_count}
                </p>
                <p className="text-xs text-blue-700">Total skills needed</p>
              </div>
            </div>
          </div>

          {/* Skills to Learn (Missing) */}
          {result.skills_to_learn.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                🎯 Skills to Learn
                <span className="ml-2 text-sm font-normal text-gray-400">
                  (sorted by how often they appear in job postings)
                </span>
              </h3>
              <div className="space-y-3">
                {result.skills_to_learn.map((skill, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-32 text-sm font-medium text-gray-700 shrink-0">
                      {skill.skill}
                    </div>
                    <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                      <div
                        className="bg-red-400 h-2.5 rounded-full"
                        style={{ width: `${skill.percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 w-24 text-right shrink-0">
                      {skill.percentage}% of jobs
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills You Have */}
          {result.skills_you_have.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                ✅ Skills You Already Have
              </h3>
              <div className="space-y-3">
                {result.skills_you_have.map((skill, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-32 text-sm font-medium text-gray-700 shrink-0">
                      {skill.skill}
                    </div>
                    <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                      <div
                        className="bg-green-400 h-2.5 rounded-full"
                        style={{ width: `${skill.percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 w-24 text-right shrink-0">
                      {skill.percentage}% of jobs
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={reset}
              className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50"
            >
              ← Analyze Again
            </button>
            <button
              onClick={() => window.open('https://www.coursera.org', '_blank')}
              className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
            >
              Find Courses on Coursera →
            </button>
          </div>

        </div>
      )}
    </div>
  );
}

export default SkillGap;