import { useState } from 'react'
import {
  Gift, Zap, Shield, BarChart2, Users, Link2, Trophy,
  Code2, Layers, ChevronDown, ChevronUp,
  Globe, Key, Upload, Cpu, Database, Star, Repeat2, Languages,
  MessageCircle, ShoppingCart, Camera,
  Mail, Bell, Palette, FlaskConical, Building2, Smartphone,
  QrCode, Sparkles, GitBranch, RefreshCw, Lock, CheckCircle2, Clock, Lightbulb,
} from 'lucide-react'

// ── Translations ──────────────────────────────────────────────────────────────

const T = {
  en: {
    badge: 'KingSumo Alternative',
    desc: 'A full-featured viral giveaway and contest platform for Shopify stores and DTC brands. Run campaigns that grow your email list, social following, and sales — with built-in fraud protection, analytics, and marketing integrations.',
    stats: ['Pages & Routes', 'Entry Methods', 'Integrations', 'Tech Stack'],
    lifecycle: 'Campaign Lifecycle',
    lifecycleSteps: [
      { step: 'Draft', desc: 'Campaign created but not visible publicly. Safe to edit everything.' },
      { step: 'Active', desc: 'Public giveaway page live. Entries flowing in. Integrations firing.' },
      { step: 'Ended', desc: 'End date passed. No new entries. Ready for winner selection.' },
      { step: 'Winner Picked', desc: 'Winner selected via spin wheel. Proof page generated.' },
      { step: 'Announced', desc: 'Winner announced publicly. Share links distributed.' },
      { step: 'Completed', desc: 'Campaign archived. Data available for export and analysis.' },
    ],
    featuresTitle: 'Features — Click to Expand',
    expandAll: 'Expand all',
    collapseAll: 'Collapse all',
    whatItDoes: 'What it does',
    capabilities: 'Capabilities',
    useCases: 'Use Cases & Examples',
    techStack: 'Tech Stack',
    dbSchema: 'Database Schema (Supabase PostgreSQL)',
    routeMap: 'Route Map',
    publicRoutes: 'Public Routes (no login)',
    protectedRoutes: 'Protected Routes (require login)',
    realWorldTitle: 'Real-World Community Examples',
    realWorldSub: 'How real users from online communities solved growth problems using GiveShop',
    problem: 'The Problem',
    solution: 'The Solution',
    result: 'The Result',
    roadmapTitle: 'Roadmap — Upcoming & Suggested Features',
    roadmapSub: 'What can be built next, categorized by effort and impact',
    canBuildNow: 'Can Build Now',
    canBuildNowSub: 'Easy wins — fully implementable within the current tech stack',
    mediumEffort: 'Medium Effort',
    mediumEffortSub: 'Requires new integrations or moderate UI work',
    futureVision: 'Future Vision',
    futureVisionSub: 'Bigger features requiring new infrastructure or platforms',
    mySuggestions: 'My Top Suggestions',
    mySuggestionsSub: 'High-impact features I recommend prioritizing based on market demand',
    effort: 'Effort',
    impact: 'Impact',
  },
  bn: {
    badge: 'কিংসুমো বিকল্প',
    desc: 'শপিফাই স্টোর এবং DTC ব্র্যান্ডের জন্য একটি সম্পূর্ণ ভাইরাল গিভঅ্যাওয়ে প্ল্যাটফর্ম। আপনার ইমেইল লিস্ট, সোশ্যাল ফলোয়ার এবং বিক্রয় বাড়ানোর জন্য ক্যাম্পেইন চালান — বিল্ট-ইন জালিয়াতি সুরক্ষা, বিশ্লেষণ এবং মার্কেটিং ইন্টিগ্রেশন সহ।',
    stats: ['পেজ ও রুট', 'এন্ট্রি পদ্ধতি', 'ইন্টিগ্রেশন', 'প্রযুক্তি লাইব্রেরি'],
    lifecycle: 'ক্যাম্পেইনের জীবনচক্র',
    lifecycleSteps: [
      { step: 'ড্রাফট', desc: 'ক্যাম্পেইন তৈরি হয়েছে কিন্তু সর্বসাধারণের কাছে দৃশ্যমান নয়। সব কিছু সম্পাদনা করা নিরাপদ।' },
      { step: 'সক্রিয়', desc: 'পাবলিক গিভঅ্যাওয়ে পেজ লাইভ। এন্ট্রি আসছে। ইন্টিগ্রেশন চলছে।' },
      { step: 'শেষ হয়েছে', desc: 'শেষ তারিখ পেরিয়ে গেছে। নতুন এন্ট্রি নেই। বিজয়ী নির্বাচনের জন্য প্রস্তুত।' },
      { step: 'বিজয়ী নির্বাচিত', desc: 'স্পিন হুইলে বিজয়ী নির্বাচিত। প্রুফ পেজ তৈরি হয়েছে।' },
      { step: 'ঘোষণা করা হয়েছে', desc: 'বিজয়ী সর্বসাধারণকে জানানো হয়েছে। শেয়ার লিঙ্ক বিতরণ করা হয়েছে।' },
      { step: 'সম্পন্ন', desc: 'ক্যাম্পেইন আর্কাইভ করা হয়েছে। ডেটা এক্সপোর্ট ও বিশ্লেষণের জন্য উপলব্ধ।' },
    ],
    featuresTitle: 'ফিচারসমূহ — ক্লিক করে বিস্তারিত দেখুন',
    expandAll: 'সব প্রসারিত করুন',
    collapseAll: 'সব সংকুচিত করুন',
    whatItDoes: 'এটি কী করে',
    capabilities: 'সক্ষমতাসমূহ',
    useCases: 'ব্যবহারের ক্ষেত্র ও উদাহরণ',
    techStack: 'প্রযুক্তি স্ট্যাক',
    dbSchema: 'ডেটাবেস স্কিমা (Supabase PostgreSQL)',
    routeMap: 'রুট ম্যাপ',
    publicRoutes: 'পাবলিক রুট (লগইন ছাড়া)',
    protectedRoutes: 'সুরক্ষিত রুট (লগইন প্রয়োজন)',
    realWorldTitle: 'বাস্তব কমিউনিটি উদাহরণ',
    realWorldSub: 'কীভাবে অনলাইন কমিউনিটির বাস্তব ব্যবহারকারীরা GiveShop দিয়ে তাদের গ্রোথ সমস্যা সমাধান করেছেন',
    problem: 'সমস্যা',
    solution: 'সমাধান',
    result: 'ফলাফল',
    roadmapTitle: 'রোডম্যাপ — আসন্ন ও প্রস্তাবিত ফিচারসমূহ',
    roadmapSub: 'পরবর্তীতে কী তৈরি করা যাবে, প্রচেষ্টা ও প্রভাব অনুযায়ী বিভাজিত',
    canBuildNow: 'এখনই তৈরি করা যাবে',
    canBuildNowSub: 'সহজ — বর্তমান টেক স্ট্যাকেই সম্পূর্ণ বাস্তবায়নযোগ্য',
    mediumEffort: 'মাঝারি প্রচেষ্টা',
    mediumEffortSub: 'নতুন ইন্টিগ্রেশন বা মাঝারি UI কাজ প্রয়োজন',
    futureVision: 'ভবিষ্যৎ পরিকল্পনা',
    futureVisionSub: 'বড় ফিচার যার জন্য নতুন অবকাঠামো প্রয়োজন',
    mySuggestions: 'আমার শীর্ষ পরামর্শ',
    mySuggestionsSub: 'বাজারের চাহিদা অনুযায়ী যেগুলো আমি অগ্রাধিকার দেওয়ার সুপারিশ করি',
    effort: 'প্রচেষ্টা',
    impact: 'প্রভাব',
  },
}

