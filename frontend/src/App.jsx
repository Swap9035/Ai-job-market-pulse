import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard  from './pages/Dashboard';
import Skills     from './pages/Skills';
import Salary     from './pages/Salary';
import Predictor  from './pages/Predictor';
import GapAnalyzer from './pages/GapAnalyzer';
import AIInsights  from './pages/AIInsights';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Navbar />
        <main className="page-content" style={{ marginTop: 'var(--navbar-h)', padding: '32px', maxWidth: 1400, marginLeft: 'auto', marginRight: 'auto', width: '100%' }}>
          <Routes>
            <Route path="/"            element={<Dashboard />}   />
            <Route path="/skills"      element={<Skills />}      />
            <Route path="/salary"      element={<Salary />}      />
            <Route path="/predictor"   element={<Predictor />}   />
            <Route path="/gap"         element={<GapAnalyzer />} />
            <Route path="/ai-insights" element={<AIInsights />}  />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
