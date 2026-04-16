import { useState } from 'react'
import { useStore } from '../store/useStore'
import { Trophy, Share2, Copy, Check, ExternalLink, Shield, Users, Calendar, Hash } from 'lucide-react'

export default function WinnerAnnouncement() {
  const { winner, entries, activeCampaign } = useStore()
  const [copied, setCopied] = useState(false)

  const proofUrl = winner?.proofUrl || `${window.location.origin}/proof/demo`
  const validEntries = entries.filter((e) => !e.suspicious)

  const copy = () => {
    navigator.clipboard.writeText(proofUrl)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  const shareLinks = [
    { label: 'X / Twitter', href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`🎉 We have a winner! Congratulations to our ${activeCampaign?.title || 'giveaway'} winner! Proof: ${proofUrl}`)}`, color: 'bg-black hover:bg-zinc-800' },
    { label: 'Facebook',    href: `https://www.facebook.com/sharer/sharer.php?u=${proofUrl}`, color: 'bg-blue-700 hover:bg-blue-600' },
    { label: 'LinkedIn',    href: `https://www.linkedin.com/sharing/share-offsite/?url=${proofUrl}`, color: 'bg-blue-800 hover:bg-blue-700' },
  ]

  if (!winner) {
    return (
      <div className="max-w-2xl">
        <div className="bg-dark-800 border border-dark-500 rounded-xl p-12 text-center">
          <Trophy size={48} className="text-dark-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-white mb-2">No Winner Selected Yet</h2>
          <p className="text-sm text-dark-400 mb-6">Pick a winner from the Winner Picker page first.</p>
          <a href="/winner" className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-green text-dark-900 font-semibold rounded-lg text-sm hover:bg-brand-green/80 transition-colors">
            <Trophy size={14} /> Go to Winner Picker
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h1 className="text-lg font-bold text-white flex items-center gap-2"><Trophy size={18} className="text-amber-400" /> Winner Announcement</h1>
        <p className="text-xs text-dark-400 mt-0.5">Public proof page — share this with your audience</p>
      </div>

      {/* Winner card */}
      <div className="bg-gradient-to-br from-amber-900/30 to-dark-800 border border-amber-700/40 rounded-2xl p-8 text-center">
        <div className="flex items-center justify-center mb-3">
          <Trophy size={48} className="text-amber-400" />
        </div>
        <p className="text-xs text-amber-400 font-semibold uppercase tracking-widest mb-1">Winner Announcement</p>
        <h2 className="text-3xl font-bold text-white mb-1">{winner.name}</h2>
        <p className="text-dark-400 text-sm mb-4">{winner.email}</p>
        <div className="inline-flex items-center gap-2 bg-brand-green/20 border border-brand-green/30 rounded-full px-4 py-1.5">
          <Trophy size={14} className="text-brand-green" />
          <span className="text-brand-green text-sm font-semibold">{activeCampaign?.prize || 'Prize'}</span>
        </div>
      </div>

      {/* Proof stats */}
      <div className="bg-dark-800 border border-dark-500 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Shield size={14} className="text-brand-green" /> Verifiable Proof of Fair Draw</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Entries',  value: validEntries.length,  icon: Users },
            { label: 'Winner Tickets', value: winner.entries,       icon: Hash },
            { label: 'Draw Method',    value: 'Weighted Random',    icon: Shield },
            { label: 'Drawn At',       value: winner.pickedAt ? new Date(winner.pickedAt).toLocaleDateString() : '—', icon: Calendar },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="text-center border border-dark-600 rounded-xl p-3">
              <Icon size={16} className="text-brand-green mx-auto mb-1.5" />
              <p className="text-sm font-bold text-white">{value}</p>
              <p className="text-[10px] text-dark-400">{label}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 border-t border-dark-600 pt-4">
          <p className="text-xs text-dark-400 mb-2">Proof URL — publicly accessible</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-xs text-brand-green font-mono truncate">
              {proofUrl}
            </div>
            <button onClick={copy} className="flex items-center gap-1.5 px-3 py-2 bg-dark-700 border border-dark-500 text-dark-400 hover:text-white rounded-lg text-xs transition-colors shrink-0">
              {copied ? <><Check size={12} className="text-brand-green" />Copied</> : <><Copy size={12} />Copy</>}
            </button>
            <a href={proofUrl} target="_blank" rel="noopener noreferrer"
              className="p-2 bg-dark-700 border border-dark-500 text-dark-400 hover:text-white rounded-lg transition-colors shrink-0">
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>

      {/* Draw details */}
      <div className="bg-dark-800 border border-dark-500 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-white mb-3">Selection Details</h2>
        <div className="space-y-2 text-xs">
          {[
            ['Campaign',       activeCampaign?.title || '—'],
            ['Winner Name',    winner.name],
            ['Winner Email',   winner.email],
            ['Entry Method',   winner.method],
            ['Ticket Weight',  `${winner.entries} tickets (higher weight = better odds)`],
            ['Total Pool',     `${validEntries.reduce((s, e) => s + e.entries, 0)} tickets across ${validEntries.length} entries`],
            ['Drawn At',       winner.pickedAt ? new Date(winner.pickedAt).toLocaleString() : '—'],
            ['Algorithm',      'Cryptographically weighted random selection'],
          ].map(([k, v]) => (
            <div key={k} className="flex gap-3 py-1.5 border-b border-dark-700 last:border-0">
              <span className="text-dark-400 w-32 shrink-0">{k}</span>
              <span className="text-white">{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Share */}
      <div className="bg-dark-800 border border-dark-500 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Share2 size={14} className="text-brand-green" /> Share the Announcement</h2>
        <div className="flex gap-3 flex-wrap">
          {shareLinks.map(({ label, href, color }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold transition-colors ${color}`}>
              <Share2 size={14} /> Share on {label}
            </a>
          ))}
          <button onClick={copy}
            className="flex items-center gap-2 px-4 py-2 bg-dark-700 border border-dark-500 text-dark-400 hover:text-white rounded-lg text-sm font-semibold transition-colors">
            {copied ? <><Check size={14} className="text-brand-green" />Proof Link Copied!</> : <><Copy size={14} />Copy Proof Link</>}
          </button>
        </div>
      </div>
    </div>
  )
}
