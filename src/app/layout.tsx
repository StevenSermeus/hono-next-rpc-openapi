import { Suspense } from 'react';

import type { Metadata } from 'next';
import localFont from 'next/font/local';

import Navigation from '@/components/navigation';
import { Providers } from '@/providers/providers';
import { ThemeProvider } from '@/providers/theme-provider';

import './globals.css';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'Template',
  description:
    'A template for Next.js with TypeScript, Tailwind CSS, and React Query. Use Hono for API requests.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Providers>
            <Suspense fallback={<div>Loading...</div>}>
              <Navigation />
            </Suspense>
            {children}
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
