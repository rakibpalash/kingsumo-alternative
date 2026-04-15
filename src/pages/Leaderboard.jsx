import { useState } from 'react'
import { useStore } from '../store/useStore'
import { Trophy, Copy, Check, Share2, Link, Gift, ChevronUp } from 'lucide-react'

const BASE_URL = 'https://give.shop/c/summer-sale'

export default function Leaderboard() {
  const { entries, activeCampaign } = useStore()
  const [copied, setCopied] = useState(null)

  const valid = entries.filter((e) => !e.suspicious && e.referralCode)
  const sorted = [...valid].sort((a, b) => b.referrals - a.referrals)

  const copy = (text, key) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const totalReferrals = valid.reduce((s, e) => s + (e.referrals || 0), 0)
  const topReferrer   = sorted[0]

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-lg font-bold text-white flex items-center gap-2"><Trophy size={18} className="text-amber-400" /> Referral Leaderboard</h1>
        <p className="text-xs text-dark-400 mt-0.5">{activeCampaign?.title || 'No active campaign'} — top referrers get bonus entries</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {[
          { label: 'Total Referrals',   value: totalReferrals,                icon: Share2,    color: 'text-brand-green' },
          { label: 'Unique Referrers',  value: valid.filter(e => e.referrals > 0).length, icon: Gift, color: 'text-blue-400' },
          { label: 'Referral Rate',     value: `${valid.length ? Math.round((valid.filter(e=>e.referredBy).length/valid.length)*100) : 0}%`, icon: ChevronUp, color: 'text-purple-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-dark-800 border border-dark-500 rounded-xl p-4 flex items-center gap-3">
            <Icon size={16} className={color} />
            <div>
              <p className={`text-xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-dark-400">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bonus entries notice */}
      {activeCampaign?.referralTracking?.enabled && (
        <div className="bg-brand-green/10 border border-brand-green/30 rounded-xl p-4 flex items-center gap-3">
          <Gift size={16} className="text-brand-green shrink-0" />
          <p className="text-sm text-white">
            Each referral earns <span className="text-brand-green font-bold">+{activeCampaign.referralTracking.bonusEntries} bonus entries</span> for the referrer.
            Unique tracking links are auto-generated per entrant.
          </p>
        </div>
      )}

      {/* Leaderboard table */}
      <div className="bg-dark-800 border border-dark-500 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-dark-500 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Top Referrers</h2>
          <span className="text-xs text-dark-400">{sorted.length} participants with tracking links</span>
        </div>

        {sorted.length === 0 ? (
          <div className="py-12 text-center">
            <Trophy size={32} className="text-dark-500 mx-auto mb-3" />
            <p className="text-sm text-dark-400">No referrals yet</p>
          </div>
        ) : (
          <div className="divide-y divide-dark-700">
            {sorted.map((entry, i) => {
              const refLink = `${BASE_URL}?ref=${entry.referralCode}`
              const isCopied = copied === entry.id
              const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null

              return (
                <div key={entry.id} className={`px-6 py-4 flex items-center gap-4 ${i === 0 ? 'bg-amber-900/10' : 'hover:bg-dark-700/30'} transition-colors`}>
                  {/* Rank */}
                  <div className="w-8 shrink-0 text-center">
                    {medal ? (
                      <span className="text-xl">{medal}</span>
                    ) : (
                      <span className="text-sm text-dark-500 font-mono">#{i + 1}</span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-dark-600 flex items-center justify-center shrink-0 text-sm font-bold text-white">
                    {entry.name.charAt(0)}
                  </div>

                  {/* Name + email */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{entry.name}</p>
                    <p className="text-xs text-dark-400 truncate">{entry.email}</p>
                  </div>

                  {/* Referrals badge */}
                  <div className="shrink-0 text-right">
                    <p className={`text-lg font-bold ${entry.referrals > 0 ? 'text-brand-green' : 'text-dark-500'}`}>
                      {entry.referrals}
                    </p>
                    <p className="text-[10px] text-dark-400">referrals</p>
                  </div>

                  {/* Entries badge */}
                  <div className="shrink-0 text-right hidden sm:block">
                    <p className="text-sm font-semibold text-white">{entry.entries}</p>
                    <p className="text-[10px] text-dark-400">entries</p>
                  </div>

                  {/* Referral link */}
                  <div className="shrink-0 flex items-center gap-1">
                    <code className="text-[10px] bg-dark-700 text-brand-green px-2 py-1 rounded hidden sm:block max-w-[120px] truncate">
                      ?ref={entry.referralCode}
                    </code>
                    <button
                      onClick={() => copy(refLink, entry.id)}
                      className="w-8 h-8 flex items-center justify-center bg-dark-700 hover:bg-dark-600 rounded-lg text-dark-400 hover:text-white transition-colors"
                      title="Copy referral link"
                    >
                      {isCopied ? <Check size={13} className="text-brand-green" /> : <Copy size={13} />}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Campaign share link */}
      <div className="bg-dark-800 border border-dark-500 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><Link size={14} className="text-brand-green" /> Campaign Share Link</h2>
        <p className="text-xs text-dark-400 mb-3">This is the base URL for your giveaway. Each entrant gets a unique version with their referral code appended.</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-sm text-brand-green font-mono truncate">
            {BASE_URL}
          </div>
          <button
            onClick={() => copy(BASE_URL, 'main')}
            className="flex items-center gap-2 px-4 py-2 bg-brand-green text-dark-900 font-semibold text-sm rounded-lg hover:bg-brand-green/80 transition-colors shrink-0"
          >
            {copied === 'main' ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy</>}
          </button>
        </div>
      </div>
    </div>
  )
}
