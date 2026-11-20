import { jest, describe, test, expect } from '@jest/globals';
import { retryWithBackoff } from '../utils/retry.js';

describe('Retry Utility – Exponential Backoff', () => {
  test('Successful operation on first attempt should return immediately', async () => {
    const mockFn = jest.fn().mockResolvedValue('success_data');

    const result = await retryWithBackoff(mockFn, 3, [10, 20, 40]);

    expect(result).toBe('success_data');
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  test('Temporary failure should retry and succeed on subsequent attempt', async () => {
    let callCount = 0;
    const mockFn = jest.fn().mockImplementation(async () => {
      callCount++;
      if (callCount < 3) {
        const err = new Error('Rate limit exceeded');
        err.status = 429;
        throw err;
      }
      return 'recovered_data';
    });

    const result = await retryWithBackoff(mockFn, 3, [10, 20, 40]);

    expect(result).toBe('recovered_data');
    expect(mockFn).toHaveBeenCalledTimes(3);
  });

  test('Exhausted retries on persistent error should throw an error', async () => {
    const mockFn = jest.fn().mockImplementation(async () => {
      const err = new Error('Internal Server Error');
      err.status = 500;
      throw err;
    });

    await expect(retryWithBackoff(mockFn, 3, [10, 20, 40])).rejects.toThrow(
      'Internal Server Error'
    );
    // 1 initial try + 3 retries = 4 total attempts
    expect(mockFn).toHaveBeenCalledTimes(4);
  });

  test('Non-retryable client error (e.g. 400 Bad Request) should fail fast without retrying', async () => {
    const mockFn = jest.fn().mockImplementation(async () => {
      const err = new Error('Bad Request');
      err.status = 400;
      throw err;
    });

    await expect(retryWithBackoff(mockFn, 3, [10, 20, 40])).rejects.toThrow(
      'Bad Request'
    );
    expect(mockFn).toHaveBeenCalledTimes(1);
  });
});
