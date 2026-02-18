import { NextRequest, NextResponse } from 'next/server';

import { translateStory } from '@/lib/gemini';
import { saveTranslation } from '@/lib/translation-store';
import { Story } from '@/lib/types';

function isValidStoryPayload(payload: unknown): payload is Story {
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

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON payload' },
      { status: 400 }
    );
  }

  if (!isValidStoryPayload(body)) {
    return NextResponse.json(
      { error: 'Invalid story payload' },
      { status: 400 }
    );
  }

  const story: Story = body;

  let translation;
  try {
    translation = await translateStory(story);
  } catch (error) {
    console.error('Translation failed:', {
      storyId: story.id,
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Translation service error' },
      { status: 503 }
    );
  }

  if (!translation.error) {
    await saveTranslation(story.id, translation);
  }

  return NextResponse.json(translation);
}
