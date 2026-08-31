import React from 'react';
import { 
  CheckCircle2, 
  Loader2, 
  Circle, 
  Sparkles, 
  Cpu, 
  Clock, 
  Scan, 
  Layers, 
  ShieldAlert, 
  Sliders 
} from 'lucide-react';
import '../styles/analysisprogress.css';

export default function AnalysisProgress({ 
  progress = 0, 
  imageSrc, 
  selectedModelName = 'ResNet-50 (Deep Residual)',
  analysisType = 'Building Damage Assessment'
}) {
  const steps = [
    { 
      id: 1, 
      title: 'Image Ingestion', 
      desc: 'Metadata & spatial registration verified', 
      threshold: 15,
      icon: CheckCircle2 
    },
    { 
      id: 2, 
      title: 'Image Preprocessing', 
      desc: 'Histogram stretch & orthorectification', 
      threshold: 35,
      icon: Sliders 
    },
    { 
      id: 3, 
      title: 'Building Detection', 
      desc: 'Bounding polygon segmentation', 
      threshold: 55,
      icon: Layers 
    },
    { 
      id: 4, 
      title: 'Feature Extraction', 
      desc: 'Crack & roof shear tensor calculation', 
      threshold: 75,
      icon: Scan 
    },
    { 
      id: 5, 
      title: 'Neural Inference', 
      desc: 'EMS-98 damage matrix classification', 
      threshold: 90,
      icon: Cpu 
    },
    { 
      id: 6, 
      title: 'Report Generation', 
      desc: 'Synthesizing recommendations & triage', 
      threshold: 100,
      icon: ShieldAlert 
    },
  ];

  // Calculate estimated seconds remaining
  const remainingSeconds = Math.max(0, Math.ceil((100 - progress) / 30));

  return (
    <div className="analysis-progress-card">
      <div className="analysis-progress-glow" />

      {/* Header */}
      <div className="progress-header">
        <div className="progress-badge-ai">
          <Sparkles size={14} />
          <span>AI Inference Pipeline Active</span>
        </div>
        <h2 className="progress-main-title">Analyzing Imagery in Progress</h2>
        <div className="progress-model-tag">
          <Cpu size={15} color="#60a5fa" />
          <span>Model: <strong>{selectedModelName}</strong></span>
          <span>•</span>
          <span>{analysisType}</span>
        </div>
      </div>

      {/* Main Meter & Percentage */}
      <div className="progress-meter-block">
        <div className="progress-stats-row">
          <div className="progress-pct-number">
            {Math.min(100, Math.floor(progress))}%
          </div>
          <div className="progress-eta-text">
            <Clock size={16} />
            <span>
              {progress >= 100 
                ? 'Finalizing assessment results...' 
                : `Estimated time remaining: ~${remainingSeconds}s`}
            </span>
          </div>
        </div>

        <div className="progress-bar-track">
          <div 
            className="progress-bar-fill"
            style={{ width: `${Math.min(100, Math.max(5, progress))}%` }}
          />
        </div>
      </div>

      {/* 6-Stage Progress Cards Grid */}
      <div className="progress-steps-grid">
        {steps.map((step) => {
          let status = 'pending';
          if (progress >= step.threshold) {
            status = 'completed';
          } else if (progress >= (step.threshold - 20)) {
            status = 'active';
          }

          return (
            <div 
              key={step.id} 
              className={`progress-step-item ${status}`}
            >
              <div className={`step-icon-wrap ${status}`}>
                {status === 'completed' ? (
                  <CheckCircle2 size={16} />
                ) : status === 'active' ? (
                  <Loader2 size={16} className="spin-animation" style={{ animation: 'spin 1.2s linear infinite' }} />
                ) : (
                  <Circle size={16} />
                )}
              </div>
              <div>
                <div className="step-text-title">{step.title}</div>
                <div className="step-text-desc">{step.desc}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Neural Laser Scanning Visualizer */}
      <div className="progress-preview-visualizer">
        {imageSrc ? (
          <img src={imageSrc} alt="Analyzing preview" className="progress-preview-img" />
        ) : (
          <div style={{ width: '100%', height: '100%', background: '#090d16' }} />
        )}
        <div className="laser-scanner-beam" />
        <div className="laser-scan-grid-overlay" />
        <div className="scan-live-telemetry">
          <span>TENSOR: [BATCH: 1, CHANNELS: 3, 512x512]</span>
          <span>LATENCY: 120FPS ACCEL</span>
          <span>FEATURE_MAP: CONV5_BLOCK3</span>
        </div>
      </div>
    </div>
  );
}
