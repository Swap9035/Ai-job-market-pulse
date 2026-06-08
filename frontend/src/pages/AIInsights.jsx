import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, Brain } from 'lucide-react';
import { fetchAIInsights } from '../api/jobApi';

const SKILLS = [
  'Python', 'Machine Learning', 'SQL', 'Deep Learning',
  'Cloud (AWS/GCP)', 'NLP', 'Data Engineering', 'MLOps',
  'TensorFlow', 'PyTorch', 'Docker', 'Spark',
];

const SKILL_ICONS = {
  'Python': '🐍', 'Machine Learning': '🤖', 'SQL': '🗄️',
  'Deep Learning': '🧠', 'Cloud (AWS/GCP)': '☁️', 'NLP': '💬',
  'Data Engineering': '⚙️', 'MLOps': '🔄', 'TensorFlow': '📐',
  'PyTorch': '🔥', 'Docker': '🐳', 'Spark': '⚡',
};

export default function AIInsights() {
  const [selected, setSelected] = useState('Python');
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const handleAnalyze = async () => {
    setLoading(true); setInsights(null);
    try {
      const res = await fetchAIInsights(selected);
      const entry = { skill: selected, insights: res.data.insights, data: res.data.data, source: res.data.source };
      setInsights(entry);
      setHistory(prev => [entry, ...prev.filter(h => h.skill !== selected)].slice(0, 5));
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <motion.div className="page-header" initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}>
        <h1 className="page-title"><Sparkles size={28} style={{ color:'var(--accent-purple)' }} /> AI Skill Insights</h1>
        <p className="page-subtitle">GPT-powered career intelligence — understand what each skill means for your career</p>
      </motion.div>

      {/* Skill Picker */}
      <motion.div className="card" style={{ marginBottom:24 }} initial={{ opacity:0 }} animate={{ opacity:1 }}>
        <h3 style={{ marginBottom:16, fontWeight:600 }}>🎯 Select a Skill to Analyze</h3>
        <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginBottom:20 }}>
          {SKILLS.map(sk => (
            <button key={sk}
              onClick={() => setSelected(sk)}
              className={`btn ${selected === sk ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize:'0.88rem' }}>
              {SKILL_ICONS[sk] || '🔧'} {sk}
            </button>
          ))}
        </div>
        <button className="btn btn-primary btn-lg" onClick={handleAnalyze} disabled={loading}>
          {loading
            ? <><Loader2 size={18} className="spin" /> Generating insights...</>
            : <><Sparkles size={18} /> Analyze {selected} with AI</>}
        </button>
      </motion.div>

      <div style={{ display:'grid', gridTemplateColumns: history.length > 0 ? '1fr 280px' : '1fr', gap:24 }}>
        {/* Main Insights */}
        <div>
          <AnimatePresence mode="wait">
            {!insights && !loading && (
              <motion.div key="empty" className="card" style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:20, minHeight:300 }} initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                <Brain size={56} style={{ color:'var(--text-muted)' }} />
                <p style={{ color:'var(--text-muted)', textAlign:'center', maxWidth:300 }}>Select a skill above and click "Analyze" to get AI-powered market insights</p>
              </motion.div>
            )}
            {loading && (
              <motion.div key="loading" className="card" style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:20, minHeight:300 }} initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                <div style={{ position:'relative', width:80, height:80 }}>
                  <div style={{ position:'absolute', inset:0, borderRadius:'50%', border:'3px solid rgba(124,58,237,0.2)' }} />
                  <div style={{ position:'absolute', inset:0, borderRadius:'50%', border:'3px solid transparent', borderTopColor:'var(--accent-purple)', animation:'spin 1s linear infinite' }} />
                  <Brain size={32} style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', color:'var(--accent-purple)' }} />
                </div>
                <p style={{ color:'var(--text-secondary)' }}>AI is analyzing {selected}...</p>
              </motion.div>
            )}
            {insights && (
              <motion.div key="result" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
                {/* Header */}
                <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:20 }}>
                  <div style={{ width:56, height:56, borderRadius:14, background:'var(--gradient-1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.8rem' }}>
                    {SKILL_ICONS[insights.skill] || '🔧'}
                  </div>
                  <div>
                    <h2 style={{ fontWeight:700, fontSize:'1.4rem' }}>{insights.skill}</h2>
                    <div style={{ display:'flex', gap:8, marginTop:4 }}>
                      <span className="badge badge-purple">
                        {insights.source === 'openai' ? '✨ GPT-3.5' : '📊 Analysis Engine'}
                      </span>
                      {insights.data && <span className="badge badge-cyan">{insights.data.job_count} jobs</span>}
                      {insights.data && <span className="badge badge-green">{insights.data.demand_pct}% demand</span>}
                    </div>
                  </div>
                </div>

                {/* Insights Box */}
                <div className="insights-box" style={{ marginBottom:20 }}>
                  <div style={{ fontWeight:600, marginBottom:12, display:'flex', alignItems:'center', gap:8 }}>
                    <Sparkles size={16} style={{ color:'var(--accent-purple)' }} /> AI Market Analysis
                  </div>
                  <div className="insights-text">{insights.insights}</div>
                </div>

                {/* Stats Row */}
                {insights.data && (
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
                    {[
                      { label:'Job Count', val: insights.data.job_count?.toLocaleString(), color:'var(--accent-cyan)' },
                      { label:'Market Share', val: `${insights.data.demand_pct}%`, color:'var(--accent-purple)' },
                      { label:'Avg Salary', val: `₹${(insights.data.avg_salary_inr/100000).toFixed(1)}L`, color:'var(--accent-green)' },
                    ].map(({ label, val, color }) => (
                      <div key={label} className="card" style={{ textAlign:'center' }}>
                        <div style={{ fontWeight:800, fontSize:'1.4rem', color }}>{val}</div>
                        <div style={{ color:'var(--text-muted)', fontSize:'0.75rem', marginTop:4 }}>{label}</div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* History Panel */}
        {history.length > 0 && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}>
            <div className="card">
              <div style={{ fontWeight:600, marginBottom:16, fontSize:'0.9rem' }}>📋 Recent Analyses</div>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {history.map(h => (
                  <div key={h.skill}
                    onClick={() => setInsights(h)}
                    style={{ padding:'10px 12px', borderRadius:8, background: insights?.skill === h.skill ? 'rgba(124,58,237,0.15)' : 'var(--bg-surface)', border:`1px solid ${insights?.skill === h.skill ? 'rgba(124,58,237,0.4)' : 'var(--border)'}`, cursor:'pointer', transition:'var(--transition)' }}>
                    <div style={{ fontWeight:600, fontSize:'0.88rem' }}>{SKILL_ICONS[h.skill]} {h.skill}</div>
                    {h.data && <div style={{ color:'var(--text-muted)', fontSize:'0.75rem', marginTop:2 }}>{h.data.job_count} jobs · {h.data.demand_pct}%</div>}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
