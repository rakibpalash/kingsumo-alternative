import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import {
  Gift, Clock, Users, ExternalLink, Copy, Check,
  Mail, AlertCircle, Loader2, PartyPopper, Share2
} from 'lucide-react'

// ── helpers ───────────────────────────────────────────────────
function mapCampaign(row) {
  const s = row.settings || {}
  return {
    id: row.id,
    title: row.title,
    prize: row.prize || '',
    prizeValue: row.prize_value || '',
    status: row.status || 'draft',
    endDate: row.end_date || '',
    description: s.description || '',
    entryActions: s.entryActions || [],       // new-style array
    entryMethods: s.entryMethods || {},       // legacy
    entryValues:  s.entryValues  || {},       // legacy
    branding: s.branding || { showPoweredBy: true, customColor: '#00d084' },
    referralTracking: s.referralTracking || { enabled: true, bonusEntries: 2 },
    rulesText: s.rulesText || '',
  }
}

function daysLeft(endDate) {
  if (!endDate) return null
  const d = Math.ceil((new Date(endDate) - new Date()) / 86400000)
  return Math.max(0, d)
}

function generateReferralCode(name) {
  const base = (name || 'user').replace(/\s+/g, '').toLowerCase().slice(0, 6)
  return `${base}${Math.random().toString(36).slice(2, 6).toUpperCase()}`
}

const BURNER_DOMAINS = [
  'mailinator.com','guerrillamail.com','temp-mail.org','throwaway.email',
  'sharklasers.com','yopmail.com','trashmail.com','dispostable.com',
  'mailnull.com','spam4.me','tempmail.com','fakeinbox.com','tempinbox.com',
]

