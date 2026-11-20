/**
 * Sleep utility for delay
 * @param {number} ms 
 * @returns {Promise<void>}
 */
export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Retries an asynchronous operation with exponential backoff.
 * 
 * Delays:
 * - 1st retry: 1000ms (1 second)
 * - 2nd retry: 2000ms (2 seconds)
 * - 3rd retry: 4000ms (4 seconds)
 * 
 * @param {Function} asyncFn - Async function to execute
 * @param {number} maxRetries - Maximum number of retries (default: 3)
 * @param {number[]} delays - Delay durations in ms for each retry
 * @returns {Promise<any>}
 */
export async function retryWithBackoff(
  asyncFn,
  maxRetries = 3,
  delays = [1000, 2000, 4000]
) {
  let attempt = 0;

  while (true) {
    try {
      return await asyncFn();
    } catch (error) {
      attempt++;

      // If we've reached or exceeded maxRetries, throw the error
      if (attempt > maxRetries) {
        throw error;
      }

      // Check if the error is retryable (rate limits 429, server errors 500/503, network timeouts)
      const status = error?.status || error?.statusCode || error?.response?.status;
      const isRetryable =
        !status || // Network/timeout errors usually don't have HTTP status
        status === 429 ||
        status === 500 ||
        status === 502 ||
        status === 503 ||
        status === 504;

      if (!isRetryable) {
        // Non-retryable error (e.g., 400 Bad Request, 401 Unauthorized), fail fast
        throw error;
      }

      const delayMs = delays[attempt - 1] || delays[delays.length - 1];
      console.warn(
        `[Retry] Attempt ${attempt} failed with ${error.message}. Retrying in ${delayMs}ms...`
      );
      await sleep(delayMs);
    }
  }
}
