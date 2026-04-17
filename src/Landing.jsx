import React, { useState } from 'react';
import './landing.css';

// ─── Top Announcement Bar ─────────────────────────────────────────────────────
function AnnouncementBar() {
  return (
    <div className="announcement-bar">
      <span>🎉 Pay once, get a <strong>LIFETIME deal</strong> — for only <strong>$49</strong></span>
      <a href="#pricing" className="announcement-cta">Claim deal</a>
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <a href="/" className="navbar-logo">
          <span className="logo-icon">🎁</span>
          <span className="logo-text">ViralGive</span>
        </a>
        <div className="navbar-links">
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#examples">Examples</a>
          <a href="#" className="btn-nav-login">Log in</a>
          <a href="#signup" className="btn-nav-register">Get started free</a>
        </div>
      </div>
    </nav>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
function Hero() {
  const [email, setEmail] = useState('');

  return (
    <section className="hero">
      <div className="hero-inner">
        {/* Left: copy + form */}
        <div className="hero-copy">
          <div className="hero-badge">Trusted by 12,000+ Shopify stores</div>
          <h1 className="hero-headline">
            Grow your email list through<br />
            <span className="hero-highlight">Viral Giveaways</span>
          </h1>
          <p className="hero-sub">
            Launch a giveaway in under 2 minutes. Every entrant shares your campaign —
            turning one signup into dozens. No coding required.
          </p>

          {/* Email form */}
          <form className="hero-form" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              className="hero-input"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="hero-btn">
              Start a contest! →
            </button>
          </form>

          {/* Google OAuth */}
          <button className="google-btn">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Or register with Google
          </button>

          <a href="#examples" className="hero-examples-link">View live examples ↓</a>
        </div>

        {/* Right: illustration */}
        <div className="hero-visual">
          <div className="hero-card">
            <div className="hero-card-ribbon">LIVE</div>
            <div className="hero-card-icon">🎁</div>
            <div className="hero-card-title">Win a Premium Bundle</div>
            <div className="hero-card-entries">
              <span className="entries-count">1,284</span>
              <span className="entries-label">entries so far</span>
            </div>
            <div className="hero-card-bar">
              <div className="hero-card-fill" style={{ width: '72%' }} />
            </div>
            <div className="hero-card-ends">Ends in 3 days</div>
            <button className="hero-card-btn">Enter to Win →</button>
          </div>
          {/* Floating stat badges */}
          <div className="stat-badge stat-badge--shares">
            <span>🔗</span> +432 shares today
          </div>
          <div className="stat-badge stat-badge--growth">
            <span>📈</span> 34% viral rate
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="hero-wave">
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none">
          <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="#f6f8fa"/>
        </svg>
      </div>
    </section>
  );
}

// ─── Social Proof Strip ───────────────────────────────────────────────────────
function SocialProof() {
  const stats = [
    { value: '12,400+', label: 'Giveaways launched' },
    { value: '2.1M', label: 'Emails collected' },
    { value: '4.8★', label: 'Average rating' },
    { value: '340%', label: 'Avg. list growth' },
  ];
  return (
    <section className="social-proof">
      {stats.map((s) => (
        <div className="proof-item" key={s.label}>
          <span className="proof-value">{s.value}</span>
          <span className="proof-label">{s.label}</span>
        </div>
      ))}
    </section>
  );
}

// ─── Features Section ─────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: '🎁',
    title: 'Unlimited Giveaways',
    desc: 'Run as many contests as you want. No limits, ever. Go crazy!',
  },
  {
    icon: '🚀',
    title: 'Viral Bonus Entries',
    desc: 'Entrants share with friends for extra entries. Your audience grows on autopilot!',
  },
  {
    icon: '📧',
    title: 'Smart Auto-Emails',
    desc: 'Reminder emails backed by 100,000+ data points. More entrants, less work!',
  },
  {
    icon: '🏆',
    title: 'Random Winner Picker',
    desc: 'Pick a fair, verified winner with one click. Transparent and trustworthy.',
  },
  {
    icon: '📊',
    title: 'Real-time Analytics',
    desc: 'Track entries, shares, and referrals as they happen. Know what drives growth.',
  },
  {
    icon: '🎨',
    title: 'Fully Customizable Widget',
    desc: 'Match your brand with custom colors, popup or embed — no code needed.',
  },
];

