import crypto from 'crypto';

/**
 * Normalizes review text by trimming, converting to lowercase,
 * and collapsing multiple spaces into a single space.
 * @param {string} text
 * @returns {string}
 */
export function normalizeReviewText(text) {
  if (!text || typeof text !== 'string') return '';
  return text.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Generates a SHA-256 hash of the normalized review text.
 * Used as a unique key for the cache system.
 * @param {string} text
 * @returns {string}
 */
export function hashReview(text) {
  const normalized = normalizeReviewText(text);
  return crypto.createHash('sha256').update(normalized).digest('hex');
}
