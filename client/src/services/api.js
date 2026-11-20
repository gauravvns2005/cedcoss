import axios from 'axios';

/**
 * Resolves the backend API base URL from Vite environment variables.
 * Supports VITE_API_URL or VITE_API_BASE_URL.
 * Normalizes trailing slashes and ensures /api prefix.
 * Falls back to '/api' for Vite dev proxy or reverse-proxy deployments.
 */
function resolveApiBaseUrl() {
  const envUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;

  if (!envUrl || typeof envUrl !== 'string' || !envUrl.trim()) {
    return '/api';
  }

  const cleaned = envUrl.trim().replace(/\/+$/, '');
  return cleaned.endsWith('/api') ? cleaned : `${cleaned}/api`;
}

const API_BASE_URL = resolveApiBaseUrl();

console.log(`[ReviewLens] Connecting to backend API at: ${API_BASE_URL}`);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000 // 2 minute timeout for batch AI processing
});

/**
 * Checks server health status
 */
export async function checkHealth() {
  const response = await apiClient.get('/health');
  return response.data;
}

/**
 * Uploads a CSV file to be analyzed
 * @param {File} file 
 * @returns {Promise<object>}
 */
export async function uploadAndAnalyzeCSV(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post('/reviews/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return response.data;
}

/**
 * Generates an empathetic customer service reply for a specific review
 * @param {string} reviewId 
 * @param {object} reviewData 
 * @returns {Promise<object>}
 */
export async function generateSuggestedReply(reviewId, reviewData) {
  const response = await apiClient.post(`/reviews/${reviewId}/reply`, {
    review_text: reviewData.review_text,
    product: reviewData.product,
    summary: reviewData.analysis?.summary || '',
    topics: reviewData.analysis?.topics || []
  });

  return response.data;
}
