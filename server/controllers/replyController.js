import { generateCustomerReply } from '../services/aiService.js';

/**
 * Controller to generate an empathetic customer service response on-demand.
 * Endpoint: POST /api/reviews/:reviewId/reply
 */
export async function generateReply(req, res, next) {
  try {
    const { reviewId } = req.params;
    const { review_text, product, summary, topics } = req.body;

    if (!review_text || typeof review_text !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: review_text'
      });
    }

    const reply = await generateCustomerReply({
      review_text,
      product,
      summary,
      topics
    });

    return res.status(200).json({
      success: true,
      reviewId,
      reply
    });
  } catch (error) {
    next(error);
  }
}