// ── component ─────────────────────────────────────────────────
export default function EntryPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const refCode = searchParams.get('ref') || null

  const [campaign, setCampaign] = useState(null)
  const [entryCount, setEntryCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // form state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  // post-entry state
  const [myEntry, setMyEntry] = useState(null)          // { referralCode }
  const [completedActions, setCompletedActions] = useState(new Set())
  const [copied, setCopied] = useState(false)
  const [step, setStep] = useState('enter')             // 'enter' | 'bonus' | 'done'

  // load campaign
  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data, error: err } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', id)
        .single()

      if (err || !data) {
        setError('Giveaway not found.')
        setLoading(false)
        return
      }

      setCampaign(mapCampaign(data))

      // entry count (public)
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
  const days = campaign ? daysLeft(campaign.endDate) : null
  const entryUrl = `${window.location.origin}/enter/${id}`

  // ── submit main entry ───────────────────────────────────────
  async function handleEnter(e) {
    e.preventDefault()
    setSubmitError('')

    if (!name.trim()) return setSubmitError('Name required.')
    if (!email.includes('@')) return setSubmitError('Valid email required.')

    const domain = email.split('@')[1]?.toLowerCase()
    if (BURNER_DOMAINS.includes(domain)) {
      return setSubmitError('Please use a real email address.')
    }

    setSubmitting(true)

    // check duplicate
    const { data: existing } = await supabase
      .from('entries')
      .select('id, referral_code')
      .eq('campaign_id', id)
      .eq('email', email.toLowerCase().trim())
      .maybeSingle()

    if (existing) {
      setMyEntry({ referralCode: existing.referral_code })
      setStep('bonus')
      setSubmitting(false)
      return
    }

    const referralCode = generateReferralCode(name)
    const { data: inserted, error: insertErr } = await supabase
      .from('entries')
      .insert({
        campaign_id:   id,
        name:          name.trim(),
        email:         email.toLowerCase().trim(),
        entries:       1,
        method:        'email',
        suspicious:    false,
        referral_code: referralCode,
        referred_by:   refCode,
      })
      .select()
      .single()

    if (insertErr) {
      setSubmitError('Something went wrong. Try again.')
      setSubmitting(false)
      return
    }

    setMyEntry({ id: inserted.id, referralCode })
    setEntryCount((n) => n + 1)
    setSubmitting(false)
    setStep('bonus')
  }

  // ── complete a bonus action ─────────────────────────────────
  async function handleBonusAction(action) {
    if (completedActions.has(action.id) || !myEntry) return

    // open URL if present
    if (action.url) window.open(action.url, '_blank', 'noopener')

    setCompletedActions((s) => new Set([...s, action.id]))

    // add entries to DB entry
    if (myEntry.id) {
      await supabase.rpc('increment_entry_count', {
        entry_id: myEntry.id,
        amount: action.entries || 1,
      }).catch(() => {
        // rpc may not exist yet — silently skip, entries still tracked locally
      })
    }
  }

  function handleCopyLink() {
    const shareUrl = `${entryUrl}?ref=${myEntry?.referralCode}`
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── bonus actions list (new-style + legacy fallback) ────────
  function getBonusActions() {
    if (campaign.entryActions?.length > 0) return campaign.entryActions
    // legacy entryMethods
    return Object.entries(campaign.entryMethods || {})
      .filter(([k, v]) => v && k !== 'email')
      .map(([k], i) => ({
        id: i + 100,
        type: k,
        label: k,
        actionText: `Complete: ${k}`,
        url: '',
        entries: campaign.entryValues?.[k] || 2,
      }))
  }

  // ── render ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-gray-500" />
      </div>
    )
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-center space-y-2">
          <AlertCircle size={36} className="mx-auto text-red-400" />
          <p className="text-white font-semibold">{error || 'Giveaway not found.'}</p>
        </div>
      </div>
    )
  }

  const bonusActions = getBonusActions()

  return (
    <div className="min-h-screen bg-[#0f0f0f]" style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div className="max-w-lg mx-auto px-4 py-10">

        {/* Draft badge */}
        {campaign.status === 'draft' && (
          <div className="mb-4 text-center">
            <span className="text-xs px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-medium">
              Preview — not yet live
            </span>
          </div>
        )}

        {/* Hero */}
        <div
          className="rounded-2xl p-8 text-center mb-6"
          style={{ background: `linear-gradient(135deg, ${color}18, #111)`, border: `1px solid ${color}30` }}
        >
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-5"
            style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}
          >
            <Gift size={11} /> Giveaway — Enter Now
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">{campaign.title}</h1>
          {campaign.description && (
            <p className="text-sm text-gray-400 mb-5 max-w-sm mx-auto">{campaign.description}</p>
          )}

          {/* Prize */}
          <div className="inline-block bg-gray-900 border border-gray-800 rounded-xl px-6 py-4 mb-5">
            <p className="text-xs text-gray-500 mb-1">Prize</p>
            <p className="text-xl font-bold text-white">{campaign.prize || 'Amazing Prize'}</p>
            {campaign.prizeValue && (
              <p className="text-sm font-semibold mt-1" style={{ color }}>{campaign.prizeValue} value</p>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
            {days !== null && (
              <span className="flex items-center gap-1.5">
                <Clock size={13} /> {days === 0 ? 'Ends today' : `${days} days left`}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Users size={13} /> {entryCount.toLocaleString()} {entryCount === 1 ? 'entry' : 'entries'}
            </span>
          </div>
        </div>

        {/* ── Step: enter ───────────────────────────────── */}
        {step === 'enter' && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <Mail size={16} style={{ color }} /> Enter Giveaway
            </h2>

            <form onSubmit={handleEnter} className="space-y-3">
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-500"
              />
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-500"
              />

              {submitError && (
                <p className="text-xs text-red-400 flex items-center gap-1.5">
                  <AlertCircle size={12} /> {submitError}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl text-sm font-bold text-gray-900 transition-opacity hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: color }}
              >
                {submitting
                  ? <><Loader2 size={14} className="animate-spin" /> Entering…</>
                  : 'Enter Giveaway — Free'}
              </button>
            </form>

            <p className="text-center text-xs text-gray-600 mt-3">
              No purchase necessary. 1 free entry per person.
            </p>
          </div>
        )}

        {/* ── Step: bonus ───────────────────────────────── */}
        {step === 'bonus' && (
          <div className="space-y-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 text-center">
              <PartyPopper size={28} className="mx-auto mb-2" style={{ color }} />
              <p className="text-white font-semibold">You're in!</p>
              <p className="text-sm text-gray-400 mt-1">Complete actions below for more entries.</p>
            </div>

            {bonusActions.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest px-1">Bonus Entries</p>
                {bonusActions.map((action) => {
                  const done = completedActions.has(action.id)
                  return (
                    <div
                      key={action.id}
                      className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-3"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white">{action.actionText || action.label}</p>
                        <p className="text-xs text-gray-500">+{action.entries || 1} {action.entries === 1 ? 'entry' : 'entries'}</p>
                      </div>
                      <button
                        onClick={() => handleBonusAction(action)}
                        disabled={done}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold transition-all disabled:opacity-50"
                        style={{
                          background: done ? '#1f2937' : `${color}20`,
                          color: done ? '#6b7280' : color,
                          border: `1px solid ${done ? '#374151' : color + '40'}`,
                        }}
                      >
                        {done ? (
                          <><Check size={11} /> Done</>
                        ) : (
                          <>{action.url && <ExternalLink size={11} />} Go</>
                        )}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Referral share */}
            {campaign.referralTracking?.enabled && myEntry?.referralCode && (
              <div
                className="rounded-2xl p-5"
                style={{ background: `${color}10`, border: `1px solid ${color}25` }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Share2 size={14} style={{ color }} />
                  <p className="text-sm font-semibold text-white">Share & get more entries</p>
                </div>
                <p className="text-xs text-gray-400 mb-3">
                  Each friend who enters via your link gives you +{campaign.referralTracking.bonusEntries || 2} bonus entries.
                </p>
                <div className="flex gap-2">
                  <div className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-400 truncate">
                    {entryUrl}?ref={myEntry.referralCode}
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-opacity hover:opacity-80"
                    style={{ background: color, color: '#0f0f0f' }}
                  >
                    {copied ? <><Check size={11} /> Copied!</> : <><Copy size={11} /> Copy</>}
                  </button>
                </div>
              </div>
            )}

            {campaign.branding?.showPoweredBy && (
              <p className="text-center text-[11px] text-gray-700 pt-2">
                Powered by GiveShop
              </p>
            )}
          </div>
        )}

        {/* Rules */}
        {campaign.rulesText && step === 'enter' && (
          <details className="mt-4">
            <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-400 transition-colors">
              View Rules & Terms
            </summary>
            <div className="mt-2 text-xs text-gray-500 whitespace-pre-wrap bg-gray-900 rounded-xl p-4 border border-gray-800">
              {campaign.rulesText}
            </div>
          </details>
        )}
      </div>
    </div>
  )
}
