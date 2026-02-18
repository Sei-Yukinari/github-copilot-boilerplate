export type Story = {
  by?: string;
  descendants?: number;
  id: number;
  score?: number;
  time?: number;
  title: string;
  type?: string;
  url?: string;
};

export type TranslationResult = {
  error?: string;
  summaryJa: string;
  titleJa: string;
  warning?: string;
};
