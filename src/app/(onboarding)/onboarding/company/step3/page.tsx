'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Link2, Check } from 'lucide-react';

export default function CompanyStep3() {
  const router = useRouter();
  const [method, setMethod] = useState<'domain' | 'linkedin' | null>(null);
  const [email, setEmail] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="text-center py-8">
        <div className="w-14 h-14 rounded-2xl bg-[#FFD60A] flex items-center justify-center mx-auto mb-4">
          <Check className="w-7 h-7 text-[#0F0F0F]" />
        </div>
        <h2 className="font-bold text-[15px] text-[#0F0F0F] mb-1">{method === 'domain' ? 'Verification email sent' : 'Submitted for review'}</h2>
        <p className="text-[13px] text-[#0F0F0F]/50 mb-6">{method === 'domain' ? `Check ${email}` : 'We will review in 24 hours'}</p>
        <button onClick={() => router.push('/feed')} className="btn-primary">Go to my page →</button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-[#0F0F0F] mb-1">Make it official</h1>
      <p className="text-[13px] text-[#0F0F0F]/50 mb-6">Verified companies get more applicants. Step 3 of 3.</p>

      <div className="space-y-3 mb-6">
        <button onClick={() => setMethod('domain')}
          className={`card-static w-full p-5 text-left transition-all ${method === 'domain' ? 'ring-2 ring-[#FFD60A]' : ''}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-[#F5F5F5] flex items-center justify-center"><Mail className="w-4 h-4 text-[#0F0F0F]/50" /></div>
            <span className="font-semibold text-[13px] text-[#0F0F0F]">Verify with domain email</span>
          </div>
          {method === 'domain' && (
            <div className="mt-3">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input mb-3" placeholder="name@yourcompany.com" />
              <button onClick={() => email && setSent(true)} className="btn-primary w-full text-[12px]">Send verification email</button>
            </div>
          )}
        </button>

        <button onClick={() => setMethod('linkedin')}
          className={`card-static w-full p-5 text-left transition-all ${method === 'linkedin' ? 'ring-2 ring-[#FFD60A]' : ''}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-[#F5F5F5] flex items-center justify-center"><Link2 className="w-4 h-4 text-[#0F0F0F]/50" /></div>
            <span className="font-semibold text-[13px] text-[#0F0F0F]">Verify with company page</span>
          </div>
          {method === 'linkedin' && (
            <div className="mt-3">
              <input type="url" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} className="input mb-3" placeholder="linkedin.com/company/..." />
              <button onClick={() => linkedin && setSent(true)} className="btn-primary w-full text-[12px]">Submit for review (24hrs)</button>
            </div>
          )}
        </button>
      </div>

      <button onClick={() => router.push('/feed')} className="btn-ghost w-full text-[13px]">Skip for now</button>
    </div>
  );
}
