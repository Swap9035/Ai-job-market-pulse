import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Skills from './pages/Skills';
import JobList from './pages/JobList';
import SkillGap from './pages/SkillGap';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/skills" element={<Skills />} />
            <Route path="/jobs" element={<JobList />} />
            <Route path="/skill-gap" element={<SkillGap />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;