import { validateAIResponse } from '../utils/validateAIResponse.js';

describe('AI Response Validation', () => {
  test('Valid AI response should pass schema validation', () => {
    const validPayload = {
      sentiment: 'positive',
      topics: ['quality', 'price'],
      summary: 'The customer is pleased with the product quality.',
      needs_reply: false
    };

    const result = validateAIResponse(validPayload);
    expect(result.isValid).toBe(true);
    expect(result.error).toBeNull();
    expect(result.data).toEqual(validPayload);
  });

  test('Valid JSON string should be successfully parsed and validated', () => {
    const jsonString = JSON.stringify({
      sentiment: 'negative',
      topics: ['delivery'],
      summary: 'Package arrived late and broken.',
      needs_reply: true
    });

    const result = validateAIResponse(jsonString);
    expect(result.isValid).toBe(true);
    expect(result.data.sentiment).toBe('negative');
  });

  test('Markdown-wrapped JSON string should be cleaned and validated', () => {
    const markdownWrapped = `\`\`\`json
{
  "sentiment": "neutral",
  "topics": ["other"],
  "summary": "Average performance with standard features.",
  "needs_reply": false
}
\`\`\``;

    const result = validateAIResponse(markdownWrapped);
    expect(result.isValid).toBe(true);
    expect(result.data.sentiment).toBe('neutral');
  });

  test('Invalid sentiment should fail validation', () => {
    const invalidPayload = {
      sentiment: 'very_happy', // not allowed
      topics: ['quality'],
      summary: 'Product is nice.',
      needs_reply: false
    };

    const result = validateAIResponse(invalidPayload);
    expect(result.isValid).toBe(false);
    expect(result.error).toMatch(/Invalid sentiment/i);
  });

  test('Invalid topic should fail validation', () => {
    const invalidPayload = {
      sentiment: 'positive',
      topics: ['quality', 'discounts'], // 'discounts' not in allowed list
      summary: 'Good product.',
      needs_reply: false
    };

    const result = validateAIResponse(invalidPayload);
    expect(result.isValid).toBe(false);
    expect(result.error).toMatch(/Invalid topic/i);
  });

  test('Missing fields should fail validation', () => {
    const missingSentiment = {
      topics: ['quality'],
      summary: 'Good sound quality.',
      needs_reply: false
    };

    const result = validateAIResponse(missingSentiment);
    expect(result.isValid).toBe(false);
    expect(result.error).toMatch(/Missing required field: sentiment/i);
  });

  test('Extra unexpected fields should fail validation', () => {
    const extraFieldPayload = {
      sentiment: 'positive',
      topics: ['quality'],
      summary: 'Solid construction.',
      needs_reply: false,
      confidence_score: 0.95 // Extra field not allowed
    };

    const result = validateAIResponse(extraFieldPayload);
    expect(result.isValid).toBe(false);
    expect(result.error).toMatch(/Unexpected extra field: confidence_score/i);
  });

  test('Non-boolean needs_reply should fail validation', () => {
    const invalidBool = {
      sentiment: 'negative',
      topics: ['support'],
      summary: 'Customer needs support urgently.',
      needs_reply: 'yes' // string instead of boolean
    };

    const result = validateAIResponse(invalidBool);
    expect(result.isValid).toBe(false);
    expect(result.error).toMatch(/needs_reply must be a boolean/i);
  });
});
