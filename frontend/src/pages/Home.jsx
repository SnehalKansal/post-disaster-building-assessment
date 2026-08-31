import React from 'react';
import { Link } from 'react-router-dom';
import { 
  UploadCloud, 
  LayoutDashboard, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Cpu, 
  Satellite, 
  Layers, 
  Sliders, 
  Scan, 
  ShieldAlert, 
  FileText, 
  Activity, 
  Zap, 
  BarChart, 
  MapPin 
} from 'lucide-react';
import { PIPELINE_STEPS, ANALYTICS_DATA, turkeyImg } from '../data/sampleData';
import '../styles/home.css';

export default function Home() {
  const iconMap = {
    UploadCloud: UploadCloud,
    Sliders: Sliders,
    Cpu: Cpu,
    ShieldAlert: ShieldAlert,
    FileText: FileText,
  };

  return (
    <div className="page-wrapper">
      {/* 1. Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-grid">
            {/* Left Content */}
            <div className="hero-left-content">
              <div className="section-tag">
                <Sparkles size={14} />
                <span>Next-Gen Computer Vision Platform</span>
              </div>

              <h1 className="hero-headline">
                <span className="text-gradient">AI-Powered</span> Disaster Damage Assessment
              </h1>

              <p className="hero-subtitle">
                Analyze satellite and building imagery using artificial intelligence to rapidly assess structural damage, quantify collapse risks, and support immediate humanitarian disaster response.
              </p>

              <div className="hero-cta-group">
                <Link to="/upload" className="btn-primary" style={{ padding: '0.85rem 1.8rem', fontSize: '1rem' }}>
                  <UploadCloud size={18} />
                  <span>Upload Image</span>
                </Link>
                <Link to="/dashboard" className="btn-secondary" style={{ padding: '0.85rem 1.8rem', fontSize: '1rem' }}>
                  <LayoutDashboard size={18} />
                  <span>Explore Dashboard</span>
                </Link>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginTop: '0.5rem', fontSize: '0.85rem', color: '#64748b' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <ShieldCheck size={16} color="#10b981" /> EMS-98 Standard
                </span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Zap size={16} color="#eab308" /> Sub-5s Inference
                </span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Satellite size={16} color="#3b82f6" /> Maxar & Drone Ready
                </span>
              </div>
            </div>

            {/* Right: AI Visualization Live Card */}
            <div className="hero-ai-card">
              <div className="ai-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="live-dot" />
                  <strong style={{ color: '#ffffff' }}>LIVE INFERENCE PREVIEW</strong>
                </div>
                <span>xBD Multi-Spectral Sensor</span>
              </div>

              <div className="ai-card-visual-viewport">
                <img 
                  src={turkeyImg} 
                  alt="Satellite disaster zone"
                  className="ai-card-sat-img" 
                />
                {/* Scanning Laser Beam */}
                <div className="hero-laser-scan" />

                {/* Animated Bounding Box */}
                <div className="hero-bounding-box-1">
                  <div className="hero-box-tag">CRITICAL COLLAPSE (97.4%)</div>
                </div>
              </div>

              <div className="ai-card-telemetry-footer">
                <div className="ai-pipeline-flow-mini">
                  <span className="flow-node">Satellite Image</span>
                  <span>→</span>
                  <span className="flow-node active-node">AI Processing</span>
                  <span>→</span>
                  <span className="flow-node" style={{ color: '#ef4444' }}>Damage Detected</span>
                </div>
                <span className="badge badge-danger" style={{ fontSize: '0.7rem' }}>
                  Tier: Severe Damage
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Live Statistics Row */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid-row">
            <div className="stat-item-box">
              <div className="stat-number">95%</div>
              <div className="stat-label">Model Confidence</div>
            </div>
            <div className="stat-item-box" style={{ borderLeftColor: '#7c3aed' }}>
              <div className="stat-number">10,000+</div>
              <div className="stat-label">Images Analyzed</div>
            </div>
            <div className="stat-item-box" style={{ borderLeftColor: '#10b981' }}>
              <div className="stat-number">&lt; 5 sec</div>
              <div className="stat-label">Average Analysis Time</div>
            </div>
            <div className="stat-item-box" style={{ borderLeftColor: '#f59e0b' }}>
              <div className="stat-number">24/7</div>
              <div className="stat-label">System Availability</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Presentation Mode Section: "How DisasterVision AI Works" */}
      <section className="pipeline-section">
        <div className="container">
          <div className="section-header-center">
            <div className="section-tag">
              <Cpu size={14} />
              <span>College Capstone Presentation Flow</span>
            </div>
            <h2 className="section-main-title">How DisasterVision AI Works</h2>
            <p className="section-main-desc">
              An end-to-end automated pipeline executing image preprocessing, convolutional feature extraction, and Bayesian risk classification in under 5 seconds.
            </p>
          </div>

          <div className="pipeline-cards-grid">
            {PIPELINE_STEPS.map((step) => {
              const IconComp = iconMap[step.icon] || Cpu;
              return (
                <div key={step.step} className="pipeline-card">
                  <div className="pipeline-step-badge">{step.step}</div>
                  <div className="pipeline-icon-circle">
                    <IconComp size={22} />
                  </div>
                  <h3 className="pipeline-card-title">{step.title}</h3>
                  <p className="pipeline-card-desc">{step.description}</p>
                  <div className="pipeline-card-tag">{step.tag}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Core Features Grid */}
      <section className="features-section">
        <div className="container">
          <div className="section-header-center">
            <div className="section-tag">
              <Layers size={14} />
              <span>Platform Capabilities</span>
            </div>
            <h2 className="section-main-title">Engineered for Rapid Response</h2>
            <p className="section-main-desc">
              Combines state-of-the-art deep neural networks with geospatial intelligence to replace slow manual inspections during crisis triage.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-box" style={{ background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb' }}>
                <Satellite size={24} />
              </div>
              <h3 className="feature-card-title">Satellite & Drone Imagery</h3>
              <p className="feature-card-p">
                Seamlessly ingests sub-meter satellite orthomosaics from Maxar, Planet, and NOAA, as well as ultra-high-resolution RGB drone surveys.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box" style={{ background: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed' }}>
                <Cpu size={24} />
              </div>
              <h3 className="feature-card-title">Multi-Model Ensemble</h3>
              <p className="feature-card-p">
                Flexibly toggle between ResNet-50 for deep residual extraction, EfficientNet-B4 for compound precision, and lightweight DamageNet CNN.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                <Sparkles size={24} />
              </div>
              <h3 className="feature-card-title">Explainable AI (XAI)</h3>
              <p className="feature-card-p">
                Provides transparent visual Grad-CAM heatmap overlays and structural anomaly indicators (roof fractures, wall shears, debris perimeters).
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                <ShieldAlert size={24} />
              </div>
              <h3 className="feature-card-title">Actionable Triage Protocol</h3>
              <p className="feature-card-p">
                Generates prioritized emergency recommendations with safety perimeters, utility cut-offs, and USAR canine dispatch alerts.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                <MapPin size={24} />
              </div>
              <h3 className="feature-card-title">GIS Disaster Mapping</h3>
              <p className="feature-card-p">
                Aggregates building classifications across geographic sectors into interactive risk zones (Critical, High, Moderate, and Low).
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box" style={{ background: 'rgba(30, 41, 59, 0.1)', color: '#1e293b' }}>
                <FileText size={24} />
              </div>
              <h3 className="feature-card-title">Automated PDF Reports</h3>
              <p className="feature-card-p">
                Generates official, print-ready Engineering Assessment Reports with certified validation stamps for municipal and insurance archives.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CTA Banner Section */}
      <section className="cta-banner-section">
        <div className="container">
          <div className="cta-banner-card">
            <div className="cta-banner-glow" />
            <div style={{ position: 'relative', zIndex: 2 }}>
              <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem', color: '#ffffff' }}>
                Ready to Evaluate Disaster Imagery?
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: '600px' }}>
                Upload your building or satellite photo now or try our one-click real disaster test presets.
              </p>
            </div>
            <div style={{ position: 'relative', zIndex: 2, display: 'flex', gap: '1rem' }}>
              <Link to="/upload" className="btn-primary" style={{ padding: '0.85rem 1.8rem', fontSize: '1rem' }}>
                <span>Start Assessment</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
