import Link from 'next/link';

const PROBLEMS = [
  { emoji: '🎭', title: 'Titles over talent', desc: 'Credentials get clicks. Actual skill gets overlooked.' },
  { emoji: '📄', title: 'Resumes are broken', desc: 'Static documents that say nothing about what you can actually build.' },
  { emoji: '🤖', title: 'Noise everywhere', desc: 'Generic outreach, irrelevant roles, zero personalization.' },
  { emoji: '😶', title: 'Hidden gems stay hidden', desc: 'Talented people in every city — but no way to surface them.' },
  { emoji: '🗣️', title: 'Talk over proof', desc: 'Engagement bait gets rewarded. Real work gets buried.' },
  { emoji: '💸', title: 'Opaque hiring', desc: 'No salary info. No response timelines. No accountability.' },
];

const HOW_IT_WORKS = [
  { emoji: '🔥', title: 'Post your work', desc: 'Ship a project, design, article — anything real. Your Work Wall is your living portfolio.', color: 'from-orange-500/20 to-red-500/20' },
  { emoji: '⚡', title: 'Build Buzz Score', desc: 'Every reaction, save, and endorsement earns points. Rise from Seedling to Legend.', color: 'from-yellow-500/20 to-amber-500/20' },
  { emoji: '💼', title: 'Get hired on merit', desc: 'Companies see your proof. Apply with your Work Wall — no CV, no cover letter.', color: 'from-blue-500/20 to-cyan-500/20' },
];

const BANDS = [
  { emoji: '🌱', label: 'Seedling', range: '0–199', color: 'from-gray-500/20 to-gray-600/20', glow: 'rgba(156,163,175,0.2)' },
  { emoji: '⚡', label: 'Charged', range: '200–499', color: 'from-blue-500/20 to-blue-600/20', glow: 'rgba(59,130,246,0.2)' },
  { emoji: '🔥', label: 'Buzzing', range: '500–799', color: 'from-orange-500/20 to-orange-600/20', glow: 'rgba(249,115,22,0.2)' },
  { emoji: '💎', label: 'Elite', range: '800–1199', color: 'from-purple-500/20 to-purple-600/20', glow: 'rgba(139,92,246,0.2)' },
  { emoji: '👑', label: 'Legend', range: '1200+', color: 'from-yellow-500/20 to-amber-500/20', glow: 'rgba(245,197,24,0.3)' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-hidden">
      {/* Ambient orbs */}
      <div className="orb w-[600px] h-[600px] bg-[#FF3366]/[0.08] top-[-200px] left-[-200px] fixed" />
      <div className="orb w-[500px] h-[500px] bg-[#FF6B9D]/[0.06] top-[40%] right-[-150px] fixed" />
      <div className="orb w-[400px] h-[400px] bg-green-400/[0.06] bottom-[-100px] left-[30%] fixed" />

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold glow-text">⚡ Buzz</Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-ghost text-sm">Sign in</Link>
            <Link href="/signup" className="btn-primary text-sm">Get started free</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative max-w-6xl mx-auto px-6 pt-24 pb-20 text-center bg-grid">
        <div className="animate-fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-sm text-gray-500 mb-8">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            India&apos;s proof-of-work professional network
          </div>
        </div>

        <h1 className="text-6xl md:text-8xl font-bold mb-6 animate-fade-up stagger-1">
          <span className="glow-text">Work loud.</span>
        </h1>

        <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-10 animate-fade-up stagger-2">
          Post your real work. Build your Buzz Score. Get discovered and hired on
          merit — through real, verifiable work.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up stagger-3">
          <Link href="/signup" className="btn-primary text-base px-10 py-3.5">
            Get started free
          </Link>
          <Link href="/feed" className="btn-secondary text-base px-8 py-3.5">
            Explore feed →
          </Link>
        </div>
        <p className="text-gray-400 text-sm mt-4 animate-fade-up stagger-4">Free forever. No credit card.</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto mt-16 animate-fade-up stagger-4">
          {[
            { value: '10K+', label: 'Creators' },
            { value: '50K+', label: 'Work posts' },
            { value: '2K+', label: 'Hires made' },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-2xl font-bold glow-text">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Problem */}
      <section className="relative py-24 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-4">
            Hiring is broken.
          </h2>
          <p className="text-gray-500 text-center mb-16 max-w-xl mx-auto">
            The way professionals get discovered and hired needs a rethink.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PROBLEMS.map((p, i) => (
              <div key={p.title} className="card-static p-6 group animate-fade-up" style={{ animationDelay: `${i * 0.1}s`, opacity: 0 }}>
                <span className="text-3xl group-hover:scale-110 transition-transform inline-block">{p.emoji}</span>
                <h3 className="font-semibold mt-3 mb-1 text-gray-800">{p.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 border-t border-gray-100 bg-grid">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-16">
            Three steps to <span className="glow-text">get noticed</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map((item, i) => (
              <div key={i} className={`card-static p-8 text-center bg-gradient-to-br ${item.color}`}>
                <span className="text-5xl animate-float inline-block" style={{ animationDelay: `${i * 0.5}s` }}>
                  {item.emoji}
                </span>
                <h3 className="text-lg font-semibold mt-6 mb-3 text-gray-900">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Buzz Score Bands */}
      <section className="py-24 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-4">
            Your <span className="glow-text">Buzz Score</span>
          </h2>
          <p className="text-gray-500 text-center mb-16 max-w-xl mx-auto">
            Every piece of real work earns points. Rise through the ranks.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {BANDS.map((b) => (
              <div
                key={b.label}
                className={`card-static p-5 text-center bg-gradient-to-br ${b.color} hover:shadow-[0_0_30px_${b.glow}] transition-all duration-500`}
              >
                <span className="text-4xl">{b.emoji}</span>
                <h3 className="font-bold mt-2 text-gray-900">{b.label}</h3>
                <p className="text-gray-500 text-xs mt-1 font-mono">{b.range}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Account types */}
      <section className="py-24 border-t border-gray-100 bg-grid">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-16">Two ways to Buzz</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card-static p-8 bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
              <span className="text-4xl">👤</span>
              <h3 className="text-xl font-bold mt-4 mb-3 text-gray-900">Person Account</h3>
              <ul className="text-gray-400 text-sm space-y-2.5">
                <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">✓</span> Build your Work Wall — a living portfolio</li>
                <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">✓</span> Earn your Buzz Score through real proof</li>
                <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">✓</span> Get discovered by companies that care about work</li>
                <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">✓</span> Apply to jobs with your Wall — no CV needed</li>
              </ul>
            </div>
            <div className="card-static p-8 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
              <span className="text-4xl">🏢</span>
              <h3 className="text-xl font-bold mt-4 mb-3 text-gray-900">Company Page</h3>
              <ul className="text-gray-400 text-sm space-y-2.5">
                <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">✓</span> Post jobs with proof requirements — attract real talent</li>
                <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">✓</span> Review Work Walls instead of CVs</li>
                <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">✓</span> Build your Credibility Rating</li>
                <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">✓</span> Free to post — no recruiter fees</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-gray-100 relative">
        <div className="orb w-[500px] h-[500px] bg-[#FF3366]/[0.06] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 absolute" />
        <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Ready to <span className="glow-text">work loud</span>?
          </h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Join thousands of creators, developers, and designers proving their worth through real work.
          </p>
          <Link href="/signup" className="btn-primary text-lg px-12 py-4 animate-pulse-glow">
            Get started free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-gray-400">
          ⚡ Buzz — Work Loud. Made in India 🇮🇳
        </div>
      </footer>
    </div>
  );
}
