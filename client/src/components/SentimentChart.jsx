import React from 'react';
import { FiPieChart, FiThumbsUp, FiMinusCircle, FiThumbsDown } from 'react-icons/fi';

export default function SentimentChart({ stats }) {
  if (!stats) return null;

  const {
    total_analysed = 0,
    positive_count = 0,
    neutral_count = 0,
    negative_count = 0,
    positive_pct = 0,
    neutral_pct = 0,
    negative_pct = 0
  } = stats;

  if (total_analysed === 0) return null;

  return (
    <section className="card sentiment-card">
      <div className="sentiment-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiPieChart size={18} color="#2563EB" />
          <h2 className="sentiment-title">Sentiment Distribution Spectrum</h2>
        </div>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          TOTAL: {total_analysed}
        </span>
      </div>

      {/* Segmented Spectrum Track with In-Bar Percentages */}
      <div className="sentiment-progress-track">
        <div
          className="sentiment-slice slice-positive"
          style={{ width: `${positive_pct}%` }}
          title={`Positive: ${positive_pct}% (${positive_count})`}
        >
          {positive_pct >= 12 && <span>{positive_pct}%</span>}
        </div>
        <div
          className="sentiment-slice slice-neutral"
          style={{ width: `${neutral_pct}%` }}
          title={`Neutral: ${neutral_pct}% (${neutral_count})`}
        >
          {neutral_pct >= 12 && <span>{neutral_pct}%</span>}
        </div>
        <div
          className="sentiment-slice slice-negative"
          style={{ width: `${negative_pct}%` }}
          title={`Negative: ${negative_pct}% (${negative_count})`}
        >
          {negative_pct >= 12 && <span>{negative_pct}%</span>}
        </div>
      </div>

      {/* Detailed Stat Pill Cards */}
      <div className="sentiment-pill-grid">
        <div className="sentiment-pill-item">
          <div className="pill-dot dot-pos"></div>
          <div className="pill-content">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FiThumbsUp size={13} color="#059669" />
              <span className="pill-heading">Positive Sentiment</span>
            </div>
            <span className="pill-metrics">{positive_count} reviews ({positive_pct}%)</span>
          </div>
        </div>

        <div className="sentiment-pill-item">
          <div className="pill-dot dot-neu"></div>
          <div className="pill-content">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FiMinusCircle size={13} color="#D97706" />
              <span className="pill-heading">Neutral / Mixed</span>
            </div>
            <span className="pill-metrics">{neutral_count} reviews ({neutral_pct}%)</span>
          </div>
        </div>

        <div className="sentiment-pill-item">
          <div className="pill-dot dot-neg"></div>
          <div className="pill-content">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FiThumbsDown size={13} color="#DC2626" />
              <span className="pill-heading">Negative Feedback</span>
            </div>
            <span className="pill-metrics">{negative_count} reviews ({negative_pct}%)</span>
          </div>
        </div>
      </div>
    </section>
  );
}
