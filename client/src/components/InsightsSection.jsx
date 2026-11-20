import React from 'react';
import { FiAlertOctagon, FiTrendingUp } from 'react-icons/fi';

export default function InsightsSection({ insights }) {
  if (!insights) return null;

  const { topComplaints = [], topPraises = [] } = insights;

  return (
    <section className="insights-split-grid">
      {/* Top Complaints Card */}
      <div className="card insight-panel">
        <div className="insight-panel-header">
          <div className="panel-title-group">
            <span className="panel-badge badge-complaint-tone">
              <FiAlertOctagon size={14} />
              Top Complaints
            </span>
          </div>
          <span className="panel-subtext">Actionable customer pain points</span>
        </div>

        <div className="insight-cards-stack">
          {topComplaints.length > 0 ? (
            topComplaints.map((item, index) => (
              <div key={index} className="insight-row-card card-complaint-style">
                <div className="insight-row-top">
                  <span className="topic-tag-bubble tag-neg">{item.topic}</span>
                  <span className="count-occurrence-text">{item.count} report{item.count > 1 ? 's' : ''}</span>
                </div>
                <p className="insight-headline-quote">"{item.headline}"</p>
                {item.details && <p className="insight-details-text">{item.details}</p>}
              </div>
            ))
          ) : (
            <p style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '13px' }}>
              No recurring complaints detected in this dataset.
            </p>
          )}
        </div>
      </div>

      {/* Top Praises Card */}
      <div className="card insight-panel">
        <div className="insight-panel-header">
          <div className="panel-title-group">
            <span className="panel-badge badge-praise-tone">
              <FiTrendingUp size={14} />
              Top Praises
            </span>
          </div>
          <span className="panel-subtext">Product strengths &amp; highlights</span>
        </div>

        <div className="insight-cards-stack">
          {topPraises.length > 0 ? (
            topPraises.map((item, index) => (
              <div key={index} className="insight-row-card card-praise-style">
                <div className="insight-row-top">
                  <span className="topic-tag-bubble tag-pos">{item.topic}</span>
                  <span className="count-occurrence-text">{item.count} mention{item.count > 1 ? 's' : ''}</span>
                </div>
                <p className="insight-headline-quote">"{item.headline}"</p>
                {item.details && <p className="insight-details-text">{item.details}</p>}
              </div>
            ))
          ) : (
            <p style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '13px' }}>
              No positive feedback recorded in this dataset.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
