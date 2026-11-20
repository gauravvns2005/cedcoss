import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CACHE_FILE_PATH = path.join(__dirname, '..', 'data', 'cache.json');

class CacheService {
  constructor() {
    this.cache = {};
    this.init();
  }

  /**
   * Initializes cache by reading from server/data/cache.json
   */
  init() {
    try {
      const dir = path.dirname(CACHE_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (fs.existsSync(CACHE_FILE_PATH)) {
        const data = fs.readFileSync(CACHE_FILE_PATH, 'utf-8');
        this.cache = JSON.parse(data || '{}');
      } else {
        this.cache = {};
        this.saveToDisk();
      }
    } catch (error) {
      console.warn('[CacheService] Failed to load cache from disk, initializing empty cache:', error.message);
      this.cache = {};
    }
  }

  /**
   * Get cached result for a SHA-256 hash
   * @param {string} hash 
   * @returns {object | null}
   */
  get(hash) {
    if (!hash || typeof hash !== 'string') return null;
    return this.cache[hash] || null;
  }

  /**
   * Save valid analysis result to cache
   * @param {string} hash 
   * @param {object} result 
   */
  set(hash, result) {
    if (!hash || !result) return;
    this.cache[hash] = result;
    this.saveToDisk();
  }

  /**
   * Check if hash is cached
   * @param {string} hash 
   * @returns {boolean}
   */
  has(hash) {
    return Boolean(this.cache[hash]);
  }

  /**
   * Persists in-memory cache to disk safely
   */
  saveToDisk() {
    try {
      fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(this.cache, null, 2), 'utf-8');
    } catch (error) {
      console.error('[CacheService] Failed to write cache to disk:', error.message);
    }
  }

  /**
   * Clear cache (useful for testing or reset)
   */
  clear() {
    this.cache = {};
    this.saveToDisk();
  }
}

export const cacheService = new CacheService();