const FEATURE_LABELS = {
  en: [
    { title: 'Campaign Builder',       tagline: 'Launch a giveaway in under 2 minutes' },
    { title: 'Multi-Method Entry',     tagline: '8+ ways to earn entries, each driving a different growth goal' },
    { title: 'Viral Referral Engine',  tagline: 'Turn every entrant into a promoter' },
    { title: 'Fraud & Bot Detection',  tagline: 'Keep your giveaway clean and your data valuable' },
    { title: 'Real-time Analytics',    tagline: "Know exactly what's working" },
    { title: 'Winner Picker & Announcement', tagline: 'Fair, transparent, dramatic' },
    { title: 'Participants Manager',   tagline: 'Full visibility into every entry' },
    { title: 'Integrations Hub',       tagline: 'Connect your entire marketing stack' },
    { title: 'Embed Widget',           tagline: 'Put your giveaway anywhere' },
    { title: 'AI Content Generation',  tagline: 'Write nothing — let AI do it' },
    { title: 'Custom Domain',          tagline: 'Your brand, your URL' },
    { title: 'API & Developer Tools',  tagline: 'Build on top of GiveShop' },
  ],
  bn: [
    { title: 'ক্যাম্পেইন বিল্ডার',       tagline: '২ মিনিটেরও কম সময়ে গিভঅ্যাওয়ে চালু করুন' },
    { title: 'মাল্টি-মেথড এন্ট্রি',       tagline: '৮+ উপায়ে এন্ট্রি অর্জন করুন, প্রতিটি ভিন্ন গ্রোথ লক্ষ্যে' },
    { title: 'ভাইরাল রেফারেল ইঞ্জিন',    tagline: 'প্রতিটি অংশগ্রহণকারীকে প্রচারক বানান' },
    { title: 'জালিয়াতি ও বট সনাক্তকরণ', tagline: 'আপনার গিভঅ্যাওয়ে পরিষ্কার রাখুন' },
    { title: 'রিয়েল-টাইম বিশ্লেষণ',      tagline: 'ঠিক কী কাজ করছে তা জানুন' },
    { title: 'বিজয়ী নির্বাচন ও ঘোষণা',   tagline: 'ন্যায্য, স্বচ্ছ, নাটকীয়' },
    { title: 'অংশগ্রহণকারী ম্যানেজার',    tagline: 'প্রতিটি এন্ট্রিতে সম্পূর্ণ দৃশ্যমানতা' },
    { title: 'ইন্টিগ্রেশন হাব',           tagline: 'আপনার সম্পূর্ণ মার্কেটিং স্ট্যাক সংযুক্ত করুন' },
    { title: 'এমবেড উইজেট',             tagline: 'যেকোনো জায়গায় গিভঅ্যাওয়ে রাখুন' },
    { title: 'AI কন্টেন্ট তৈরি',          tagline: 'কিছু লিখতে হবে না — AI করবে' },
    { title: 'কাস্টম ডোমেইন',            tagline: 'আপনার ব্র্যান্ড, আপনার URL' },
    { title: 'API ও ডেভেলপার টুলস',      tagline: 'GiveShop-এর উপর নির্মাণ করুন' },
  ],
}

// ── Features Data ──────────────────────────────────────────────────────────────

