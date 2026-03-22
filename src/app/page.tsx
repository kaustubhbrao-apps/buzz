import Link from 'next/link';

const PROBLEMS = [
  { emoji: '🎭', title: 'Titles, not talent', desc: 'Your IIT tag matters more than your GitHub.' },
  { emoji: '📄', title: 'CVs, not work', desc: 'PDFs that nobody reads. Zero proof of what you can do.' },
  { emoji: '🤖', title: 'Recruiter spam', desc: 'Mass InMails for roles that don\'t match.' },
  { emoji: '😶', title: 'Tier 2/3 invisible', desc: 'Great devs in Indore, Jaipur, Kochi — never found.' },
  { emoji: '🗣️', title: 'Performative posts', desc: '"Humbled to announce" culture drowns real work.' },
  { emoji: '💸', title: 'Ghost jobs', desc: 'No salary. No response. No accountability.' },
];

const HOW_IT_WORKS = [
  { emoji: '🔥', title: 'Post your work', desc: 'Ship a project, design, article, video — anything real. Your Work Wall is your portfolio.' },
  { emoji: '⚡', title: 'Build your Buzz Score', desc: 'Every reaction, save, and endorsement earns points. Rise from Seedling to Legend.' },
  { emoji: '💼', title: 'Get hired', desc: 'Companies see your proof. Apply with your Work Wall — no CV, no cover letter.' },
];

const BANDS = [
  { emoji: '🌱', label: 'Seedling', range: '0–199', desc: 'Just getting started. Post your first work.' },
  { emoji: '⚡', label: 'Charged', range: '200–499', desc: 'Building momentum. Proof is piling up.' },
  { emoji: '🔥', label: 'Buzzing', range: '500–799', desc: 'You\'re on fire. Recruiters are noticing.' },
  { emoji: '💎', label: 'Elite', range: '800–1199', desc: 'Top tier. Companies compete for you.' },
  { emoji: '👑', label: 'Legend', range: '1200+', desc: 'The best of the best. Icon status.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-buzz-border">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-buzz-dark">⚡ Buzz</Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-ghost text-sm">Sign in</Link>
            <Link href="/signup" className="btn-primary text-sm">Get started free</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 pt-20 pb-16 text-center">
        <p className="text-buzz-muted text-sm font-medium uppercase tracking-wider mb-4">
          India&apos;s proof-of-work professional network
        </p>
        <h1 className="text-5xl md:text-7xl font-bold text-buzz-dark mb-6">Work loud.</h1>
        <p className="text-lg md:text-xl text-buzz-muted max-w-2xl mx-auto mb-8">
          Post your real work. Build your Buzz Score. Get discovered and hired on merit — not
          titles, connections, or college names.
        </p>
        <Link href="/signup" className="btn-primary text-lg px-8 py-3 inline-block">
          Get started free
        </Link>
        <p className="text-buzz-muted text-sm mt-3">Free forever. No credit card.</p>
      </section>

      {/* Problem */}
      <section className="bg-buzz-dark text-white py-20">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            LinkedIn wasn&apos;t built for you.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PROBLEMS.map((p) => (
              <div key={p.title} className="bg-white/10 rounded-card p-6">
                <span className="text-2xl">{p.emoji}</span>
                <h3 className="font-semibold mt-2 mb-1">{p.title}</h3>
                <p className="text-white/70 text-sm">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {HOW_IT_WORKS.map((item, i) => (
            <div key={i} className="card p-8 text-center">
              <span className="text-4xl">{item.emoji}</span>
              <h3 className="text-lg font-semibold mt-4 mb-2">{item.title}</h3>
              <p className="text-buzz-muted text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Buzz Score Bands */}
      <section className="bg-white py-20">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Your Buzz Score</h2>
          <p className="text-buzz-muted text-center mb-12 max-w-xl mx-auto">
            Every piece of real work you share earns points. Rise through the ranks.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {BANDS.map((b) => (
              <div key={b.label} className="card p-5 text-center">
                <span className="text-3xl">{b.emoji}</span>
                <h3 className="font-semibold mt-2">{b.label}</h3>
                <p className="text-buzz-muted text-xs mt-1">{b.range}</p>
                <p className="text-buzz-muted text-sm mt-2">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Account types */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Two ways to Buzz</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="card p-8">
            <span className="text-3xl">👤</span>
            <h3 className="text-xl font-semibold mt-3 mb-2">Person Account</h3>
            <ul className="text-buzz-muted text-sm space-y-2">
              <li>Build your Work Wall — a living portfolio</li>
              <li>Earn your Buzz Score through real proof</li>
              <li>Get discovered by companies that care about work</li>
              <li>Apply to jobs with your Wall — no CV needed</li>
            </ul>
          </div>
          <div className="card p-8">
            <span className="text-3xl">🏢</span>
            <h3 className="text-xl font-semibold mt-3 mb-2">Company Page</h3>
            <ul className="text-buzz-muted text-sm space-y-2">
              <li>Post jobs with proof requirements — attract real talent</li>
              <li>Review Work Walls instead of CVs</li>
              <li>Build your Credibility Rating</li>
              <li>Free to post — no recruiter fees</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-buzz-yellow py-20">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-buzz-dark mb-6">
            Ready to work loud?
          </h2>
          <Link
            href="/signup"
            className="inline-block bg-buzz-dark text-white font-semibold rounded-chip px-8 py-3 text-lg hover:bg-opacity-90 transition-all"
          >
            Get started free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-buzz-dark text-white/60 py-8">
        <div className="max-w-5xl mx-auto px-4 text-center text-sm">
          ⚡ Buzz — Work Loud. Made in India.
        </div>
      </footer>
    </div>
  );
}
