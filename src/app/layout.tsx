import '@/styles/globals.css';

import Link from 'next/link';
import { ReactNode } from 'react';

import { WebVitals } from '@/components/WebVitals';

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-slate-100">
        <WebVitals />
        <header className="bg-orange-500 shadow-md">
          <div className="mx-auto max-w-3xl px-6 py-3">
            <Link
              href="/"
              className="text-white font-bold text-xl tracking-wide hover:opacity-80 transition-opacity"
            >
              🗞 HN 日本語ダイジェスト
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-3xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
