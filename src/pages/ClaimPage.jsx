import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Gift, Package, Check, AlertTriangle, Loader, ChevronRight, Trophy } from 'lucide-react'

const COUNTRIES = [
  'Australia','United States','United Kingdom','Canada','New Zealand',
  'Germany','France','Netherlands','Spain','Italy','Sweden','Norway',
  'Denmark','Finland','Switzerland','Austria','Belgium','Ireland',
  'Singapore','Japan','South Korea','India','Brazil','Mexico',
  'Bangladesh','Pakistan','Philippines','Indonesia','Malaysia','Thailand',
]

export default function ClaimPage() {
  const { campaignId } = useParams()
  const [campaign, setCampaign] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Step: 'verify' | 'form' | 'done'
  const [step, setStep] = useState('verify')
  const [verifyEmail, setVerifyEmail] = useState('')
  const [verifyError, setVerifyError] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [winner, setWinner] = useState(null)

  const [form, setForm] = useState({
    fullName: '', email: '', phone: '',
    address1: '', address2: '', city: '',
    state: '', postcode: '', country: 'Australia',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    async function load() {
      const { data, error: err } = await supabase
        .from('campaigns')
        .select('id, title, prize, prize_value, settings')
        .eq('id', campaignId)
        .single()
      if (err || !data) { setError('Giveaway not found.'); setLoading(false); return }
      const color = data.settings?.branding?.customColor || '#00d084'
      setCampaign({ ...data, color })
      setLoading(false)
    }
    load()
  }, [campaignId])

  const handleVerify = async (e) => {
    e.preventDefault()
    setVerifyError('')
    setVerifying(true)
    const { data: winners } = await supabase
      .from('winners')
      .select('*')
      .eq('campaign_id', campaignId)
      .ilike('email', verifyEmail.trim())
      .limit(1)
    setVerifying(false)
    if (!winners || winners.length === 0) {
      setVerifyError("Email not found. Make sure you entered the giveaway with this email.")
      return
    }
    const w = winners[0]
    setWinner(w)
    if (w.shipping_address) {
      setStep('done')
    } else {
      setForm((f) => ({ ...f, fullName: w.name || '', email: w.email || '' }))
      setStep('form')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.fullName || !form.address1 || !form.city || !form.postcode || !form.country) {
      setSubmitError('Please fill in all required fields.')
      return
    }
    setSubmitting(true)
    setSubmitError('')
    const { error: err } = await supabase
      .from('winners')
      .update({ shipping_address: form })
      .eq('id', winner.id)
    setSubmitting(false)
    if (err) { setSubmitError('Something went wrong. Please try again.'); return }
    setStep('done')
  }

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }))
  const inputCls = 'w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/50 transition-colors'
  const color = campaign?.color || '#00d084'

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0d1117' }}>
      <Loader size={28} className="animate-spin text-white/30" />
    </div>
  )

  if (error) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0d1117' }}>
      <div className="text-center px-4">
        <AlertTriangle size={36} className="text-red-400 mx-auto mb-3" />
        <p className="text-white font-semibold">{error}</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen px-4 py-12" style={{ background: `linear-gradient(160deg, ${color}22 0%, #0d1117 40%)` }}>
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: color + '30' }}>
            <Package size={24} style={{ color }} />
          </div>
          <h1 className="text-xl font-bold text-white mb-1">Claim Your Prize</h1>
          <p className="text-sm text-white/50">{campaign?.title}</p>
        </div>

        {/* Prize card */}
        <div className="rounded-2xl border p-4 mb-6 text-center" style={{ borderColor: color + '40', background: color + '10' }}>
          <div className="flex items-center justify-center gap-2">
            <Gift size={16} style={{ color }} />
            <p className="font-bold text-white">{campaign?.prize}</p>
            {campaign?.prize_value && <span className="text-sm" style={{ color }}>(${campaign.prize_value})</span>}
          </div>
        </div>

        {/* ── Step: Verify ── */}
        {step === 'verify' && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-white mb-1">Verify your entry</h2>
            <p className="text-xs text-white/50 mb-4">Enter the email address you used to enter the giveaway.</p>
            <form onSubmit={handleVerify} className="space-y-3">
              <input
                type="email"
                required
                value={verifyEmail}
                onChange={(e) => setVerifyEmail(e.target.value)}
                placeholder="you@email.com"
                className={inputCls}
              />
              {verifyError && (
                <p className="text-xs text-red-400 bg-red-900/20 border border-red-800/30 rounded-lg px-3 py-2">{verifyError}</p>
              )}
              <button
                type="submit"
                disabled={verifying}
                className="w-full flex items-center justify-center gap-2 py-2.5 font-bold rounded-xl text-sm transition-colors disabled:opacity-60"
                style={{ background: color, color: '#0d1117' }}
              >
                {verifying ? <><Loader size={14} className="animate-spin" /> Checking…</> : <>Verify <ChevronRight size={14} /></>}
              </button>
            </form>
          </div>
        )}

        {/* ── Step: Address Form ── */}
        {step === 'form' && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-white mb-1 flex items-center gap-2"><Trophy size={14} className="text-amber-400" /> Congratulations, {winner?.name}!</h2>
            <p className="text-xs text-white/50 mb-4">Please fill in your shipping details so we can send your prize.</p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs text-white/50 mb-1">Full Name *</label>
                  <input value={form.fullName} onChange={(e) => set('fullName', e.target.value)} placeholder="Jane Smith" className={inputCls} required />
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-1">Email *</label>
                  <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className={inputCls} required />
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-1">Phone</label>
                  <input type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+1 555 0000" className={inputCls} />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-white/50 mb-1">Address Line 1 *</label>
                  <input value={form.address1} onChange={(e) => set('address1', e.target.value)} placeholder="123 Main St" className={inputCls} required />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-white/50 mb-1">Address Line 2</label>
                  <input value={form.address2} onChange={(e) => set('address2', e.target.value)} placeholder="Apt, suite, unit…" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-1">City *</label>
                  <input value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="Sydney" className={inputCls} required />
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-1">State / Province</label>
                  <input value={form.state} onChange={(e) => set('state', e.target.value)} placeholder="NSW" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-1">Postcode *</label>
                  <input value={form.postcode} onChange={(e) => set('postcode', e.target.value)} placeholder="2000" className={inputCls} required />
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-1">Country *</label>
                  <select value={form.country} onChange={(e) => set('country', e.target.value)} className={inputCls + ' bg-[#1a2030]'}>
                    {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              {submitError && <p className="text-xs text-red-400 bg-red-900/20 border border-red-800/30 rounded-lg px-3 py-2">{submitError}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-2.5 font-bold rounded-xl text-sm transition-colors disabled:opacity-60 mt-2"
                style={{ background: color, color: '#0d1117' }}
              >
                {submitting ? <><Loader size={14} className="animate-spin" /> Submitting…</> : <><Check size={14} /> Submit My Address</>}
              </button>
            </form>
          </div>
        )}

        {/* ── Step: Done ── */}
        {step === 'done' && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: color + '20', border: `2px solid ${color}` }}>
              <Check size={28} style={{ color }} />
            </div>
            {winner?.shipping_address && winner.shipping_address?.address1 ? (
              <>
                <h2 className="text-lg font-bold text-white mb-2">Already Claimed!</h2>
                <p className="text-sm text-white/50">Your shipping details have already been received. The organiser will be in touch soon.</p>
              </>
            ) : (
              <>
                <h2 className="text-lg font-bold text-white mb-2">Details Received!</h2>
                <p className="text-sm text-white/50">Your shipping address has been sent to the organiser. Expect your prize within 5–10 business days.</p>
              </>
            )}
          </div>
        )}

        <p className="text-center text-xs text-white/20 mt-8">Powered by GiveShop</p>
      </div>
    </div>
  )
}
