import { Link, useLocation } from 'react-router-dom';
import { Brain, BarChart3, TrendingUp, Sparkles, DollarSign, Target } from 'lucide-react';

const NAV_LINKS = [
  { path: '/',           label: 'Dashboard',  icon: BarChart3   },
  { path: '/skills',     label: 'Skills',     icon: TrendingUp  },
  { path: '/salary',     label: 'Salary',     icon: DollarSign  },
  { path: '/predictor',  label: 'Predictor',  icon: Target,  badge: 'ML' },
  { path: '/gap',        label: 'Gap Analyzer', icon: Target   },
  { path: '/ai-insights',label: 'AI Insights',icon: Sparkles, badge: 'AI' },
];

export default function Navbar() {
  const { pathname } = useLocation();
  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">
        <Brain size={22} className="logo-icon" />
        <span>AI Job Market <span className="gradient-text">Pulse</span></span>
      </Link>
      <div className="nav-links">
        {NAV_LINKS.map(({ path, label, icon: Icon, badge }) => (
          <Link key={path} to={path} className={`nav-link ${pathname === path ? 'active' : ''}`}>
            <Icon size={15} />
            <span className="nav-text">{label}</span>
            {badge && <span className="nav-badge">{badge}</span>}
          </Link>
        ))}
      </div>
    </nav>
  );
}
