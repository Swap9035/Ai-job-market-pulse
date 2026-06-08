import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Loader2, TrendingUp, AlertCircle } from 'lucide-react';
import { predictSalary, fetchModelInfo } from '../api/jobApi';
import { useEffect } from 'react';

const ROLES = ['Data Scientist','Machine Learning Engineer','Data Analyst','Data Engineer',
  'AI Engineer','Business Intelligence Analyst','NLP Engineer','Computer Vision Engineer',
  'MLOps Engineer','Research Scientist','Deep Learning Engineer'];

const EXP_LEVELS = ['Entry Level','Mid Level','Senior Level','Lead','Director'];
const COMPANY_SIZES = ['Startup (1-50)','Small (51-200)','Medium (201-1000)','Large (1001-5000)','Enterprise (5000+)'];
const REMOTE_TYPES = ['Remote','Hybrid','On-site'];
const LOCATIONS = ['Bangalore','Hyderabad','Mumbai','Delhi','Pune','Chennai','San Francisco','New York','Seattle','Singapore'];

export default function Predictor() {
  const [form, setForm] = useState({
    job_title: 'Data Scientist',
    experience_level: 'Mid Level',
    company_size: 'Large (1001-5000)',
    remote_type: 'Hybrid',
    location: 'Bangalore',
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modelInfo, setModelInfo] = useState(null);

  useEffect(() => { fetchModelInfo().then(r => setModelInfo(r.data)); }, []);

  const handlePredict = async () => {
    setLoading(true); setResult(null);
    try {
      const res = await predictSalary(form);
      setResult(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fmtINR = n => `₹${(n / 100000).toFixed(1)}L`;
  const fmtUSD = n => `$${n.toLocaleString()}`;

  return (
    <div>
      <motion.div className="page-header" initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}>
        <h1 className="page-title"><Target size={28} style={{ color:'var(--accent-green)' }} /> ML Salary Predictor</h1>
        <p className="page-subtitle">Powered by a Random Forest model trained on 4,000+ real job records</p>
      </motion.div>

      {/* Model Info Banner */}
      {modelInfo && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="card" style={{ marginBottom:24, display:'flex', gap:32, flexWrap:'wrap' }}>
          {[
            { label: 'Algorithm', val: modelInfo.algorithm },
            { label: 'R² Score', val: modelInfo.r2_score, color: 'var(--accent-green)' },
            { label: 'Training Samples', val: modelInfo.training_samples?.toLocaleString() },
            { label: 'MAE', val: `₹${(modelInfo.mae_inr/100000).toFixed(1)}L` },
            { label: 'Features Used', val: modelInfo.features?.length },
          ].map(({ label, val, color }) => (
            <div key={label}>
              <div style={{ color:'var(--text-muted)', fontSize:'0.75rem', textTransform:'uppercase', letterSpacing:'0.05em' }}>{label}</div>
              <div style={{ fontWeight:700, fontSize:'1rem', color: color || 'var(--accent-cyan)', marginTop:2 }}>{val}</div>
            </div>
          ))}
        </motion.div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
        {/* Input Form */}
        <motion.div className="card" initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }}>
          <h3 style={{ marginBottom:24, fontSize:'1.1rem', fontWeight:600 }}>🔧 Configure Your Profile</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
            {[
              { label:'Job Role', key:'job_title', opts: ROLES },
              { label:'Experience Level', key:'experience_level', opts: EXP_LEVELS },
              { label:'Company Size', key:'company_size', opts: COMPANY_SIZES },
              { label:'Work Model', key:'remote_type', opts: REMOTE_TYPES },
              { label:'Location', key:'location', opts: LOCATIONS },
            ].map(({ label, key, opts }) => (
              <div className="form-group" key={key}>
                <label className="form-label">{label}</label>
                <select className="form-select" value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}>
                  {opts.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
            <button className="btn btn-primary btn-lg" onClick={handlePredict} disabled={loading} style={{ marginTop:8 }}>
              {loading ? <><Loader2 size={18} className="spin" /> Predicting...</> : '🤖 Predict Salary'}
            </button>
          </div>
        </motion.div>

        {/* Result */}
        <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }}>
          <AnimatePresence mode="wait">
            {!result && !loading && (
              <motion.div key="empty" className="card" style={{ height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16, minHeight:400 }} initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                <TrendingUp size={48} style={{ color:'var(--text-muted)' }} />
                <p style={{ color:'var(--text-muted)', textAlign:'center' }}>Fill in your profile and click<br/>"Predict Salary" to get your estimate</p>
              </motion.div>
            )}
            {loading && (
              <motion.div key="loading" className="card" style={{ height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16, minHeight:400 }} initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                <Loader2 size={48} className="spin" style={{ color:'var(--accent-purple)' }} />
                <p style={{ color:'var(--text-secondary)' }}>Running Random Forest model...</p>
              </motion.div>
            )}
            {result && !result.error && (
              <motion.div key="result" initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }}>
                <div className="predictor-result" style={{ marginBottom:16 }}>
                  <div style={{ color:'var(--text-secondary)', fontSize:'0.85rem', marginBottom:8 }}>Predicted Annual Salary</div>
                  <div className="predicted-amount">{fmtINR(result.predicted_salary_inr)}</div>
                  <div className="predicted-range">{fmtUSD(result.predicted_salary_usd)} USD · Range: {fmtINR(result.range_low_inr)} – {fmtINR(result.range_high_inr)}</div>
                  <div style={{ marginTop:12 }}><span className="badge badge-green">R² = {result.model_r2}</span>&nbsp;<span className="badge badge-purple">{result.algorithm}</span></div>
                </div>
                <div className="card">
                  <div style={{ fontWeight:600, marginBottom:16 }}>📊 Your Profile Summary</div>
                  {Object.entries(result.inputs).map(([k, v]) => (
                    <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--border)', fontSize:'0.88rem' }}>
                      <span style={{ color:'var(--text-secondary)', textTransform:'capitalize' }}>{k.replace(/_/g,' ')}</span>
                      <span style={{ color:'var(--accent-cyan)', fontWeight:500 }}>{v}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
            {result?.error && (
              <motion.div key="error" className="card" style={{ display:'flex', gap:12, alignItems:'center', color:'var(--accent-red)' }} initial={{ opacity:0 }} animate={{ opacity:1 }}>
                <AlertCircle /><span>{result.error}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
