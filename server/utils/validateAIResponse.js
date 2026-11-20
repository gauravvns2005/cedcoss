/**
 * Allowed values for AI response fields
 */
export const ALLOWED_SENTIMENTS = ['positive', 'neutral', 'negative'];

export const ALLOWED_TOPICS = [
  'quality',
  'delivery',
  'price',
  'packaging',
  'support',
  'size_fit',
  'other'
];

/**
 * Validates the structure and content of Groq AI analysis response.
 * 
 * Rules:
 * 1. Must be valid JSON object
 * 2. sentiment must be: 'positive', 'neutral', or 'negative'
 * 3. topics must be a non-empty array containing only allowed topics
 * 4. summary must be a non-empty string
 * 5. needs_reply must be a boolean
 * 6. No extra fields allowed beyond the 4 required fields
 * 
 * @param {any} rawResponse - Parsed JSON object or JSON string from AI
 * @returns {{ isValid: boolean, error: string | null, data: object | null }}
 */
export function validateAIResponse(rawResponse) {
  let parsed = rawResponse;

  // 1. Check if string needs JSON parsing
  if (typeof rawResponse === 'string') {
    try {
      // Strip potential markdown code fences e.g. ```json ... ```
      const cleaned = rawResponse
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();
      parsed = JSON.parse(cleaned);
    } catch (err) {
      return {
        isValid: false,
        error: `Invalid JSON format: ${err.message}`,
        data: null
      };
    }
  }

  // Ensure it's a non-null object and not an array
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return {
      isValid: false,
      error: 'Response must be a JSON object',
      data: null
    };
  }

  // Check for exact allowed keys (no extra fields)
  const allowedKeys = ['sentiment', 'topics', 'summary', 'needs_reply'];
  const actualKeys = Object.keys(parsed);

  for (const key of allowedKeys) {
    if (!(key in parsed)) {
      return {
        isValid: false,
        error: `Missing required field: ${key}`,
        data: null
      };
    }
  }

  for (const key of actualKeys) {
    if (!allowedKeys.includes(key)) {
      return {
        isValid: false,
        error: `Unexpected extra field: ${key}`,
        data: null
      };
    }
  }

  // 2. Validate sentiment
  if (!ALLOWED_SENTIMENTS.includes(parsed.sentiment)) {
    return {
      isValid: false,
      error: `Invalid sentiment '${parsed.sentiment}'. Must be one of: ${ALLOWED_SENTIMENTS.join(', ')}`,
      data: null
    };
  }

  // 3. Validate topics
  if (!Array.isArray(parsed.topics) || parsed.topics.length === 0) {
    return {
      isValid: false,
      error: 'topics must be a non-empty array',
      data: null
    };
  }

  for (const topic of parsed.topics) {
    if (!ALLOWED_TOPICS.includes(topic)) {
      return {
        isValid: false,
        error: `Invalid topic '${topic}'. Allowed topics: ${ALLOWED_TOPICS.join(', ')}`,
        data: null
      };
    }
  }

  // 4. Validate summary
  if (typeof parsed.summary !== 'string' || parsed.summary.trim().length === 0) {
    return {
      isValid: false,
      error: 'summary must be a non-empty string',
      data: null
    };
  }

  // 5. Validate needs_reply
  if (typeof parsed.needs_reply !== 'boolean') {
    return {
      isValid: false,
      error: 'needs_reply must be a boolean',
      data: null
    };
  }

  return {
    isValid: true,
    error: null,
    data: {
      sentiment: parsed.sentiment,
      topics: parsed.topics,
      summary: parsed.summary.trim(),
      needs_reply: parsed.needs_reply
    }
  };
}
