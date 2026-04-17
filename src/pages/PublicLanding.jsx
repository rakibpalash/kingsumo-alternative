/**
 * PublicLanding.jsx
 * Fully public giveaway entry page — no auth required.
 * Accessible at /g/:id  (e.g. /g/abc123)
 * Loads campaign from Supabase and submits entries directly.
 */
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { supabase } from '../lib/supabase'
import { triggerEntryIntegrations } from '../lib/integrations'
import {
  Gift, Clock, Users, Mail, Camera, Music2,
  Share2, Globe, ShoppingCart, Check, Copy, AlertTriangle, Loader
} from 'lucide-react'

const METHOD_CONFIG = {
  email:     { icon: Mail,          label: 'Subscribe to Email List',  cta: 'Subscribe',          tickets: 1 },
  instagram: { icon: Camera,        label: 'Follow on Instagram',       cta: 'Follow on Instagram', tickets: 2 },
  tiktok:    { icon: Music2,        label: 'Follow on TikTok',          cta: 'Follow on TikTok',   tickets: 2 },
  share:     { icon: Share2,        label: 'Share this Giveaway',       cta: 'Share Now',           tickets: 3 },
  visit:     { icon: Globe,         label: 'Visit Our Website',         cta: 'Visit Site',          tickets: 1 },
  purchase:  { icon: ShoppingCart,  label: 'Make a Purchase',           cta: 'Shop Now',            tickets: 5 },
}

function CountdownTimer({ endDate }) {
  const [time, setTime] = useState({})

  useEffect(() => {
    const calc = () => {
      const diff = Math.max(0, new Date(endDate) - new Date())
      setTime({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      })
    }
    calc()
    const t = setInterval(calc, 1000)
    return () => clearInterval(t)
  }, [endDate])

  const pad = (n) => String(n).padStart(2, '0')

  return (
    <div className="flex items-center justify-center gap-3 my-4">
      {[['d', 'Days'], ['h', 'Hrs'], ['m', 'Min'], ['s', 'Sec']].map(([k, label]) => (
        <div key={k} className="flex flex-col items-center">
          <div className="bg-white/10 rounded-xl px-4 py-2 min-w-[52px] text-center">
            <span className="text-2xl font-bold text-white tabular-nums">{pad(time[k] ?? 0)}</span>
          </div>
          <span className="text-[10px] text-white/50 mt-1 uppercase tracking-wider">{label}</span>
        </div>
      ))}
    </div>
  )
}

