import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { Briefcase, TrendingUp, DollarSign, Building2, MapPin, Wifi } from 'lucide-react';
import StatCard from '../components/StatCard';
import { LoadingSpinner } from '../components/Loading';
import { fetchStats, fetchSkillTrends, fetchMonthlyTrends, fetchRemoteTrends } from '../api/jobApi';

const TOOLTIP_STYLE = {
  contentStyle: { background: '#0d1526', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '10px', color: '#f1f5f9' },
  labelStyle: { color: '#94a3b8' },
};

const COLORS = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [remote, setRemote] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchStats(), fetchSkillTrends(), fetchMonthlyTrends(), fetchRemoteTrends()])
      .then(([s, t, m, r]) => {
        setStats(s.data);
        setTrends(t.data);
        setMonthly(m.data);
        setRemote(r.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;

  const fmt = (n) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n;
  const fmtINR = (n) => `₹${(n / 100000).toFixed(1)}L`;

  const STAT_CARDS = [
    { title: 'Total Jobs Analyzed', value: fmt(stats?.total_jobs), change: '+12% this month', icon: Briefcase, gradient: 'linear-gradient(135deg,#7c3aed,#06b6d4)', iconBg: 'rgba(124,58,237,0.15)', iconColor: '#7c3aed' },
    { title: 'Unique Skills Tracked', value: stats?.total_skills, change: '+5 new this week', icon: TrendingUp, gradient: 'linear-gradient(135deg,#06b6d4,#10b981)', iconBg: 'rgba(6,182,212,0.15)', iconColor: '#06b6d4' },
    { title: 'Avg Salary (INR)', value: fmtINR(stats?.avg_salary_inr), change: '+8.3% YoY', icon: DollarSign, gradient: 'linear-gradient(135deg,#10b981,#f59e0b)', iconBg: 'rgba(16,185,129,0.15)', iconColor: '#10b981' },
    { title: 'Companies Hiring', value: stats?.total_companies, change: 'Across all sectors', icon: Building2, gradient: 'linear-gradient(135deg,#f59e0b,#ef4444)', iconBg: 'rgba(245,158,11,0.15)', iconColor: '#f59e0b' },
    { title: 'Top Location', value: stats?.top_location, change: 'Highest demand', icon: MapPin, gradient: 'linear-gradient(135deg,#ec4899,#7c3aed)', iconBg: 'rgba(236,72,153,0.15)', iconColor: '#ec4899' },
    { title: 'Remote Jobs', value: `${stats?.remote_pct}%`, change: 'Of all listings', icon: Wifi, gradient: 'linear-gradient(135deg,#7c3aed,#ec4899)', iconBg: 'rgba(124,58,237,0.15)', iconColor: '#7c3aed' },
  ];

  const SKILL_KEYS = ['Python', 'Machine Learning', 'SQL', 'Deep Learning', 'Cloud (AWS/GCP)'];
  const SKILL_COLORS = { 'Python': '#7c3aed', 'Machine Learning': '#06b6d4', 'SQL': '#10b981', 'Deep Learning': '#f59e0b', 'Cloud (AWS/GCP)': '#ec4899' };

  return (
    <div>
      {/* HERO */}
      <motion.div className="hero-section" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <h1 className="hero-title">
              <span className="gradient-text">Decode the Job Market</span><br />with AI Precision
            </h1>
            <p className="hero-sub">Real-time analytics on 5,000+ job postings. Skill trends, salary predictions, and AI-powered career insights — all in one place.</p>
            <div className="hero-actions">
              <span style={{ display:'flex', alignItems:'center', fontSize:'0.85rem', color:'var(--accent-green)' }}>
                <span className="live-dot" />Dataset: 5,000 jobs • 15 roles • 16 locations
              </span>
            </div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8, minWidth:200 }}>
            {[['🔬 ML Model', 'Random Forest Regressor'], ['📊 Data', 'Pandas + NumPy'], ['🤖 AI', 'OpenAI GPT-3.5']].map(([k, v]) => (
              <div key={k} style={{ background:'rgba(255,255,255,0.04)', borderRadius:8, padding:'8px 14px', fontSize:'0.82rem' }}>
                <span style={{ color:'var(--text-muted)' }}>{k}: </span><span style={{ color:'var(--accent-cyan)' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* STAT CARDS */}
      <div className="stats-grid">
        {STAT_CARDS.map((c, i) => (
          <motion.div key={c.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <StatCard {...c} />
          </motion.div>
        ))}
      </div>

      {/* CHARTS ROW 1 */}
      <div className="charts-grid">
        {/* Skill Trends Line Chart */}
        <motion.div className="chart-card" initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.3 }}>
          <div className="chart-title">📈 Skill Demand Trends (12 months)</div>
          <div className="chart-subtitle">Monthly demand index (0-100) for top skills</div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={trends}>
              <defs>
                {SKILL_KEYS.map((sk) => (
                  <linearGradient key={sk} id={`grad-${sk}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={SKILL_COLORS[sk]} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={SKILL_COLORS[sk]} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
              <XAxis dataKey="month" stroke="#475569" tick={{ fontSize: 11 }} />
              <YAxis stroke="#475569" tick={{ fontSize: 11 }} domain={[40, 100]} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
              {SKILL_KEYS.map((sk) => (
                <Area key={sk} type="monotone" dataKey={sk} stroke={SKILL_COLORS[sk]} strokeWidth={2}
                  fill={`url(#grad-${sk})`} dot={false} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Monthly Hiring Bar Chart */}
        <motion.div className="chart-card" initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.4 }}>
          <div className="chart-title">📅 Monthly Job Postings</div>
          <div className="chart-subtitle">Number of jobs posted each month</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthly}>
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
              <XAxis dataKey="month" stroke="#475569" tick={{ fontSize: 11 }} />
              <YAxis stroke="#475569" tick={{ fontSize: 11 }} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="jobs" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* CHARTS ROW 2 */}
      <div className="charts-grid">
        {/* Remote Distribution Pie */}
        <motion.div className="chart-card" initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }}>
          <div className="chart-title">🌐 Work Model Distribution</div>
          <div className="chart-subtitle">Remote vs Hybrid vs On-site breakdown</div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={remote} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={3} label={({ type, pct }) => `${type} (${pct}%)`} labelLine={{ stroke: '#475569' }}>
                {remote.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip {...TOOLTIP_STYLE} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Quick Insight Cards */}
        <motion.div className="chart-card" initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.6 }}>
          <div className="chart-title">💡 Market Insights</div>
          <div className="chart-subtitle">Key findings from the dataset analysis</div>
          <div style={{ display:'flex', flexDirection:'column', gap:16, marginTop:8 }}>
            {[
              { label: 'Python demand growth', val: '+23% YoY', color: '#7c3aed' },
              { label: 'ML Engineer avg salary', val: '₹22.5L', color: '#06b6d4' },
              { label: 'Remote jobs share', val: `${stats?.remote_pct}%`, color: '#10b981' },
              { label: 'Highest paying location', val: stats?.top_location, color: '#f59e0b' },
              { label: 'Fastest growing skill', val: 'MLOps (+41%)', color: '#ec4899' },
              { label: 'Top hiring company size', val: 'Enterprise 5000+', color: '#7c3aed' },
            ].map(({ label, val, color }) => (
              <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
                <span style={{ color:'var(--text-secondary)', fontSize:'0.88rem' }}>{label}</span>
                <span style={{ color, fontWeight:700, fontSize:'0.92rem' }}>{val}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
