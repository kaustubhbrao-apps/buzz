'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Zap, User, Building2, Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Step = 'pick-type' | 'details';

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('pick-type');
  const [accountType, setAccountType] = useState<'person' | 'company' | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmEmail, setConfirmEmail] = useState(false);
  const [existingSession, setExistingSession] = useState<string | null>(null);

  // Check if user already has a session (e.g. redirected from login with no DB user)
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setExistingSession(data.session.access_token);
      }
    });
  }, []);

  const createDbUser = async (type: 'person' | 'company', token: string) => {
    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ account_type: type }),
    });

    if (!res.ok && res.status !== 409) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to create account');
    }

    router.push(type === 'company' ? '/onboarding/company/step1' : '/onboarding/person/step1');
  };

  const handlePickType = async (type: 'person' | 'company') => {
    setAccountType(type);
    setError('');

    // If already signed in, skip the form — just create DB user
    if (existingSession) {
      setLoading(true);
      try {
        await createDbUser(type, existingSession);
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
        setLoading(false);
      }
      return;
    }

    setStep('details');
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountType || !name.trim() || !email.trim() || !password.trim()) return;

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const supabase = createClient();

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: name.trim() },
        },
      });

      if (authError) throw authError;

      // If email confirmation is required (no session returned)
      if (!authData.session) {
        setConfirmEmail(true);
        setLoading(false);
        return;
      }

      await createDbUser(accountType, authData.session.access_token);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setLoading(false);
    }
  };

  if (confirmEmail) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#FFD60A] flex items-center justify-center mx-auto mb-6">
            <Zap className="w-6 h-6 text-[#0F0F0F]" fill="#0F0F0F" />
          </div>
          <div className="card-static p-6">
            <h2 className="font-bold text-[15px] text-[#0F0F0F] mb-2">Check your email</h2>
            <p className="text-[13px] text-[#0F0F0F]/50 mb-4">
              We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account, then come back and sign in.
            </p>
            <Link href="/login" className="btn-primary inline-block w-full text-center">Go to sign in</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <Link href="/" className="flex justify-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#FFD60A] flex items-center justify-center">
            <Zap className="w-6 h-6 text-[#0F0F0F]" fill="#0F0F0F" />
          </div>
        </Link>

        {step === 'pick-type' && (
          <>
            <h1 className="text-2xl font-bold text-[#0F0F0F] text-center mb-1">
              {existingSession ? 'Almost there' : 'Join Buzz'}
            </h1>
            <p className="text-[13px] text-[#0F0F0F]/50 text-center mb-8">What are you here for?</p>

            {error && (
              <div className="mb-4 px-4 py-2.5 rounded-2xl bg-red-50 text-red-600 text-[12px] font-semibold text-center">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <button onClick={() => handlePickType('person')} disabled={loading} className="card-static p-6 text-center hover:shadow-md transition-all group disabled:opacity-50">
                <div className="w-12 h-12 rounded-2xl bg-[#0F0F0F] text-white flex items-center justify-center mx-auto mb-4 group-hover:bg-[#FFD60A] group-hover:text-[#0F0F0F] transition-all">
                  {loading && accountType === 'person' ? <Loader2 className="w-5 h-5 animate-spin" /> : <User className="w-5 h-5" />}
                </div>
                <h2 className="font-bold text-[15px] text-[#0F0F0F] mb-1">I&apos;m a professional</h2>
                <p className="text-[12px] text-[#0F0F0F]/50">Build your Work Wall, earn your Buzz Score, get hired on merit.</p>
              </button>

              <button onClick={() => handlePickType('company')} disabled={loading} className="card-static p-6 text-center hover:shadow-md transition-all group disabled:opacity-50">
                <div className="w-12 h-12 rounded-2xl bg-[#0F0F0F] text-white flex items-center justify-center mx-auto mb-4 group-hover:bg-[#FFD60A] group-hover:text-[#0F0F0F] transition-all">
                  {loading && accountType === 'company' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Building2 className="w-5 h-5" />}
                </div>
                <h2 className="font-bold text-[15px] text-[#0F0F0F] mb-1">I&apos;m hiring</h2>
                <p className="text-[12px] text-[#0F0F0F]/50">Post jobs free, find talent through real work, not resumes.</p>
              </button>
            </div>

            <p className="text-center text-[13px] text-[#0F0F0F]/40">
              Already on Buzz? <Link href="/login" className="font-semibold text-[#0F0F0F] underline underline-offset-2">Sign in</Link>
            </p>
          </>
        )}

        {step === 'details' && (
          <div className="max-w-sm mx-auto">
            <button onClick={() => { setStep('pick-type'); setError(''); }} className="flex items-center gap-1 text-[13px] text-[#0F0F0F]/50 mb-4 hover:text-[#0F0F0F] transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>

            <div className="card-static p-6">
              <h1 className="text-lg font-bold text-[#0F0F0F] text-center mb-1">Create your account</h1>
              <p className="text-[12px] text-[#0F0F0F]/40 text-center mb-6">
                {accountType === 'company' ? 'Set up your company on Buzz' : 'Start building your proof of work'}
              </p>

              {error && (
                <div className="mb-4 px-4 py-2.5 rounded-2xl bg-red-50 text-red-600 text-[12px] font-semibold text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleSignup} className="space-y-3">
                <input
                  type="text"
                  placeholder={accountType === 'company' ? 'Company name' : 'Full name'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                  required
                  autoFocus
                />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  required
                />
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password (min 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input pr-10"
                    required
                    minLength={6}
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
                  {loading ? 'Creating account...' : 'Create account'}
                </button>
              </form>
            </div>

            <p className="text-center text-[13px] text-[#0F0F0F]/40 mt-4">
              Already on Buzz? <Link href="/login" className="font-semibold text-[#0F0F0F] underline underline-offset-2">Sign in</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