export default function PublicLanding() {
  const { id } = useParams()

  const [campaign, setCampaign]     = useState(null)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [entryCount, setEntryCount] = useState(0)

  // Entry form state
  const [name, setName]   = useState('')
  const [email, setEmail] = useState('')
  const [customFieldValues, setCustomFieldValues] = useState({})
  const [step, setStep]   = useState('form') // 'form' | 'submitting' | 'done' | 'blocked'
  const [formError, setFormError] = useState('')
  const [myEntry, setMyEntry] = useState(null)
  const [completedMethods, setCompletedMethods] = useState(new Set())
  const [copied, setCopied] = useState(false)

  // Load campaign
  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data, error: err } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', id)
        .single()

      if (err || !data) { setError('Giveaway not found or no longer active.'); setLoading(false); return }

      const s = data.settings || {}
      setCampaign({
        id: data.id,
        title: data.title,
        prize: data.prize,
        prizeValue: data.prize_value,
        description: s.description || '',
        endDate: data.end_date,
        startDate: s.startDate || '',
        status: data.status,
        branding: s.branding || { customColor: '#00d084', storeName: '' },
        entryMethods: s.entryMethods || { email: true },
        entryValues: s.entryValues || { email: 1 },
        password: s.password || '',
        rulesText: s.rulesText || '',
        termsUrl: s.termsUrl || '',
        customFields: s.customFields || [],
        seoTitle: s.seoTitle || '',
        seoDescription: s.seoDescription || '',
        ogImage: s.ogImage || '',
      })

      // Get entry count
      const { count } = await supabase
        .from('entries')
        .select('*', { count: 'exact', head: true })
        .eq('campaign_id', id)
        .eq('suspicious', false)
      setEntryCount(count || 0)
      setLoading(false)
    }
    load()
  }, [id])

  const color = campaign?.branding?.customColor || '#00d084'
  const activeEntryMethods = campaign
    ? Object.entries(campaign.entryMethods).filter(([, v]) => v).map(([k]) => k)
    : []

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) { setFormError('Name is required'); return }
    if (!email.trim() || !email.includes('@')) { setFormError('Valid email is required'); return }
    // Validate required custom fields
    for (const cf of (campaign.customFields || [])) {
      if (cf.required && !customFieldValues[cf.id]?.trim()) {
        setFormError(`"${cf.label || 'A required field'}" is required`); return
      }
    }
    setFormError('')
    setStep('submitting')

    const referralCode = `${name.replace(/\s+/g, '').toLowerCase().slice(0, 6)}${Math.random().toString(36).slice(2, 5).toUpperCase()}`
    const ip = ''
    const entryId = crypto.randomUUID()

    const { error: dbError } = await supabase.from('entries').insert({
      id: entryId,
      campaign_id: id,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      entries: campaign.entryValues?.email || 1,
      method: 'email',
      suspicious: false,
      referral_code: referralCode,
      referred_by: null,
      referrals: 0,
      ip,
      custom_fields: Object.keys(customFieldValues).length ? customFieldValues : null,
    })

    if (dbError) {
      if (dbError.code === '23505') {
        setStep('blocked')
        setFormError('This email has already entered this giveaway.')
      } else {
        setFormError('Something went wrong. Please try again.')
        setStep('form')
      }
      return
    }

    setEntryCount((c) => c + 1)
    setMyEntry({ id: entryId, name: name.trim(), email: email.trim(), referralCode })
    setStep('done')

    // Fire integrations
    triggerEntryIntegrations({
      entry: { id: entryId, name: name.trim(), email: email.trim(), method: 'email', entries: campaign.entryValues?.email || 1, referralCode },
      campaign,
      integrationConnections: {},
      webhookConfig: {},
      trackingPixels: {},
    })
  }

  const handleMethodComplete = (method) => {
    setCompletedMethods((s) => new Set([...s, method]))
  }

  const handleCopyReferral = () => {
    const url = `${window.location.origin}/g/${id}?ref=${myEntry?.referralCode}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── Loading ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0d1117 0%, #1a1f2e 100%)' }}>
        <div className="flex flex-col items-center gap-3">
          <Loader size={32} className="animate-spin text-white/40" />
          <p className="text-sm text-white/40">Loading giveaway…</p>
        </div>
      </div>
    )
  }

  // ── Error ────────────────────────────────────────────────────
  if (error || !campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0d1117' }}>
        <div className="text-center px-4">
          <AlertTriangle size={40} className="text-red-400 mx-auto mb-3" />
          <p className="text-white font-semibold mb-1">Giveaway Not Found</p>
          <p className="text-sm text-white/50">{error || 'This giveaway may have ended or been removed.'}</p>
        </div>
      </div>
    )
  }

  const isEnded = campaign.status === 'completed' || (campaign.endDate && new Date(campaign.endDate) < new Date())

  const metaTitle       = campaign.seoTitle       || campaign.title       || 'Giveaway'
  const metaDescription = campaign.seoDescription || campaign.description || `Enter for a chance to win ${campaign.prize || 'an amazing prize'}!`
  const metaImage       = campaign.ogImage        || campaign.prizeImageUrl || ''
  const metaUrl         = window.location.href

  return (
    <>
    <Helmet>
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />
      {/* Open Graph */}
      <meta property="og:type"        content="website" />
      <meta property="og:url"         content={metaUrl} />
      <meta property="og:title"       content={metaTitle} />
      <meta property="og:description" content={metaDescription} />
      {metaImage && <meta property="og:image" content={metaImage} />}
      {metaImage && <meta property="og:image:width"  content="1200" />}
      {metaImage && <meta property="og:image:height" content="630" />}
      {/* Twitter Card */}
      <meta name="twitter:card"        content={metaImage ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title"       content={metaTitle} />
      <meta name="twitter:description" content={metaDescription} />
      {metaImage && <meta name="twitter:image" content={metaImage} />}
    </Helmet>
    <div className="min-h-screen" style={{ background: `linear-gradient(160deg, ${color}22 0%, #0d1117 40%)` }}>
      <div className="max-w-lg mx-auto px-4 py-10">

        {/* Header */}
        <div className="text-center mb-8">
          {campaign.branding?.storeName && (
            <p className="text-sm text-white/50 mb-2">{campaign.branding.storeName}</p>
          )}
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: color + '30' }}>
            <Gift size={24} style={{ color }} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">{campaign.title}</h1>
          {campaign.description && (
            <p className="text-sm text-white/60 leading-relaxed">{campaign.description}</p>
          )}
        </div>

        {/* Prize card */}
        <div className="rounded-2xl border p-5 mb-6 text-center" style={{ borderColor: color + '40', background: color + '10' }}>
          <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Prize</p>
          <p className="text-xl font-bold text-white">{campaign.prize}</p>
          {campaign.prizeValue && <p className="text-sm mt-1" style={{ color }}>Valued at ${campaign.prizeValue}</p>}
        </div>

        {/* Stats + countdown */}
        <div className="flex items-center justify-center gap-6 mb-4">
          <div className="flex items-center gap-1.5 text-sm text-white/60">
            <Users size={14} style={{ color }} />
            <span><strong className="text-white">{entryCount.toLocaleString()}</strong> entered</span>
          </div>
          {!isEnded && campaign.endDate && (
            <div className="flex items-center gap-1.5 text-sm text-white/60">
              <Clock size={14} style={{ color }} />
              <span>Ends {new Date(campaign.endDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {!isEnded && campaign.endDate && <CountdownTimer endDate={campaign.endDate} />}

        {/* Ended banner */}
        {isEnded && (
          <div className="bg-red-900/20 border border-red-800/40 rounded-xl px-4 py-3 text-center mb-6">
            <p className="text-sm font-semibold text-red-400">This giveaway has ended.</p>
          </div>
        )}

        {/* Entry form */}
        {!isEnded && (
          <>
            {step === 'form' && (
              <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-4">
                <h2 className="text-sm font-semibold text-white mb-4">Enter the Giveaway</h2>
                <div className="space-y-3 mb-4">
                  <div>
                    <label className="block text-xs text-white/50 mb-1.5">Full Name</label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@email.com"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/50 transition-colors"
                    />
                  </div>

                  {/* Custom fields */}
                  {(campaign.customFields || []).map((cf) => (
                    <div key={cf.id}>
                      <label className="block text-xs text-white/50 mb-1.5">
                        {cf.label || 'Field'}{cf.required && <span className="text-red-400 ml-1">*</span>}
                      </label>
                      {cf.type === 'checkbox' ? (
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!customFieldValues[cf.id]}
                            onChange={(e) => setCustomFieldValues((v) => ({ ...v, [cf.id]: e.target.checked ? 'yes' : '' }))}
                            className="w-4 h-4 accent-[var(--color)]"
                          />
                          <span className="text-sm text-white/70">{cf.label}</span>
                        </label>
                      ) : cf.type === 'dropdown' ? (
                        <select
                          value={customFieldValues[cf.id] || ''}
                          onChange={(e) => setCustomFieldValues((v) => ({ ...v, [cf.id]: e.target.value }))}
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-white/50 transition-colors"
                        >
                          <option value="">Select…</option>
                          {(cf.options || []).map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      ) : (
                        <input
                          type={cf.type === 'email' ? 'email' : cf.type === 'number' ? 'number' : cf.type === 'phone' ? 'tel' : 'text'}
                          value={customFieldValues[cf.id] || ''}
                          onChange={(e) => setCustomFieldValues((v) => ({ ...v, [cf.id]: e.target.value }))}
                          placeholder={cf.placeholder || cf.label}
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/50 transition-colors"
                        />
                      )}
                    </div>
                  ))}
                </div>
                {formError && <p className="text-xs text-red-400 mb-3">{formError}</p>}
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl font-bold text-sm transition-opacity hover:opacity-90"
                  style={{ background: color, color: '#0d1117' }}
                >
                  Enter Giveaway (+{campaign.entryValues?.email || 1} ticket{(campaign.entryValues?.email || 1) > 1 ? 's' : ''})
                </button>
                <p className="text-[10px] text-white/30 text-center mt-3">
                  By entering, you agree to the giveaway rules.
                </p>
              </form>
            )}

            {step === 'submitting' && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-4 text-center">
                <Loader size={24} className="animate-spin mx-auto mb-3" style={{ color }} />
                <p className="text-sm text-white/60">Submitting your entry…</p>
              </div>
            )}

            {step === 'blocked' && (
              <div className="bg-amber-900/20 border border-amber-700/40 rounded-2xl p-6 mb-4 text-center">
                <AlertTriangle size={24} className="text-amber-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-amber-400 mb-1">Already Entered</p>
                <p className="text-xs text-white/50">{formError}</p>
              </div>
            )}

            {step === 'done' && myEntry && (
              <>
                {/* Success */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-4 text-center">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: color + '30' }}>
                    <Check size={20} style={{ color }} />
                  </div>
                  <p className="text-lg font-bold text-white mb-1">You're entered!</p>
                  <p className="text-sm text-white/50">Good luck, {myEntry.name.split(' ')[0]}!</p>
                </div>

                {/* Bonus entry methods */}
                {activeEntryMethods.filter((m) => m !== 'email').length > 0 && (
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-4">
                    <h3 className="text-sm font-semibold text-white mb-1">Earn Bonus Tickets</h3>
                    <p className="text-xs text-white/40 mb-4">Complete actions below to increase your chances.</p>
                    <div className="space-y-2">
                      {activeEntryMethods.filter((m) => m !== 'email').map((method) => {
                        const cfg = METHOD_CONFIG[method]
                        if (!cfg) return null
                        const done = completedMethods.has(method)
                        const tickets = campaign.entryValues?.[method] || cfg.tickets
                        return (
                          <button
                            key={method}
                            onClick={() => handleMethodComplete(method)}
                            disabled={done}
                            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all"
                            style={done
                              ? { borderColor: color + '60', background: color + '15' }
                              : { borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)' }
                            }
                          >
                            <div className="flex items-center gap-3">
                              <cfg.icon size={15} style={{ color: done ? color : 'rgba(255,255,255,0.5)' }} />
                              <span className="text-sm text-white">{cfg.label}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold" style={{ color }}>+{tickets} tickets</span>
                              {done && <Check size={13} style={{ color }} />}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Referral */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <h3 className="text-sm font-semibold text-white mb-1">Refer Friends</h3>
                  <p className="text-xs text-white/40 mb-3">Share your link and earn extra entries for every friend who enters.</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-xs text-white/60 truncate">
                      {window.location.origin}/g/{id}?ref={myEntry.referralCode}
                    </code>
                    <button
                      onClick={handleCopyReferral}
                      className="p-2.5 rounded-xl transition-opacity hover:opacity-80"
                      style={{ background: color + '30' }}
                    >
                      {copied ? <Check size={14} style={{ color }} /> : <Copy size={14} style={{ color }} />}
                    </button>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* Rules */}
        {campaign.rulesText && (
          <details className="mt-6 text-xs text-white/30">
            <summary className="cursor-pointer hover:text-white/50 transition-colors">View Rules</summary>
            <div className="mt-2 whitespace-pre-line leading-relaxed pl-3 border-l border-white/10">
              {campaign.rulesText}
            </div>
          </details>
        )}

        {/* Footer */}
        <p className="text-center text-[10px] text-white/20 mt-8">
          Powered by <span style={{ color }}>GiveShop</span>
        </p>
      </div>
    </div>
    </>
  )
}
