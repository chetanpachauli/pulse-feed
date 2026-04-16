import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PulseFeed - High-Performance Content Platform',
  description: 'A modern, high-performance content platform built with Next.js, Prisma, and PostgreSQL',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
