import { cleanAndValidateCSV } from '../services/csvService.js';
import { analyzeBatchReviews } from '../services/aiService.js';
import { generateInsights } from '../services/insightService.js';

/**
 * Controller to handle CSV file upload, data cleaning, and AI batch analysis.
 * Endpoint: POST /api/reviews/analyze
 */
export async function analyzeReviews(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No CSV file uploaded. Please upload a valid CSV file under field "file".'
      });
    }

    // Step 1: Clean and validate CSV
    const { rows: cleanedRows, stats: csvStats } = cleanAndValidateCSV(req.file.buffer);

    if (!cleanedRows || cleanedRows.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'The uploaded CSV file contains no data rows.'
      });
    }

    // Step 2: Batch AI analysis with caching and duplicate reuse
    const analyzedRows = await analyzeBatchReviews(cleanedRows);

    // Step 3: Calculate summary metrics
    // Rule: Do not count failed or skipped reviews as analysed
    const analyzedOnly = analyzedRows.filter(
      (r) => r.status === 'analyzed' && r.analysis
    );

    const totalAnalysed = analyzedOnly.length;
    let positiveCount = 0;
    let neutralCount = 0;
    let negativeCount = 0;
    let needsReplyCount = 0;

    for (const r of analyzedOnly) {
      const sentiment = r.analysis.sentiment;
      if (sentiment === 'positive') positiveCount++;
      else if (sentiment === 'neutral') neutralCount++;
      else if (sentiment === 'negative') negativeCount++;

      if (r.analysis.needs_reply === true) {
        needsReplyCount++;
      }
    }

    const positivePct = totalAnalysed > 0 ? Math.round((positiveCount / totalAnalysed) * 100) : 0;
    const neutralPct = totalAnalysed > 0 ? Math.round((neutralCount / totalAnalysed) * 100) : 0;
    const negativePct = totalAnalysed > 0 ? Math.round((negativeCount / totalAnalysed) * 100) : 0;

    // Step 4: Generate dynamic insights (Top 3 Complaints & Top 3 Praises)
    const insights = generateInsights(analyzedRows);

    return res.status(200).json({
      success: true,
      stats: {
        total_rows: csvStats.total_rows,
        valid_rows: csvStats.valid_rows,
        skipped_rows: csvStats.skipped_rows,
        duplicate_rows: csvStats.duplicate_rows,
        total_analysed: totalAnalysed,
        positive_count: positiveCount,
        neutral_count: neutralCount,
        negative_count: negativeCount,
        positive_pct: positivePct,
        neutral_pct: neutralPct,
        negative_pct: negativePct,
        needs_reply_count: needsReplyCount
      },
      insights,
      reviews: analyzedRows
    });
  } catch (error) {
    next(error);
  }
}
