export type HNItemType = 'story' | 'comment' | 'poll' | 'job' | 'pollopt';

export type Story = {
  by?: string;
  descendants?: number;
  id: number;
  score?: number;
  time?: number;
  title: string;
  type?: HNItemType;
  url?: string;
};

export type TranslationResult = {
  error?: string;
  summaryJa: string;
  titleJa: string;
  warning?: string;
};
