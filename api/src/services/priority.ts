import type { Effort, ReturnLevel, PriorityScore } from '@shared/types';

// effort × returnLevel → priorityScore
// High return + low effort = top (do first); low return + high effort = lowest
const MATRIX: Record<ReturnLevel, Record<Effort, PriorityScore>> = {
  high:   { low: 'top',    medium: 'high',   high: 'high'   },
  medium: { low: 'high',   medium: 'medium', high: 'low'    },
  low:    { low: 'medium', medium: 'low',    high: 'lowest' },
};

export function computePriorityScore(effort: Effort, returnLevel: ReturnLevel): PriorityScore {
  return MATRIX[returnLevel][effort];
}
