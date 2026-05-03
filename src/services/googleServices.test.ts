import { describe, expect, it } from 'vitest';
import { classifyQuestion, getGoogleServicesLabel } from './googleServices';

describe('googleServices', () => {
  it('classifies preset and non-election questions deterministically', () => {
    expect(classifyQuestion('How do I register to vote?')).toBe('preset');
    expect(classifyQuestion('hello there')).toBe('greeting');
    expect(classifyQuestion('What is the capital of France?')).toBe('out_of_scope');
  });

  it('always exposes the Google services label', () => {
    expect(getGoogleServicesLabel()).toContain('Gemini');
  });
});