const FEATURES = [
  {
    id: 'campaigns', icon: <Gift size={22} />, color: 'text-brand-green', bg: 'bg-brand-green/10',
    route: '/campaigns/new',
    what: 'A full drag-and-drop style campaign editor. Set your prize, pick entry methods, configure fraud rules, apply branding, and generate AI content — all from one screen.',
    how: ['Set prize name, value, and campaign dates', 'Choose entry methods (email, social, referral, purchase)', 'Configure fraud detection rules per campaign', 'Add custom fields to collect extra data from entrants', 'AI-generated titles, descriptions, and rules via Groq LLM', 'Save as Draft or Publish instantly'],
    usecases: [{ label: 'Shopify Product Launch', example: 'A skincare brand launches a new serum. They create a giveaway with "Follow on Instagram" + "Refer a Friend" entry methods. In 7 days they collect 4,200 emails and 1,800 new Instagram followers.' }, { label: 'Holiday Campaign', example: 'An apparel store runs a Christmas giveaway. They use AI to generate the description, set it to end on Dec 24, and embed it on their Shopify homepage. No coding needed.' }],
  },
  {
    id: 'entry-methods', icon: <Zap size={22} />, color: 'text-yellow-400', bg: 'bg-yellow-400/10',
    route: '/campaigns/new',
    what: 'Each entry method rewards entrants with bonus tickets, creating an incentive loop. More entries = more chances to win = more sharing.',
    how: ['Email signup (1 entry — baseline)', 'Instagram follow (3 entries)', 'TikTok follow (3 entries)', 'Share on social (5 entries)', 'Visit a URL / product page (2 entries)', 'Purchase verification via Shopify order (10 entries)', 'Discord server join (3 entries)', 'YouTube subscribe (3 entries)'],
    usecases: [{ label: 'Grow Social Following', example: 'A food brand wants 10k TikTok followers. They set TikTok Follow = 5 entries (highest weight). Campaign ends with 8,400 new TikTok followers.' }, { label: 'Drive Purchase Conversions', example: 'An electronics store gives 10 entries for verified purchases. Customers who buy feel VIP. Conversion rate on the giveaway page jumps to 12%.' }],
  },
  {
    id: 'referral', icon: <Repeat2 size={22} />, color: 'text-purple-400', bg: 'bg-purple-400/10',
    route: '/leaderboard',
    what: 'Every participant gets a unique referral link. When their friend enters, they earn bonus entries. The leaderboard shows top referrers and fuels competition.',
    how: ['Auto-generated unique referral codes per entrant', 'Referral tracking links: /enter/:id?ref=CODE', 'Bonus entries awarded automatically when referrals convert', 'Leaderboard ranks top referrers in real time', 'Referral count and rate shown in Analytics', 'Copy referral link + social share buttons on leaderboard'],
    usecases: [{ label: 'Exponential List Growth', example: 'A coffee subscription brand starts with 200 email subscribers. After a 14-day giveaway, each entrant referred 2.8 new people on average. Final count: 1,960 new email subscribers.' }, { label: 'Community Engagement', example: 'A gaming Discord server runs a giveaway for a rare in-game item. Top referrers compete on the leaderboard. The #1 referrer brings in 47 new members.' }],
  },
  {
    id: 'fraud', icon: <Shield size={22} />, color: 'text-red-400', bg: 'bg-red-400/10',
    route: '/bot-detection',
    what: 'A real-time fraud engine that flags suspicious entries before they pollute your email list. Rules are configurable per-campaign.',
    how: ["Duplicate email detection — same email can't enter twice", 'Duplicate IP detection — blocks multiple entries from one device', 'Burner email domain blocklist (50+ domains like mailinator, guerrillamail)', 'Entry velocity detection — too many entries too fast = bot', 'Suspicious entries excluded from winner draw automatically', 'Manual review and dismiss alerts'],
    usecases: [{ label: 'High-Value Prize Protection', example: 'A watch brand gives away a $2,000 timepiece. Bot Detection blocks 340 suspicious entries (12% of total), all from the same IP subnet. Winner is a genuine fan.' }, { label: 'Email List Quality', example: 'A SaaS company runs a giveaway for a 1-year subscription. Burner email filter blocks 180 throwaway addresses. Their CRM import is clean — 94% deliverability rate.' }],
  },
  {
    id: 'analytics', icon: <BarChart2 size={22} />, color: 'text-teal-400', bg: 'bg-teal-400/10',
    route: '/analytics',
    what: "A live analytics dashboard that breaks down entries by method, quality, date, and referral source. No external tools needed.",
    how: ['Total entries, valid entries, fraud-blocked count', 'Entry method breakdown (pie/bar chart)', 'Lead quality scoring: Engaged / Neutral / Freebie hunter', 'Daily entry trend chart (7/14/30-day view)', 'Top referrers table with referral counts', 'Referral conversion rate', 'Filter by campaign or date range'],
    usecases: [{ label: 'Optimize Entry Methods', example: 'A pet supplies store sees that "Visit Product Page" gets 40% of entries but zero referrals. They increase bonus entries for "Share on Social" mid-campaign. Referral rate jumps from 8% to 31%.' }, { label: 'Identify Super-Sharers', example: 'Analytics shows one entrant drove 89 referrals. The brand reaches out, offers them an affiliate deal. They become a micro-influencer partner.' }],
  },
  {
    id: 'winner', icon: <Trophy size={22} />, color: 'text-amber-400', bg: 'bg-amber-400/10',
    route: '/winner',
    what: 'An animated spin wheel picks winner(s) weighted by entry count. Results are publicly verifiable. Supports multiple prizes.',
    how: ['Animated spin wheel for dramatic winner reveals', 'Weighted by total entries (more entries = higher chance)', 'Suspicious/fraudulent entries automatically excluded', 'Multiple winner support (configurable prize count)', 'Public proof page with masked email for verification', 'Winner announcement page with social share buttons'],
    usecases: [{ label: 'Transparent Draw', example: 'A charity runs a raffle and shares the spin wheel video live on Instagram. The public proof page link is shared in the bio. Zero dispute from 3,400 entrants.' }, { label: 'Multiple Prize Tiers', example: 'A beauty brand offers 1st, 2nd, and 3rd prize tiers. WinnerPicker draws 3 separate winners with one click each.' }],
  },
  {
    id: 'participants', icon: <Users size={22} />, color: 'text-blue-400', bg: 'bg-blue-400/10',
    route: '/participants',
    what: 'Browse, search, filter, and export all entries across campaigns. Bulk CSV export for CRM import.',
    how: ['Search by name or email', 'Filter by campaign, date range, entry method', 'Sort by entries, date, referrals', 'View custom field answers per entry', 'Mark / review suspicious entries', 'Bulk export to CSV (for Klaviyo, Mailchimp, CRM import)'],
    usecases: [{ label: 'Post-Giveaway Email Blast', example: 'After a giveaway ends, the marketing team exports all 5,200 valid entries to CSV. They import directly into Klaviyo and send a consolation 15% discount email. $12,000 in revenue attributed.' }, { label: 'Segment Super-Fans', example: 'Filter participants with 20+ entries (power referrers). Export that segment and add to a VIP customer list in their CRM.' }],
  },
  {
    id: 'integrations', icon: <Link2 size={22} />, color: 'text-indigo-400', bg: 'bg-indigo-400/10',
    route: '/integrations-setup',
    what: 'On every new entry, GiveShop fires all active integrations in parallel — syncing email lists, webhooks, and tracking pixels automatically.',
    how: ['Mailchimp — sync new entrants to audience lists', 'Klaviyo — onsite SDK + private API list sync', 'ConvertKit — form subscriber API', 'ActiveCampaign — contact sync', 'Custom Webhooks — POST entry data to any endpoint', 'Zapier — no-code automation trigger', 'Facebook Pixel — track Lead events', 'Google Analytics 4 — track generate_lead events', 'Google Tag Manager', 'Shopify Orders — purchase verification webhook'],
    usecases: [{ label: 'Full Automation Stack', example: 'A DTC brand connects Klaviyo + Zapier + Facebook Pixel. Every entry: (1) adds contact to Klaviyo flow, (2) fires Zapier to create a Notion row, (3) fires Facebook Pixel Lead event to optimize their ad campaign.' }, { label: 'Shopify Purchase Verification', example: 'A shoe store gives 10 entries for purchases. Shopify order webhook automatically verifies and awards entries to buyers — no manual work.' }],
  },
  {
    id: 'embed', icon: <Code2 size={22} />, color: 'text-pink-400', bg: 'bg-pink-400/10',
    route: '/embed',
    what: 'Generate a single `<script>` or `<iframe>` snippet to embed the giveaway on any website, Shopify page, or landing page builder.',
    how: ['One-line embed code — paste anywhere', 'Popup mode (button triggers modal)', 'Inline mode (embeds directly in page)', 'Responsive — works on mobile', 'Auto-syncs with campaign changes', 'Supports custom domain for white-label look'],
    usecases: [{ label: 'Shopify Store Integration', example: 'Paste the embed script in Shopify theme. The giveaway widget appears on the homepage. No app install required. Entry data flows back to GiveShop in real time.' }, { label: 'Standalone Landing Page', example: 'A brand builds a dedicated /giveaway page on their WordPress site and embeds the popup widget.' }],
  },
  {
    id: 'ai', icon: <Cpu size={22} />, color: 'text-violet-400', bg: 'bg-violet-400/10',
    route: '/campaigns/new',
    what: "Powered by Groq's Llama 3.3 70B model. Generates giveaway titles, descriptions, and official rules in seconds with streaming output.",
    how: ['Generate catchy campaign title from prize + audience', 'Write engaging 2-3 paragraph description', 'Generate formal 6-clause contest rules', 'Streaming output — text appears as it\'s written', 'Fallback templates when offline/rate-limited', 'One-click regenerate if you don\'t like the result'],
    usecases: [{ label: 'Zero Copywriting Effort', example: "A store owner enters 'Prize: iPhone 16, Audience: Gen Z shoppers' and clicks Generate. In 4 seconds they have a title, 3-paragraph description, and full legal rules. Campaign live in 90 seconds total." }],
  },
  {
    id: 'custom-domain', icon: <Globe size={22} />, color: 'text-cyan-400', bg: 'bg-cyan-400/10',
    route: '/custom-domain',
    what: 'Point a custom subdomain (e.g., win.yourbrand.com) to GiveShop. Your public giveaway pages show your domain instead of giveshop.app.',
    how: ['Enter your custom subdomain in settings', 'Add a CNAME DNS record (instructions provided)', 'SSL auto-provisioned', 'All /g/:id public pages served from your domain', 'White-label — no GiveShop branding visible'],
    usecases: [{ label: 'Agency White-Label', example: 'A marketing agency manages giveaways for 5 clients. Each client gets their own subdomain (win.clienta.com). Entrants never see "GiveShop".' }],
  },
  {
    id: 'api', icon: <Key size={22} />, color: 'text-orange-400', bg: 'bg-orange-400/10',
    route: '/api-settings',
    what: 'Public and private API keys for programmatic access. CORS whitelist for secure browser-side calls. Full request/response logging.',
    how: ['Generate public key (safe for frontend) and private key (server-only)', 'CORS origin whitelist — restrict which domains can call the API', 'API Logs — view every request with status, payload, timestamp', 'Order Logs — Shopify order webhook history', 'Notification Logs — email/webhook delivery status'],
    usecases: [{ label: 'Custom Entry Form', example: "A developer builds a bespoke entry form on their Next.js site. They call the GiveShop API with the public key to submit entries directly, bypassing the default widget." }],
  },
]

const LIFECYCLE_COLORS = [
  'bg-dark-600 text-dark-300',
  'bg-brand-green/20 text-brand-green',
  'bg-amber-500/20 text-amber-400',
  'bg-purple-500/20 text-purple-400',
  'bg-blue-500/20 text-blue-400',
  'bg-teal-500/20 text-teal-400',
]

