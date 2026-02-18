import { NextRequest, NextResponse } from 'next/server';

import { translateStory } from '@/lib/gemini';
import { Story } from '@/lib/types';

function isValidStoryPayload(payload: unknown): payload is Story {
  if (payload === null || typeof payload !== 'object') {
    return false;
  }

  const maybeStory = payload as { [key: string]: unknown };
  const title = maybeStory.title;
  const url = maybeStory.url;

  if (typeof title !== 'string' || title.length === 0 || title.length > 256) {
    return false;
  }

  if (typeof url !== 'string' || url.length === 0 || url.length > 2048) {
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
  const translation = await translateStory(story);
  return NextResponse.json(translation);
}
