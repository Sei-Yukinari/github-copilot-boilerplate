import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Replicate isValidStoryPayload for testing (not exported from route.ts)
function isValidStoryPayload(
  payload: unknown
): payload is { id: number; title: string; url: string } {
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

  if (
    typeof maybeStory.url !== 'string' ||
    maybeStory.url.length === 0 ||
    maybeStory.url.length > 2048
  ) {
    return false;
  }

  return true;
}

describe('isValidStoryPayload', () => {
  it('正常なペイロードを受け入れる', () => {
    const payload = {
      id: 123,
      title: 'Test Story',
      url: 'https://example.com',
    };
    assert.equal(isValidStoryPayload(payload), true);
  });

  it('nullを拒否する', () => {
    assert.equal(isValidStoryPayload(null), false);
  });

  it('文字列を拒否する', () => {
    assert.equal(isValidStoryPayload('string'), false);
  });

  it('idがないペイロードを拒否する', () => {
    const payload = { title: 'Test', url: 'https://example.com' };
    assert.equal(isValidStoryPayload(payload), false);
  });

  it('idが文字列のペイロードを拒否する', () => {
    const payload = { id: '123', title: 'Test', url: 'https://example.com' };
    assert.equal(isValidStoryPayload(payload), false);
  });

  it('idが小数のペイロードを拒否する', () => {
    const payload = { id: 1.5, title: 'Test', url: 'https://example.com' };
    assert.equal(isValidStoryPayload(payload), false);
  });

  it('titleが空のペイロードを拒否する', () => {
    const payload = { id: 1, title: '', url: 'https://example.com' };
    assert.equal(isValidStoryPayload(payload), false);
  });

  it('titleが256文字超のペイロードを拒否する', () => {
    const payload = {
      id: 1,
      title: 'a'.repeat(257),
      url: 'https://example.com',
    };
    assert.equal(isValidStoryPayload(payload), false);
  });

  it('urlがないペイロードを拒否する', () => {
    const payload = { id: 1, title: 'Test' };
    assert.equal(isValidStoryPayload(payload), false);
  });

  it('urlが空のペイロードを拒否する', () => {
    const payload = { id: 1, title: 'Test', url: '' };
    assert.equal(isValidStoryPayload(payload), false);
  });
});