const TECH_STACK = [
  { name: 'React 19', role: 'Frontend framework', rolebn: 'ফ্রন্টএন্ড ফ্রেমওয়ার্ক', icon: '⚛️' },
  { name: 'Vite 8', role: 'Build tool / dev server', rolebn: 'বিল্ড টুল', icon: '⚡' },
  { name: 'Zustand', role: 'State management', rolebn: 'স্টেট ম্যানেজমেন্ট', icon: '🐻' },
  { name: 'React Router 7', role: 'Client-side routing', rolebn: 'ক্লায়েন্ট রাউটিং', icon: '🔀' },
  { name: 'Supabase', role: 'PostgreSQL database + Auth', rolebn: 'ডেটাবেস + অথ', icon: '🗄️' },
  { name: 'TailwindCSS', role: 'Utility-first styling', rolebn: 'স্টাইলিং ফ্রেমওয়ার্ক', icon: '🎨' },
  { name: 'Groq / Llama 3.3', role: 'AI content generation', rolebn: 'AI কন্টেন্ট তৈরি', icon: '🤖' },
  { name: 'Shopify API', role: 'Product data + orders', rolebn: 'প্রোডাক্ট + অর্ডার', icon: '🛍️' },
  { name: 'Lucide React', role: 'Icon library', rolebn: 'আইকন লাইব্রেরি', icon: '✨' },
  { name: 'Vercel', role: 'Hosting / deployment', rolebn: 'হোস্টিং / ডেপ্লয়', icon: '▲' },
]

// ── Roadmap Data ─────────────────────────────────────────────────────────────

const ROADMAP = {
  canBuildNow: [
    {
      icon: <Mail size={16} />,
      color: 'text-brand-green',
      title: 'Automated Winner Email',
      titlebn: 'স্বয়ংক্রিয় বিজয়ী ইমেইল',
      desc: 'Auto-send a congratulations email to the winner with a claim link, and a consolation discount email to all non-winners. Currently winner notification is manual.',
      descbn: 'বিজয়ীকে স্বয়ংক্রিয়ভাবে ক্লেইম লিঙ্কসহ অভিনন্দন ইমেইল পাঠানো এবং বাকিদের সান্ত্বনা ডিসকাউন্ট ইমেইল পাঠানো।',
      effort: 'Low', impact: 'High',
    },
    {
      icon: <QrCode size={16} />,
      color: 'text-cyan-400',
      title: 'QR Code Generator',
      titlebn: 'QR কোড জেনারেটর',
      desc: 'Generate a QR code for the giveaway URL. Print on flyers, packaging inserts, or event banners to drive offline traffic to the giveaway.',
      descbn: 'গিভঅ্যাওয়ে URL-এর জন্য QR কোড তৈরি করুন। ফ্লায়ার, প্যাকেজিং বা ইভেন্ট ব্যানারে প্রিন্ট করুন।',
      effort: 'Low', impact: 'Medium',
    },
    {
      icon: <Bell size={16} />,
      color: 'text-yellow-400',
      title: 'Social Proof Notifications',
      titlebn: 'সোশ্যাল প্রুফ নোটিফিকেশন',
      desc: '"Sarah from New York just entered!" popup notifications on the giveaway page. Proven to increase conversion rate by 15–25%. Uses existing entry data — no new backend needed.',
      descbn: '"নিউ ইয়র্কের সারা এইমাত্র অংশ নিয়েছেন!" পপআপ নোটিফিকেশন। কনভার্সন রেট ১৫-২৫% বাড়ায়।',
      effort: 'Low', impact: 'High',
    },
    {
      icon: <FlaskConical size={16} />,
      color: 'text-purple-400',
      title: 'A/B Testing for Campaign Copy',
      titlebn: 'ক্যাম্পেইন কপির A/B টেস্টিং',
      desc: 'Test two different headlines or descriptions. Split traffic 50/50 and show which version gets more entries. The state management already has abTestEnabled in the form.',
      descbn: 'দুটি ভিন্ন শিরোনাম বা বিবরণ পরীক্ষা করুন। ট্র্যাফিক ৫০/৫০ ভাগ করুন এবং কোনটি বেশি এন্ট্রি পায় দেখুন।',
      effort: 'Low', impact: 'Medium',
    },
    {
      icon: <RefreshCw size={16} />,
      color: 'text-teal-400',
      title: 'Campaign Duplication & Templates',
      titlebn: 'ক্যাম্পেইন ডুপ্লিকেশন ও টেমপ্লেট',
      desc: 'One-click duplicate any campaign as a starting template. Also add a library of 10+ pre-built niche templates (e-commerce, SaaS, creator, local business).',
      descbn: 'এক ক্লিকে যেকোনো ক্যাম্পেইন ডুপ্লিকেট করুন। ১০+ প্রি-বিল্ট নিশ টেমপ্লেট লাইব্রেরি যোগ করুন।',
      effort: 'Low', impact: 'High',
    },
    {
      icon: <GitBranch size={16} />,
      color: 'text-indigo-400',
      title: 'Supabase Edge Functions for Email APIs',
      titlebn: 'ইমেইল API-এর জন্য Supabase Edge Functions',
      desc: 'Move CORS-blocked integrations (Mailchimp REST API, Klaviyo private key subscribe) to Supabase Edge Functions. Currently these only work via JSONP workarounds.',
      descbn: 'CORS-ব্লকড ইন্টিগ্রেশন (Mailchimp REST, Klaviyo private) Supabase Edge Functions-এ সরান।',
      effort: 'Low', impact: 'High',
    },
  ],
  mediumEffort: [
    {
      icon: <Palette size={16} />,
      color: 'text-pink-400',
      title: 'Visual Theme Builder',
      titlebn: 'ভিজ্যুয়াল থিম বিল্ডার',
      desc: 'Live color picker, font selector, background image upload for the public giveaway page. Brand colors, logo placement, and custom CSS — all visual, no code.',
      descbn: 'পাবলিক গিভঅ্যাওয়ে পেজের জন্য লাইভ কালার পিকার, ফন্ট সিলেক্টর, ব্যাকগ্রাউন্ড ইমেজ আপলোড।',
      effort: 'Medium', impact: 'High',
    },
    {
      icon: <Camera size={16} />,
      color: 'text-orange-400',
      title: 'Photo / Video Contest Mode',
      titlebn: 'ফটো/ভিডিও কনটেস্ট মোড',
      desc: 'Entrants submit a photo or short video. Public gallery displays all submissions. Voting system lets the audience vote for their favorite. Winner = most votes OR random from top 10.',
      descbn: 'অংশগ্রহণকারীরা ছবি বা শর্ট ভিডিও জমা দেন। পাবলিক গ্যালারি প্রদর্শন করে। ভোটিং সিস্টেম।',
      effort: 'Medium', impact: 'High',
    },
    {
      icon: <Sparkles size={16} />,
      color: 'text-violet-400',
      title: 'Instant Win / Scratch Card',
      titlebn: 'ইনস্ট্যান্ট উইন / স্ক্র্যাচ কার্ড',
      desc: 'Some entrants win instantly after signing up — scratch card UI reveals if they won. A percentage of entries are pre-marked as instant winners. Creates addictive engagement.',
      descbn: 'কিছু অংশগ্রহণকারী সাইনআপের পরেই জিতে যান। স্ক্র্যাচ কার্ড UI দেখায় তারা জিতেছে কিনা।',
      effort: 'Medium', impact: 'High',
    },
    {
      icon: <Building2 size={16} />,
      color: 'text-blue-400',
      title: 'Team Collaboration & Roles',
      titlebn: 'টিম কোলাবরেশন ও রোলস',
      desc: 'Invite team members with role-based access: Admin (full access), Manager (edit campaigns), Viewer (read-only analytics). Essential for agencies managing multiple client accounts.',
      descbn: 'রোল-ভিত্তিক অ্যাক্সেস সহ টিম মেম্বার আমন্ত্রণ করুন: অ্যাডমিন, ম্যানেজার, ভিউয়ার।',
      effort: 'Medium', impact: 'High',
    },
    {
      icon: <BarChart2 size={16} />,
      color: 'text-teal-400',
      title: 'Advanced Analytics Dashboard',
      titlebn: 'অ্যাডভান্সড অ্যানালিটিক্স ড্যাশবোর্ড',
      desc: 'Conversion funnel (views → entries → shares → referrals), cohort analysis, email engagement scoring, cost-per-lead calculator, campaign comparison charts.',
      descbn: 'কনভার্সন ফানেল, কোহর্ট বিশ্লেষণ, ইমেইল এনগেজমেন্ট স্কোরিং, লিড-প্রতি-খরচ ক্যালকুলেটর।',
      effort: 'Medium', impact: 'High',
    },
    {
      icon: <Lock size={16} />,
      color: 'text-amber-400',
      title: 'GDPR Compliance Dashboard',
      titlebn: 'GDPR কমপ্লায়েন্স ড্যাশবোর্ড',
      desc: 'Data export requests (DSAR), right to be forgotten (delete entry by email), consent log viewer, cookie consent banner. Required for EU market.',
      descbn: 'ডেটা এক্সপোর্ট রিকোয়েস্ট, ভুলে যাওয়ার অধিকার (ইমেইল দিয়ে এন্ট্রি মুছুন), কনসেন্ট লগ।',
      effort: 'Medium', impact: 'Medium',
    },
  ],
  futureVision: [
    {
      icon: <Smartphone size={16} />,
      color: 'text-green-400',
      title: 'Mobile App (iOS & Android)',
      titlebn: 'মোবাইল অ্যাপ (iOS ও Android)',
      desc: 'Manage campaigns, view live analytics, and pick winners from your phone. Push notifications for milestone alerts ("You just hit 1,000 entries!"). Built with React Native.',
      descbn: 'ফোন থেকে ক্যাম্পেইন ম্যানেজ করুন, লাইভ অ্যানালিটিক্স দেখুন এবং বিজয়ী নির্বাচন করুন।',
      effort: 'High', impact: 'High',
    },
    {
      icon: <Building2 size={16} />,
      color: 'text-blue-400',
      title: 'Shopify App Store Listing',
      titlebn: 'শপিফাই অ্যাপ স্টোর লিস্টিং',
      desc: 'Proper Shopify embedded app using App Bridge. Install directly from Shopify App Store with one click. Auto-authenticates with store credentials. Massive distribution channel.',
      descbn: 'App Bridge ব্যবহার করে শপিফাই এমবেডেড অ্যাপ। শপিফাই অ্যাপ স্টোর থেকে সরাসরি ইনস্টল।',
      effort: 'High', impact: 'Very High',
    },
    {
      icon: <Cpu size={16} />,
      color: 'text-violet-400',
      title: 'AI Campaign Optimizer',
      titlebn: 'AI ক্যাম্পেইন অপ্টিমাইজার',
      desc: 'AI analyzes your campaign performance mid-run and suggests: "Increase referral bonus entries — your referral rate is 4x higher than email entries." Auto-adjusts entry weights.',
      descbn: 'AI মাঝ-চলাকালীন পারফরম্যান্স বিশ্লেষণ করে পরামর্শ দেয়: "রেফারেল বোনাস বাড়ান।"',
      effort: 'High', impact: 'Very High',
    },
    {
      icon: <Globe size={16} />,
      color: 'text-cyan-400',
      title: 'Multi-Language Giveaway Pages',
      titlebn: 'মাল্টি-ল্যাঙ্গুয়েজ গিভঅ্যাওয়ে পেজ',
      desc: 'Public giveaway pages auto-detect browser language and show content in the visitor\'s language. Support 10+ languages. Translation management UI in the dashboard.',
      descbn: 'পাবলিক গিভঅ্যাওয়ে পেজ ব্রাউজার ভাষা স্বয়ংক্রিয়ভাবে সনাক্ত করে। ১০+ ভাষা সমর্থন।',
      effort: 'High', impact: 'High',
    },
  ],
  mySuggestions: [
    {
      icon: <Mail size={16} />,
      color: 'text-brand-green',
      rank: '#1',
      title: 'Automated Email Sequences',
      titlebn: 'স্বয়ংক্রিয় ইমেইল সিকোয়েন্স',
      why: 'Biggest gap vs KingSumo. KingSumo\'s email automation is their #1 selling point — "smart auto-emails backed by 100,000+ data points." Without this, you\'re just a lead collector, not a lead nurturer.',
      whybn: 'KingSumo-এর বিরুদ্ধে সবচেয়ে বড় ঘাটতি। KingSumo-এর ইমেইল অটোমেশন তাদের #১ বিক্রয় পয়েন্ট। এটা ছাড়া শুধু লিড কালেক্টর, নার্চারার নয়।',
      sequences: ['Entry confirmation email (instant)', 'Day 3 reminder "Don\'t miss out — 4 days left"', 'Day 7 final reminder "Last chance!"', 'Winner announcement to all entrants', 'Consolation email with discount code to non-winners'],
    },
    {
      icon: <Sparkles size={16} />,
      color: 'text-yellow-400',
      rank: '#2',
      title: 'Instant Win Mechanic',
      titlebn: 'ইনস্ট্যান্ট উইন মেকানিক',
      why: 'Solves the biggest giveaway problem: people enter once and forget. Instant win keeps users coming back daily. "Spin daily for an extra chance to win instantly." 3–5x higher engagement.',
      whybn: 'গিভঅ্যাওয়ের সবচেয়ে বড় সমস্যা সমাধান করে: মানুষ একবার এন্ট্রি করে ভুলে যায়। ইনস্ট্যান্ট উইন ৩-৫x বেশি এনগেজমেন্ট তৈরি করে।',
      sequences: ['Daily spin wheel for instant win chance', 'Scratch card UI on entry confirmation', 'Configurable win % (e.g., 1 in 50 wins a small prize)', 'Big prize still drawn randomly at end'],
    },
    {
      icon: <Building2 size={16} />,
      color: 'text-blue-400',
      rank: '#3',
      title: 'Agency / White-Label Mode',
      titlebn: 'এজেন্সি / হোয়াইট-লেবেল মোড',
      why: 'The highest-LTV customer segment. One agency = 5–50 clients paying monthly. White-label removes all GiveShop branding. Client management dashboard lets agencies bill clients separately.',
      whybn: 'সর্বোচ্চ LTV কাস্টমার সেগমেন্ট। একটি এজেন্সি = ৫-৫০ ক্লায়েন্ট। হোয়াইট-লেবেল সব GiveShop ব্র্যান্ডিং সরায়।',
      sequences: ['Custom logo + colors on all pages', 'Client sub-accounts with usage limits', 'Agency billing dashboard', 'Custom domain per client (win.client.com)', 'Reseller pricing tiers'],
    },
  ],
}

