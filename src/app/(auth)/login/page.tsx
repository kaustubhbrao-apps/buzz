'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Zap, Mail } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleGoogleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex justify-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#FFD60A] flex items-center justify-center">
            <Zap className="w-6 h-6 text-[#0F0F0F]" fill="#0F0F0F" />
          </div>
        </Link>

        <div className="card-static p-6">
          {sent ? (
            <div className="text-center py-6">
              <Mail className="w-10 h-10 text-[#0F0F0F] mx-auto mb-3" />
              <h2 className="font-bold text-[15px] text-[#0F0F0F] mb-1">Check your email</h2>
              <p className="text-[13px] text-[#0F0F0F]/50">We sent a magic link to <strong>{email}</strong></p>
            </div>
          ) : (
            <>
              <h1 className="text-lg font-bold text-[#0F0F0F] text-center mb-6">Sign in to Buzz</h1>

              <button onClick={handleGoogleLogin} className="btn-secondary w-full flex items-center justify-center gap-2 mb-4">
                <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Continue with Google
              </button>

              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-[#F0F0F0]" />
                <span className="text-[11px] text-[#0F0F0F]/30 uppercase tracking-wider font-semibold">or</span>
                <div className="flex-1 h-px bg-[#F0F0F0]" />
              </div>

              <input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="input mb-3" />
              <button onClick={() => email && setSent(true)} className="btn-primary w-full">Send magic link</button>
            </>
          )}
        </div>

        <p className="text-center text-[13px] text-[#0F0F0F]/40 mt-4">
          New to Buzz? <Link href="/signup" className="font-semibold text-[#0F0F0F] underline underline-offset-2">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
