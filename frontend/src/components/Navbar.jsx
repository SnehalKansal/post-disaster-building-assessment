import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { 
  Building2, 
  UploadCloud, 
  LayoutDashboard, 
  Cpu, 
  Info, 
  ArrowRight, 
  Menu, 
  X, 
  ShieldCheck,
  Activity
} from 'lucide-react';
import '../styles/navbar.css';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: Building2 },
    { path: '/upload', label: 'Upload & Analyze', icon: UploadCloud },
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/technology', label: 'AI Technology', icon: Cpu },
    { path: '/about', label: 'About Project', icon: Info },
  ];

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        {/* Brand Logo */}
        <Link to="/" className="brand-logo" onClick={() => setMobileMenuOpen(false)}>
          <div className="brand-icon-wrapper">
            <Building2 size={22} />
            <div className="brand-radar-pulse" title="AI Inference System Online" />
          </div>
          <div className="brand-text-block">
            <div className="brand-name">
              DisasterVision <span>AI</span>
            </div>
            <div className="brand-subtitle">
              Damage Assessment SaaS
            </div>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav aria-label="Main Navigation">
          <ul className="nav-links-list">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `nav-link-item ${isActive ? 'active' : ''}`
                    }
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Navbar Right Actions */}
        <div className="navbar-actions">
          <div className="nav-system-status">
            <span className="live-dot" />
            <span>AI Models Live</span>
          </div>

          <Link to="/upload" className="nav-cta-btn">
            <span>Start Analysis</span>
            <ArrowRight size={15} />
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button 
            className="mobile-menu-btn" 
            onClick={toggleMobileMenu}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer">
          <ul className="mobile-nav-links">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `mobile-nav-link ${isActive ? 'active' : ''}`
                    }
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
          <Link 
            to="/upload" 
            className="btn-primary" 
            style={{ width: '100%' }}
            onClick={() => setMobileMenuOpen(false)}
          >
            <UploadCloud size={18} />
            <span>Start New Analysis</span>
          </Link>
        </div>
      )}
    </header>
  );
}
