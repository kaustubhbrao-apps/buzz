'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient();

      // The browser client can read its own cookies + handle PKCE automatically
      const { error } = await supabase.auth.exchangeCodeForSession(
        new URL(window.location.href).searchParams.get('code') ?? ''
      );

      if (error) {
        console.error('Auth error:', error.message);
        setError(error.message);
        setTimeout(() => router.push('/login?error=auth'), 2000);
        return;
      }

      // Session is now set in browser cookies
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login?error=auth');
        return;
      }

      // Check if user row exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, account_type')
        .eq('id', user.id)
        .single();

      if (!existingUser) {
        router.push('/signup');
        return;
      }

      // Check if profile exists
      const table = existingUser.account_type === 'company' ? 'company_profiles' : 'person_profiles';
      const { data: profile } = await supabase
        .from(table)
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) {
        const path = existingUser.account_type === 'company'
          ? '/onboarding/company/step1'
          : '/onboarding/person/step1';
        router.push(path);
        return;
      }

      router.push('/feed');
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
      <div className="text-center">
        {error ? (
          <>
            <p className="text-[14px] text-red-500 font-semibold mb-2">Authentication failed</p>
            <p className="text-[12px] text-[#888]">{error}</p>
            <p className="text-[12px] text-[#888] mt-2">Redirecting to login...</p>
          </>
        ) : (
          <>
            <Loader2 className="w-6 h-6 animate-spin text-[#0F0F0F]/30 mx-auto mb-3" />
            <p className="text-[13px] text-[#888]">Signing you in...</p>
          </>
        )}
      </div>
    </div>
  );
}
