import { NextRequest, NextResponse } from 'next/server';

import { translateStory } from '@/lib/gemini';
import { Story } from '@/lib/types';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const story = (await request.json()) as Story;
  const translation = await translateStory(story);
  return NextResponse.json(translation);
}
