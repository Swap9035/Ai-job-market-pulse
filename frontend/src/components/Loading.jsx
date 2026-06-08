import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ text = 'Loading data...' }) => (
  <div className="loading-center">
    <Loader2 size={36} className="spin" style={{ color: 'var(--accent-purple)' }} />
    <span>{text}</span>
  </div>
);

export const SkeletonCard = () => (
  <div className="skeleton skeleton-card" />
);

export const SkeletonChart = () => (
  <div className="skeleton skeleton-chart" />
);
