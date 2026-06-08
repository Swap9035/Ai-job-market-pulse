import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
});

// ── Dashboard ──────────────────────────────
export const fetchStats        = ()       => API.get('/dashboard/stats');

// ── Skills ─────────────────────────────────
export const fetchTopSkills    = (n = 10) => API.get(`/skills/top?limit=${n}`);
export const fetchSkillTrends  = ()       => API.get('/skills/trends');
export const fetchSkillsByExp  = ()       => API.get('/skills/by-experience');

// ── Salary ─────────────────────────────────
export const fetchSalaryByRole     = ()   => API.get('/salary/by-role');
export const fetchSalaryByLocation = ()   => API.get('/salary/by-location');
export const fetchSalaryDist       = ()   => API.get('/salary/distribution');

// ── Trends ─────────────────────────────────
export const fetchMonthlyTrends  = ()     => API.get('/trends/monthly');
export const fetchRemoteTrends   = ()     => API.get('/trends/remote');
export const fetchCompanySize    = ()     => API.get('/trends/company-size');

// ── ML Predictor ───────────────────────────
export const predictSalary = (payload)    => API.post('/ml/predict-salary', payload);
export const fetchModelInfo = ()          => API.get('/ml/model-info');
export const fetchFeatureImportance = ()  => API.get('/ml/feature-importance');

// ── Gap Analyzer ───────────────────────────
export const analyzeGap = (payload)       => API.post('/gap/analyze', payload);

// ── AI Insights ────────────────────────────
export const fetchAIInsights = (skill)    => API.post('/ai/insights', { skill });
