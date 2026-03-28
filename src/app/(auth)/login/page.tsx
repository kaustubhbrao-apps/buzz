'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Zap, Loader2, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setLoading(true);
    setError('');

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) throw authError;

      // Check if user has completed setup
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Sign in failed');

      const { data: dbUser } = await supabase
        .from('users')
        .select('account_type')
        .eq('id', user.id)
        .single();

      if (!dbUser) {
        // Auth user exists but no DB user — send to signup to pick type
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
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex justify-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#FFD60A] flex items-center justify-center">
            <Zap className="w-6 h-6 text-[#0F0F0F]" fill="#0F0F0F" />
          </div>
        </Link>

        <div className="card-static p-6">
          <h1 className="text-lg font-bold text-[#0F0F0F] text-center mb-6">Sign in to Buzz</h1>

          {error && (
            <div className="mb-4 px-4 py-2.5 rounded-2xl bg-red-50 text-red-600 text-[12px] font-semibold text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              required
              autoFocus
            />
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0F0F0F]/30 hover:text-[#0F0F0F]/60"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-center text-[13px] text-[#0F0F0F]/40 mt-4">
          New to Buzz? <Link href="/signup" className="font-semibold text-[#0F0F0F] underline underline-offset-2">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
