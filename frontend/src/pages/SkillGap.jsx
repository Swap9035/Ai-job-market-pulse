// SkillGap.jsx — the most impressive feature
// User enters their skills + selects target role
// App shows exactly what they need to learn

import React, { useState } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ROLES = [
  "Data Analysis",
  "Machine Learning",
  "Data Science",
  "Data Engineering",
  "Business Intelligence"
];

const COMMON_SKILLS = [
  "Python", "SQL", "Excel", "Power BI", "Tableau",
  "Machine Learning", "Statistics", "R", "TensorFlow",
  "AWS", "Docker", "Spark", "Hadoop", "NLP", "scikit-learn",
  "PyTorch", "Deep Learning", "Kafka", "Kubernetes", "MLflow"
];

function SkillGap() {
  const [step, setStep] = useState(1);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [customSkill, setCustomSkill] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiAdvice, setAiAdvice] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [showAi, setShowAi] = useState(false);

  const toggleSkill = (skill) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const addCustomSkill = () => {
    const trimmed = customSkill.trim();
    if (trimmed && !selectedSkills.includes(trimmed)) {
      setSelectedSkills(prev => [...prev, trimmed]);
      setCustomSkill('');
    }
  };

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

  const getAiAdvice = async () => {
    setLoadingAi(true);
    setShowAi(true);
    try {
      const response = await axios.post(
        `${API_URL}/api/ai/career-advice`,
        result
      );
      setAiAdvice(response.data.data);
    } catch (err) {
      setAiAdvice({ error: 'Failed to get AI advice. Check your Groq API key.' });
    } finally {
      setLoadingAi(false);
    }
  };

  const reset = () => {
    setStep(1);
    setSelectedSkills([]);
    setTargetRole('');
    setResult(null);
    setError('');
    setAiAdvice(null);
    setShowAi(false);
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

      {/* STEP 1: Select Your Skills */}
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

      {/* STEP 2: Select Target Role */}
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

      {/* STEP 3: Results */}
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

          {/* Skills to Learn */}
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

          {/* Action Buttons */}
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

          {/* AI Career Advisor Section */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <span className="text-xl">🤖</span>
                  AI Career Advisor
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  Powered by Groq (Llama3) — personalized advice for your skill gap
                </p>
              </div>
              {!showAi && (
                <button
                  onClick={getAiAdvice}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                >
                  Get AI Advice ✨
                </button>
              )}
            </div>

            {/* Loading state */}
            {loadingAi && (
              <div className="flex items-center gap-3 py-4">
                <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-purple-600 text-sm">
                  AI is analyzing your skill gap...
                </p>
              </div>
            )}

            {/* AI Advice Result */}
            {aiAdvice && !loadingAi && (
              <div className="space-y-4">
                {aiAdvice.error ? (
                  <p className="text-red-500 text-sm">{aiAdvice.error}</p>
                ) : (
                  <>
                    {/* Assessment */}
                    {aiAdvice.assessment && (
                      <div className="bg-white rounded-lg p-4 border border-purple-100">
                        <p className="text-xs font-semibold text-purple-600 mb-1">
                          📋 ASSESSMENT
                        </p>
                        <p className="text-sm text-gray-700">
                          {aiAdvice.assessment}
                        </p>
                      </div>
                    )}

                    {/* Learning Roadmap */}
                    {aiAdvice.roadmap && aiAdvice.roadmap.length > 0 && (
                      <div className="bg-white rounded-lg p-4 border border-purple-100">
                        <p className="text-xs font-semibold text-purple-600 mb-3">
                          🗺️ 3-MONTH LEARNING ROADMAP
                        </p>
                        <div className="space-y-3">
                          {aiAdvice.roadmap.map((item, i) => (
                            <div key={i} className="flex gap-3">
                              <div className="w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                                {item.month}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 text-sm">
                                  {item.skill}
                                  <span className="ml-2 text-xs text-gray-400">
                                    {item.time_needed}
                                  </span>
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {item.reason}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Resources */}
                    {aiAdvice.resources && aiAdvice.resources.length > 0 && (
                      <div className="bg-white rounded-lg p-4 border border-purple-100">
                        <p className="text-xs font-semibold text-purple-600 mb-3">
                          📚 FREE LEARNING RESOURCES
                        </p>
                        {aiAdvice.resources.map((item, i) => (
                          <div key={i} className="mb-3">
                            <p className="text-sm font-medium text-gray-800 mb-1">
                              {item.skill}
                            </p>
                            <div className="space-y-1">
                              {item.resources && item.resources.map((r, j) => (
                                <a
                                  key={j}
                                  href={r.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-xs text-blue-600 hover:underline"
                                >
                                  <span className="text-green-500">
                                    {r.type === 'free' ? '🆓' : '💰'}
                                  </span>
                                  {r.name}
                                </a>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Market Insight */}
                    {aiAdvice.market_insight && (
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                        <p className="text-xs font-semibold text-blue-600 mb-1">
                          💡 INDIAN MARKET INSIGHT
                        </p>
                        <p className="text-sm text-blue-800">
                          {aiAdvice.market_insight}
                        </p>
                      </div>
                    )}

                    {/* Token usage */}
                    {aiAdvice.tokens_used && (
                      <p className="text-xs text-gray-300 text-right">
                        Tokens used: {aiAdvice.tokens_used}
                      </p>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}

export default SkillGap;
