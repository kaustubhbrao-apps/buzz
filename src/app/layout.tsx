import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Buzz — Work Loud.',
  description:
    "India's proof-of-work professional network. Post your real work. Build your Buzz Score. Get hired on merit.",
  openGraph: {
    title: 'Buzz — Work Loud.',
    description:
      "India's proof-of-work professional network. Post your real work. Build your Buzz Score. Get hired on merit.",
    siteName: 'Buzz',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-buzz-bg text-buzz-text antialiased`}>
        {children}
      </body>
    </html>
  );
}
