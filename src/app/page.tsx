import Link from 'next/link';
import { Zap } from 'lucide-react';

const PROBLEMS = [
  { title: 'Titles over talent', desc: 'Credentials get clicks. Actual skill gets overlooked.' },
  { title: 'Resumes are fiction', desc: 'Static documents that say nothing about what you can actually build.' },
  { title: 'Hidden gems stay hidden', desc: 'Talented people in every city — but no way to surface them.' },
  { title: 'Talk over proof', desc: 'Engagement bait gets rewarded. Real work gets buried.' },
  { title: 'Opaque hiring', desc: 'No salary info. No response timelines. No accountability.' },
  { title: 'Noise everywhere', desc: 'Generic outreach, irrelevant roles, zero personalization.' },
];

const HOW = [
  { step: '01', title: 'Post your work', desc: 'Ship a project, design, article — anything real. Your Work Wall is your living portfolio.' },
  { step: '02', title: 'Build your score', desc: 'Every reaction, save, and endorsement earns points. Rise from Seedling to Legend.' },
  { step: '03', title: 'Get hired on merit', desc: 'Companies see your proof. Apply with your Work Wall — no CV, no cover letter.' },
];

const BANDS = [
  { emoji: '🌱', label: 'Seedling', range: '0–199' },
  { emoji: '⚡', label: 'Charged', range: '200–499' },
  { emoji: '🔥', label: 'Buzzing', range: '500–799' },
  { emoji: '💎', label: 'Elite', range: '800–1199' },
  { emoji: '👑', label: 'Legend', range: '1200+' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#0F0F0F] overflow-hidden">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[#EAEAE8]">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FFD60A] flex items-center justify-center">
              <Zap className="w-4 h-4 text-[#0F0F0F]" fill="#0F0F0F" />
            </div>
            <span className="font-bold text-[15px]">Buzz</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login" className="text-[13px] font-medium text-[#666] hover:text-[#0F0F0F] px-3 py-2 transition-colors">Sign in</Link>
            <Link href="/signup" className="btn-primary text-[13px] px-5 py-2">Get started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 sm:pt-32 pb-20">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFD60A]/10 text-[13px] text-[#0F0F0F]/70 font-medium mb-6 animate-fade-up">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
            India&apos;s proof-of-work network
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.1] tracking-tight mb-5 animate-fade-up stagger-1">
            Get hired for what<br />you <span className="text-[#FFD60A]">actually build</span>.
          </h1>

          <p className="text-base sm:text-lg text-[#666] max-w-lg mb-8 leading-relaxed animate-fade-up stagger-2">
            Post your real work. Build your Buzz Score. Get discovered by companies
            that hire on proof, not resumes.
          </p>

          <div className="flex flex-wrap items-center gap-3 animate-fade-up stagger-3">
            <Link href="/signup" className="btn-primary text-[14px] px-8 py-3">
              Start building your wall
            </Link>
            <Link href="/feed" className="btn-secondary text-[14px] px-6 py-3">
              See the feed
            </Link>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="border-t border-[#EAEAE8]">
        <div className="max-w-5xl mx-auto px-6 py-20 sm:py-24">
          <p className="text-[12px] font-semibold text-[#FFD60A] uppercase tracking-widest mb-3">The problem</p>
          <h2 className="text-2xl sm:text-3xl font-bold mb-12 max-w-md">
            Hiring is broken. Everyone knows it.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#EAEAE8] rounded-2xl overflow-hidden border border-[#EAEAE8]">
            {PROBLEMS.map((p) => (
              <div key={p.title} className="bg-white p-6">
                <h3 className="font-semibold text-[14px] text-[#0F0F0F] mb-1.5">{p.title}</h3>
                <p className="text-[13px] text-[#888] leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-[#EAEAE8] bg-white">
        <div className="max-w-5xl mx-auto px-6 py-20 sm:py-24">
          <p className="text-[12px] font-semibold text-[#FFD60A] uppercase tracking-widest mb-3">How it works</p>
          <h2 className="text-2xl sm:text-3xl font-bold mb-12 max-w-md">
            Three steps. No fluff.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW.map((item) => (
              <div key={item.step}>
                <span className="text-[11px] font-mono font-bold text-[#FFD60A]">{item.step}</span>
                <h3 className="text-[16px] font-semibold mt-2 mb-2 text-[#0F0F0F]">{item.title}</h3>
                <p className="text-[13px] text-[#888] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Buzz Score */}
      <section className="border-t border-[#EAEAE8]">
        <div className="max-w-5xl mx-auto px-6 py-20 sm:py-24">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-start">
            <div className="lg:max-w-sm flex-shrink-0">
              <p className="text-[12px] font-semibold text-[#FFD60A] uppercase tracking-widest mb-3">Buzz Score</p>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                Your work has a number.
              </h2>
              <p className="text-[14px] text-[#888] leading-relaxed">
                Every piece of real work you post earns points. Reactions, endorsements, and saves push your score higher. Companies filter by score — the better your work, the more visible you become.
              </p>
            </div>
            <div className="flex-1 w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {BANDS.map((b) => (
                <div key={b.label} className="card-static p-4 text-center">
                  <span className="text-2xl">{b.emoji}</span>
                  <h3 className="font-bold text-[13px] mt-2 text-[#0F0F0F]">{b.label}</h3>
                  <p className="text-[#BBB] text-[11px] mt-0.5 font-mono">{b.range}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Account types */}
      <section className="border-t border-[#EAEAE8] bg-white">
        <div className="max-w-5xl mx-auto px-6 py-20 sm:py-24">
          <p className="text-[12px] font-semibold text-[#FFD60A] uppercase tracking-widest mb-3">For everyone</p>
          <h2 className="text-2xl sm:text-3xl font-bold mb-12">Two ways to use Buzz</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-[#EAEAE8] p-8">
              <span className="text-2xl">👤</span>
              <h3 className="text-lg font-bold mt-3 mb-3 text-[#0F0F0F]">Person</h3>
              <ul className="text-[#777] text-[13px] space-y-2">
                <li>Build your Work Wall — a living portfolio</li>
                <li>Earn your Buzz Score through proof</li>
                <li>Get discovered by companies</li>
                <li>Apply to jobs with your Wall, not a CV</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-[#EAEAE8] p-8">
              <span className="text-2xl">🏢</span>
              <h3 className="text-lg font-bold mt-3 mb-3 text-[#0F0F0F]">Company</h3>
              <ul className="text-[#777] text-[13px] space-y-2">
                <li>Post jobs with proof requirements</li>
                <li>Review Work Walls instead of CVs</li>
                <li>Build your Credibility Rating</li>
                <li>Free to post — no recruiter fees</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[#EAEAE8]">
        <div className="max-w-5xl mx-auto px-6 py-20 sm:py-28 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Stop talking. Start proving.
          </h2>
          <p className="text-[#888] mb-8 max-w-sm mx-auto text-[14px]">
            Free forever. No credit card. Just your work.
          </p>
          <Link href="/signup" className="btn-primary text-[15px] px-10 py-3.5">
            Get started free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#EAEAE8] py-6">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between text-[12px] text-[#BBB]">
          <span>Buzz</span>
          <span>Made in India</span>
        </div>
      </footer>
    </div>
  );
}
