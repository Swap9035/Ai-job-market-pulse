import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { DollarSign } from 'lucide-react';
import { LoadingSpinner } from '../components/Loading';
import { fetchSalaryByRole, fetchSalaryByLocation, fetchSalaryDist } from '../api/jobApi';

const TOOLTIP_STYLE = {
  contentStyle: { background: '#0d1526', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '10px', color: '#f1f5f9' },
};

const COLORS = ['#7c3aed','#06b6d4','#10b981','#f59e0b','#ec4899','#ef4444','#6366f1','#14b8a6','#84cc16','#f97316'];

export default function Salary() {
  const [byRole, setByRole] = useState([]);
  const [byLoc, setByLoc]   = useState([]);
  const [dist, setDist]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchSalaryByRole(), fetchSalaryByLocation(), fetchSalaryDist()])
      .then(([r, l, d]) => { setByRole(r.data); setByLoc(l.data); setDist(d.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Crunching salary data..." />;

  const fmtL = (v) => `₹${(v / 100000).toFixed(1)}L`;

  return (
    <div>
      <motion.div className="page-header" initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}>
        <h1 className="page-title"><DollarSign size={28} style={{ color:'var(--accent-green)' }} /> Salary Intelligence</h1>
        <p className="page-subtitle">Compensation benchmarks across roles and locations — powered by real job data</p>
      </motion.div>

      {/* Mini stat row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:16, marginBottom:28 }}>
        {[
          { label:'Highest Role Avg', val: byRole[0] ? fmtL(byRole[0].avg) : '-', color:'var(--accent-purple)' },
          { label:'Top Location', val: byLoc[0]?.location || '-', color:'var(--accent-cyan)' },
          { label:'Median Band', val: '₹12–18L', color:'var(--accent-green)' },
          { label:'Entry Level Start', val: '₹5–8L', color:'var(--accent-orange)' },
        ].map(({ label, val, color }) => (
          <div key={label} className="card" style={{ textAlign:'center' }}>
            <div style={{ fontSize:'1.5rem', fontWeight:800, color }}>{val}</div>
            <div style={{ color:'var(--text-secondary)', fontSize:'0.8rem', marginTop:4 }}>{label}</div>
          </div>
        ))}
      </div>

      <div className="charts-grid">
        {/* By Role */}
        <motion.div className="chart-card" initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.1 }}>
          <div className="chart-title">💼 Avg Salary by Job Role</div>
          <div className="chart-subtitle">Annual compensation in INR (Lakhs)</div>
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={byRole.map(r => ({ ...r, avgL: +(r.avg / 100000).toFixed(1) }))} layout="vertical" margin={{ left: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" horizontal={false} />
              <XAxis type="number" stroke="#475569" tick={{ fontSize:11 }} tickFormatter={v => `₹${v}L`} />
              <YAxis type="category" dataKey="job_title" stroke="#475569" tick={{ fontSize:10 }} width={130} />
              <Tooltip {...TOOLTIP_STYLE} formatter={v => [`₹${v}L`, 'Avg Salary']} />
              <Bar dataKey="avgL" radius={[0,6,6,0]}>
                {byRole.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* By Location */}
        <motion.div className="chart-card" initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.2 }}>
          <div className="chart-title">📍 Avg Salary by Location</div>
          <div className="chart-subtitle">Where the highest-paying jobs are</div>
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={byLoc.map(l => ({ ...l, avgL: +(l.avg_salary / 100000).toFixed(1) }))} layout="vertical" margin={{ left: 10 }}>
              <defs>
                <linearGradient id="locGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" horizontal={false} />
              <XAxis type="number" stroke="#475569" tick={{ fontSize:11 }} tickFormatter={v => `₹${v}L`} />
              <YAxis type="category" dataKey="location" stroke="#475569" tick={{ fontSize:11 }} width={100} />
              <Tooltip {...TOOLTIP_STYLE} formatter={v => [`₹${v}L`, 'Avg Salary']} />
              <Bar dataKey="avgL" fill="url(#locGrad)" radius={[0,6,6,0]} name="Avg Salary" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Distribution */}
      <motion.div className="chart-card" initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.3 }}>
        <div className="chart-title">📊 Salary Distribution</div>
        <div className="chart-subtitle">How salaries are spread across the dataset</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={dist}>
            <defs>
              <linearGradient id="distGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7c3aed" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
            <XAxis dataKey="range" stroke="#475569" tick={{ fontSize:12 }} />
            <YAxis stroke="#475569" tick={{ fontSize:11 }} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Bar dataKey="count" fill="url(#distGrad)" radius={[6,6,0,0]} name="Jobs" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
