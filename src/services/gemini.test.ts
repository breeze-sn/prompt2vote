import { describe, expect, it } from 'vitest';
import { generateChatResponse } from './gemini';

describe('generateChatResponse', () => {
  it('returns a preset answer without calling Gemini for registration questions', async () => {
    const result = await generateChatResponse('How do I register to vote?', null, 0);

    expect(result).toContain('Form 6');
    expect(result).toContain('voters.eci.gov.in');
  });

  it('greets back when greeted', async () => {
    const result = await generateChatResponse('hello there', null, 0);

    expect(result).toMatch(/thanks for reaching out/i);
  });

  it('rejects non-election questions', async () => {
    const result = await generateChatResponse('What is the capital of France?', null, 0);

    expect(result).toMatch(/election-related help only/i);
  });
});