import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BarChart3, 
  TrendingUp, 
  ShieldAlert, 
  CheckCircle2, 
  FileText, 
  Search, 
  Filter, 
  Sparkles, 
  Building2, 
  Eye, 
  ExternalLink,
  Activity
} from 'lucide-react';
import { ANALYTICS_DATA, DAMAGE_LEVELS } from '../data/sampleData';

import StatCard from '../components/StatCard';
import DisasterMap from '../components/DisasterMap';
import ReportModal from '../components/ReportModal';

import '../styles/dashboard.css';

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [selectedReportItem, setSelectedReportItem] = useState(null);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const kpis = ANALYTICS_DATA.kpis;
  const damageDistribution = ANALYTICS_DATA.damageDistribution;
  const monthlyTrends = ANALYTICS_DATA.monthlyTrends;
  const recentAnalyses = ANALYTICS_DATA.recentAnalyses;

  // Filter recent analyses
  const filteredAnalyses = recentAnalyses.filter((item) => {
    const matchesSearch = item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.imageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.disaster.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = severityFilter === 'ALL' || item.damageLevelKey === severityFilter;
    return matchesSearch && matchesFilter;
  });

  const handleOpenReport = (item) => {
    setSelectedReportItem({
      id: item.id,
      name: item.imageName,
      location: item.location,
      disasterType: item.disaster,
      damageLevel: item.damageLevelKey,
      confidenceScore: parseFloat(item.confidence),
      modelName: item.model,
      thumbnail: item.thumbnail,
      originalImage: item.thumbnail,
      detectedIndicators: [
        { text: 'Structural deformation detected', positive: true, severity: 'high' },
        { text: 'Debris pattern around perimeter verified', positive: true, severity: 'medium' },
      ],
      recommendations: [
        { priority: 'HIGH', text: 'On-ground structural engineering verification', category: 'Safety' },
        { priority: 'MEDIUM', text: 'Municipal evacuation mapping update', category: 'GIS' },
      ]
    });
    setIsReportOpen(true);
  };

  // Find max monthly analysis for chart scaling
  const maxMonthlyVal = Math.max(...monthlyTrends.map(m => m.analyses));

  return (
    <div className="page-wrapper dashboard-page-wrapper">
      {/* Header Banner */}
      <div className="dashboard-header-banner">
        <div className="container">
          <div className="badge badge-blue" style={{ marginBottom: '0.75rem' }}>
            <Activity size={13} /> Real-Time Disaster Intelligence
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--dark-navy)', marginBottom: '0.5rem' }}>
            Disaster Analytics & Mission Dashboard
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '650px' }}>
            Comprehensive geospatial statistics, damage severity breakdowns, and historical assessment logs across active disaster sectors.
          </p>
        </div>
      </div>

      <div className="container">
        {/* Top 4 KPI Cards */}
        <div className="dashboard-top-row">
          <StatCard 
            title="Total Analyses"
            value={kpis.totalAnalyses}
            icon={Building2}
            iconColor="#2563eb"
            iconBg="rgba(37, 99, 235, 0.1)"
            subtext="From 42 disaster zones"
            trend="+14% this week"
            glowColor="#2563eb"
          />
          <StatCard 
            title="Damage Cases Detected"
            value={kpis.damageCasesDetected}
            icon={ShieldAlert}
            iconColor="#f97316"
            iconBg="rgba(249, 115, 22, 0.1)"
            subtext="67.5% of total inputs"
            trend="Active Triage"
            glowColor="#f97316"
          />
          <StatCard 
            title="Critical Emergency Cases"
            value={kpis.criticalCases}
            icon={ShieldAlert}
            iconColor="#ef4444"
            iconBg="rgba(239, 68, 68, 0.1)"
            subtext="Immediate USAR dispatch"
            trend="Priority 1"
            trendType="critical"
            glowColor="#ef4444"
          />
          <StatCard 
            title="Average Confidence"
            value={kpis.averageConfidence}
            icon={Sparkles}
            iconColor="#7c3aed"
            iconBg="rgba(124, 58, 237, 0.1)"
            subtext="Ensemble Bayesian score"
            trend="High Precision"
            glowColor="#7c3aed"
          />
        </div>

        {/* Charts Grid: Damage Distribution & Monthly Trends */}
        <div className="charts-grid-row">
          {/* 1. Damage Distribution Chart */}
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <div className="dashboard-card-title">
                <BarChart3 size={18} color="var(--primary-blue)" />
                <span>Damage Severity Distribution</span>
              </div>
              <span className="badge badge-blue">EMS-98 Tiers</span>
            </div>

            <div className="donut-distribution-list">
              {damageDistribution.map((dist) => (
                <div key={dist.label} className="dist-bar-item">
                  <div className="dist-bar-meta">
                    <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>
                      {dist.label}
                    </span>
                    <span style={{ fontWeight: '700', color: dist.color }}>
                      {dist.count} cases ({dist.percentage}%)
                    </span>
                  </div>
                  <div className="dist-bar-track">
                    <div 
                      className="dist-bar-fill" 
                      style={{ width: `${dist.percentage}%`, backgroundColor: dist.color }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Analysis Volume Trends */}
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <div className="dashboard-card-title">
                <TrendingUp size={18} color="#10b981" />
                <span>Monthly Assessment Volume & Critical Spikes</span>
              </div>
              <span className="badge badge-success">6-Month Trend</span>
            </div>

            {/* Custom SVG Bar Chart */}
            <div className="trend-chart-container">
              {monthlyTrends.map((month) => {
                const totalHeight = (month.analyses / maxMonthlyVal) * 140;
                const critHeight = (month.critical / maxMonthlyVal) * 140;
                return (
                  <div key={month.month} className="trend-bar-col">
                    <div className="trend-bars-pair">
                      <div 
                        className="trend-bar-total" 
                        style={{ height: `${totalHeight}px` }} 
                        title={`Total: ${month.analyses} analyses`}
                      />
                      <div 
                        className="trend-bar-critical" 
                        style={{ height: `${critHeight}px` }} 
                        title={`Critical: ${month.critical} cases`}
                      />
                    </div>
                    <div className="trend-col-label">{month.month}</div>
                  </div>
                );
              })}
            </div>

            <div className="trend-legend-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '12px', height: '12px', background: '#2563eb', borderRadius: '3px' }} />
                <span>Total Analyses Ingested</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '12px', height: '12px', background: '#ef4444', borderRadius: '3px' }} />
                <span>Critical / Severe Collapses</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Interactive GIS Disaster Impact Map Section */}
        <div style={{ marginBottom: '3rem' }}>
          <DisasterMap />
        </div>

        {/* 4. Recent Analyses Table Section */}
        <div className="recent-analyses-section">
          <div className="table-toolbar">
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--dark-navy)' }}>
                Recent Structural Damage Assessments
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--slate-muted)' }}>
                Live feed of uploaded satellite and aerial imagery processed through the neural pipeline
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              {/* Search Bar */}
              <input 
                type="text"
                placeholder="Search location, file, or disaster..."
                className="table-search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              {/* Filter Select */}
              <select 
                className="table-filter-select"
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
              >
                <option value="ALL">All Damage Tiers</option>
                <option value="NO_DAMAGE">No Damage</option>
                <option value="MINOR_DAMAGE">Minor Damage</option>
                <option value="MODERATE_DAMAGE">Moderate Damage</option>
                <option value="SEVERE_DAMAGE">Severe Damage</option>
                <option value="DESTROYED">Destroyed</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="data-table-container">
            <table className="modern-data-table">
              <thead>
                <tr>
                  <th>Target Imagery</th>
                  <th>Location & Event</th>
                  <th>Damage Level</th>
                  <th>Model Confidence</th>
                  <th>Date & Time</th>
                  <th>Architecture</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAnalyses.map((row) => {
                  const level = DAMAGE_LEVELS[row.damageLevelKey] || DAMAGE_LEVELS.MODERATE_DAMAGE;
                  return (
                    <tr key={row.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div className="table-thumb-wrap">
                            <img src={row.thumbnail} alt={row.imageName} className="table-thumb-img" />
                          </div>
                          <div>
                            <strong style={{ color: 'var(--dark-navy)', display: 'block' }}>
                              {row.imageName}
                            </strong>
                            <span style={{ fontSize: '0.72rem', color: 'var(--slate-muted)', fontFamily: 'JetBrains Mono' }}>
                              ID: {row.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: '600', color: 'var(--dark-navy)' }}>{row.location}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--slate-muted)' }}>{row.disaster}</div>
                      </td>

                      <td>
                        <span 
                          className="badge"
                          style={{
                            backgroundColor: level.bgColor,
                            color: level.color,
                            border: `1px solid ${level.borderColor}`
                          }}
                        >
                          ● {level.label}
                        </span>
                      </td>

                      <td>
                        <strong style={{ color: 'var(--dark-navy)', fontFamily: 'JetBrains Mono' }}>
                          {row.confidence}
                        </strong>
                      </td>

                      <td style={{ color: 'var(--slate-muted)', fontSize: '0.82rem' }}>
                        {row.date}
                      </td>

                      <td>
                        <span className="badge badge-ai" style={{ fontSize: '0.72rem' }}>
                          {row.model}
                        </span>
                      </td>

                      <td>
                        <button 
                          className="btn-secondary" 
                          style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem' }}
                          onClick={() => handleOpenReport(row)}
                        >
                          <FileText size={14} />
                          <span>View Report</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Engineering Assessment Report Modal */}
      <ReportModal 
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        assessmentData={selectedReportItem}
      />
    </div>
  );
}
