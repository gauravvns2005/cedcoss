import React, { useRef, useState } from 'react';
import { 
  FiCpu, 
  FiUploadCloud, 
  FiFileText, 
  FiPlay, 
  FiLayers, 
  FiActivity, 
  FiDatabase, 
  FiShield, 
  FiCheckCircle, 
  FiAlertCircle,
  FiMessageSquare,
  FiBarChart2
} from 'react-icons/fi';

export default function Sidebar({
  serverStatus,
  model = 'llama-3.3-70b-versatile',
  selectedFile,
  onFileUpload,
  onAnalyze,
  isLoading,
  error,
  onLoadSample,
  stats,
  activeTab,
  onTabChange
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.toLowerCase().endsWith('.csv')) {
        onFileUpload(file);
      } else {
        alert('Please drop a valid .csv file.');
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileUpload(e.target.files[0]);
    }
  };

  return (
    <aside className="sidebar-rail">
      {/* Brand Header */}
      <div className="sidebar-brand-block">
        <div className="brand-icon-wrapper">
          <FiCpu size={20} />
        </div>
        <div className="brand-info">
          <div className="brand-header-line">
            <span className="brand-title">ReviewLens</span>
            <span className="brand-badge">CEDCOSS</span>
          </div>
          <span className="brand-subtitle">AI Review Intelligence</span>
        </div>
      </div>

      {/* Engine & Model Status Pill */}
      <div className="sidebar-model-card">
        <div className="model-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className={`pulse-dot ${serverStatus === 'online' ? 'online' : 'checking'}`}></span>
            <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              {serverStatus === 'online' ? 'Engine Ready' : 'Connecting'}
            </span>
          </div>
          <span style={{ fontSize: '10px', color: '#2563EB', fontWeight: '700' }}>GROQ API</span>
        </div>
        <div className="model-card-name" title={`Configured Model: ${model}`}>
          <FiActivity size={13} color="#2563EB" style={{ flexShrink: 0 }} />
          <span>{model}</span>
        </div>
      </div>

      {/* Dataset / Upload Control Box */}
      <div className="sidebar-section-box">
        <div className="sidebar-section-title">
          <span>Dataset Input</span>
          {stats && <span className="sidebar-count-pill">{stats.total_rows} Rows</span>}
        </div>

        {/* Compact Drop Zone */}
        <div
          className={`sidebar-drop-zone ${isDragOver ? 'drag-over' : ''} ${selectedFile ? 'has-file' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv,text/csv"
            style={{ display: 'none' }}
          />

          {selectedFile ? (
            <div className="sidebar-file-meta" onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiFileText size={16} color="#2563EB" />
                <span className="sidebar-filename" title={selectedFile.name}>
                  {selectedFile.name}
                </span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {(selectedFile.size / 1024).toFixed(1)} KB • CSV Ready
              </span>
            </div>
          ) : (
            <div className="sidebar-drop-prompt">
              <FiUploadCloud size={20} color="#2563EB" />
              <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-heading)' }}>
                Upload CSV File
              </span>
              <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                Drop or click to browse
              </span>
            </div>
          )}
        </div>

        {/* 1-Click Assessment Sample Button */}
        <button
          type="button"
          className="btn btn-secondary btn-sm sidebar-full-btn"
          onClick={onLoadSample}
          disabled={isLoading}
          title="Load 30 official assessment reviews"
        >
          <FiLayers size={13} />
          Load 30 Sample Reviews
        </button>

        {/* Analyze Reviews Button */}
        <button
          type="button"
          className="btn btn-primary btn-sm sidebar-full-btn"
          onClick={onAnalyze}
          disabled={!selectedFile || isLoading}
        >
          {isLoading ? (
            <>
              <span className="button-spinner"></span>
              Analyzing...
            </>
          ) : (
            <>
              <FiPlay size={13} />
              Run Analysis
            </>
          )}
        </button>

        {error && (
          <div className="sidebar-error-box">
            <FiAlertCircle size={14} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Navigation Views Filter */}
      {stats && (
        <div className="sidebar-nav-group">
          <div className="sidebar-section-title">Views &amp; Filters</div>

          <button
            type="button"
            className={`sidebar-nav-item ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => onTabChange('all')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiBarChart2 size={14} />
              <span>All Reviews</span>
            </div>
            <span className="nav-item-badge">{stats.total_rows}</span>
          </button>

          <button
            type="button"
            className={`sidebar-nav-item ${activeTab === 'needs_reply' ? 'active-purple' : ''}`}
            onClick={() => onTabChange('needs_reply')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiMessageSquare size={14} />
              <span>Needs Reply</span>
            </div>
            <span className="nav-item-badge badge-purple">{stats.needs_reply_count || 0}</span>
          </button>

          <button
            type="button"
            className={`sidebar-nav-item ${activeTab === 'negative' ? 'active-red' : ''}`}
            onClick={() => onTabChange('negative')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiAlertCircle size={14} />
              <span>Complaints</span>
            </div>
            <span className="nav-item-badge badge-red">{stats.negative_count || 0}</span>
          </button>

          <button
            type="button"
            className={`sidebar-nav-item ${activeTab === 'positive' ? 'active-green' : ''}`}
            onClick={() => onTabChange('positive')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiCheckCircle size={14} />
              <span>Praises</span>
            </div>
            <span className="nav-item-badge badge-green">{stats.positive_count || 0}</span>
          </button>
        </div>
      )}

      {/* Architecture Highlights Footer */}
      <div className="sidebar-footer-box">
        <div className="footer-feature-item">
          <FiShield size={13} color="#2563EB" />
          <span>Prompt Injection Isolation (R012)</span>
        </div>
        <div className="footer-feature-item">
          <FiDatabase size={13} color="#2563EB" />
          <span>SHA-256 Deduplication &amp; Cache</span>
        </div>
      </div>
    </aside>
  );
}
