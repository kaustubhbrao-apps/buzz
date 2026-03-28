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

      // Exchange code for session (email confirmation flow)
      const { error: authError } = await supabase.auth.exchangeCodeForSession(
        window.location.href
      );

      if (authError) {
        setError('Confirmation link expired or invalid');
        setTimeout(() => router.push('/login?error=auth'), 2000);
        return;
      }

      // Session is now active — check if user has completed setup
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Authentication failed');
        setTimeout(() => router.push('/login?error=auth'), 2000);
        return;
      }

      const { data: dbUser } = await supabase
        .from('users')
        .select('account_type')
        .eq('id', user.id)
        .single();

      if (!dbUser) {
        // Auth confirmed but no DB user yet — go to signup to pick type + create profile
        router.push('/signup');
        return;
      }

      // Check if profile exists
      const table = dbUser.account_type === 'company' ? 'company_profiles' : 'person_profiles';
      const { data: profile } = await supabase
        .from(table)
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) {
        const path = dbUser.account_type === 'company' ? '/onboarding/company/step1' : '/onboarding/person/step1';
        router.push(path);
        return;
      }

      router.push('/feed');
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
      <div className="text-center">
        {error ? (
          <>
            <p className="text-[14px] text-red-500 font-semibold mb-2">{error}</p>
            <p className="text-[12px] text-[#888]">Redirecting to login...</p>
          </>
        ) : (
          <>
            <Loader2 className="w-6 h-6 animate-spin text-[#0F0F0F]/30 mx-auto mb-3" />
            <p className="text-[13px] text-[#888]">Confirming your account...</p>
          </>
        )}
      </div>
    </div>
  );
}
