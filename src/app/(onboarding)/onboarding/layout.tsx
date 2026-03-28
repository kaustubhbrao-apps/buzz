'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Zap } from 'lucide-react';

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const step = pathname.includes('step1') ? 1 : pathname.includes('step2') ? 2 : 3;

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="max-w-md mx-auto px-4 py-8">
        <Link href="/" className="flex justify-center mb-6">
          <div className="w-10 h-10 rounded-2xl bg-[#FFD60A] flex items-center justify-center">
            <Zap className="w-5 h-5 text-[#0F0F0F]" fill="#0F0F0F" />
          </div>
        </Link>

        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`flex-1 h-1 rounded-full transition-all duration-500 ${s <= step ? 'bg-[#FFD60A]' : 'bg-[#F0F0EE]'}`} />
          ))}
        </div>

        {children}
      </div>
    </div>
  );
}
