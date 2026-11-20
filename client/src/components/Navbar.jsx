import React from 'react';
import { FiActivity, FiCpu } from 'react-icons/fi';

export default function Navbar({ serverStatus, model = 'llama-3.3-70b-versatile' }) {
  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <div className="brand-icon-wrapper">
            <FiCpu size={22} />
          </div>
          <div className="brand-info">
            <div className="brand-header-line">
              <span className="brand-title">ReviewLens</span>
              <span className="brand-badge">CEDCOSS</span>
            </div>
            <span className="brand-subtitle">AI-Powered Customer Review Intelligence Platform</span>
          </div>
        </div>

        <div className="navbar-right">
          <div className="status-indicator-pill">
            <span className={`pulse-dot ${serverStatus === 'online' ? 'online' : 'checking'}`}></span>
            <span>{serverStatus === 'online' ? 'Engine Ready' : 'Connecting...'}</span>
          </div>
          <div className="status-indicator-pill" title="Configured Groq Llama Model">
            <FiActivity size={14} color="#2563EB" />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px', color: '#1D4ED8' }}>
              {model}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
