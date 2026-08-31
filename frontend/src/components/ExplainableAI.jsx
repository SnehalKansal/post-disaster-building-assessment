import React from 'react';
import { 
  Sparkles, 
  BrainCircuit, 
  CheckCircle2, 
  AlertTriangle, 
  Check, 
  ScanSearch, 
  Activity 
} from 'lucide-react';
import '../styles/explainableai.css';

export default function ExplainableAI({ 
  aiExplanation, 
  detectedIndicators = [],
  confidenceScore = 95.8,
  modelName = 'ResNet-50'
}) {
  return (
    <div className="explainable-ai-card">
      <div className="explainable-header">
        <div>
          <div className="explainable-title">
            <BrainCircuit size={22} color="var(--purple-ai)" />
            <span>AI Assessment Insights & Feature Attribution</span>
          </div>
          <p className="explainable-subtitle">
            Explainable AI (XAI) output derived from Grad-CAM activation tensors & structural anomaly filters
          </p>
        </div>
        <span className="badge badge-ai">
          <Sparkles size={13} /> {modelName} Neural Core
        </span>
      </div>

      {/* AI Explanation Box */}
      {aiExplanation && (
        <div className="ai-explanation-box">
          <div className="ai-explanation-icon">
            <Sparkles size={20} />
          </div>
          <div>
            <div className="ai-explanation-text-title">AI Synthesis Rationale</div>
            <p className="ai-explanation-p">"{aiExplanation}"</p>
          </div>
        </div>
      )}

      {/* Detected Indicators List */}
      <div>
        <div className="indicators-list-heading">
          <ScanSearch size={17} color="var(--primary-blue)" />
          <span>Detected Structural Anomaly Indicators:</span>
        </div>
        <div className="indicators-grid">
          {detectedIndicators.map((indicator, idx) => (
            <div key={idx} className="indicator-item">
              <div className="indicator-left">
                <div className={`indicator-icon-badge ${indicator.positive ? 'detected' : 'clear'}`}>
                  {indicator.positive ? (
                    <AlertTriangle size={14} />
                  ) : (
                    <Check size={14} />
                  )}
                </div>
                <span>{indicator.text}</span>
              </div>
              <span className={`indicator-severity-tag ${indicator.severity || 'medium'}`}>
                {indicator.positive ? `${indicator.severity} ANOMALY` : 'NOMINAL'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
