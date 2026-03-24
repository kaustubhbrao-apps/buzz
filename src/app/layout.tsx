import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';
import './globals.css';

const font = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Buzz — Work Loud.',
  description: "India's proof-of-work professional network.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={font.className}>{children}</body>
    </html>
  );
}