// ── Real-World Use Cases ───────────────────────────────────────────────────────

const REALWORLD = [
  {
    community: 'Reddit — r/entrepreneur',
    icon: <MessageCircle size={18} />,
    communityColor: 'text-orange-400',
    communityBg: 'bg-orange-400/10 border-orange-400/20',
    niche: 'SaaS Founder',
    problemEn: 'A SaaS founder posted on r/entrepreneur: "Spending $3,000/month on Meta ads but only getting 50 new email subscribers/month. ROI is terrible. What am I doing wrong?" The thread blew up — 200+ comments, most recommending giveaways but with no clear tool recommendation.',
    problemBn: 'একজন SaaS প্রতিষ্ঠাতা r/entrepreneur-এ পোস্ট করেছিলেন: "মেটা বিজ্ঞাপনে মাসে $৩,০০০ খরচ করছি কিন্তু মাত্র ৫০টি নতুন ইমেইল সাবস্ক্রাইবার পাচ্ছি। ROI ভয়াবহ।" থ্রেডে ২০০+ কমেন্ট আসে, বেশিরভাগই গিভঅ্যাওয়ের পরামর্শ দেয়।',
    solutionEn: 'They ran a "Win a 1-year Pro subscription ($588 value)" giveaway using GiveShop. Entry required email signup + Tweet about the product (3 bonus entries). Fraud detection blocked 89 bot entries. The campaign ran for 14 days with zero manual work.',
    solutionBn: 'তারা GiveShop ব্যবহার করে "১ বছরের প্রো সাবস্ক্রিপশন জিতুন ($৫৮৮ মূল্য)" গিভঅ্যাওয়ে চালায়। এন্ট্রির জন্য ইমেইল সাইনআপ + পণ্য সম্পর্কে টুইট করতে হতো। জালিয়াতি সনাক্তকরণ ৮৯টি বট এন্ট্রি ব্লক করে।',
    resultEn: '2,400 email signups in 14 days. 890 organic tweets. Product trended on Twitter/X for 6 hours. Cost per lead dropped from $60 → $1.75. They converted 340 signups into paid customers within 30 days.',
    resultBn: '১৪ দিনে ২,৪০০ ইমেইল সাইনআপ। ৮৯০টি অর্গানিক টুইট। লিড প্রতি খরচ $৬০ থেকে $১.৭৫-এ নামে। ৩০ দিনের মধ্যে ৩৪০ জন পেইড কাস্টমার হয়।',
    tags: ['SaaS', 'Twitter/X', 'Email Growth'],
  },
  {
    community: 'Facebook Group — Shopify Dropshippers Hub',
    icon: <ShoppingCart size={18} />,
    communityColor: 'text-blue-400',
    communityBg: 'bg-blue-400/10 border-blue-400/20',
    niche: 'Dropshipper / E-commerce',
    problemEn: 'A member of a 45,000-person Shopify dropshippers Facebook group shared: "78% cart abandonment rate. Tried every popup app. Retargeting ads cost $1,200/month and barely break even. My email list has 800 people but open rates are 9%. How do people actually grow these lists?"',
    problemBn: 'একটি ৪৫,০০০ সদস্যের শপিফাই ড্রপশিপার্স ফেসবুক গ্রুপে একজন সদস্য লিখেছিলেন: "৭৮% কার্ট অ্যাবান্ডনমেন্ট রেট। রিটার্গেটিং বিজ্ঞাপনে মাসে $১,২০০ খরচ হচ্ছে। ৮০০ ইমেইল সাবস্ক্রাইবার আছে কিন্তু ওপেন রেট মাত্র ৯%।"',
    solutionEn: 'They set up a GiveShop campaign offering their best-selling $120 product as the prize. Key setup: "Make a purchase" = 10 bonus entries (verified via Shopify order webhook — automated, no manual checking). They connected Klaviyo so every entrant was automatically added to a welcome flow.',
    solutionBn: 'তারা GiveShop ক্যাম্পেইন তৈরি করে সেরা-বিক্রয় $১২০ পণ্যটি পুরস্কার হিসেবে দেয়। "পণ্য কিনুন" = ১০ বোনাস এন্ট্রি (শপিফাই অর্ডার ওয়েবহুক দিয়ে স্বয়ংক্রিয়ভাবে যাচাই)। Klaviyo সংযুক্ত করা হয় যাতে প্রতিটি অংশগ্রহণকারী স্বয়ংক্রিয়ভাবে ওয়েলকাম ফ্লোতে যোগ হয়।',
    resultEn: 'Campaign ran for 10 days. 1,200 new email subscribers. Revenue during campaign: +43% vs same period last month ($8,400 extra). The Klaviyo welcome flow converted 18% of giveaway signups into buyers. Post-giveaway open rate improved to 31% (people who actually want the product).',
    resultBn: '১০ দিনের ক্যাম্পেইনে ১,২০০ নতুন ইমেইল সাবস্ক্রাইবার। ক্যাম্পেইন চলাকালীন রাজস্ব +৪৩% (অতিরিক্ত $৮,৪০০)। Klaviyo ওয়েলকাম ফ্লো গিভঅ্যাওয়ে সাইনআপের ১৮% ক্রেতায় রূপান্তরিত করে। ওপেন রেট ৯% থেকে বেড়ে ৩১% হয়।',
    tags: ['Shopify', 'Klaviyo', 'Dropshipping', 'Purchase Entry'],
  },
  {
    community: 'Instagram — Food & Lifestyle Community',
    icon: <Camera size={18} />,
    communityColor: 'text-pink-400',
    communityBg: 'bg-pink-400/10 border-pink-400/20',
    niche: 'Food Blogger / Content Creator',
    problemEn: 'A food blogger with 8,200 Instagram followers DM\'d for advice: "Been posting twice a day for 6 months. Growth has completely stalled at 8k. Engagement is dropping. I tried a basic "tag a friend" post giveaway but only got 40 entries and Instagram flagged it as spam. I need actual systematic growth."',
    problemBn: 'একজন ফুড ব্লগার (৮,২০০ ইনস্টাগ্রাম ফলোয়ার) সাহায্য চেয়েছিলেন: "৬ মাস ধরে দিনে দুবার পোস্ট করছি কিন্তু গ্রোথ থেমে গেছে। একটি বেসিক \'ফ্রেন্ড ট্যাগ\' গিভঅ্যাওয়ে করেছিলাম কিন্তু মাত্র ৪০ এন্ট্রি এলো এবং ইনস্টাগ্রাম স্প্যাম হিসেবে ফ্ল্যাগ করল।"',
    solutionEn: 'They created a proper giveaway page on GiveShop: Prize = "Dinner for two at partner restaurant ($150 value)". Entry methods: Email signup (1 entry) + Instagram follow (3 entries) + Share in Stories (5 entries) + Tag a friend via referral link (2 entries per referral). The referral system meant each person brought in 2–3 more via their personal link — no spam flags.',
    solutionBn: 'তারা GiveShop-এ সঠিক গিভঅ্যাওয়ে পেজ তৈরি করে। পুরস্কার: "পার্টনার রেস্টুরেন্টে দুজনের ডিনার ($১৫০ মূল্য)"। এন্ট্রি পদ্ধতি: ইমেইল সাইনআপ + ইনস্টাগ্রাম ফলো + স্টোরিতে শেয়ার + রেফারেল লিঙ্কে বন্ধু ট্যাগ। রেফারেল সিস্টেমে প্রত্যেকে ব্যক্তিগত লিঙ্কের মাধ্যমে ২-৩ জন নিয়ে আসে।',
    resultEn: '10-day campaign. +2,100 Instagram followers (crossed 10k — unlocked the link in bio feature). 3,400 email signups (monetized with a paid recipe ebook 2 weeks later — $4,200 revenue). The restaurant partner was so happy they offered a monthly collaboration deal.',
    resultBn: '১০ দিনের ক্যাম্পেইনে +২,১০০ ইনস্টাগ্রাম ফলোয়ার (১০k পার করে বায়ো লিঙ্ক ফিচার আনলক)। ৩,৪০০ ইমেইল সাইনআপ (২ সপ্তাহ পরে পেইড রেসিপি ইবুক থেকে $৪,২০০ আয়)। রেস্টুরেন্ট পার্টনার মাসিক কোলাবরেশন ডিল অফার করে।',
    tags: ['Instagram', 'Food Blogger', 'Creator Economy', 'Referral'],
  },
]

