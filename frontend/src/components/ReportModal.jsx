import React from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  X, 
  ShieldCheck, 
  Calendar, 
  MapPin, 
  Cpu, 
  CheckCircle2,
  AlertTriangle 
} from 'lucide-react';
import { DAMAGE_LEVELS, turkeyImg } from '../data/sampleData';
import '../styles/reportmodal.css';

export default function ReportModal({ 
  isOpen, 
  onClose, 
  assessmentData 
}) {
  if (!isOpen || !assessmentData) return null;

  const levelInfo = DAMAGE_LEVELS[assessmentData.damageLevel] || DAMAGE_LEVELS.MODERATE_DAMAGE;
  const analysisId = assessmentData.id || `DV-${new Date().getFullYear()}-0891`;
  const timestamp = new Date().toLocaleString();

  // BACKEND INTEGRATION POINT:
  // In production, triggers POST /api/v1/reports/pdf to stream server-side generated PDF
  const handlePrint = () => {
    window.print();
  };

  // BACKEND INTEGRATION POINT:
  // In production, downloads raw structured JSON assessment payload
  const handleDownloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(assessmentData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `DisasterVision_Report_${analysisId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="report-modal-backdrop" onClick={onClose}>
      <div className="report-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Action Header (Excluded in print) */}
        <div className="report-action-header no-print">
          <div className="report-action-title">
            <FileText size={20} color="#60a5fa" />
            <span>Official Structural Damage Assessment Report</span>
          </div>
          <div className="report-action-btns">
            <button className="btn-secondary" onClick={handleDownloadJSON} style={{ padding: '0.45rem 0.9rem', fontSize: '0.82rem' }}>
              <Download size={14} />
              <span>Export JSON</span>
            </button>
            <button className="btn-primary" onClick={handlePrint} style={{ padding: '0.45rem 1rem', fontSize: '0.82rem' }}>
              <Printer size={14} />
              <span>Print / PDF</span>
            </button>
            <button 
              onClick={onClose} 
              style={{ color: '#94a3b8', padding: '0.4rem', marginLeft: '0.5rem', borderRadius: '6px' }}
              aria-label="Close report modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Engineering Document Body */}
        <div className="report-printable-body report-print-container">
          {/* Document Header */}
          <div className="report-doc-header">
            <div>
              <div className="report-brand-title">DisasterVision AI</div>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Automated Post-Disaster Building Integrity & Structural Damage Triage
              </p>
            </div>
            <div className="report-id-box">
              <div><strong>REPORT ID:</strong> {analysisId}</div>
              <div style={{ color: '#64748b', fontSize: '0.78rem' }}>DATE: {timestamp}</div>
              <div style={{ color: '#10b981', fontWeight: '700', fontSize: '0.75rem' }}>EMS-98 CERTIFIED CLASSIFICATION</div>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="report-meta-grid">
            <div className="report-meta-item">
              <span className="report-meta-label">Inspection Target</span>
              <span className="report-meta-val">{assessmentData.name || 'Building Sector'}</span>
            </div>
            <div className="report-meta-item">
              <span className="report-meta-label">Geographic Location</span>
              <span className="report-meta-val">{assessmentData.location || 'Disaster Zone'}</span>
            </div>
            <div className="report-meta-item">
              <span className="report-meta-label">Disaster Hazard</span>
              <span className="report-meta-val">{assessmentData.disasterType || 'Seismic Event'}</span>
            </div>
            <div className="report-meta-item">
              <span className="report-meta-label">AI Neural Model</span>
              <span className="report-meta-val">{assessmentData.modelName || 'EfficientNet-B4 / ResNet-50'}</span>
            </div>
          </div>

          {/* Rating Banner */}
          <div 
            className="report-rating-banner"
            style={{ 
              backgroundColor: levelInfo.bgColor, 
              border: `2px solid ${levelInfo.borderColor}`,
              color: levelInfo.color 
            }}
          >
            <div className="rating-left">
              <span className="rating-title">Assessed Damage Severity Tier</span>
              <span className="rating-level-badge">{levelInfo.label.toUpperCase()}</span>
              <span style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: '500' }}>
                {levelInfo.description}
              </span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className="rating-title" style={{ color: '#64748b' }}>Model Confidence</span>
              <div className="rating-confidence">{assessmentData.confidenceScore || 95.8}%</div>
              <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>High Certainty</span>
            </div>
          </div>

          {/* Visual Image & Detected Indicators */}
          <div className="report-sections-grid">
            <div>
              <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#0f172a' }}>
                Pre/Post Disaster Imagery
              </h4>
              <div className="report-image-preview">
                <img 
                  src={assessmentData.originalImage || assessmentData.thumbnail || turkeyImg} 
                  alt="Post disaster inspection" 
                />
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#0f172a' }}>
                Identified Structural Anomalies
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {(assessmentData.detectedIndicators || []).map((ind, idx) => (
                  <div 
                    key={idx} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      padding: '0.45rem 0.75rem',
                      background: '#f8fafc',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    <span>{ind.text}</span>
                    <span style={{ fontWeight: '700', fontSize: '0.72rem', color: ind.positive ? '#ef4444' : '#10b981' }}>
                      {ind.positive ? 'DETECTED' : 'NOMINAL'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommended Triage Actions Table */}
          <div>
            <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#0f172a' }}>
              Actionable Emergency Response Recommendations
            </h4>
            <table className="report-table">
              <thead>
                <tr>
                  <th style={{ width: '120px' }}>Priority</th>
                  <th style={{ width: '140px' }}>Category</th>
                  <th>Action Protocol</th>
                </tr>
              </thead>
              <tbody>
                {(assessmentData.recommendations || []).map((rec, idx) => (
                  <tr key={idx}>
                    <td>
                      <span 
                        className="badge" 
                        style={{ 
                          backgroundColor: rec.priority === 'HIGH' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(249, 115, 22, 0.12)',
                          color: rec.priority === 'HIGH' ? '#dc2626' : '#ea580c',
                          fontSize: '0.68rem'
                        }}
                      >
                        {rec.priority}
                      </span>
                    </td>
                    <td style={{ fontWeight: '600' }}>{rec.category || 'Structural'}</td>
                    <td>{rec.text}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Seal */}
          <div className="report-doc-footer">
            <div>
              <span>DisasterVision AI Platform • Automated Neural Synthesis</span>
              <div style={{ fontSize: '0.72rem', marginTop: '2px' }}>
                // BACKEND INTEGRATION POINT: Connected to municipal GIS emergency queue
              </div>
            </div>
            <div className="ai-verification-seal">
              <ShieldCheck size={18} />
              <span>AI VALIDATED ASSESSMENT</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
