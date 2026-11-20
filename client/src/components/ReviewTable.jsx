import React, { useState } from 'react';
import { FaStar, FaRegStar } from 'react-icons/fa';
import { FiMessageSquare, FiX, FiCheck } from 'react-icons/fi';

export default function ReviewTable({ reviews = [], onGenerateReply, isGeneratingReply }) {
  const [selectedReviewForDetail, setSelectedReviewForDetail] = useState(null);

  if (!reviews || reviews.length === 0) {
    return (
      <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-heading)', marginBottom: '6px' }}>
          No reviews match your filters
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Try clearing search keywords or resetting dropdown filters.
        </p>
      </div>
    );
  }

  // Graphical star ratings using React Icons (FaStar, FaRegStar)
  const renderStars = (rating) => {
    if (rating === null || rating === undefined) {
      return <span className="rating-na-pill">N/A</span>;
    }

    const starElements = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        starElements.push(<FaStar key={i} className="star-filled" size={13} />);
      } else {
        starElements.push(<FaRegStar key={i} className="star-empty" size={13} />);
      }
    }

    return (
      <span className="stars-group" title={`Rating: ${rating} / 5`}>
        {starElements}
        <span className="rating-score-num">{rating}</span>
      </span>
    );
  };

  return (
    <>
      <div className="card table-outer-wrapper">
        <div className="table-scrollable">
          <table className="data-table-main">
            <thead>
              <tr>
                <th style={{ width: '100px' }}>Review ID</th>
                <th style={{ width: '180px' }}>Product</th>
                <th style={{ width: '120px' }}>Rating</th>
                <th style={{ width: '125px' }}>Sentiment</th>
                <th style={{ width: '150px' }}>Topics</th>
                <th>AI Classification Summary</th>
                <th style={{ width: '145px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((row) => {
                const {
                  review_id,
                  product,
                  rating,
                  status,
                  analysis,
                  is_duplicate,
                  duplicate_of,
                  review_text
                } = row;

                const isSkipped = status === 'skipped';
                const isFailed = status === 'analysis_failed';
                const isAnalyzed = status === 'analyzed' && analysis;

                const sentiment = isAnalyzed ? analysis.sentiment : null;
                const topics = isAnalyzed ? analysis.topics : [];
                const summary = isAnalyzed
                  ? analysis.summary
                  : isSkipped
                  ? 'Skipped (Empty review text)'
                  : isFailed
                  ? 'Analysis Failed'
                  : 'Pending';

                const needsReply = isAnalyzed && analysis.needs_reply === true;

                return (
                  <tr key={review_id} className={`data-row ${isSkipped ? 'row-is-skipped' : ''}`}>
                    {/* Review ID */}
                    <td>
                      <span
                        className="id-badge"
                        style={{ cursor: 'pointer' }}
                        title="Click to inspect raw review"
                        onClick={() => setSelectedReviewForDetail(row)}
                      >
                        {review_id}
                      </span>
                      {is_duplicate && (
                        <span className="dup-pill" title={`Duplicate text of ${duplicate_of}`}>
                          dup
                        </span>
                      )}
                    </td>

                    {/* Product Name */}
                    <td className="product-name-cell" title={product}>
                      {product}
                    </td>

                    {/* Rating */}
                    <td>{renderStars(rating)}</td>

                    {/* Sentiment */}
                    <td>
                      {isAnalyzed ? (
                        <span className={`badge-pill-sentiment badge-${sentiment === 'positive' ? 'pos' : sentiment === 'neutral' ? 'neu' : 'neg'}`}>
                          <span className="bullet-dot"></span>
                          {sentiment}
                        </span>
                      ) : isSkipped ? (
                        <span className="badge-pill-sentiment badge-skipped">
                          <span className="bullet-dot"></span>
                          Skipped
                        </span>
                      ) : isFailed ? (
                        <span className="badge-pill-sentiment badge-failed">
                          <span className="bullet-dot"></span>
                          Failed
                        </span>
                      ) : (
                        <span className="badge-pill-sentiment badge-skipped">
                          Pending
                        </span>
                      )}
                    </td>

                    {/* Topics */}
                    <td>
                      {topics && topics.length > 0 ? (
                        <div className="topics-cluster">
                          {topics.map((t) => (
                            <span key={t} className="tag-item">
                              {t}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-dim)' }}>—</span>
                      )}
                    </td>

                    {/* Summary */}
                    <td>
                      <div
                        className="summary-content-clamp"
                        style={{ cursor: 'pointer' }}
                        title="Click to view full review context"
                        onClick={() => setSelectedReviewForDetail(row)}
                      >
                        {summary}
                      </div>
                    </td>

                    {/* Action */}
                    <td style={{ textAlign: 'right' }}>
                      {needsReply ? (
                        <button
                          type="button"
                          className="btn btn-action"
                          onClick={() => onGenerateReply(row)}
                          disabled={isGeneratingReply}
                        >
                          <FiMessageSquare size={13} />
                          Generate Reply
                        </button>
                      ) : (
                        <span style={{ color: 'var(--text-dim)', fontSize: '12px' }}>
                          —
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Inspector Dialog */}
      {selectedReviewForDetail && (
        <div className="modal-backdrop-blur" onClick={() => setSelectedReviewForDetail(null)}>
          <div className="modal-surface" onClick={(e) => e.stopPropagation()}>
            <div className="modal-surface-header">
              <div className="modal-title-left">
                <span className="id-badge">{selectedReviewForDetail.review_id}</span>
                <div>
                  <h3 className="modal-dialog-title">{selectedReviewForDetail.product}</h3>
                  <p className="modal-dialog-desc">Customer Review Record</p>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-trigger"
                onClick={() => setSelectedReviewForDetail(null)}
              >
                <FiX size={18} />
              </button>
            </div>
            <div className="modal-surface-body">
              <div className="customer-context-panel">
                <div className="context-row-meta">
                  <span><strong>Date:</strong> {selectedReviewForDetail.date || 'N/A'}</span>
                  <span><strong>Rating:</strong> {renderStars(selectedReviewForDetail.rating)}</span>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-heading)', lineHeight: '1.5' }}>
                  <strong>Raw Customer Review:</strong>
                  <p style={{ marginTop: '6px', background: '#FFFFFF', padding: '10px 12px', border: '1px solid #E2E8F0', fontStyle: 'italic' }}>
                    "{selectedReviewForDetail.review_text || '(Empty text)'}"
                  </p>
                </div>
              </div>

              {selectedReviewForDetail.analysis && (
                <div style={{ background: '#F8FAFC', padding: '14px', border: '1px solid #E2E8F0' }}>
                  <h4 style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    AI Classification Data
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px' }}>
                    <div><strong>Sentiment:</strong> {selectedReviewForDetail.analysis.sentiment}</div>
                    <div><strong>Needs Reply:</strong> {selectedReviewForDetail.analysis.needs_reply ? 'Yes' : 'No'}</div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <strong>Topics:</strong> {selectedReviewForDetail.analysis.topics.join(', ')}
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <strong>AI Summary:</strong> {selectedReviewForDetail.analysis.summary}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-surface-footer">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedReviewForDetail(null)}
              >
                Close
              </button>
              {selectedReviewForDetail.analysis?.needs_reply && (
                <button
                  type="button"
                  className="btn btn-action"
                  onClick={() => {
                    const row = selectedReviewForDetail;
                    setSelectedReviewForDetail(null);
                    onGenerateReply(row);
                  }}
                >
                  <FiMessageSquare size={13} />
                  Generate Reply
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
