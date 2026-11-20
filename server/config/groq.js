import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

// Create and export the Groq client instance
const groqApiKey = process.env.GROQ_API_KEY || '';

export const groq = new Groq({
  apiKey: groqApiKey
});

// Configurable model from environment variable with reliable default
export const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
