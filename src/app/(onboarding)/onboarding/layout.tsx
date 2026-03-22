'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const getStep = () => {
    if (pathname.includes('step1')) return 1;
    if (pathname.includes('step2')) return 2;
    if (pathname.includes('step3')) return 3;
    return 1;
  };

  const step = getStep();

  return (
    <div className="min-h-screen bg-buzz-bg">
      <div className="max-w-lg mx-auto px-4 py-8">
        <Link href="/" className="block text-center text-2xl font-bold text-buzz-dark mb-8">
          ⚡ Buzz
        </Link>

        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 w-16 rounded-full transition-colors ${
                s <= step ? 'bg-buzz-yellow' : 'bg-buzz-border'
              }`}
            />
          ))}
        </div>

        {children}
      </div>
    </div>
  );
}
