import { describe, it, expect } from 'vitest';

// Replicate isValidStoryPayload for testing (not exported from route.ts)
// url is optional: undefined/null は許可、空文字・長すぎる文字列は拒否
function isValidStoryPayload(
  payload: unknown
): payload is { id: number; title: string; url?: string } {
  if (payload === null || typeof payload !== 'object') {
    return false;
  }

  const maybeStory = payload as { [key: string]: unknown };

  if (typeof maybeStory.id !== 'number' || !Number.isInteger(maybeStory.id)) {
    return false;
  }

  if (
    typeof maybeStory.title !== 'string' ||
    maybeStory.title.length === 0 ||
    maybeStory.title.length > 256
  ) {
    return false;
  }

  const url = maybeStory.url;

  if (
    url !== undefined &&
    url !== null &&
    (typeof url !== 'string' || url.length === 0 || url.length > 2048)
  ) {
    return false;
  }

  return true;
}

describe('isValidStoryPayload', () => {
  it('正常なペイロード（urlあり）を受け入れる', () => {
    const payload = {
      id: 123,
      title: 'Test Story',
      url: 'https://example.com',
    };
    expect(isValidStoryPayload(payload)).toBe(true);
  });

  it('urlなしのペイロードを受け入れる（urlはoptional）', () => {
    const payload = { id: 1, title: 'Test' };
    expect(isValidStoryPayload(payload)).toBe(true);
  });

  it('url が null のペイロードを受け入れる', () => {
    const payload = { id: 1, title: 'Test', url: null };
    expect(isValidStoryPayload(payload)).toBe(true);
  });

  it('nullを拒否する', () => {
    expect(isValidStoryPayload(null)).toBe(false);
  });

  it('文字列を拒否する', () => {
    expect(isValidStoryPayload('string')).toBe(false);
  });

  it('idがないペイロードを拒否する', () => {
    const payload = { title: 'Test', url: 'https://example.com' };
    expect(isValidStoryPayload(payload)).toBe(false);
  });

  it('idが文字列のペイロードを拒否する', () => {
    const payload = { id: '123', title: 'Test', url: 'https://example.com' };
    expect(isValidStoryPayload(payload)).toBe(false);
  });

  it('idが小数のペイロードを拒否する', () => {
    const payload = { id: 1.5, title: 'Test', url: 'https://example.com' };
    expect(isValidStoryPayload(payload)).toBe(false);
  });

  it('titleが空のペイロードを拒否する', () => {
    const payload = { id: 1, title: '', url: 'https://example.com' };
    expect(isValidStoryPayload(payload)).toBe(false);
  });

  it('titleが256文字超のペイロードを拒否する', () => {
    const payload = {
      id: 1,
      title: 'a'.repeat(257),
      url: 'https://example.com',
    };
    expect(isValidStoryPayload(payload)).toBe(false);
  });

  it('urlが空文字のペイロードを拒否する', () => {
    const payload = { id: 1, title: 'Test', url: '' };
    expect(isValidStoryPayload(payload)).toBe(false);
  });

  it('urlが2048文字超のペイロードを拒否する', () => {
    const payload = {
      id: 1,
      title: 'Test',
      url: 'https://example.com/' + 'a'.repeat(2048),
    };
    expect(isValidStoryPayload(payload)).toBe(false);
  });
});
