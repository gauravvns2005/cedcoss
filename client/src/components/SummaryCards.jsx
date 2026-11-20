import React from 'react';
import { FiBarChart2, FiThumbsUp, FiMinusCircle, FiThumbsDown, FiMessageSquare } from 'react-icons/fi';

export default function SummaryCards({ stats }) {
  if (!stats) return null;

  const {
    total_rows = 0,
    total_analysed = 0,
    positive_pct = 0,
    neutral_pct = 0,
    negative_pct = 0,
    needs_reply_count = 0,
    skipped_rows = 0,
    duplicate_rows = 0,
    positive_count = 0,
    neutral_count = 0,
    negative_count = 0
  } = stats;

  const replyRatioPct = total_analysed > 0 ? Math.round((needs_reply_count / total_analysed) * 100) : 0;

  return (
    <div className="summary-cards-grid">
      {/* 1. Total Analysed */}
      <div className="card kpi-card kpi-total">
        <div className="kpi-header">
          <span className="kpi-label">Total Analysed</span>
          <div className="kpi-icon-pill">
            <FiBarChart2 size={16} />
          </div>
        </div>
        <div className="kpi-value">{total_analysed}</div>
        <div className="kpi-progress-track">
          <div className="kpi-progress-fill fill-blue" style={{ width: '100%' }}></div>
        </div>
        <div className="kpi-subtext">
          {total_rows} total ({skipped_rows} skipped, {duplicate_rows} dup)
        </div>
      </div>

      {/* 2. Positive Reviews */}
      <div className="card kpi-card kpi-positive">
        <div className="kpi-header">
          <span className="kpi-label">Positive</span>
          <div className="kpi-icon-pill">
            <FiThumbsUp size={16} />
          </div>
        </div>
        <div className="kpi-value">{positive_pct}%</div>
        <div className="kpi-progress-track">
          <div className="kpi-progress-fill fill-green" style={{ width: `${positive_pct}%` }}></div>
        </div>
        <div className="kpi-subtext">
          {positive_count} positive experiences
        </div>
      </div>

      {/* 3. Neutral Reviews */}
      <div className="card kpi-card kpi-neutral">
        <div className="kpi-header">
          <span className="kpi-label">Neutral</span>
          <div className="kpi-icon-pill">
            <FiMinusCircle size={16} />
          </div>
        </div>
        <div className="kpi-value">{neutral_pct}%</div>
        <div className="kpi-progress-track">
          <div className="kpi-progress-fill fill-amber" style={{ width: `${neutral_pct}%` }}></div>
        </div>
        <div className="kpi-subtext">
          {neutral_count} balanced feedback
        </div>
      </div>

      {/* 4. Negative Reviews */}
      <div className="card kpi-card kpi-negative">
        <div className="kpi-header">
          <span className="kpi-label">Negative</span>
          <div className="kpi-icon-pill">
            <FiThumbsDown size={16} />
          </div>
        </div>
        <div className="kpi-value">{negative_pct}%</div>
        <div className="kpi-progress-track">
          <div className="kpi-progress-fill fill-red" style={{ width: `${negative_pct}%` }}></div>
        </div>
        <div className="kpi-subtext">
          {negative_count} customer issues
        </div>
      </div>

      {/* 5. Needs Reply */}
      <div className="card kpi-card kpi-reply">
        <div className="kpi-header">
          <span className="kpi-label">Needs Reply</span>
          <div className="kpi-icon-pill">
            <FiMessageSquare size={16} />
          </div>
        </div>
        <div className="kpi-value">{needs_reply_count}</div>
        <div className="kpi-progress-track">
          <div className="kpi-progress-fill fill-purple" style={{ width: `${replyRatioPct}%` }}></div>
        </div>
        <div className="kpi-subtext">
          {replyRatioPct}% of reviews require outreach
        </div>
      </div>
    </div>
  );
}
