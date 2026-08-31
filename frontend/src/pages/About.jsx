import React from 'react';
import { 
  Building2, 
  Layers, 
  Cpu, 
  Globe, 
  ShieldCheck, 
  Terminal, 
  Sparkles, 
  FileCode2, 
  Server, 
  Database, 
  ArrowRight, 
  CheckCircle2,
  Users,
  ChevronRight,
  GraduationCap
} from 'lucide-react';
import '../styles/about.css';

export default function About() {
  const archNodes = [
    { title: 'User / First Responder', sub: 'Satellite & Drone Ingestion', icon: Users },
    { title: 'React + Vite Frontend', sub: 'Responsive SaaS Interface', icon: FileCode2 },
    { title: 'Backend API Gateway', sub: 'FastAPI / Python Service', icon: Server },
    { title: 'AI / ML Inference', sub: 'ResNet / EfficientNet Engine', icon: Cpu },
    { title: 'Damage Prediction', sub: 'EMS-98 5-Tier Softmax', icon: Layers },
    { title: 'Analytics Dashboard', sub: 'GIS Mapping & Reports', icon: Globe },
  ];

  return (
    <div className="page-wrapper about-page-wrapper">
      {/* Header Banner */}
      <div className="about-header-banner">
        <div className="container">
          <div className="badge badge-blue" style={{ marginBottom: '0.75rem' }}>
            <GraduationCap size={14} /> Final Year Capstone Project Brief
          </div>
          <h1 style={{ fontSize: '2.3rem', fontWeight: '800', color: 'var(--dark-navy)', marginBottom: '0.5rem' }}>
            About DisasterVision AI
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '700px' }}>
            An academic and practical breakthrough in automated disaster reconnaissance, bridging modern computer vision with humanitarian crisis response.
          </p>
        </div>
      </div>

      <div className="container">
        {/* 1. Problem Statement & Proposed Solution */}
        <div className="about-intro-grid">
          <div className="about-statement-card">
            <div>
              <div className="badge badge-ai" style={{ marginBottom: '0.5rem' }}>
                <Sparkles size={13} /> Project Definition
              </div>
              <h2 className="about-h2">
                AI-Powered Post-Disaster Building Damage Assessment System
              </h2>
            </div>

            {/* Problem Box */}
            <div className="problem-box">
              <div className="about-box-title" style={{ color: '#ef4444' }}>
                Problem Statement:
              </div>
              <p style={{ fontSize: '0.92rem', color: 'var(--dark-navy)', lineHeight: '1.6' }}>
                Manual post-disaster damage assessment is notoriously slow, dangerously hazardous to human field teams, labor-intensive, and prone to subjective variance. During natural crises such as earthquakes and hurricanes, rescue delays cost critical lives.
              </p>
            </div>

            {/* Solution Box */}
            <div className="solution-box">
              <div className="about-box-title" style={{ color: '#10b981' }}>
                Our AI Solution:
              </div>
              <p style={{ fontSize: '0.92rem', color: 'var(--dark-navy)', lineHeight: '1.6' }}>
                DisasterVision AI employs deep convolutional neural networks and computer vision to analyze high-resolution pre- and post-disaster satellite and drone imagery. It delivers sub-5-second structural damage classification, EMS-98 tier stratification, and instant emergency dispatch prioritization.
              </p>
            </div>
          </div>

          {/* Quick Specifications */}
          <div className="about-statement-card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--dark-navy)' }}>
              Project Objectives & Key Goals
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.9rem' }}>
                <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span><strong>Instant Triage:</strong> Reduce structural reconnaissance from days to seconds using automated neural inference.</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.9rem' }}>
                <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span><strong>Standardized Damage Scale:</strong> Comply with international European Macroseismic Scale (EMS-98) damage tiers.</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.9rem' }}>
                <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span><strong>Explainable AI (XAI):</strong> Provide Grad-CAM activation overlays to ensure transparency for structural engineers.</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.9rem' }}>
                <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span><strong>Actionable Reporting:</strong> Auto-generate formal engineering assessment certificates for municipal and insurance use.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* 2. Technology Stack Matrix */}
        <div className="tech-stack-section">
          <div style={{ marginBottom: '1.75rem' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--dark-navy)' }}>
              Technology Stack Matrix
            </h2>
            <p style={{ color: 'var(--slate-muted)', fontSize: '0.9rem' }}>
              Production-grade tools and libraries integrated across frontend, backend, and machine learning
            </p>
          </div>

          <div className="tech-stack-grid">
            <div className="stack-card">
              <div className="stack-header">
                <div className="stack-icon-box" style={{ background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb' }}>
                  <FileCode2 size={22} />
                </div>
                <div className="stack-title">Frontend Layer</div>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                High-performance modern single page application with glassmorphic styling and zero bloated CSS frameworks.
              </p>
              <div className="stack-tags-list">
                <span className="stack-tag">React 19</span>
                <span className="stack-tag">Vite 6</span>
                <span className="stack-tag">JavaScript / JSX</span>
                <span className="stack-tag">React Router DOM</span>
                <span className="stack-tag">Lucide Icons</span>
                <span className="stack-tag">Pure Modern CSS</span>
              </div>
            </div>

            <div className="stack-card">
              <div className="stack-header">
                <div className="stack-icon-box" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                  <Server size={22} />
                </div>
                <div className="stack-title">Backend & APIs</div>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Asynchronous microservices facilitating high-throughput geospatial image decoding and model serving.
              </p>
              <div className="stack-tags-list">
                <span className="stack-tag">Python 3.11</span>
                <span className="stack-tag">FastAPI</span>
                <span className="stack-tag">Uvicorn</span>
                <span className="stack-tag">GDAL / Rasterio</span>
                <span className="stack-tag">GeoJSON / GIS</span>
                <span className="stack-tag">ReportLab PDF</span>
              </div>
            </div>

            <div className="stack-card">
              <div className="stack-header">
                <div className="stack-icon-box" style={{ background: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed' }}>
                  <Cpu size={22} />
                </div>
                <div className="stack-title">Artificial Intelligence</div>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Deep residual and compound scaled convolutional vision models fine-tuned on disaster datasets.
              </p>
              <div className="stack-tags-list">
                <span className="stack-tag">PyTorch / Torchvision</span>
                <span className="stack-tag">ResNet-50</span>
                <span className="stack-tag">EfficientNet-B4</span>
                <span className="stack-tag">OpenCV</span>
                <span className="stack-tag">Grad-CAM XAI</span>
                <span className="stack-tag">xBD Dataset</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. System Architecture Diagram */}
        <div className="architecture-section">
          <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto' }}>
            <div className="badge badge-blue" style={{ marginBottom: '0.5rem' }}>
              <Layers size={13} /> System Architecture Flowchart
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#ffffff' }}>
              End-to-End Data Lifecycle
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
              How information flows from field data acquisition through deep learning inference to the emergency dispatch dashboard
            </p>
          </div>

          <div className="arch-flow-flex">
            {archNodes.map((node, idx) => {
              const Icon = node.icon;
              const isLast = idx === archNodes.length - 1;
              return (
                <React.Fragment key={idx}>
                  <div className="arch-node">
                    <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
                      <Icon size={18} />
                    </div>
                    <div className="arch-node-title">{node.title}</div>
                    <div className="arch-node-sub">{node.sub}</div>
                  </div>
                  {!isLast && (
                    <div style={{ color: '#60a5fa', display: 'flex', alignItems: 'center' }}>
                      <ChevronRight size={22} />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
