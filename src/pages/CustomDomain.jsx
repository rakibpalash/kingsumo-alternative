import { useState } from 'react'
import { Globe, Check, Copy, RefreshCw, AlertTriangle, ExternalLink, ShieldCheck } from 'lucide-react'

const inputCls = 'w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-sm text-white placeholder-dark-400 focus:outline-none focus:border-brand-green transition-colors'

const DNS_RECORD = {
  type: 'CNAME',
  name: 'win',
  value: 'cname.giveshop.app',
  ttl: '3600',
}

export default function CustomDomain() {
  const [domain, setDomain]         = useState('')
  const [savedDomain, setSavedDomain] = useState('')
  const [verifying, setVerifying]   = useState(false)
  const [status, setStatus]         = useState(null) // null | 'verified' | 'failed'
  const [copied, setCopied]         = useState(null)
  const [saving, setSaving]         = useState(false)

  const copy = (text, key) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleSave = () => {
    if (!domain.trim()) return
    setSaving(true)
    setTimeout(() => {
      setSavedDomain(domain.trim())
      setSaving(false)
      setStatus(null)
    }, 600)
  }

  const handleVerify = () => {
    setVerifying(true)
    setStatus(null)
    // Mock: always succeeds after delay
    setTimeout(() => {
      setVerifying(false)
      setStatus('verified')
    }, 1800)
  }

  const exampleUrl = savedDomain
    ? `https://${savedDomain}/g/your-campaign-id`
    : 'https://win.yourbrand.com/g/your-campaign-id'

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div>
        <h1 className="text-lg font-bold text-white flex items-center gap-2">
          <Globe size={18} className="text-brand-green" /> Custom Domain
        </h1>
        <p className="text-xs text-dark-400 mt-0.5">
          Serve giveaway pages from your own domain instead of giveshop.app.
          Improves branding, trust, and SEO.
        </p>
      </div>

      {/* Why section */}
      <div className="bg-brand-green/5 border border-brand-green/20 rounded-xl p-4 space-y-1.5">
        <p className="text-xs font-semibold text-brand-green">Why use a custom domain?</p>
        {[
          'Your giveaway URL looks like win.yourbrand.com — not giveshop.app',
          'Backlinks and SEO juice go to your domain, not ours',
          'Higher click-through rate on social shares',
          'Enterprise clients expect it',
        ].map((t) => (
          <div key={t} className="flex items-start gap-2">
            <Check size={12} className="text-brand-green mt-0.5 shrink-0" />
            <p className="text-xs text-dark-300">{t}</p>
          </div>
        ))}
      </div>

      {/* Step 1: Enter domain */}
      <div className="bg-dark-800 border border-dark-500 rounded-xl p-5 space-y-3">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-brand-green text-dark-900 text-[10px] font-bold flex items-center justify-center">1</span>
          Enter Your Subdomain
        </h2>
        <p className="text-xs text-dark-400">Use a subdomain like <span className="font-mono text-dark-300">win.yourbrand.com</span> or <span className="font-mono text-dark-300">giveaway.yourbrand.com</span>.</p>
        <div className="flex gap-2">
          <input
            value={domain}
            onChange={(e) => setDomain(e.target.value.toLowerCase().replace(/\s/g, ''))}
            placeholder="win.yourbrand.com"
            className={inputCls + ' flex-1'}
          />
          <button
            onClick={handleSave}
            disabled={saving || !domain.trim()}
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-green text-dark-900 font-semibold text-sm rounded-lg hover:bg-brand-green/80 transition-colors disabled:opacity-40"
          >
            {saving ? <RefreshCw size={13} className="animate-spin" /> : <Check size={13} />}
            Save
          </button>
        </div>
        {savedDomain && (
          <p className="text-xs text-brand-green flex items-center gap-1.5">
            <Check size={11} /> Saved: <span className="font-mono">{savedDomain}</span>
          </p>
        )}
      </div>

      {/* Step 2: DNS setup */}
      {savedDomain && (
        <div className="bg-dark-800 border border-dark-500 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-brand-green text-dark-900 text-[10px] font-bold flex items-center justify-center">2</span>
            Add DNS Record
          </h2>
          <p className="text-xs text-dark-400">
            In your domain registrar (Cloudflare, GoDaddy, Namecheap, etc.), add this DNS record:
          </p>

          <div className="bg-dark-900 border border-dark-600 rounded-xl overflow-hidden">
            <div className="grid grid-cols-4 gap-px bg-dark-600 text-[10px] font-semibold text-dark-400 uppercase tracking-wider">
              {['Type', 'Name', 'Value', 'TTL'].map((h) => (
                <div key={h} className="bg-dark-800 px-3 py-2">{h}</div>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-px bg-dark-600">
              {[DNS_RECORD.type, savedDomain.split('.')[0], DNS_RECORD.value, DNS_RECORD.ttl].map((val, i) => (
                <div key={i} className="bg-dark-900 px-3 py-2.5 flex items-center gap-1.5">
                  <span className="text-xs font-mono text-white truncate">{val}</span>
                  <button onClick={() => copy(val, `dns-${i}`)} className="shrink-0 text-dark-500 hover:text-white transition-colors">
                    {copied === `dns-${i}` ? <Check size={11} className="text-brand-green" /> : <Copy size={11} />}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-start gap-2 bg-amber-900/20 border border-amber-700/30 rounded-lg px-3 py-2.5">
            <AlertTriangle size={13} className="text-amber-400 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-300">DNS changes can take up to 48 hours to propagate globally. Usually under 30 minutes on Cloudflare.</p>
          </div>
        </div>
      )}

      {/* Step 3: Verify */}
      {savedDomain && (
        <div className="bg-dark-800 border border-dark-500 rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-brand-green text-dark-900 text-[10px] font-bold flex items-center justify-center">3</span>
            Verify Domain
          </h2>

          {status === 'verified' && (
            <div className="flex items-center gap-2 bg-green-900/20 border border-green-700/30 rounded-lg px-4 py-3 text-sm text-green-400">
              <ShieldCheck size={15} />
              <span>Domain verified and active! Your giveaways now serve from <span className="font-mono">{savedDomain}</span>.</span>
            </div>
          )}

          {status === 'failed' && (
            <div className="flex items-center gap-2 bg-red-900/20 border border-red-700/30 rounded-lg px-4 py-3 text-sm text-red-400">
              <AlertTriangle size={15} />
              DNS record not found yet. Wait a few minutes and try again.
            </div>
          )}

          <button
            onClick={handleVerify}
            disabled={verifying}
            className="flex items-center gap-2 px-4 py-2 border border-dark-500 text-dark-400 hover:text-white rounded-lg text-sm transition-colors disabled:opacity-60"
          >
            <RefreshCw size={13} className={verifying ? 'animate-spin' : ''} />
            {verifying ? 'Checking DNS…' : 'Verify Domain'}
          </button>
        </div>
      )}

      {/* Preview */}
      {savedDomain && status === 'verified' && (
        <div className="bg-dark-800 border border-brand-green/20 rounded-xl p-5 space-y-2">
          <p className="text-xs font-semibold text-brand-green">Your giveaway URLs will look like:</p>
          <div className="flex items-center gap-2 bg-dark-700 rounded-lg px-3 py-2">
            <span className="text-xs font-mono text-white flex-1 truncate">{exampleUrl}</span>
            <button onClick={() => copy(exampleUrl, 'url')} className="text-dark-400 hover:text-white shrink-0 transition-colors">
              {copied === 'url' ? <Check size={13} className="text-brand-green" /> : <Copy size={13} />}
            </button>
            <a href={exampleUrl} target="_blank" rel="noreferrer" className="text-dark-400 hover:text-white shrink-0 transition-colors">
              <ExternalLink size={13} />
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
