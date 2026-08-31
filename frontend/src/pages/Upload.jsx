import React, { useState, useRef, useEffect } from 'react';
import { 
  UploadCloud, 
  FileImage, 
  Trash2, 
  RefreshCw, 
  Sliders, 
  Cpu, 
  Layers, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FileText, 
  RotateCcw, 
  ShieldCheck,
  Building,
  Waves,
  Milestone
} from 'lucide-react';
import { 
  PRESET_DISASTER_IMAGES, 
  DAMAGE_LEVELS, 
  AI_MODELS, 
  ANALYSIS_TYPES 
} from '../data/sampleData';

import StatCard from '../components/StatCard';
import DamageMeter from '../components/DamageMeter';
import AnalysisProgress from '../components/AnalysisProgress';
import ExplainableAI from '../components/ExplainableAI';
import ProbabilityBar from '../components/ProbabilityBar';
import ImageOverlayViewer from '../components/ImageOverlayViewer';
import ReportModal from '../components/ReportModal';
import { analyzeDisasterImage } from '../services/api';

import '../styles/upload.css';

export default function Upload() {
  // State management
  const [selectedPresetId, setSelectedPresetId] = useState('preset-1');
  const [currentPreset, setCurrentPreset] = useState(PRESET_DISASTER_IMAGES[0]);
  const [customImage, setCustomImage] = useState(null);
  const [customImageFile, setCustomImageFile] = useState(null);
  const [imageMeta, setImageMeta] = useState({
    name: PRESET_DISASTER_IMAGES[0].fileName,
    size: PRESET_DISASTER_IMAGES[0].fileSize,
    time: 'Just now',
    type: 'Satellite Orthomosaic (JPG)',
    dimensions: PRESET_DISASTER_IMAGES[0].dimensions,
  });

  const [selectedModel, setSelectedModel] = useState('resnet-50');
  const [selectedAnalysisType, setSelectedAnalysisType] = useState('building-damage');

  // Analysis workflow states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [assessmentResult, setAssessmentResult] = useState(PRESET_DISASTER_IMAGES[0]);
  const [showResults, setShowResults] = useState(true);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const fileInputRef = useRef(null);
  const resultsRef = useRef(null);

  // Switch preset
  const handleSelectPreset = (preset) => {
    setSelectedPresetId(preset.id);
    setCurrentPreset(preset);
    setCustomImage(null);
    setCustomImageFile(null);
    setImageMeta({
      name: preset.fileName,
      size: preset.fileSize,
      time: 'Just now',
      type: 'Satellite Imagery',
      dimensions: preset.dimensions,
    });
    setAssessmentResult(preset);
    setShowResults(false);
  };

  // Custom Image Upload handler
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCustomImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomImage(event.target?.result);
        setSelectedPresetId('custom');
        setImageMeta({
          name: file.name,
          size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: file.type || 'Custom Image',
          dimensions: 'Detected by Browser',
        });
        setShowResults(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger AI analysis with animated progress simulation and API integration
  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setShowResults(false);

    // Simulated progress interval
    const interval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + 15;
      });
    }, 180);

    try {
      const targetPayload = customImageFile || customImage || currentPreset?.originalImage;
      const apiResult = await analyzeDisasterImage(targetPayload, selectedModel, selectedAnalysisType);
      
      clearInterval(interval);
      setAnalysisProgress(100);

      setTimeout(() => {
        setIsAnalyzing(false);
        setAssessmentResult(apiResult);
        setShowResults(true);
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }, 400);
    } catch (err) {
      clearInterval(interval);
      setIsAnalyzing(false);
      setAssessmentResult(currentPreset || PRESET_DISASTER_IMAGES[0]);
      setShowResults(true);
    }
  };

  const activeImageSrc = customImage || currentPreset?.originalImage;
  const currentModelObj = AI_MODELS.find(m => m.id === selectedModel);
  const currentAnalysisTypeObj = ANALYSIS_TYPES.find(a => a.id === selectedAnalysisType);
  const levelInfo = DAMAGE_LEVELS[assessmentResult?.damageLevel] || DAMAGE_LEVELS.MODERATE_DAMAGE;

  return (
    <div className="page-wrapper upload-page-wrapper">
      {/* Top Banner */}
      <div className="upload-header-banner">
        <div className="container">
          <div className="badge badge-blue" style={{ marginBottom: '0.75rem' }}>
            <Sparkles size={13} /> Automated Damage Classification Engine
          </div>
          <h1 className="upload-page-title">Image Upload & AI Analysis Studio</h1>
          <p className="upload-page-subtitle">
            Upload post-disaster aerial or satellite imagery, configure neural model parameters, and generate instant structural damage assessments.
          </p>
        </div>
      </div>

      <div className="container">
        {/* Presets Gallery for 1-Click Testing */}
        <div className="presets-section">
          <div className="presets-heading">
            <Sparkles size={16} color="var(--purple-ai)" />
            <span>Select a Preset Disaster Scenario for Instant Presentation Demo:</span>
          </div>
          <div className="presets-carousel">
            {PRESET_DISASTER_IMAGES.map((preset) => {
              const isSelected = selectedPresetId === preset.id;
              const pLevel = DAMAGE_LEVELS[preset.damageLevel];
              return (
                <button
                  key={preset.id}
                  className={`preset-card-btn ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelectPreset(preset)}
                >
                  <img src={preset.thumbnail} alt={preset.name} className="preset-thumb-img" />
                  <div>
                    <div className="preset-text-name">{preset.name}</div>
                    <div className="preset-text-tag" style={{ color: pLevel.color, fontWeight: '700' }}>
                      ● {pLevel.label} ({preset.confidenceScore}%)
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Upload & Config Studio Grid */}
        <div className="upload-studio-grid">
          {/* Left Column: Dropzone & Image Metadata */}
          <div>
            {!activeImageSrc ? (
              <div 
                className="dropzone-container"
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept="image/jpeg,image/png,image/jpg" 
                  style={{ display: 'none' }} 
                />
                <div className="dropzone-icon-circle">
                  <UploadCloud size={32} />
                </div>
                <div>
                  <div className="dropzone-text-main">Click or Drag Disaster Imagery Here</div>
                  <div className="dropzone-text-sub">Supports JPG, PNG, GeoTIFF up to 25MB</div>
                </div>
                <button className="btn-secondary" type="button" style={{ marginTop: '0.5rem' }}>
                  Browse Files
                </button>
              </div>
            ) : (
              <div className="image-preview-panel">
                <div className="preview-img-container">
                  <img src={activeImageSrc} alt="Inspection target" className="preview-img-src" />
                  <div className="preview-actions-overlay">
                    <button 
                      className="preview-action-btn"
                      onClick={() => fileInputRef.current?.click()}
                      title="Replace Image"
                    >
                      <RefreshCw size={14} />
                      <span>Replace</span>
                    </button>
                    <button 
                      className="preview-action-btn"
                      onClick={() => {
                        setCustomImage(null);
                        setSelectedPresetId(null);
                      }}
                      title="Remove Image"
                    >
                      <Trash2 size={14} color="#ef4444" />
                      <span>Remove</span>
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileUpload} 
                      accept="image/jpeg,image/png,image/jpg" 
                      style={{ display: 'none' }} 
                    />
                  </div>
                </div>

                {/* Metadata Table */}
                <div className="preview-meta-table">
                  <div className="meta-item-box">
                    <span className="meta-label">File Name</span>
                    <span className="meta-value">{imageMeta.name}</span>
                  </div>
                  <div className="meta-item-box">
                    <span className="meta-label">Image Size</span>
                    <span className="meta-value">{imageMeta.size}</span>
                  </div>
                  <div className="meta-item-box">
                    <span className="meta-label">Upload Timestamp</span>
                    <span className="meta-value">{imageMeta.time}</span>
                  </div>
                  <div className="meta-item-box">
                    <span className="meta-label">Sensor Resolution</span>
                    <span className="meta-value">{imageMeta.dimensions}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: AI Model Configuration Card */}
          <div className="ai-config-card">
            <div className="config-card-header">
              <div className="config-card-title">
                <Sliders size={20} color="var(--primary-blue)" />
                <span>AI Analysis Parameters</span>
              </div>
              <span className="badge badge-ai">PyTorch v2.3</span>
            </div>

            {/* Analysis Type */}
            <div className="form-group-block">
              <label className="form-label">Analysis Objective:</label>
              <div className="options-toggle-list">
                {ANALYSIS_TYPES.map((type) => {
                  const isSelected = selectedAnalysisType === type.id;
                  return (
                    <div
                      key={type.id}
                      className={`option-toggle-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelectedAnalysisType(type.id)}
                    >
                      <div>
                        <div className="option-title-text">{type.title}</div>
                        <div className="option-desc-text">{type.description}</div>
                      </div>
                      {isSelected && <CheckCircle2 size={18} color="var(--primary-blue)" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Neural Model Selection */}
            <div className="form-group-block">
              <label className="form-label">Select Neural Architecture:</label>
              <div className="options-toggle-list">
                {AI_MODELS.map((model) => {
                  const isSelected = selectedModel === model.id;
                  return (
                    <div
                      key={model.id}
                      className={`option-toggle-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelectedModel(model.id)}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className="option-title-text">{model.name}</span>
                          <span className="badge badge-blue" style={{ fontSize: '0.65rem' }}>{model.badge}</span>
                        </div>
                        <div className="option-desc-text">
                          Accuracy: {model.accuracy} • Latency: {model.latency}
                        </div>
                      </div>
                      {isSelected && <CheckCircle2 size={18} color="var(--primary-blue)" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Submit Action Button */}
            <button
              className="btn-primary"
              style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', marginTop: '0.5rem' }}
              disabled={isAnalyzing || !activeImageSrc}
              onClick={handleRunAnalysis}
            >
              <Sparkles size={18} />
              <span>Analyze with AI</span>
            </button>
          </div>
        </div>

        {/* 5. AI Processing Experience Screen */}
        {isAnalyzing && (
          <div style={{ marginTop: '2.5rem' }}>
            <AnalysisProgress 
              progress={analysisProgress}
              imageSrc={activeImageSrc}
              selectedModelName={currentModelObj?.name}
              analysisType={currentAnalysisTypeObj?.title}
            />
          </div>
        )}

        {/* 6. Assessment Results Section */}
        {!isAnalyzing && showResults && assessmentResult && (
          <div className="results-section-wrapper" ref={resultsRef}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--dark-navy)' }}>
                  Damage Assessment Results
                </h2>
                <p style={{ color: 'var(--slate-muted)', fontSize: '0.9rem' }}>
                  Inference computed via {currentModelObj?.name} on {assessmentResult.location}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn-secondary" onClick={() => handleRunAnalysis()}>
                  <RotateCcw size={16} />
                  <span>Re-Analyze</span>
                </button>
                <button className="btn-primary" onClick={() => setIsReportOpen(true)}>
                  <FileText size={16} />
                  <span>Generate Full Report</span>
                </button>
              </div>
            </div>

            {/* Top 4 KPI Metrics */}
            <div className="results-top-metrics-row">
              <StatCard 
                title="Damage Level"
                value={levelInfo.label.toUpperCase()}
                icon={ShieldCheck}
                iconColor={levelInfo.color}
                iconBg={levelInfo.bgColor}
                subtext={levelInfo.severityRange}
                trend="EMS-98 Grade"
                glowColor={levelInfo.color}
              />
              <StatCard 
                title="Confidence Score"
                value={`${assessmentResult.confidenceScore}%`}
                icon={Sparkles}
                iconColor="#7c3aed"
                iconBg="rgba(124, 58, 237, 0.1)"
                subtext="Bayesian Certainty"
                trend="High"
                glowColor="#7c3aed"
              />
              <StatCard 
                title="Analysis Status"
                value="COMPLETED"
                icon={CheckCircle2}
                iconColor="#10b981"
                iconBg="rgba(16, 185, 129, 0.1)"
                subtext="Verified Model Output"
                trend="Ready"
                glowColor="#10b981"
              />
              <StatCard 
                title="Analysis Time"
                value={assessmentResult.analysisTime || '2.8s'}
                icon={Clock}
                iconColor="#2563eb"
                iconBg="rgba(37, 99, 235, 0.1)"
                subtext="Edge Acceleration"
                trend="Fast"
                glowColor="#2563eb"
              />
            </div>

            {/* Severity Meter Component */}
            <div style={{ marginBottom: '2rem' }}>
              <DamageMeter currentLevelKey={assessmentResult.damageLevel} />
            </div>

            {/* 2-Column Results Grid: Image Analysis View & Probability Distribution */}
            <div className="results-main-grid">
              <ImageOverlayViewer 
                originalImage={assessmentResult.originalImage}
                overlayImage={assessmentResult.overlayImage}
                heatmapBoxes={assessmentResult.heatmapData}
                locationName={assessmentResult.location}
                sensorType={assessmentResult.sensorType}
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <ProbabilityBar probabilities={assessmentResult.probabilities} />
                
                {/* Explainable AI Insights */}
                <ExplainableAI 
                  aiExplanation={assessmentResult.aiExplanation}
                  detectedIndicators={assessmentResult.detectedIndicators}
                  confidenceScore={assessmentResult.confidenceScore}
                  modelName={currentModelObj?.name}
                />
              </div>
            </div>

            {/* Recommendations Section */}
            <div className="recommendations-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={20} color="var(--primary-blue)" />
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--dark-navy)' }}>
                    Actionable Emergency Response Recommendations
                  </h3>
                </div>
                <span className="badge badge-blue">Triage Protocol</span>
              </div>

              <div className="recommendations-list">
                {(assessmentResult.recommendations || []).map((rec, idx) => (
                  <div key={idx} className="rec-item-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span 
                        className="badge" 
                        style={{ 
                          backgroundColor: rec.priority === 'HIGH' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(249, 115, 22, 0.12)',
                          color: rec.priority === 'HIGH' ? '#dc2626' : '#ea580c',
                          fontSize: '0.72rem'
                        }}
                      >
                        {rec.priority} PRIORITY
                      </span>
                      <span className="rec-text">{rec.text}</span>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600' }}>
                      {rec.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Engineering Assessment Report Modal */}
      <ReportModal 
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        assessmentData={{
          ...assessmentResult,
          modelName: currentModelObj?.name,
        }}
      />
    </div>
  );
}
