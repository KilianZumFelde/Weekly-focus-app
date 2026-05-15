import { computePriorityScore } from '../../src/services/priority.js';

describe('computePriorityScore', () => {
  it('high return + low effort = top', () => expect(computePriorityScore('low', 'high')).toBe('top'));
  it('high return + medium effort = high', () => expect(computePriorityScore('medium', 'high')).toBe('high'));
  it('high return + high effort = high', () => expect(computePriorityScore('high', 'high')).toBe('high'));
  it('medium return + low effort = high', () => expect(computePriorityScore('low', 'medium')).toBe('high'));
  it('medium return + medium effort = medium', () => expect(computePriorityScore('medium', 'medium')).toBe('medium'));
  it('medium return + high effort = low', () => expect(computePriorityScore('high', 'medium')).toBe('low'));
  it('low return + low effort = medium', () => expect(computePriorityScore('low', 'low')).toBe('medium'));
  it('low return + medium effort = low', () => expect(computePriorityScore('medium', 'low')).toBe('low'));
  it('low return + high effort = lowest', () => expect(computePriorityScore('high', 'low')).toBe('lowest'));
});
