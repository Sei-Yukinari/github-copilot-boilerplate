import '@/styles/globals.css';

import { ReactNode } from 'react';

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ja">
      <body>
        <main className="mx-auto max-w-3xl p-6">{children}</main>
      </body>
    </html>
  );
}
