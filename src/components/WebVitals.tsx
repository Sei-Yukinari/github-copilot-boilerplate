'use client';

import { useEffect } from 'react';
import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from 'web-vitals';

function reportMetric(metric: Metric) {
  // 開発環境ではコンソールに出力
  if (process.env.NODE_ENV === 'development') {
    console.log(
      '[Web Vitals]',
      metric.name,
      Math.round(metric.value),
      metric.rating
    );
  }

  // Vercel Analytics や外部サービスへの送信（将来拡張用）
  // navigator.sendBeacon('/api/vitals', JSON.stringify(metric));
}

export function WebVitals() {
  useEffect(() => {
    onCLS(reportMetric);
    onFCP(reportMetric);
    onINP(reportMetric);
    onLCP(reportMetric);
    onTTFB(reportMetric);
  }, []);

  return null;
}
