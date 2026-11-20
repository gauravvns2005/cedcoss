import React, { useRef, useState } from 'react';
import { FiUploadCloud, FiFileText, FiPlay, FiAlertCircle, FiShield, FiDatabase, FiZap, FiLayers } from 'react-icons/fi';

export default function UploadSection({
  onFileUpload,
  onAnalyze,
  selectedFile,
  isLoading,
  error,
  onLoadSample,
  model = 'llama-3.3-70b-versatile'
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
    <section className="card upload-card">
      <div className="upload-header">
        <div className="upload-title-wrap">
          <h2 className="upload-heading">Import Customer Reviews</h2>
          <p className="upload-subheading">
            Upload CSV with columns: <span className="code-pill">review_id, product, rating, date, review_text</span>
          </p>
        </div>
      </div>

      {/* Feature Ribbon */}
      <div className="upload-feature-ribbon">
        <div className="feature-ribbon-item">
          <FiShield size={16} />
          <span>Prompt Injection Defense (R012 Safe)</span>
        </div>
        <div className="feature-ribbon-item">
          <FiDatabase size={16} />
          <span>SHA-256 Deduplication &amp; Cache</span>
        </div>
        <div className="feature-ribbon-item">
          <FiZap size={16} />
          <span>Batch Processing (5 per batch)</span>
        </div>
      </div>

      <div className="upload-dual-grid">
        {/* Left: Drag & Drop Zone */}
        <div
          className={`drop-zone ${isDragOver ? 'drag-over' : ''} ${selectedFile ? 'has-file' : ''}`}
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

          <div className="drop-icon-circle">
            <FiUploadCloud size={24} />
          </div>

          {selectedFile ? (
            <div className="selected-file-card" onClick={(e) => e.stopPropagation()}>
              <div className="file-icon-badge">
                <FiFileText size={18} />
              </div>
              <div className="file-meta-content">
                <span className="file-name-text">{selectedFile.name}</span>
                <span className="file-size-text">
                  {(selectedFile.size / 1024).toFixed(1)} KB • Ready for analysis
                </span>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-xs"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
              >
                Change
              </button>
            </div>
          ) : (
            <div>
              <p className="drop-primary-text">
                <span className="drop-browse-accent">Choose a CSV file</span> or drag and drop here
              </p>
              <p className="drop-secondary-hint">Accepts UTF-8 CSV files up to 5 MB</p>
            </div>
          )}
        </div>

        {/* Right: Quick-Start Assessment Dataset CTA */}
        <div className="sample-cta-card">
          <div className="sample-cta-header">
            <span className="sample-tag-badge">CEDCOSS Assessment</span>
          </div>
          <div>
            <h3 className="sample-cta-title">Official 30-Record Dataset</h3>
            <p className="sample-cta-desc">
              Test immediately with all 30 assessment reviews including prompt injections (R012, R015), Hinglish text, empty rows, and invalid ratings.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-accent btn-sm"
            onClick={onLoadSample}
            disabled={isLoading}
          >
            <FiLayers size={14} />
            Load Sample (30 Reviews)
          </button>
        </div>
      </div>

      {error && (
        <div className="alert-error" style={{ marginTop: '18px' }}>
          <FiAlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      <div className="upload-footer-actions">
        {selectedFile && (
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Selected: <strong>{selectedFile.name}</strong>
          </span>
        )}
        <button
          type="button"
          className="btn btn-primary"
          onClick={onAnalyze}
          disabled={!selectedFile || isLoading}
        >
          {isLoading ? (
            <>
              <span className="button-spinner"></span>
              Analyzing in Batches...
            </>
          ) : (
            <>
              <FiPlay size={14} />
              Run AI Analysis ({model})
            </>
          )}
        </button>
      </div>
    </section>
  );
}
