import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

function createGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn('WARNING: GEMINI_API_KEY is not set. AI evaluation will not work.');
    return null;
  }

  return new GoogleGenAI({ apiKey });
}

export const gemini = createGeminiClient();
export const geminiModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
export const aiScoreThreshold = parseInt(process.env.AI_SCORE_THRESHOLD || '5', 10);
