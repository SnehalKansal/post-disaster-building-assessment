import React, { useState } from 'react';
import { Eye, Layers, Maximize2, Sparkles, MapPin, Camera, Info } from 'lucide-react';
import { turkeyImg } from '../data/sampleData';
import '../styles/imageoverlayviewer.css';

export default function ImageOverlayViewer({ 
  originalImage, 
  overlayImage, 
  heatmapBoxes = [],
  locationName = 'Disaster Inspection Sector',
  sensorType = 'Satellite Orthomosaic 0.3m'
}) {
  const [viewMode, setViewMode] = useState('overlay'); // 'original' | 'overlay'
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Default fallback boxes if none provided
  const boxes = heatmapBoxes.length > 0 ? heatmapBoxes : [
    { x: 35, y: 28, width: 32, height: 28, intensity: 'high', label: 'Roof Failure (94%)' },
    { x: 20, y: 58, width: 26, height: 25, intensity: 'medium', label: 'Wall Spalling (88%)' },
  ];

  return (
    <div className="image-viewer-card">
      {/* Top Toolbar */}
      <div className="viewer-toolbar">
        <div className="viewer-mode-switch">
          <button 
            className={`mode-btn ${viewMode === 'original' ? 'active' : ''}`}
            onClick={() => setViewMode('original')}
          >
            <Eye size={15} />
            <span>Original Image</span>
          </button>
          <button 
            className={`mode-btn ${viewMode === 'overlay' ? 'active' : ''}`}
            onClick={() => setViewMode('overlay')}
          >
            <Layers size={15} />
            <span>AI Damage Overlay</span>
          </button>
        </div>

        <div className="viewer-meta-tags">
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={13} color="var(--primary-blue)" />
            {locationName}
          </span>
          <span>•</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Camera size={13} />
            {sensorType}
          </span>
        </div>
      </div>

      {/* Main Canvas with Image + Overlays */}
      <div className="image-canvas-container">
        <img 
          src={originalImage || turkeyImg} 
          alt="Satellite damage analysis view"
          className={`main-image-display ${viewMode === 'overlay' ? 'overlay-mode' : ''}`}
        />

        {/* Dynamic AI Heatmap & Detection Bounding Boxes */}
        {viewMode === 'overlay' && (
          <>
            <div className="heatmap-layer" />
            
            {boxes.map((box, idx) => (
              <div 
                key={idx}
                className={`bounding-box-item intensity-${box.intensity || 'high'}`}
                style={{
                  top: `${box.y}%`,
                  left: `${box.x}%`,
                  width: `${box.width}%`,
                  height: `${box.height}%`,
                }}
              >
                <div className="bounding-box-tag">
                  {box.label || `Anomaly Region #${idx + 1}`}
                </div>
              </div>
            ))}

            {/* In-Canvas Overlay Legend */}
            <div className="overlay-legend-panel">
              <div className="overlay-legend-item">
                <span className="legend-color-box" style={{ background: '#ef4444' }} />
                <span>Critical Fracture</span>
              </div>
              <div className="overlay-legend-item">
                <span className="legend-color-box" style={{ background: '#f97316' }} />
                <span>Shear Zone</span>
              </div>
              <div className="overlay-legend-item">
                <span className="legend-color-box" style={{ background: '#eab308' }} />
                <span>Debris Field</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Backend Annotation Note */}
      <div className="backend-placeholder-notice">
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Info size={14} color="var(--primary-blue)" />
          {viewMode === 'overlay' 
            ? 'Visualizing multi-spectral damage feature activations & EMS-98 bounding polygons' 
            : 'Unprocessed high-resolution sensor imagery'}
        </span>
        <span className="badge badge-ai">
          <Sparkles size={11} /> Grad-CAM Heatmap
        </span>
      </div>
    </div>
  );
}
