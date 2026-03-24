'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Zap, User, Building2, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<'person' | 'company' | null>(null);
  const [error, setError] = useState('');

  const handleGoogleSignup = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  const handlePickType = async (accountType: 'person' | 'company') => {
    setLoading(accountType);
    setError('');

    try {
      // Get the current session token from the browser client
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('Not signed in. Please sign in with Google first.');
      }

      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ account_type: accountType }),
      });

      if (!res.ok) {
        const data = await res.json();
        // If user already exists, just redirect to onboarding
        if (res.status === 409) {
          router.push(accountType === 'company' ? '/onboarding/company/step1' : '/onboarding/person/step1');
          return;
        }
        throw new Error(data.error || 'Failed to create account');
      }

      router.push(accountType === 'company' ? '/onboarding/company/step1' : '/onboarding/person/step1');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <Link href="/" className="flex justify-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#FFD60A] flex items-center justify-center">
            <Zap className="w-6 h-6 text-[#0F0F0F]" fill="#0F0F0F" />
          </div>
        </Link>

        <h1 className="text-2xl font-bold text-[#0F0F0F] text-center mb-1">Join Buzz</h1>
        <p className="text-[13px] text-[#0F0F0F]/50 text-center mb-8">What are you here for?</p>

        {error && (
          <div className="mb-4 px-4 py-2.5 rounded-2xl bg-red-50 text-red-600 text-[12px] font-semibold text-center">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <button onClick={() => handlePickType('person')} disabled={!!loading} className="card-static p-6 text-center hover:shadow-md transition-all group disabled:opacity-50">
            <div className="w-12 h-12 rounded-2xl bg-[#0F0F0F] text-white flex items-center justify-center mx-auto mb-4 group-hover:bg-[#FFD60A] group-hover:text-[#0F0F0F] transition-all">
              {loading === 'person' ? <Loader2 className="w-5 h-5 animate-spin" /> : <User className="w-5 h-5" />}
            </div>
            <h2 className="font-bold text-[15px] text-[#0F0F0F] mb-1">I&apos;m a professional</h2>
            <p className="text-[12px] text-[#0F0F0F]/50">Build your Work Wall, earn your Buzz Score, get hired on merit.</p>
          </button>

          <button onClick={() => handlePickType('company')} disabled={!!loading} className="card-static p-6 text-center hover:shadow-md transition-all group disabled:opacity-50">
            <div className="w-12 h-12 rounded-2xl bg-[#0F0F0F] text-white flex items-center justify-center mx-auto mb-4 group-hover:bg-[#FFD60A] group-hover:text-[#0F0F0F] transition-all">
              {loading === 'company' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Building2 className="w-5 h-5" />}
            </div>
            <h2 className="font-bold text-[15px] text-[#0F0F0F] mb-1">I&apos;m hiring</h2>
            <p className="text-[12px] text-[#0F0F0F]/50">Post jobs free, find talent through real work, not resumes.</p>
          </button>
        </div>

        <div className="text-center">
          <button onClick={handleGoogleSignup} className="btn-secondary inline-flex items-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Sign up with Google
          </button>
        </div>

        <p className="text-center text-[13px] text-[#0F0F0F]/40 mt-6">
          Already on Buzz? <Link href="/login" className="font-semibold text-[#0F0F0F] underline underline-offset-2">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
