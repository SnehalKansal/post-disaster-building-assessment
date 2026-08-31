import React from 'react';
import { BarChart3, Percent } from 'lucide-react';
import '../styles/probabilitybar.css';

export default function ProbabilityBar({ 
  probabilities = {
    noDamage: 5,
    minorDamage: 12,
    moderateDamage: 58,
    severeDamage: 20,
    destroyed: 5,
  } 
}) {
  const items = [
    { key: 'noDamage', label: 'No Damage', val: probabilities.noDamage || 0, color: '#10b981' },
    { key: 'minorDamage', label: 'Minor Damage', val: probabilities.minorDamage || 0, color: '#eab308' },
    { key: 'moderateDamage', label: 'Moderate Damage', val: probabilities.moderateDamage || 0, color: '#f97316' },
    { key: 'severeDamage', label: 'Severe Damage', val: probabilities.severeDamage || 0, color: '#ef4444' },
    { key: 'destroyed', label: 'Destroyed', val: probabilities.destroyed || 0, color: '#991b1b' },
  ];

  // Find max for the highest classification tag
  const highestVal = Math.max(...items.map(i => i.val));

  return (
    <div className="probability-card">
      <div className="probability-header">
        <div className="probability-title">
          <BarChart3 size={19} color="var(--primary-blue)" />
          <span>Damage Probability Distribution</span>
        </div>
        <span className="badge badge-blue">Softmax Output</span>
      </div>

      <div className="probability-rows-list">
        {items.map((item) => {
          const isHighest = item.val === highestVal && item.val > 0;
          return (
            <div key={item.key} className="prob-row">
              <div className="prob-label-row">
                <div className="prob-tier-name">
                  <span className="prob-color-pill" style={{ backgroundColor: item.color }} />
                  <span>{item.label}</span>
                  {isHighest && <span className="prob-highest-tag">Predicted Tier</span>}
                </div>
                <span className="prob-percentage-val" style={{ color: item.color }}>
                  {item.val.toFixed(1)}%
                </span>
              </div>
              <div className="prob-bar-track">
                <div 
                  className="prob-bar-fill" 
                  style={{ 
                    width: `${Math.min(100, item.val)}%`, 
                    backgroundColor: item.color,
                    boxShadow: isHighest ? `0 0 10px ${item.color}80` : 'none'
                  }} 
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
