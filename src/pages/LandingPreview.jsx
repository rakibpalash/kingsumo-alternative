import { useState } from 'react'
import { Mail, Camera, Music2, Share2, Globe, ShoppingCart, Monitor, Smartphone, Gift, Clock, Users, Copy, Check } from 'lucide-react'
import { useStore } from '../store/useStore'

const methodConfig = {
  email: { icon: Mail, label: 'Subscribe to Email List', cta: 'Subscribe', color: '#3b82f6' },
  instagram: { icon: Camera, label: 'Follow on Instagram', cta: 'Follow @store', color: '#ec4899' },
  tiktok: { icon: Music2, label: 'Follow on TikTok', cta: 'Follow @store', color: '#a855f7' },
  share: { icon: Share2, label: 'Share this Giveaway', cta: 'Share Now', color: '#f59e0b' },
  visit: { icon: Globe, label: 'Visit Our Website', cta: 'Visit Site', color: '#14b8a6' },
  purchase: { icon: ShoppingCart, label: 'Make a Purchase', cta: 'Shop Now (+5 tickets)', color: '#00d084' },
}

export default function LandingPreview() {
  const { activeCampaign, entries } = useStore()
  const [device, setDevice] = useState('desktop')
  const [entered, setEntered] = useState(new Set())
  const [email, setEmail] = useState('')
  const [copied, setCopied] = useState(false)

  const campaign = activeCampaign
  const validEntries = entries.filter((e) => !e.suspicious).length
  const color = campaign?.branding?.customColor || '#00d084'

  const daysLeft = campaign
    ? Math.max(0, Math.ceil((new Date(campaign.endDate) - new Date()) / 86400000))
    : 0

  const handleEntry = (method) => {
    setEntered((s) => new Set([...s, method]))
  }

  const entryUrl = campaign ? `${window.location.origin}/enter/${campaign.id}` : ''

  const handleCopy = () => {
    navigator.clipboard.writeText(entryUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!campaign) {
    return (
      <div className="flex items-center justify-center h-64 text-dark-400 text-sm">
        No active campaign — create one first.
      </div>
    )
  }

  return (
    <div className="max-w-5xl space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-dark-400">Landing URL</p>
          <div className="flex items-center gap-2 mt-0.5">
            <code className="text-sm text-brand-teal">{entryUrl}</code>
            <button onClick={handleCopy} className="text-dark-400 hover:text-white transition-colors">
              {copied ? <Check size={13} className="text-brand-green" /> : <Copy size={13} />}
            </button>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-dark-800 border border-dark-500 rounded-lg p-1">
          {[['desktop', Monitor], ['mobile', Smartphone]].map(([d, Icon]) => (
            <button
              key={d}
              onClick={() => setDevice(d)}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md capitalize transition-colors ${
                device === d ? 'bg-brand-green text-dark-900 font-semibold' : 'text-dark-400 hover:text-white'
              }`}
            >
              <Icon size={12} /> {d}
            </button>
          ))}
        </div>
      </div>

      {/* Browser chrome */}
      <div className="bg-dark-700 rounded-xl border border-dark-500 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-dark-600">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-amber-500/60" />
            <div className="w-3 h-3 rounded-full bg-brand-green/60" />
          </div>
          <div className="flex-1 bg-dark-800 rounded-md px-3 py-1 text-xs text-dark-400 text-center truncate">
            {entryUrl}
          </div>
        </div>

        {/* Page content */}
        <div className={`${device === 'mobile' ? 'max-w-sm mx-auto' : ''} overflow-y-auto max-h-[600px]`}>
          <div className="theme-preserve bg-[#0f0f0f] min-h-full">
            {/* Hero */}
            <div className="text-center px-6 pt-10 pb-8" style={{ background: `linear-gradient(135deg, ${color}15, #0f0f0f)` }}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4"
                style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}>
                <Gift size={11} /> Giveaway — Enter Now
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">{campaign.title}</h1>
              <p className="text-sm text-gray-400 mb-4 max-w-xs mx-auto">{campaign.description || 'Enter for a chance to win!'}</p>

              {/* Prize card */}
              <div className="inline-block bg-gray-900 border border-gray-700 rounded-2xl p-5 mb-6">
                <p className="text-xs text-gray-500 mb-1">Prize</p>
                <p className="text-xl font-bold text-white">{campaign.prize}</p>
                {campaign.prizeValue && <p className="text-sm font-semibold mt-1" style={{ color }}>{campaign.prizeValue} value</p>}
              </div>

              {/* Timer + count */}
              <div className="flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Clock size={13} />
                  <span>{daysLeft} days left</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Users size={13} />
                  <span>{validEntries} entries</span>
                </div>
              </div>
            </div>

            {/* Entry methods */}
            <div className="px-6 pb-8 space-y-3">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-widest mb-4">How to Enter</p>

              {/* Email special */}
              {campaign.entryMethods?.email && (
                <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}20` }}>
                      <Mail size={14} style={{ color }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">Subscribe to Email List</p>
                      <p className="text-xs text-gray-500">+1 ticket</p>
                    </div>
                    {entered.has('email') && <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: `${color}20`, color }}>✓ Done</span>}
                  </div>
                  {!entered.has('email') && (
                    <div className="flex gap-2">
                      <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none"
                        style={{ '--tw-ring-color': color }}
                      />
                      <button
                        onClick={() => email.includes('@') && handleEntry('email')}
                        className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-900 transition-opacity hover:opacity-80"
                        style={{ background: color }}
                      >
                        Subscribe
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Other methods */}
              {Object.entries(campaign.entryMethods || {})
                .filter(([k, v]) => v && k !== 'email')
                .map(([method]) => {
                  const cfg = methodConfig[method]
                  if (!cfg) return null
                  const { icon: Icon, label, cta } = cfg
                  const tickets = campaign.entryValues?.[method] || 1
                  const done = entered.has(method)
                  return (
                    <div key={method} className="bg-gray-900 border border-gray-700 rounded-xl p-4 flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}20` }}>
                        <Icon size={14} style={{ color }} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white">{label}</p>
                        <p className="text-xs text-gray-500">+{tickets} {tickets === 1 ? 'ticket' : 'tickets'}</p>
                      </div>
                      <button
                        onClick={() => handleEntry(method)}
                        disabled={done}
                        className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-opacity disabled:opacity-50"
                        style={{ background: done ? '#1f1f1f' : `${color}20`, color: done ? '#6b7280' : color, border: `1px solid ${done ? '#374151' : color}40` }}
                      >
                        {done ? '✓ Done' : cta}
                      </button>
                    </div>
                  )
                })}

              {/* Powered by */}
              {campaign.branding?.showPoweredBy && (
                <p className="text-center text-[11px] text-gray-600 pt-4">
                  Powered by <span className="text-gray-500">GiveShop</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
