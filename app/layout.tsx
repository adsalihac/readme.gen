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
  title: 'readme.gen — Professional README generator',
  description:
    'Generate a polished GitHub profile README, bio, skills summary, and sponsor copy in seconds. Free to start.',
  keywords: [
    'GitHub README generator',
    'profile README generator',
    'professional README builder',
    'developer profile README',
  ],
  openGraph: {
    title: 'readme.gen',
    description: 'Generate a professional profile README that earns attention.',
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
