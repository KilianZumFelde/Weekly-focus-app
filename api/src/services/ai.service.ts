import Anthropic from '@anthropic-ai/sdk';
import type { AiParseBody, AiParseResponse, DraftItem } from '@shared/types';

const client = new Anthropic({ apiKey: process.env['ANTHROPIC_API_KEY'] });

const PARSE_MODEL = process.env['CLAUDE_PARSE_MODEL'] ?? 'claude-haiku-4-5-20251001';

export async function parseTranscript(body: AiParseBody): Promise<AiParseResponse> {
  const { transcript, context } = body;

  const systemPrompt = `You are a voice capture parser for a personal productivity app. The user speaks naturally, and you extract one or more task or habit drafts from their words.

User's themes: ${JSON.stringify(context.themes)}
User's active goals: ${JSON.stringify(context.activeGoals)}
Current time (ISO): ${new Date().toISOString()} (UTC)

Return a JSON object with an "items" array. Each item is either a task or habit draft:

TASK draft: { "type": "task", "title": string, "themeId": string|null, "themeConfidence": "high"|"medium"|"low"|null, "effort": "low"|"medium"|"high"|null, "effortConfidence": "high"|"medium"|"low"|null, "returnLevel": "low"|"medium"|"high"|null, "returnLevelConfidence": "high"|"medium"|"low"|null, "weekAssignment": "this_week"|"backlog", "goalId": string|null, "suggestedReminder": {"type":"one_shot","fireAt":"ISO8601"}|{"type":"recurring_until_done","dailyTime":"HH:MM"}|null }

HABIT draft: { "type": "habit", "title": string, "themeId": string|null, "themeConfidence": "high"|"medium"|"low"|null, "weeklyTarget": number|null, "weeklyTargetConfidence": "high"|"medium"|"low"|null, "goalId": string|null }

Rules:
- "task" = one-time action; "habit" = weekly recurring behavior with a count target
- effort: "low"=minutes/quick, "medium"=few hours, "high"=major effort; null if truly unknown
- returnLevel: "high"=big life impact, "medium"=moderate, "low"=minor; null if truly unknown
- weekAssignment: default "this_week"; use "backlog" only if user says "later", "someday", "not now"
- themeId: match to closest theme by name; null if no clear match
- goalId: match to closest goal; null if no match
- confidence "high"=very certain, "medium"=likely, "low"=guessing, null=no information at all
- For reminders: parse natural time phrases to ISO 8601 UTC; "morning"=09:00, "afternoon"=14:00, "tonight/evening"=20:00
- Multi-item utterances: return all items in the array
- Return ONLY valid JSON, no explanation, no markdown code fences`;

  const response = await client.messages.create({
    model: PARSE_MODEL,
    max_tokens: 1024,
    temperature: 0,
    system: systemPrompt,
    messages: [{ role: 'user', content: transcript }],
  });

  const rawText = response.content[0]?.type === 'text' ? response.content[0].text : '{"items":[]}';
  const cleaned = rawText
    .replace(/^```(?:json)?\n?/, '')
    .replace(/\n?```$/, '')
    .trim();

  let parsed: { items: DraftItem[] };
  try {
    parsed = JSON.parse(cleaned) as { items: DraftItem[] };
  } catch {
    // Fallback: return single task with raw transcript as title
    parsed = {
      items: [{
        type: 'task',
        title: transcript,
        themeId: null,
        themeConfidence: null,
        effort: null,
        effortConfidence: null,
        returnLevel: null,
        returnLevelConfidence: null,
        weekAssignment: 'this_week',
        goalId: null,
      }],
    };
  }

  return { items: parsed.items };
}
