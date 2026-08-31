import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Shield, HeartHandshake, FileText, Sparkles, ExternalLink } from 'lucide-react';
import '../styles/footer.css';

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-grid">
        {/* Brand Column */}
        <div className="footer-brand-col">
          <div className="footer-brand-header">
            <div className="brand-icon-wrapper" style={{ width: '36px', height: '36px' }}>
              <Building2 size={20} />
            </div>
            <div className="footer-brand-title">DisasterVision AI</div>
          </div>
          <p className="footer-brand-desc">
            Next-generation AI platform for rapid post-disaster building damage classification, structural risk assessment, and automated emergency reporting.
          </p>
          <div className="footer-badge-row">
            <span className="badge badge-ai">
              <Sparkles size={12} /> Deep Learning v2.4
            </span>
            <span className="badge badge-blue">EMS-98 Compliant</span>
          </div>
        </div>

        {/* Platform Links */}
        <div>
          <h4 className="footer-heading">Platform</h4>
          <ul className="footer-links-list">
            <li><Link to="/" className="footer-link">Home Overview</Link></li>
            <li><Link to="/upload" className="footer-link">Upload & Analyze</Link></li>
            <li><Link to="/dashboard" className="footer-link">Analytics Dashboard</Link></li>
            <li><Link to="/technology" className="footer-link">AI Architecture</Link></li>
            <li><Link to="/about" className="footer-link">Capstone Details</Link></li>
          </ul>
        </div>

        {/* Damage Tiers */}
        <div>
          <h4 className="footer-heading">Damage Tiers</h4>
          <ul className="footer-links-list">
            <li><span className="footer-link" style={{ color: '#10b981' }}>● Grade 1: No Damage</span></li>
            <li><span className="footer-link" style={{ color: '#eab308' }}>● Grade 2: Minor Damage</span></li>
            <li><span className="footer-link" style={{ color: '#f97316' }}>● Grade 3: Moderate Damage</span></li>
            <li><span className="footer-link" style={{ color: '#ef4444' }}>● Grade 4: Severe Damage</span></li>
            <li><span className="footer-link" style={{ color: '#991b1b' }}>● Grade 5: Destroyed</span></li>
          </ul>
        </div>

        {/* Academic / Capstone info */}
        <div>
          <h4 className="footer-heading">Project Specs</h4>
          <ul className="footer-links-list">
            <li><span className="footer-link">Final Year Project 2026</span></li>
            <li><span className="footer-link">React + Vite + PyTorch</span></li>
            <li><span className="footer-link">xBD Dataset & Maxar</span></li>
            <li><span className="footer-link">Sub-5s Neural Inference</span></li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom-bar">
        <div className="footer-copyright">
          © {new Date().getFullYear()} DisasterVision AI Platform. Designed for Rapid Humanitarian Disaster Response.
        </div>
        <div className="footer-capsule-tag">
          Final Year Engineering Project Presentation Edition
        </div>
      </div>
    </footer>
  );
}
