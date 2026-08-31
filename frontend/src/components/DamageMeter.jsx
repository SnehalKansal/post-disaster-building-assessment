import React from 'react';
import { ShieldAlert, Gauge } from 'lucide-react';
import { DAMAGE_LEVELS } from '../data/sampleData';
import '../styles/damagemeter.css';

export default function DamageMeter({ currentLevelKey = 'MODERATE_DAMAGE' }) {
  const tiers = [
    { key: 'NO_DAMAGE', label: 'No Damage', short: 'None', pctPosition: 10, classname: 'segment-no-damage', color: '#10b981' },
    { key: 'MINOR_DAMAGE', label: 'Minor', short: 'Minor', pctPosition: 30, classname: 'segment-minor', color: '#eab308' },
    { key: 'MODERATE_DAMAGE', label: 'Moderate', short: 'Moderate', pctPosition: 50, classname: 'segment-moderate', color: '#f97316' },
    { key: 'SEVERE_DAMAGE', label: 'Severe', short: 'Severe', pctPosition: 70, classname: 'segment-severe', color: '#ef4444' },
    { key: 'DESTROYED', label: 'Destroyed', short: 'Destroyed', pctPosition: 90, classname: 'segment-destroyed', color: '#991b1b' },
  ];

  const currentTierIndex = tiers.findIndex(t => t.key === currentLevelKey);
  const activeTier = tiers[currentTierIndex !== -1 ? currentTierIndex : 2];
  const levelInfo = DAMAGE_LEVELS[currentLevelKey] || DAMAGE_LEVELS.MODERATE_DAMAGE;

  return (
    <div className="damage-meter-container">
      <div className="damage-meter-header">
        <div className="damage-meter-title">
          <Gauge size={20} color={activeTier.color} />
          <span>Damage Severity Spectrum</span>
        </div>
        <span 
          className="badge" 
          style={{ 
            backgroundColor: levelInfo.bgColor, 
            color: levelInfo.color,
            borderColor: levelInfo.borderColor,
            borderWidth: '1px',
            borderStyle: 'solid'
          }}
        >
          {levelInfo.statusBadge}
        </span>
      </div>

      <div className="damage-meter-track-wrapper">
        {/* Pointer indicator */}
        <div 
          className="damage-meter-indicator"
          style={{ left: `${activeTier.pctPosition}%` }}
        >
          <div className="meter-pointer-badge">
            <span>CURRENT RESULT</span>
          </div>
          <div className="meter-pointer-arrow" />
        </div>

        {/* 5-tier colored segmented track */}
        <div className="damage-meter-track">
          {tiers.map((tier, idx) => {
            const isCurrent = tier.key === currentLevelKey;
            return (
              <div 
                key={tier.key} 
                className={`damage-meter-segment ${tier.classname} ${isCurrent ? 'active' : 'inactive'}`}
                title={`${tier.label} (${DAMAGE_LEVELS[tier.key].severityRange})`}
              />
            );
          })}
        </div>

        {/* Text labels below */}
        <div className="damage-meter-labels">
          {tiers.map((tier) => {
            const isCurrent = tier.key === currentLevelKey;
            return (
              <div 
                key={tier.key} 
                className={`meter-tier-label ${isCurrent ? 'active-label' : ''}`}
                style={{ color: isCurrent ? tier.color : undefined }}
              >
                {tier.short}
              </div>
            );
          })}
        </div>
      </div>

      {/* Description Callout */}
      <div 
        className="damage-status-callout"
        style={{ 
          backgroundColor: levelInfo.bgColor, 
          borderLeft: `4px solid ${levelInfo.color}`,
          color: 'var(--text-main)'
        }}
      >
        <div 
          className="damage-status-dot" 
          style={{ backgroundColor: levelInfo.color }}
        />
        <div>
          <strong style={{ color: levelInfo.color, marginRight: '6px' }}>
            {levelInfo.label} ({levelInfo.severityRange}):
          </strong>
          <span>{levelInfo.description}</span>
        </div>
      </div>
    </div>
  );
}
