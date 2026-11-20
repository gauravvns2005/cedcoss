import Papa from 'papaparse';
import { normalizeReviewText } from '../utils/hashReview.js';

const REQUIRED_COLUMNS = ['review_id', 'product', 'rating', 'date', 'review_text'];

/**
 * Validates and cleans raw CSV data.
 * 
 * Rules:
 * - Validate required columns: review_id, product, rating, date, review_text
 * - Skip empty review text
 * - Trim unnecessary spaces
 * - Handle missing ratings (set to null)
 * - Handle invalid ratings such as "five" (set to null)
 * - Accept only numeric ratings 1 to 5; all others become null
 * - Detect duplicate reviews using normalized review text
 * - Preserve all review IDs in response
 * - Return useful statistics
 * 
 * @param {string | Buffer} csvContent - Raw CSV string or buffer
 * @returns {{ rows: Array, stats: object }}
 */
export function cleanAndValidateCSV(csvContent) {
  const contentString = Buffer.isBuffer(csvContent)
    ? csvContent.toString('utf-8')
    : String(csvContent || '');

  const parsed = Papa.parse(contentString, {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: (header) => header.trim().toLowerCase()
  });

  if (parsed.errors && parsed.errors.length > 0) {
    const fatalErrors = parsed.errors.filter((e) => e.type === 'FieldMismatch' || e.code === 'UndetectableDelimiter');
    if (fatalErrors.length > 0) {
      throw new Error(`CSV Parsing error: ${fatalErrors.map((e) => e.message).join('; ')}`);
    }
  }

  const headers = parsed.meta?.fields || [];
  const missingColumns = REQUIRED_COLUMNS.filter((col) => !headers.includes(col));

  if (missingColumns.length > 0) {
    throw new Error(
      `Invalid CSV format. Missing required column(s): ${missingColumns.join(', ')}. Expected: ${REQUIRED_COLUMNS.join(', ')}`
    );
  }

  const cleanedRows = [];
  const seenNormalizedTexts = new Map(); // normalizedText -> originalReviewId

  let totalRows = 0;
  let skippedRows = 0;
  let duplicateRows = 0;
  let validRows = 0;

  for (let i = 0; i < parsed.data.length; i++) {
    const rawRow = parsed.data[i];
    totalRows++;

    // Extract and trim fields
    const reviewId = rawRow.review_id ? String(rawRow.review_id).trim() : `ROW_${i + 1}`;
    const product = rawRow.product ? String(rawRow.product).trim() : 'Unknown Product';
    const date = rawRow.date ? String(rawRow.date).trim() : '';
    const rawReviewText = rawRow.review_text ? String(rawRow.review_text).trim() : '';

    // Handle rating: only integers 1-5 allowed. Everything else (missing, null, "five", decimals outside, etc.) -> null
    let rating = null;
    const rawRating = rawRow.rating !== undefined && rawRow.rating !== null ? String(rawRow.rating).trim() : '';
    if (rawRating !== '') {
      const parsedNum = Number(rawRating);
      if (Number.isInteger(parsedNum) && parsedNum >= 1 && parsedNum <= 5) {
        rating = parsedNum;
      } else {
        rating = null; // e.g. "five", "0", "6", "N/A"
      }
    }

    // Check for empty review text
    if (!rawReviewText) {
      skippedRows++;
      cleanedRows.push({
        review_id: reviewId,
        product,
        rating,
        date,
        review_text: '',
        status: 'skipped',
        reason: 'empty_review_text',
        is_duplicate: false,
        duplicate_of: null,
        analysis: null
      });
      continue;
    }

    validRows++;
    const normalizedText = normalizeReviewText(rawReviewText);

    // Duplicate detection
    let isDuplicate = false;
    let duplicateOf = null;

    if (seenNormalizedTexts.has(normalizedText)) {
      isDuplicate = true;
      duplicateOf = seenNormalizedTexts.get(normalizedText);
      duplicateRows++;
    } else {
      seenNormalizedTexts.set(normalizedText, reviewId);
    }

    cleanedRows.push({
      review_id: reviewId,
      product,
      rating,
      date,
      review_text: rawReviewText,
      normalized_text: normalizedText,
      status: 'pending',
      is_duplicate: isDuplicate,
      duplicate_of: duplicateOf,
      analysis: null
    });
  }

  const uniqueToAnalyze = seenNormalizedTexts.size;

  return {
    rows: cleanedRows,
    stats: {
      total_rows: totalRows,
      valid_rows: validRows,
      skipped_rows: skippedRows,
      duplicate_rows: duplicateRows,
      unique_to_analyze: uniqueToAnalyze
    }
  };
}
