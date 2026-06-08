import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Plus, X, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { analyzeGap } from '../api/jobApi';

const ROLES = ['Data Scientist','Machine Learning Engineer','Data Analyst','Data Engineer',
  'AI Engineer','MLOps Engineer','NLP Engineer'];

const SUGGESTED_SKILLS = [
  'Python','SQL','Machine Learning','Deep Learning','TensorFlow','PyTorch',
  'Pandas','NumPy','Statistics','Excel','Tableau','Power BI','Spark','Airflow',
  'AWS','Docker','Kubernetes','MLflow','NLP','Transformers','BERT','dbt','Git',
];

export default function GapAnalyzer() {
  const [targetRole, setTargetRole] = useState('Data Scientist');
  const [selectedSkills, setSelectedSkills] = useState(['Python', 'SQL', 'Pandas']);
  const [customSkill, setCustomSkill] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const toggleSkill = (skill) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const addCustom = () => {
    if (customSkill.trim() && !selectedSkills.includes(customSkill.trim())) {
      setSelectedSkills(prev => [...prev, customSkill.trim()]);
      setCustomSkill('');
    }
  };

  const handleAnalyze = async () => {
    setLoading(true); setResult(null);
    const res = await analyzeGap({ skills: selectedSkills, target_role: targetRole });
    setResult(res.data);
    setLoading(false);
  };

  const scoreColor = (s) => s >= 80 ? 'var(--accent-green)' : s >= 60 ? 'var(--accent-cyan)' : s >= 40 ? 'var(--accent-orange)' : 'var(--accent-red)';
  const circumference = 2 * Math.PI * 54;

  return (
    <div>
      <motion.div className="page-header" initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}>
        <h1 className="page-title"><Target size={28} style={{ color:'var(--accent-purple)' }} /> Skills Gap Analyzer</h1>
        <p className="page-subtitle">Compare your current skills against what the market demands for your target role</p>
      </motion.div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, marginBottom:24 }}>
        {/* Config Panel */}
        <motion.div className="card" initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }}>
          <h3 style={{ marginBottom:20, fontWeight:600 }}>🎯 Your Target Role</h3>
          <div className="form-group" style={{ marginBottom:24 }}>
            <label className="form-label">I want to become a...</label>
            <select className="form-select" value={targetRole} onChange={e => setTargetRole(e.target.value)}>
              {ROLES.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>

          <h4 style={{ marginBottom:12, color:'var(--text-secondary)', fontSize:'0.85rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' }}>Skills You Have</h4>
          <div className="skill-tags">
            {SUGGESTED_SKILLS.map(sk => (
              <span key={sk} className={`skill-tag ${selectedSkills.includes(sk) ? 'selected' : ''}`}
                onClick={() => toggleSkill(sk)}>
                {selectedSkills.includes(sk) ? <CheckCircle size={12} /> : <Plus size={12} />}
                {sk}
              </span>
            ))}
          </div>

          {/* Custom skill */}
          <div style={{ display:'flex', gap:8, marginTop:16 }}>
            <input className="form-input" placeholder="Add custom skill..." value={customSkill}
              onChange={e => setCustomSkill(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCustom()} />
            <button className="btn btn-outline btn-sm" onClick={addCustom}>Add</button>
          </div>

          {/* Selected preview */}
          {selectedSkills.length > 0 && (
            <div style={{ marginTop:16 }}>
              <div style={{ fontSize:'0.8rem', color:'var(--text-muted)', marginBottom:8 }}>Your skills ({selectedSkills.length}):</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {selectedSkills.map(sk => (
                  <span key={sk} style={{ background:'rgba(6,182,212,0.15)', border:'1px solid rgba(6,182,212,0.3)', color:'var(--accent-cyan)', padding:'3px 10px', borderRadius:20, fontSize:'0.78rem', display:'flex', alignItems:'center', gap:4, cursor:'pointer' }}
                    onClick={() => toggleSkill(sk)}>
                    {sk} <X size={10} />
                  </span>
                ))}
              </div>
            </div>
          )}

          <button className="btn btn-primary btn-lg" onClick={handleAnalyze} disabled={loading} style={{ marginTop:24, width:'100%' }}>
            {loading ? <><Loader2 size={18} className="spin" /> Analyzing...</> : '🔍 Analyze My Gap'}
          </button>
        </motion.div>

        {/* Results Panel */}
        <AnimatePresence mode="wait">
          {!result && !loading && (
            <motion.div key="empty" className="card" style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16, minHeight:350 }} initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
              <Target size={48} style={{ color:'var(--text-muted)' }} />
              <p style={{ color:'var(--text-muted)', textAlign:'center' }}>Select your skills and target role,<br/>then click Analyze</p>
            </motion.div>
          )}
          {loading && (
            <motion.div key="loading" className="card" style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16, minHeight:350 }} initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
              <Loader2 size={48} className="spin" style={{ color:'var(--accent-purple)' }} />
              <p style={{ color:'var(--text-secondary)' }}>Analyzing skill gap...</p>
            </motion.div>
          )}
          {result && !result.error && (
            <motion.div key="result" initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }}>
              {/* Score Ring */}
              <div className="card" style={{ marginBottom:16, textAlign:'center' }}>
                <div className="score-ring-wrap">
                  <div className="score-ring">
                    <svg width="140" height="140" viewBox="0 0 140 140">
                      <circle cx="70" cy="70" r="54" fill="none" stroke="var(--bg-surface)" strokeWidth="12" />
                      <motion.circle cx="70" cy="70" r="54" fill="none"
                        stroke={scoreColor(result.match_score)} strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: circumference - (result.match_score / 100) * circumference }}
                        transition={{ duration: 1.2, ease: 'easeOut' }}
                      />
                    </svg>
                    <div className="score-ring-text">
                      <span className="score-number" style={{ color: scoreColor(result.match_score) }}>{result.match_score}%</span>
                      <span className="score-label">Match</span>
                    </div>
                  </div>
                  <div style={{ fontWeight:700, fontSize:'1.1rem' }}>{result.readiness}</div>
                  <div style={{ color:'var(--text-secondary)', fontSize:'0.85rem' }}>for {result.target_role}</div>
                </div>
                <div style={{ display:'flex', gap:24, justifyContent:'center', marginTop:16, flexWrap:'wrap' }}>
                  <div style={{ textAlign:'center' }}><div style={{ fontWeight:700, color:'var(--accent-green)' }}>{result.available_jobs}</div><div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>Jobs Available</div></div>
                  <div style={{ textAlign:'center' }}><div style={{ fontWeight:700, color:'var(--accent-cyan)' }}>₹{result.avg_salary_inr ? (result.avg_salary_inr/100000).toFixed(1) : 'N/A'}L</div><div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>Avg Salary</div></div>
                </div>
              </div>

              {/* Missing Skills */}
              {result.missing_skills?.length > 0 && (
                <div className="card" style={{ marginBottom:16, borderColor:'rgba(239,68,68,0.3)' }}>
                  <div style={{ fontWeight:600, marginBottom:12, display:'flex', alignItems:'center', gap:8 }}>
                    <XCircle size={16} style={{ color:'var(--accent-red)' }} /> Skills to Learn ({result.missing_skills.length})
                  </div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                    {result.missing_skills.map(sk => (
                      <span key={sk} style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', color:'var(--accent-red)', padding:'4px 12px', borderRadius:20, fontSize:'0.82rem' }}>{sk}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched Skills */}
              <div className="card" style={{ borderColor:'rgba(16,185,129,0.3)' }}>
                <div style={{ fontWeight:600, marginBottom:12, display:'flex', alignItems:'center', gap:8 }}>
                  <CheckCircle size={16} style={{ color:'var(--accent-green)' }} /> Skills You Already Have ({result.matched_skills?.length})
                </div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                  {result.matched_skills?.map(sk => (
                    <span key={sk} style={{ background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.3)', color:'var(--accent-green)', padding:'4px 12px', borderRadius:20, fontSize:'0.82rem', textTransform:'capitalize' }}>{sk}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
