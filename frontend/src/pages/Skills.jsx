import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis
} from 'recharts';
import { TrendingUp, Award } from 'lucide-react';
import { LoadingSpinner } from '../components/Loading';
import { fetchTopSkills, fetchSkillsByExp } from '../api/jobApi';

const TOOLTIP_STYLE = {
  contentStyle: { background: '#0d1526', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '10px', color: '#f1f5f9' },
};

const EXP_ORDER = ['Entry Level', 'Mid Level', 'Senior Level', 'Lead', 'Director'];

export default function Skills() {
  const [skills, setSkills] = useState([]);
  const [byExp, setByExp] = useState({});
  const [selectedExp, setSelectedExp] = useState('Mid Level');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchTopSkills(12), fetchSkillsByExp()])
      .then(([s, e]) => { setSkills(s.data); setByExp(e.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Analyzing skills..." />;

  const maxCount = Math.max(...skills.map(s => s.job_count));
  const radarData = (byExp[selectedExp] || []).map(s => ({ skill: s.primary_skill, count: s.count }));

  return (
    <div>
      <motion.div className="page-header" initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}>
        <h1 className="page-title"><TrendingUp size={28} style={{ color:'var(--accent-cyan)' }} /> Skills Analytics</h1>
        <p className="page-subtitle">Demand analysis across 5,000+ job postings — what employers actually want</p>
      </motion.div>

      <div className="charts-grid">
        {/* Top Skills Bar Chart */}
        <motion.div className="chart-card" initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.1 }}>
          <div className="chart-title">🏆 Top Skills by Job Count</div>
          <div className="chart-subtitle">Number of jobs requiring each skill</div>
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={skills} layout="vertical" margin={{ left: 20 }}>
              <defs>
                <linearGradient id="skillGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" horizontal={false} />
              <XAxis type="number" stroke="#475569" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="skill" stroke="#475569" tick={{ fontSize: 11 }} width={110} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="job_count" fill="url(#skillGrad)" radius={[0,6,6,0]} name="Jobs" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Skills Radar by Experience */}
        <motion.div className="chart-card" initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.2 }}>
          <div className="chart-title">🎯 Skills Demand by Experience Level</div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:16 }}>
            {EXP_ORDER.map(exp => (
              <button key={exp} onClick={() => setSelectedExp(exp)}
                className={`btn btn-sm ${selectedExp === exp ? 'btn-primary' : 'btn-ghost'}`}>
                {exp}
              </button>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(99,102,241,0.2)" />
              <PolarAngleAxis dataKey="skill" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Radar dataKey="count" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.3} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Skills Table */}
      <motion.div className="chart-card" initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.3 }}>
        <div className="chart-title"><Award size={18} /> Skills Demand Leaderboard</div>
        <div className="chart-subtitle">Ranked by job count with salary data</div>
        <table className="data-table" style={{ marginTop:16 }}>
          <thead>
            <tr>
              <th>#</th>
              <th>Skill</th>
              <th>Job Count</th>
              <th>Market Share</th>
              <th>Avg Salary (INR)</th>
              <th>Demand Bar</th>
            </tr>
          </thead>
          <tbody>
            {skills.map((s, i) => (
              <tr key={s.skill}>
                <td className="rank">#{i + 1}</td>
                <td style={{ fontWeight: 600 }}>{s.skill}</td>
                <td><span className="badge badge-cyan">{s.job_count.toLocaleString()}</span></td>
                <td style={{ color: 'var(--accent-green)' }}>{s.demand_pct}%</td>
                <td>₹{(s.avg_salary_inr / 100000).toFixed(1)}L</td>
                <td style={{ width: 140 }}>
                  <div className="progress-bar-wrap">
                    <div className="progress-bar" style={{ width: `${(s.job_count / maxCount) * 100}%` }} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}
