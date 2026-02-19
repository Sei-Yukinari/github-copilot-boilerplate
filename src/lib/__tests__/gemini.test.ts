import { describe, it, expect } from 'vitest';

// extractJsonBlock is not exported, so we replicate it for testing
function extractJsonBlock(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }
  return text.trim();
}

describe('extractJsonBlock', () => {
  it('fenced json block を正しく抽出する', () => {
    const input = '```json\n{"titleJa": "テスト"}\n```';
    const result = extractJsonBlock(input);
    expect(result).toBe('{"titleJa": "テスト"}');
  });

  it('fenced block (lang指定なし) を正しく抽出する', () => {
    const input = '```\n{"titleJa": "テスト"}\n```';
    const result = extractJsonBlock(input);
    expect(result).toBe('{"titleJa": "テスト"}');
  });

  it('fenceなしの場合はtrimして返す', () => {
    const input = '  {"titleJa": "テスト"}  ';
    const result = extractJsonBlock(input);
    expect(result).toBe('{"titleJa": "テスト"}');
  });

  it('空文字列の場合は空文字列を返す', () => {
    const result = extractJsonBlock('');
    expect(result).toBe('');
  });

  it('前後にテキストがあるfenced blockを抽出する', () => {
    const input =
      'Here is the result:\n```json\n{"titleJa": "テスト"}\n```\nDone.';
    const result = extractJsonBlock(input);
    expect(result).toBe('{"titleJa": "テスト"}');
  });
});
