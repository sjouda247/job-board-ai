import path from 'path';
import { gemini, geminiModel } from '../config/gemini';
import { AIEvaluationResult, Job } from '../types';

const MIME_TYPES: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

export class GeminiService {
  /**
   * Evaluate resume against job requirements by uploading file to Gemini and
   * sending it with the evaluation prompt.
   */
  static async evaluateResume(filePath: string, job: Job): Promise<AIEvaluationResult> {
    if (!gemini) {
      throw new Error('Gemini client not initialized. Please set GEMINI_API_KEY in your .env file.');
    }

    try {
      const ext = path.extname(filePath).toLowerCase();
      const mimeType = MIME_TYPES[ext] || 'application/octet-stream';

      // Upload file to Gemini Files API
      const uploadedFile = await gemini.files.upload({
        file: filePath,
        config: { mimeType },
      });
      const fileUri = (uploadedFile as { uri?: string; name?: string }).uri ?? (uploadedFile as { uri?: string; name?: string }).name;
      if (!fileUri) throw new Error('File upload did not return a URI');

      const prompt = `Evaluate this candidate's resume against the following job requirements:

Job Title: ${job.title}
Requirements: ${job.requirements}
Description: ${job.description}
Location: ${job.location}

Please provide:
1. A score from 1-10 (10 being perfect match)
2. Brief feedback (2-3 sentences) explaining the score

Focus on:
- Relevant skills and experience
- Education background
- Cultural fit indicators
- Years of experience match

Format your response as JSON only, no other text:
{
  "score": <number>,
  "feedback": "<string>"
}`;

      const response = await gemini.models.generateContent({
        model: geminiModel,
        contents: [
          {
            role: 'user',
            parts: [
              { fileData: { fileUri, mimeType } },
              { text: prompt },
            ],
          },
        ],
        config: {
          temperature: 0.3,
          responseMimeType: 'application/json',
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('Empty response from Gemini');
      }

      const result = JSON.parse(responseText) as AIEvaluationResult;

      // Validate score is between 1-10
      if (result.score < 1 || result.score > 10) {
        result.score = Math.max(1, Math.min(10, result.score));
      }

      return result;
    } catch (error) {
      console.error('Gemini evaluation error:', error);
      throw new Error('Failed to evaluate resume');
    }
  }
}
