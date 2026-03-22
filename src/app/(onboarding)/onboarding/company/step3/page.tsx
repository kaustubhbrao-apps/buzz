'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function CompanyStep3() {
  const router = useRouter();
  const supabase = createClient();
  const [method, setMethod] = useState<'domain' | 'linkedin' | null>(null);
  const [domainEmail, setDomainEmail] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const getHandle = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return null; }
    const { data } = await supabase
      .from('company_profiles')
      .select('handle')
      .eq('user_id', user.id)
      .single();
    return data?.handle;
  };

  const handleDomain = async () => {
    if (!domainEmail) return;
    setLoading(true);
    setError('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }

    await supabase
      .from('company_profiles')
      .update({ verification_method: 'domain' })
      .eq('user_id', user.id);

    // In production, send verification email via Resend API
    setSent(true);
    setLoading(false);
  };

  const handleLinkedin = async () => {
    if (!linkedinUrl) return;
    setLoading(true);
    setError('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }

    await supabase
      .from('company_profiles')
      .update({ linkedin_url: linkedinUrl, verification_method: 'linkedin' })
      .eq('user_id', user.id);

    const handle = await getHandle();
    router.push(handle ? `/${handle}` : '/feed');
  };

  const handleSkip = async () => {
    const handle = await getHandle();
    router.push(handle ? `/${handle}` : '/feed');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Make it official</h1>
      <p className="text-buzz-muted text-sm mb-6">
        Verified companies get more applicants and higher trust. Step 3 of 3.
      </p>

      {sent ? (
        <div className="card p-6 text-center">
          <p className="text-2xl mb-2">📧</p>
          <h2 className="font-semibold mb-2">Verification email sent</h2>
          <p className="text-buzz-muted text-sm mb-4">Check your inbox at <strong>{domainEmail}</strong></p>
          <button onClick={handleSkip} className="btn-primary">Continue to my page →</button>
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            {/* Option A: Domain */}
            <div
              className={`card p-5 cursor-pointer border-2 transition-colors ${
                method === 'domain' ? 'border-buzz-yellow' : 'border-transparent'
              }`}
              onClick={() => setMethod('domain')}
            >
              <h3 className="font-semibold mb-2">📧 Verify with domain email</h3>
              {method === 'domain' && (
                <div className="mt-3">
                  <input
                    type="email"
                    value={domainEmail}
                    onChange={(e) => setDomainEmail(e.target.value)}
                    className="input mb-3"
                    placeholder="name@yourcompany.com"
                  />
                  <button onClick={handleDomain} disabled={loading} className="btn-primary w-full">
                    {loading ? 'Sending...' : 'Send verification email'}
                  </button>
                </div>
              )}
            </div>

            {/* Option B: LinkedIn */}
            <div
              className={`card p-5 cursor-pointer border-2 transition-colors ${
                method === 'linkedin' ? 'border-buzz-yellow' : 'border-transparent'
              }`}
              onClick={() => setMethod('linkedin')}
            >
              <h3 className="font-semibold mb-2">🔗 Verify with LinkedIn page</h3>
              {method === 'linkedin' && (
                <div className="mt-3">
                  <input
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    className="input mb-3"
                    placeholder="linkedin.com/company/..."
                  />
                  <button onClick={handleLinkedin} disabled={loading} className="btn-primary w-full">
                    {loading ? 'Submitting...' : 'Submit for review (24hrs)'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {error && <p className="text-buzz-error text-sm mb-4">{error}</p>}

          <button onClick={handleSkip} className="btn-ghost w-full text-sm">
            Skip for now <span className="text-buzz-warning">⚠️ Unverified badge until verified</span>
          </button>
        </>
      )}
    </div>
  );
}
