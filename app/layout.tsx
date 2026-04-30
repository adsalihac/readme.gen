import type { Metadata } from 'next';
import { Geist_Mono, Roboto_Mono } from 'next/font/google';
import './globals.css';

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
});

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-roboto-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'GitHub README Generator — AI-powered developer branding',
  description:
    'Generate a polished GitHub README, bio, skill badges, and sponsor pitch in seconds using AI. Free, no sign-up required.',
  keywords: [
    'GitHub README generator',
    'AI profile generator',
    'developer branding',
    'GitHub bio generator',
  ],
  openGraph: {
    title: 'GitHub README Generator',
    description: 'Build a GitHub profile that stands out — powered by AI.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistMono.variable} ${robotoMono.variable}`}>
      <body className="min-h-screen bg-white font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