function Features() {
  return (
    <section className="features" id="features">
      <div className="section-inner">
        <div className="section-label">Why ViralGive?</div>
        <h2 className="section-title">Everything you need to grow faster</h2>
        <p className="section-sub">
          Built for Shopify stores. Launch in minutes. Watch your list explode.
        </p>
        <div className="features-grid">
          {FEATURES.map((f) => (
            <div className="feature-card" key={f.title}>
              <div className="feature-icon">{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    { n: '01', title: 'Create your giveaway', desc: 'Set a prize, entry rules, and end date in under 2 minutes.' },
    { n: '02', title: 'Share your campaign', desc: 'Embed on your store or share a direct link on social.' },
    { n: '03', title: 'Watch it go viral', desc: 'Every entrant refers friends for bonus entries — growth on autopilot.' },
    { n: '04', title: 'Pick a winner & convert', desc: 'Draw a random winner. Send everyone a consolation discount.' },
  ];
  return (
    <section className="how-it-works" id="examples">
      <div className="section-inner">
        <div className="section-label">Simple process</div>
        <h2 className="section-title">Up and running in 4 steps</h2>
        <div className="steps-grid">
          {steps.map((s) => (
            <div className="step-card" key={s.n}>
              <div className="step-number">{s.n}</div>
              <h3 className="step-title">{s.title}</h3>
              <p className="step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Pricing ──────────────────────────────────────────────────────────────────
function Pricing() {
  const plans = [
    {
      name: 'Starter',
      price: '$9',
      period: '/mo',
      desc: 'Perfect for new stores.',
      features: ['3 active giveaways', 'Up to 500 entries/mo', 'Email support', 'Basic analytics'],
      cta: 'Start free trial',
      highlight: false,
    },
    {
      name: 'Growth',
      price: '$29',
      period: '/mo',
      desc: 'For stores scaling fast.',
      features: ['Unlimited giveaways', 'Unlimited entries', 'Referral tracking', 'Advanced analytics', 'Priority support'],
      cta: 'Start free trial',
      highlight: true,
      badge: 'Most popular',
    },
    {
      name: 'Lifetime',
      price: '$49',
      period: ' one-time',
      desc: 'Pay once, own it forever.',
      features: ['Everything in Growth', 'Lifetime updates', 'White-label widget', 'Dedicated support'],
      cta: 'Claim lifetime deal',
      highlight: false,
      badge: '🔥 Limited',
    },
  ];

  return (
    <section className="pricing" id="pricing">
      <div className="section-inner">
        <div className="section-label">Pricing</div>
        <h2 className="section-title">Simple, transparent pricing</h2>
        <p className="section-sub">No hidden fees. Cancel anytime.</p>
        <div className="pricing-grid">
          {plans.map((p) => (
            <div className={`pricing-card ${p.highlight ? 'pricing-card--highlight' : ''}`} key={p.name}>
              {p.badge && <div className="pricing-badge">{p.badge}</div>}
              <div className="pricing-name">{p.name}</div>
              <div className="pricing-price">
                {p.price}<span className="pricing-period">{p.period}</span>
              </div>
              <div className="pricing-desc">{p.desc}</div>
              <ul className="pricing-features">
                {p.features.map((f) => (
                  <li key={f}><span className="check">✓</span> {f}</li>
                ))}
              </ul>
              <a href="#signup" className={`pricing-cta ${p.highlight ? 'pricing-cta--primary' : ''}`}>
                {p.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    quote: "We collected 3,200 emails in one week. Nothing has moved the needle this fast for us.",
    name: "Sarah K.",
    store: "Bloom & Petal Co.",
    avatar: "SK",
  },
  {
    quote: "The referral system is genius. Each entrant brought in 2–3 more people on average.",
    name: "Marcus T.",
    store: "Urban Thread",
    avatar: "MT",
  },
  {
    quote: "Set it up in 5 minutes, ran it for 10 days. Best marketing ROI we've ever seen.",
    name: "Priya S.",
    store: "Glow Skincare",
    avatar: "PS",
  },
];

function Testimonials() {
  return (
    <section className="testimonials">
      <div className="section-inner">
        <div className="section-label">Social proof</div>
        <h2 className="section-title">Merchants love ViralGive</h2>
        <div className="testimonials-grid">
          {TESTIMONIALS.map((t) => (
            <div className="testimonial-card" key={t.name}>
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-quote">"{t.quote}"</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">{t.avatar}</div>
                <div>
                  <div className="testimonial-name">{t.name}</div>
                  <div className="testimonial-store">{t.store}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA Banner ───────────────────────────────────────────────────────────────
function CTABanner() {
  const [email, setEmail] = useState('');
  return (
    <section className="cta-banner" id="signup">
      <div className="section-inner cta-inner">
        <h2 className="cta-title">Ready to grow your list?</h2>
        <p className="cta-sub">Join 12,400+ Shopify stores already using ViralGive.</p>
        <form className="cta-form" onSubmit={(e) => e.preventDefault()}>
          <input
            type="email"
            className="cta-input"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="cta-btn">Get started free →</button>
        </form>
        <p className="cta-note">Free 14-day trial · No credit card required</p>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="logo-icon">🎁</span>
          <span className="logo-text">ViralGive</span>
          <p>The viral giveaway app built for Shopify merchants.</p>
        </div>
        <div className="footer-links">
          <div className="footer-col">
            <div className="footer-col-title">Product</div>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#examples">Examples</a>
          </div>
          <div className="footer-col">
            <div className="footer-col-title">Company</div>
            <a href="#">About</a>
            <a href="#">Blog</a>
            <a href="#">Contact</a>
          </div>
          <div className="footer-col">
            <div className="footer-col-title">Legal</div>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        © {new Date().getFullYear()} ViralGive · Built for Shopify
      </div>
    </footer>
  );
}

// ─── Landing Page Root ────────────────────────────────────────────────────────
export default function Landing() {
  return (
    <div className="landing">
      <AnnouncementBar />
      <Navbar />
      <Hero />
      <SocialProof />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <CTABanner />
      <Footer />
    </div>
  );
}