// ── Components ────────────────────────────────────────────────────────────────

function FeatureCard({ feature, idx, isBangla, forceOpen }) {
  const [localOpen, setLocalOpen] = useState(false)
  const open = forceOpen || localOpen
  const labels = isBangla ? FEATURE_LABELS.bn[idx] : FEATURE_LABELS.en[idx]
  const t = isBangla ? T.bn : T.en

  return (
    <div className="rounded-xl border border-dark-700 bg-dark-800 overflow-hidden">
      <button
        className="w-full flex items-start gap-4 p-5 text-left hover:bg-dark-700/40 transition-colors"
        onClick={() => setLocalOpen(v => !v)}
      >
        <div className={`shrink-0 w-10 h-10 rounded-lg ${feature.bg} ${feature.color} flex items-center justify-center`}>
          {feature.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-dark-50">{labels.title}</span>
            <span className="text-xs text-dark-400 bg-dark-700 px-2 py-0.5 rounded-full font-mono">{feature.route}</span>
          </div>
          <p className="text-sm text-dark-400 mt-0.5">{labels.tagline}</p>
        </div>
        <div className="shrink-0 text-dark-500 mt-0.5">
          {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {open && (
        <div className="border-t border-dark-700 p-5 space-y-5">
          <div>
            <h4 className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-2">{t.whatItDoes}</h4>
            <p className="text-sm text-dark-200 leading-relaxed">{feature.what}</p>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-2">{t.capabilities}</h4>
            <ul className="space-y-1">
              {feature.how.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-dark-300">
                  <span className={`shrink-0 mt-0.5 ${feature.color}`}>•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-2">{t.useCases}</h4>
            <div className="space-y-3">
              {feature.usecases.map((uc, i) => (
                <div key={i} className="rounded-lg bg-dark-900/60 border border-dark-700 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Star size={13} className={feature.color} />
                    <span className="text-sm font-medium text-dark-100">{uc.label}</span>
                  </div>
                  <p className="text-sm text-dark-400 leading-relaxed">{uc.example}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function RealWorldCard({ item, isBangla }) {
  const [open, setOpen] = useState(false)
  const t = isBangla ? T.bn : T.en
  const problem = isBangla ? item.problemBn : item.problemEn
  const solution = isBangla ? item.solutionBn : item.solutionEn
  const result = isBangla ? item.resultBn : item.resultEn

  return (
    <div className={`rounded-xl border ${item.communityBg} overflow-hidden`}>
      <button
        className="w-full flex items-start gap-3 p-5 text-left hover:bg-white/5 transition-colors"
        onClick={() => setOpen(v => !v)}
      >
        <div className={`shrink-0 mt-0.5 ${item.communityColor}`}>{item.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-semibold ${item.communityColor}`}>{item.community}</span>
          </div>
          <p className="text-sm font-semibold text-dark-100 mt-0.5">{item.niche}</p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {item.tags.map(tag => (
              <span key={tag} className="text-xs bg-dark-700 text-dark-400 px-2 py-0.5 rounded-full">{tag}</span>
            ))}
          </div>
        </div>
        <div className="shrink-0 text-dark-500">
          {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {open && (
        <div className="border-t border-dark-700/50 divide-y divide-dark-700/50">
          {[
            { label: t.problem, text: problem, color: 'text-red-400', dot: 'bg-red-400' },
            { label: t.solution, text: solution, color: 'text-brand-green', dot: 'bg-brand-green' },
            { label: t.result, text: result, color: 'text-amber-400', dot: 'bg-amber-400' },
          ].map(({ label, text, color, dot }) => (
            <div key={label} className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />
                <span className={`text-xs font-semibold uppercase tracking-wider ${color}`}>{label}</span>
              </div>
              <p className="text-sm text-dark-300 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Roadmap Components ────────────────────────────────────────────────────────

const effortColor = { Low: 'text-brand-green bg-brand-green/10', Medium: 'text-amber-400 bg-amber-400/10', High: 'text-red-400 bg-red-400/10' }
const impactColor = { High: 'text-purple-400 bg-purple-400/10', 'Very High': 'text-blue-400 bg-blue-400/10', Medium: 'text-dark-300 bg-dark-700' }

function RoadmapCard({ item, isBangla }) {
  return (
    <div className="rounded-xl bg-dark-800 border border-dark-700 p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className={`shrink-0 w-8 h-8 rounded-lg bg-dark-700 flex items-center justify-center ${item.color}`}>
          {item.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-dark-100">{isBangla ? item.titlebn : item.title}</p>
          <p className="text-xs text-dark-400 mt-1 leading-relaxed">{isBangla ? item.descbn : item.desc}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${effortColor[item.effort] || 'text-dark-400 bg-dark-700'}`}>
          {isBangla ? 'প্রচেষ্টা' : 'Effort'}: {item.effort}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${impactColor[item.impact] || 'text-dark-400 bg-dark-700'}`}>
          {isBangla ? 'প্রভাব' : 'Impact'}: {item.impact}
        </span>
      </div>
    </div>
  )
}

function SuggestionCard({ item, isBangla }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-xl bg-dark-800 border border-dark-700 overflow-hidden">
      <button className="w-full flex items-start gap-3 p-5 text-left hover:bg-dark-700/40 transition-colors" onClick={() => setOpen(v => !v)}>
        <div className={`shrink-0 w-8 h-8 rounded-lg bg-dark-700 flex items-center justify-center ${item.color}`}>{item.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-brand-green bg-brand-green/10 px-2 py-0.5 rounded-full">{item.rank}</span>
            <span className="text-sm font-semibold text-dark-100">{isBangla ? item.titlebn : item.title}</span>
          </div>
          <p className="text-xs text-dark-400 mt-1 leading-relaxed">{isBangla ? item.whybn : item.why}</p>
        </div>
        <div className="shrink-0 text-dark-500">{open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</div>
      </button>
      {open && (
        <div className="border-t border-dark-700 px-5 py-4">
          <p className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-2">{isBangla ? 'বাস্তবায়ন তালিকা' : 'Implementation Checklist'}</p>
          <ul className="space-y-1.5">
            {item.sequences.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-dark-300">
                <CheckCircle2 size={13} className={`shrink-0 mt-0.5 ${item.color}`} />
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function RoadmapSection({ isBangla }) {
  const t = isBangla ? T.bn : T.en
  const sections = [
    { key: 'canBuildNow',  label: t.canBuildNow,   sub: t.canBuildNowSub,   icon: <CheckCircle2 size={16} />, color: 'text-brand-green', border: 'border-brand-green/30', data: ROADMAP.canBuildNow },
    { key: 'mediumEffort', label: t.mediumEffort,  sub: t.mediumEffortSub,  icon: <Clock size={16} />,        color: 'text-amber-400',   border: 'border-amber-400/30',   data: ROADMAP.mediumEffort },
    { key: 'futureVision', label: t.futureVision,  sub: t.futureVisionSub,  icon: <Lightbulb size={16} />,   color: 'text-purple-400',  border: 'border-purple-400/30',  data: ROADMAP.futureVision },
  ]
  return (
    <div className="space-y-8">
      {/* Category sections */}
      {sections.map(sec => (
        <div key={sec.key}>
          <div className={`flex items-center gap-2 mb-1 ${sec.color}`}>
            {sec.icon}
            <h3 className="text-base font-semibold">{sec.label}</h3>
          </div>
          <p className="text-xs text-dark-400 mb-4">{sec.sub}</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {sec.data.map((item, i) => <RoadmapCard key={i} item={item} isBangla={isBangla} />)}
          </div>
        </div>
      ))}

      {/* My Suggestions */}
      <div>
        <div className="flex items-center gap-2 mb-1 text-brand-green">
          <Star size={16} />
          <h3 className="text-base font-semibold">{t.mySuggestions}</h3>
        </div>
        <p className="text-xs text-dark-400 mb-4">{t.mySuggestionsSub}</p>
        <div className="space-y-3">
          {ROADMAP.mySuggestions.map((item, i) => <SuggestionCard key={i} item={item} isBangla={isBangla} />)}
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ProjectOverview() {
  const [allOpen, setAllOpen] = useState(false)
  const [isBangla, setIsBangla] = useState(false)
  const t = isBangla ? T.bn : T.en
  const lifecycle = t.lifecycleSteps

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">

      {/* ── Hero ── */}
      <div className="rounded-2xl bg-gradient-to-br from-brand-green/10 via-dark-800 to-dark-800 border border-brand-green/20 p-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className="w-14 h-14 rounded-2xl bg-brand-green/20 flex items-center justify-center shrink-0">
              <Gift size={28} className="text-brand-green" />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-dark-50">GiveShop</h1>
                <span className="text-xs bg-brand-green/20 text-brand-green px-2.5 py-1 rounded-full font-medium">{t.badge}</span>
              </div>
              <p className="text-dark-300 mt-2 leading-relaxed max-w-2xl text-sm">{t.desc}</p>
            </div>
          </div>
          {/* Language toggle */}
          <button
            onClick={() => setIsBangla(v => !v)}
            className="shrink-0 flex items-center gap-2 px-3 py-2 border border-dark-500 rounded-lg text-sm text-dark-300 hover:text-white hover:border-brand-green transition-colors"
          >
            <Languages size={15} />
            {isBangla ? 'English' : 'বাংলা'}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-dark-700">
          {[['25+', 0], ['8', 1], ['10+', 2], ['10 libs', 3]].map(([val, i]) => (
            <div key={i} className="text-center">
              <div className="text-2xl font-bold text-brand-green">{val}</div>
              <div className="text-xs text-dark-400 mt-0.5">{t.stats[i]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Roadmap ── */}
      <div>
        <h2 className="text-lg font-semibold text-dark-100 mb-1 flex items-center gap-2">
          <Lightbulb size={18} className="text-brand-green" />
          {t.roadmapTitle}
        </h2>
        <p className="text-sm text-dark-400 mb-6">{t.roadmapSub}</p>
        <RoadmapSection isBangla={isBangla} />
      </div>

      {/* ── Real-World Community Examples ── */}
      <div>
        <h2 className="text-lg font-semibold text-dark-100 mb-1 flex items-center gap-2">
          <MessageCircle size={18} className="text-brand-green" />
          {t.realWorldTitle}
        </h2>
        <p className="text-sm text-dark-400 mb-4">{t.realWorldSub}</p>
        <div className="space-y-3">
          {REALWORLD.map((item) => (
            <RealWorldCard key={item.niche} item={item} isBangla={isBangla} />
          ))}
        </div>
      </div>

      {/* ── Campaign Lifecycle ── */}
      <div>
        <h2 className="text-lg font-semibold text-dark-100 mb-4 flex items-center gap-2">
          <Layers size={18} className="text-brand-green" />
          {t.lifecycle}
        </h2>
        <div className="flex flex-wrap gap-2 items-center">
          {lifecycle.map((l, i) => (
            <div key={l.step} className="flex items-center gap-2">
              <div className={`rounded-lg px-3 py-1.5 text-sm font-medium ${LIFECYCLE_COLORS[i]} border border-current/20`}>
                <div className="font-semibold">{l.step}</div>
                <div className="text-xs opacity-75 font-normal max-w-[140px] mt-0.5">{l.desc}</div>
              </div>
              {i < lifecycle.length - 1 && (
                <span className="text-dark-600 text-lg shrink-0">→</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Features ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-dark-100 flex items-center gap-2">
            <Zap size={18} className="text-brand-green" />
            {t.featuresTitle}
          </h2>
          <button
            className="text-sm text-dark-400 hover:text-dark-200 transition-colors"
            onClick={() => setAllOpen(v => !v)}
          >
            {allOpen ? t.collapseAll : t.expandAll}
          </button>
        </div>
        <div className="space-y-3">
          {FEATURES.map((f, idx) => (
            <FeatureCard key={f.id} feature={f} idx={idx} isBangla={isBangla} forceOpen={allOpen} />
          ))}
        </div>
      </div>

      {/* ── Tech Stack ── */}
      <div>
        <h2 className="text-lg font-semibold text-dark-100 mb-4 flex items-center gap-2">
          <Database size={18} className="text-brand-green" />
          {t.techStack}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {TECH_STACK.map(tech => (
            <div key={tech.name} className="rounded-xl bg-dark-800 border border-dark-700 p-4 text-center">
              <div className="text-2xl mb-2">{tech.icon}</div>
              <div className="text-sm font-semibold text-dark-100">{tech.name}</div>
              <div className="text-xs text-dark-500 mt-1 leading-snug">
                {isBangla ? tech.rolebn : tech.role}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Database Schema ── */}
      <div>
        <h2 className="text-lg font-semibold text-dark-100 mb-4 flex items-center gap-2">
          <Database size={18} className="text-brand-green" />
          {t.dbSchema}
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { table: 'campaigns', fields: ['id — UUID (PK)', 'user_id — FK to auth.users', 'title, prize, prize_value', 'status — draft|active|ended|...', 'end_date — timestamp', 'settings — JSONB (all config)', 'created_at — timestamp'], rls: 'Users read/write own campaigns only' },
            { table: 'entries', fields: ['id — UUID (PK)', 'campaign_id — FK campaigns', 'name, email', 'entries — integer (ticket count)', 'method — email|instagram|...', 'suspicious — boolean', 'referral_code, referred_by', 'ip — for fraud detection', 'custom_fields — JSONB', 'entered_at — timestamp'], rls: 'Public insert; unique (campaign_id, email)' },
            { table: 'winners', fields: ['id — UUID (PK)', 'campaign_id — FK campaigns', 'entry_id — FK entries', 'name, email, method', 'entries — integer', 'proof_url — string', 'notified — boolean', 'picked_at — timestamp'], rls: 'Public read; auth users manage own' },
          ].map(s => (
            <div key={s.table} className="rounded-xl bg-dark-800 border border-dark-700 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Database size={14} className="text-brand-green" />
                <span className="font-mono text-sm font-semibold text-brand-green">{s.table}</span>
              </div>
              <ul className="space-y-1 mb-3">
                {s.fields.map(f => (
                  <li key={f} className="text-xs text-dark-400 font-mono">{f}</li>
                ))}
              </ul>
              <div className="text-xs text-dark-500 bg-dark-900/60 rounded-lg p-2 border border-dark-700">
                RLS: {s.rls}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Route Map ── */}
      <div>
        <h2 className="text-lg font-semibold text-dark-100 mb-4 flex items-center gap-2">
          <Globe size={18} className="text-brand-green" />
          {t.routeMap}
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-xl bg-dark-800 border border-dark-700 p-4">
            <div className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-3">{t.publicRoutes}</div>
            <div className="space-y-2">
              {[['/g/:id', 'Public giveaway entry page'], ['/enter/:id', 'Entry submission form'], ['/proof/:campaignId', 'Winner proof/verification'], ['/claim/:campaignId', 'Winner claim flow']].map(([route, desc]) => (
                <div key={route} className="flex items-start gap-3">
                  <code className="text-xs text-brand-green bg-dark-900 px-2 py-0.5 rounded shrink-0">{route}</code>
                  <span className="text-xs text-dark-400">{desc}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl bg-dark-800 border border-dark-700 p-4">
            <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-3">{t.protectedRoutes}</div>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {[['/dashboard','Campaign list & quick actions'],['/campaigns/new','Create campaign'],['/campaigns/:id/edit','Edit campaign'],['/participants','Browse & export entries'],['/winner','Pick winner (spin wheel)'],['/winner-announcement','Announce winner publicly'],['/analytics','Real-time analytics'],['/bot-detection','Fraud detection dashboard'],['/leaderboard','Referral leaderboard'],['/embed','Generate embed code'],['/preview','Preview landing page'],['/integrations-setup','Integrations hub'],['/api-settings','API keys & CORS'],['/settings','Account & plan settings'],['/logs/api','API request logs'],['/import','Bulk CSV import'],['/custom-domain','Custom domain config'],['/email-editor','Email template editor'],['/setup','Onboarding wizard'],['/subscriptions','Plan & billing'],['/my-account','User profile']].map(([route, desc]) => (
                <div key={route} className="flex items-start gap-3">
                  <code className="text-xs text-blue-400 bg-dark-900 px-2 py-0.5 rounded shrink-0">{route}</code>
                  <span className="text-xs text-dark-400">{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
