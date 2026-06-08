import { motion } from 'framer-motion';

const StatCard = ({ title, value, change, icon: Icon, gradient, iconBg, iconColor }) => (
  <motion.div
    className="stat-card"
    style={{ '--card-gradient': gradient, '--icon-bg': iconBg, '--icon-color': iconColor }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.02 }}
    transition={{ duration: 0.3 }}
  >
    <div className="stat-icon-wrap">
      <Icon size={20} />
    </div>
    <div className="stat-value">{value}</div>
    <div className="stat-label">{title}</div>
    {change && <div className={`stat-change ${change.startsWith('+') ? 'up' : 'neutral'}`}>{change}</div>}
  </motion.div>
);

export default StatCard;
