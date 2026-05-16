import { api } from './api';
import type { AiParseBody, AiParseResponse, DraftItem } from '@shared/types';

export const aiService = {
  parseTranscript: async (body: AiParseBody): Promise<AiParseResponse> => {
    try {
      return await api.post<AiParseResponse>('/ai/parse', body);
    } catch {
      // Fallback: empty draft card with raw transcript as title
      const fallback: DraftItem = {
        type: 'task',
        title: body.transcript,
        themeId: null,
        themeConfidence: null,
        effort: null,
        effortConfidence: null,
        returnLevel: null,
        returnLevelConfidence: null,
        weekAssignment: 'this_week',
        goalId: null,
      };
      return { items: [fallback] };
    }
  },
};
