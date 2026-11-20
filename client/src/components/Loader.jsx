import React from 'react';
import { FiCpu, FiLayers, FiDatabase, FiShield, FiActivity } from 'react-icons/fi';

/**
 * Analysis Modal
 * Displays active model, progress steps, and batch details during AI processing.
 */
export default function Loader({
  model = 'llama-3.3-70b-versatile',
  message = 'Analyzing customer reviews...'
}) {
  return (
    <div className="modal-backdrop-blur">
      <div className="modal-surface" style={{ maxWidth: '540px' }}>
        {/* Modal Header */}
        <div className="modal-surface-header">
          <div className="modal-title-left">
            <div className="modal-icon-container" style={{ background: '#EFF6FF', color: '#2563EB', borderColor: '#BFDBFE' }}>
              <FiCpu size={18} />
            </div>
            <div>
              <h3 className="modal-dialog-title">AI Batch Analysis Active</h3>
              <p className="modal-dialog-desc">Sequential Processing with Groq AI</p>
            </div>
          </div>
          <span className="model-badge-header">
            {model}
          </span>
        </div>

        {/* Modal Body */}
        <div className="modal-surface-body">
          <div className="analysis-spinner-box">
            <span className="button-spinner" style={{ borderColor: 'rgba(37,99,235,0.2)', borderTopColor: '#2563EB', width: '22px', height: '22px' }}></span>
            <span style={{ fontWeight: '600', color: 'var(--text-heading)' }}>
              {message}
            </span>
          </div>

          <div className="analysis-steps-card">
            <div className="analysis-step-item active">
              <div className="step-icon-box">
                <FiLayers size={14} />
              </div>
              <span>1. PapaParse CSV Ingestion &amp; Sanitization</span>
            </div>

            <div className="analysis-step-item active">
              <div className="step-icon-box">
                <FiDatabase size={14} />
              </div>
              <span>2. Normalized Text Deduplication &amp; SHA-256 Cache Check</span>
            </div>

            <div className="analysis-step-item active">
              <div className="step-icon-box">
                <FiCpu size={14} />
              </div>
              <span>3. Sequential Groq Inference (5 reviews / batch)</span>
            </div>

            <div className="analysis-step-item active">
              <div className="step-icon-box">
                <FiShield size={14} />
              </div>
              <span>4. Schema Validation &amp; Prompt Injection Isolation</span>
            </div>
          </div>

          <div style={{ fontSize: '12px', color: 'var(--text-muted)', background: '#F8FAFC', padding: '10px 12px', border: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiActivity size={14} color="#2563EB" />
            <span>Active Engine: <strong>Groq Cloud ({model})</strong> • Exponential backoff enabled</span>
          </div>
        </div>
      </div>
    </div>
  );
}
