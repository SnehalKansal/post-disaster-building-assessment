import React from 'react';
import '../styles/statcard.css';

export default function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  iconColor = '#2563eb', 
  iconBg = 'rgba(37, 99, 235, 0.1)', 
  subtext, 
  trend,
  trendType = 'up',
  glowColor = '#2563eb'
}) {
  return (
    <div className="stat-card">
      <div 
        className="stat-card-glow-bg" 
        style={{ backgroundColor: glowColor }} 
      />
      <div className="stat-card-header">
        <span className="stat-card-title">{title}</span>
        <div 
          className="stat-card-icon-wrap" 
          style={{ backgroundColor: iconBg, color: iconColor }}
        >
          {Icon && <Icon size={20} />}
        </div>
      </div>
      <div className="stat-card-value">{value}</div>
      {subtext && (
        <div className="stat-card-subtext">
          {trend && (
            <span className={trendType === 'critical' ? 'stat-card-trend-critical' : 'stat-card-trend-up'}>
              {trend}
            </span>
          )}
          <span>{subtext}</span>
        </div>
      )}
    </div>
  );
}
