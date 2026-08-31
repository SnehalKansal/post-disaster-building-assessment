import React from 'react';
import { 
  Cpu, 
  Satellite, 
  Layers, 
  Eye, 
  BrainCircuit, 
  Sliders, 
  ScanSearch, 
  ShieldAlert, 
  Sparkles, 
  Zap, 
  BarChart, 
  CheckCircle2,
  ChevronRight,
  Database,
  GitBranch
} from 'lucide-react';
import { ANALYTICS_DATA } from '../data/sampleData';
import '../styles/technology.css';

export default function Technology() {
  const models = ANALYTICS_DATA.modelPerformance;

  const pipelineStages = [
    { title: 'Satellite / Building Image', sub: 'GeoTIFF / PNG 0.3m Res', icon: Satellite },
    { title: 'Image Preprocessing', sub: 'Histogram & Geo Alignment', icon: Sliders },
    { title: 'Computer Vision', sub: 'Edge & Contour Saliency', icon: Eye },
    { title: 'Deep Learning Model', sub: 'ResNet / EfficientNet', icon: Cpu },
    { title: 'Damage Classification', sub: 'Softmax 5-Tier EMS-98', icon: Layers },
    { title: 'Risk Assessment', sub: 'XAI Heatmap & Protocol', icon: ShieldAlert },
  ];

  return (
    <div className="page-wrapper tech-page-wrapper">
      {/* Header Banner */}
      <div className="tech-header-banner">
        <div className="container">
          <div className="badge badge-ai" style={{ marginBottom: '0.75rem' }}>
            <BrainCircuit size={13} /> Deep Learning & Computer Vision
          </div>
          <h1 style={{ fontSize: '2.3rem', fontWeight: '800', color: 'var(--dark-navy)', marginBottom: '0.5rem' }}>
            AI Architecture & Neural Pipeline
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '700px' }}>
            Explore the multi-stage convolutional neural network pipeline, Grad-CAM explainable feature attribution, and quantitative benchmark evaluations powering DisasterVision AI.
          </p>
        </div>
      </div>

      <div className="container">
        {/* 1. Animated Interactive Pipeline Diagram */}
        <div className="tech-pipeline-wrapper">
          <div className="tech-pipeline-header">
            <div className="badge badge-blue" style={{ marginBottom: '0.5rem' }}>
              <Zap size={13} /> End-to-End Inference Pipeline
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#ffffff' }}>
              Multi-Stage Computational Flow
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', maxWidth: '600px', margin: '0.4rem auto 0' }}>
              Data packet propagation from raw satellite sensor acquisition through to certified risk synthesis
            </p>
          </div>

          <div className="pipeline-diagram-flex">
            {pipelineStages.map((stage, idx) => {
              const Icon = stage.icon;
              const isLast = idx === pipelineStages.length - 1;
              return (
                <React.Fragment key={idx}>
                  <div className="pipeline-node-box">
                    <div className="node-icon-circle">
                      <Icon size={20} />
                    </div>
                    <div>
                      <div className="node-title-text">{stage.title}</div>
                      <div className="node-sub-text">{stage.sub}</div>
                    </div>
                  </div>
                  {!isLast && (
                    <div className="pipeline-arrow-connector">
                      <ChevronRight size={24} />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* 2. Deep Dive Architecture Cards */}
        <div className="tech-cards-grid">
          <div className="tech-detail-card">
            <div className="tech-card-icon-wrap" style={{ background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb' }}>
              <Eye size={22} />
            </div>
            <h3 className="tech-card-h3">Computer Vision & Preprocessing</h3>
            <p className="tech-card-desc">
              Executes Sobel edge filters, morphological gradient normalization, and spatial orthorectification. Corrects atmospheric distortion and sensor skew before tensor serialization.
            </p>
          </div>

          <div className="tech-detail-card">
            <div className="tech-card-icon-wrap" style={{ background: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed' }}>
              <Cpu size={22} />
            </div>
            <h3 className="tech-card-h3">Deep Convolutional Networks</h3>
            <p className="tech-card-desc">
              Employs residual skip-connections (ResNet-50) and compound scaled inverted bottleneck convolutions (EfficientNet-B4) pretrained on ImageNet and fine-tuned on disaster datasets.
            </p>
          </div>

          <div className="tech-detail-card">
            <div className="tech-card-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
              <ScanSearch size={22} />
            </div>
            <h3 className="tech-card-h3">Feature Extraction & Geometry</h3>
            <p className="tech-card-desc">
              Extracts high-order geometrical features including roof planar skew angles, facade shear lines, vertical pillar buckling, and perimeter rubble dispersion radii.
            </p>
          </div>

          <div className="tech-detail-card">
            <div className="tech-card-icon-wrap" style={{ background: 'rgba(249, 115, 22, 0.1)', color: '#f97316' }}>
              <Sparkles size={22} />
            </div>
            <h3 className="tech-card-h3">Explainable AI (Grad-CAM)</h3>
            <p className="tech-card-desc">
              Gradient-weighted Class Activation Mapping (Grad-CAM) computes gradients of the damage score with respect to the final convolutional layer, producing transparent thermal heatmaps.
            </p>
          </div>

          <div className="tech-detail-card">
            <div className="tech-card-icon-wrap" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
              <ShieldAlert size={22} />
            </div>
            <h3 className="tech-card-h3">Bayesian Confidence Estimation</h3>
            <p className="tech-card-desc">
              Quantifies epistemic and aleatoric uncertainty through Monte Carlo dropout sampling, ensuring safety-critical decisions are backed by statistical confidence bounds.
            </p>
          </div>

          <div className="tech-detail-card">
            <div className="tech-card-icon-wrap" style={{ background: 'rgba(30, 41, 59, 0.1)', color: '#1e293b' }}>
              <Database size={22} />
            </div>
            <h3 className="tech-card-h3">xBD & SpaceNet Datasets</h3>
            <p className="tech-card-desc">
              Trained on xBD, the world's largest satellite imagery dataset for post-disaster building damage assessment, encompassing over 850,000 building annotations across 19 global disasters.
            </p>
          </div>
        </div>

        {/* 3. Model Benchmark Comparison Table */}
        <div className="benchmark-section">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--dark-navy)' }}>
                Neural Model Benchmark Comparisons
              </h3>
              <p style={{ color: 'var(--slate-muted)', fontSize: '0.88rem' }}>
                Evaluated on the xBD held-out test split (4,500 validation building polygons)
              </p>
            </div>
            <span className="badge badge-success">
              <CheckCircle2 size={13} /> SOTA Verified
            </span>
          </div>

          <table className="benchmark-table">
            <thead>
              <tr>
                <th>Model Architecture</th>
                <th>Classification Accuracy</th>
                <th>Inference Latency</th>
                <th>F1-Score (Macro)</th>
                <th>Parameter Count</th>
              </tr>
            </thead>
            <tbody>
              {models.map((m, idx) => (
                <tr key={idx}>
                  <td>
                    <strong style={{ color: 'var(--dark-navy)' }}>{m.model}</strong>
                  </td>
                  <td>
                    <span className="badge badge-blue" style={{ fontFamily: 'JetBrains Mono' }}>
                      {m.accuracy}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'JetBrains Mono', color: 'var(--slate-muted)' }}>
                    {m.latency}
                  </td>
                  <td>
                    <strong style={{ color: '#10b981', fontFamily: 'JetBrains Mono' }}>
                      {m.f1Score}
                    </strong>
                  </td>
                  <td style={{ color: 'var(--slate-muted)', fontFamily: 'JetBrains Mono' }}>
                    {m.params}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
