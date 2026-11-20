import React, { useState } from 'react';
import { FiMessageSquare, FiCopy, FiCheck, FiX } from 'react-icons/fi';

export default function ReplyModal({
  isOpen,
  onClose,
  review,
  replyText,
  isLoading
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    if (!replyText) return;
    try {
      await navigator.clipboard.writeText(replyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <div className="modal-backdrop-blur" onClick={onClose}>
      <div className="modal-surface" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-surface-header">
          <div className="modal-title-left">
            <div className="modal-icon-container">
              <FiMessageSquare size={18} />
            </div>
            <div>
              <h3 className="modal-dialog-title">Suggested Customer Reply</h3>
              <p className="modal-dialog-desc">Empathetic customer support draft</p>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-trigger"
            onClick={onClose}
            aria-label="Close modal"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-surface-body">
          {review && (
            <div className="customer-context-panel">
              <div className="context-row-meta">
                <span><strong>Review ID:</strong> <span className="id-badge">{review.review_id}</span></span>
                <span><strong>Product:</strong> {review.product}</span>
              </div>
              <div className="context-quote-block">
                "{review.review_text}"
              </div>
            </div>
          )}

          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '11.5px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                AI-Generated Customer Service Response
              </span>
            </div>

            {isLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '32px', background: '#F8FAFC', border: '1px dashed #CBD5E1' }}>
                <span className="button-spinner" style={{ borderColor: 'rgba(37,99,235,0.2)', borderTopColor: '#2563EB', width: '20px', height: '20px' }}></span>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>
                  Drafting empathetic resolution response with Groq AI...
                </span>
              </div>
            ) : (
              <div className="generated-reply-box">
                <p className="reply-prose">{replyText || 'No reply generated yet.'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-surface-footer">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onClose}
          >
            Close
          </button>

          <button
            type="button"
            className={`btn ${copied ? 'btn-accent' : 'btn-primary'} btn-sm`}
            onClick={handleCopy}
            disabled={isLoading || !replyText}
          >
            {copied ? (
              <>
                <FiCheck size={14} />
                Copied to Clipboard!
              </>
            ) : (
              <>
                <FiCopy size={14} />
                Copy Reply
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
