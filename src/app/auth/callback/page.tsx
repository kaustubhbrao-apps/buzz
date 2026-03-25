'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    const supabase = createClient();

    // Listen for auth state change — implicit flow triggers this automatically
    // when tokens are in the URL hash
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          const user = session.user;

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
          const table = existingUser.account_type === 'company'
            ? 'company_profiles'
            : 'person_profiles';
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
        } else if (event === 'INITIAL_SESSION' && !session) {
          // No session after checking — auth failed
          setError('Authentication failed');
          setTimeout(() => router.push('/login?error=auth'), 2000);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
      <div className="text-center">
        {error ? (
          <>
            <p className="text-[14px] text-red-500 font-semibold mb-2">{error}</p>
            <p className="text-[12px] text-[#888]">Redirecting to login...</p>
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
