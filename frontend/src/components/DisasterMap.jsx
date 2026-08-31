import React, { useState } from 'react';
import { 
  Map as MapIcon, 
  Layers, 
  MapPin, 
  AlertTriangle, 
  ShieldAlert, 
  Info, 
  Crosshair, 
  Radio 
} from 'lucide-react';
import { ANALYTICS_DATA } from '../data/sampleData';
import '../styles/disastermap.css';

export default function DisasterMap() {
  const [selectedZoneId, setSelectedZoneId] = useState('zone-a');
  const [activeLayer, setActiveLayer] = useState('satellite'); // 'satellite' | 'terrain' | 'zones'
  const [hoveredZone, setHoveredZone] = useState(null);

  const zones = ANALYTICS_DATA.riskZones;

  // Mock map pixel coordinates
  const pinPositions = {
    'zone-a': { top: '38%', left: '46%' },
    'zone-b': { top: '62%', left: '32%' },
    'zone-c': { top: '48%', left: '72%' },
    'zone-d': { top: '24%', left: '68%' },
  };

  return (
    <div className="disaster-map-wrapper">
      {/* Header Bar */}
      <div className="map-header-bar">
        <div className="map-title-block">
          <div className="map-title">
            <MapIcon size={20} color="var(--primary-blue)" />
            <span>GIS Disaster Impact & Damage Risk Map</span>
          </div>
          <span className="map-subtitle">
            Geospatial overlay of seismic epicenters, flood inundation zones, and affected building clusters
          </span>
        </div>

        <div className="map-controls-row">
          <button 
            className={`map-layer-btn ${activeLayer === 'satellite' ? 'active' : ''}`}
            onClick={() => setActiveLayer('satellite')}
          >
            Satellite View
          </button>
          <button 
            className={`map-layer-btn ${activeLayer === 'zones' ? 'active' : ''}`}
            onClick={() => setActiveLayer('zones')}
          >
            Hazard Heatmap
          </button>
        </div>
      </div>

      {/* Main Map Viewport with Radar & Pins */}
      <div className="map-canvas-viewport">
        {/* Animated Radar Scanning Sweep */}
        <div className="map-radar-sweep" />

        {/* Legend Box */}
        <div className="map-hud-legend">
          <div className="hud-legend-title">Risk Severity Legend</div>
          <div className="hud-legend-grid">
            <div className="hud-legend-row">
              <span className="hud-legend-dot" style={{ backgroundColor: '#ef4444' }} />
              <span>Critical Zone (80-100% Collapse)</span>
            </div>
            <div className="hud-legend-row">
              <span className="hud-legend-dot" style={{ backgroundColor: '#f59e0b' }} />
              <span>High Risk (60-80% Damaged)</span>
            </div>
            <div className="hud-legend-row">
              <span className="hud-legend-dot" style={{ backgroundColor: '#f97316' }} />
              <span>Moderate Risk (40-60%)</span>
            </div>
            <div className="hud-legend-row">
              <span className="hud-legend-dot" style={{ backgroundColor: '#10b981' }} />
              <span>Low Risk (0-40% Stable)</span>
            </div>
          </div>
        </div>

        {/* Interactive Pins */}
        {zones.map((zone) => {
          const pos = pinPositions[zone.id] || { top: '50%', left: '50%' };
          const isSelected = selectedZoneId === zone.id;
          const isHovered = hoveredZone === zone.id;

          return (
            <div
              key={zone.id}
              className="map-pin-marker"
              style={{ top: pos.top, left: pos.left, color: zone.color }}
              onClick={() => setSelectedZoneId(zone.id)}
              onMouseEnter={() => setHoveredZone(zone.id)}
              onMouseLeave={() => setHoveredZone(null)}
            >
              <div 
                className="pin-core-circle"
                style={{ backgroundColor: zone.color }}
              >
                {zone.id.split('-')[1].toUpperCase()}
                <div className="pin-pulse-ring" />
              </div>

              {/* Tooltip Card on Hover or Active Selection */}
              {(isSelected || isHovered) && (
                <div className="pin-tooltip-card">
                  <div className="tooltip-zone-name">{zone.name}</div>
                  <div className="tooltip-affected-num">
                    {zone.affectedBuildings} Buildings
                  </div>
                  <div className="tooltip-sub">
                    Tier: <strong style={{ color: zone.color }}>{zone.riskTier}</strong> • {zone.coordinates}
                  </div>
                  <div className="tooltip-sub" style={{ marginTop: '4px', color: '#e2e8f0' }}>
                    Dispatch: {zone.recommendedDispatch}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Affected Zones Summary Grid */}
      <div className="affected-zones-grid">
        {zones.map((zone) => {
          const isSelected = selectedZoneId === zone.id;
          return (
            <div
              key={zone.id}
              className={`zone-summary-card ${isSelected ? 'selected' : ''}`}
              style={{ borderLeftColor: zone.color }}
              onClick={() => setSelectedZoneId(zone.id)}
            >
              <div className="zone-card-title">{zone.name}</div>
              <div className="zone-card-count" style={{ color: zone.color }}>
                {zone.affectedBuildings} Affected
              </div>
              <div className="zone-card-desc">
                {zone.severity} • {zone.avgConfidence} Avg Conf.
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
