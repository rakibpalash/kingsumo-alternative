import { useState } from 'react'
import { Trophy, RefreshCw, Check, ExternalLink, Mail, Shield } from 'lucide-react'
import { useStore } from '../store/useStore'

export default function WinnerPicker() {
  const { entries, activeCampaign, winner, pickWinner, clearWinner } = useStore()
  const [spinning, setSpinning] = useState(false)
  const [notified, setNotified] = useState(false)

  const validEntries = entries.filter((e) => !e.suspicious)
  const pool = validEntries.flatMap((e) => Array(e.entries).fill(e))

  const handlePick = () => {
    if (!validEntries.length) return
    setSpinning(true)
    setNotified(false)
    setTimeout(() => {
      pickWinner()
      setSpinning(false)
    }, 2000)
  }

  const handleNotify = () => {
    setNotified(true)
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 sm:grid-cols-3 gap-3 sm:gap-4">
        {[
          { label: 'Eligible Entries', value: validEntries.length, color: 'text-white' },
          { label: 'Total Tickets', value: pool.length, color: 'text-brand-green' },
          { label: 'Blocked Entries', value: entries.filter((e) => e.suspicious).length, color: 'text-red-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-dark-800 border border-dark-500 rounded-xl p-3 sm:p-4 text-center">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-dark-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Winner card */}
      <div className="bg-dark-800 border border-dark-500 rounded-xl p-8 text-center">
        {!winner && !spinning && (
          <>
            <div className="w-20 h-20 rounded-full bg-dark-700 border-2 border-dashed border-dark-500 flex items-center justify-center mx-auto mb-6">
              <Trophy size={32} className="text-dark-400" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Ready to Pick a Winner?</h2>
            <p className="text-sm text-dark-400 mb-6">
              The system uses weighted random selection — participants with more tickets have higher odds.
              Suspicious entries are automatically excluded.
            </p>
            <button
              onClick={handlePick}
              disabled={!validEntries.length}
              className="px-8 py-3 bg-brand-green text-dark-900 font-bold rounded-xl hover:bg-brand-green/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
            >
              Pick Winner Now
            </button>
            {!validEntries.length && (
              <p className="text-xs text-red-400 mt-3">No valid entries to pick from</p>
            )}
          </>
        )}

        {spinning && (
          <div className="py-8">
            <div className="w-20 h-20 rounded-full bg-brand-green/10 border-2 border-brand-green/40 flex items-center justify-center mx-auto mb-6 animate-spin">
              <Trophy size={32} className="text-brand-green" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2 animate-pulse">Drawing winner...</h2>
            <p className="text-sm text-dark-400">Selecting from {pool.length} tickets across {validEntries.length} participants</p>
            <div className="mt-6 bg-dark-700 rounded-lg p-3 overflow-hidden h-10">
              <div className="flex gap-3 animate-bounce text-xs text-dark-400">
                {validEntries.slice(0, 6).map((e, i) => (
                  <span key={i} className="whitespace-nowrap">{e.name}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {winner && !spinning && (
          <>
            <div className="w-20 h-20 rounded-full bg-brand-green/10 border-2 border-brand-green flex items-center justify-center mx-auto mb-6">
              <Trophy size={32} className="text-brand-green" />
            </div>
            <p className="text-xs font-semibold text-brand-green uppercase tracking-widest mb-2">Winner Selected!</p>
            <h2 className="text-2xl font-bold text-white mb-1">{winner.name}</h2>
            <p className="text-sm text-dark-400 mb-1">{winner.email}</p>
            <div className="flex items-center justify-center gap-2 mt-2 mb-6">
              <span className="text-xs px-2 py-0.5 rounded-full bg-brand-green/10 text-brand-green border border-brand-green/20 capitalize">
                via {winner.method}
              </span>
              <span className="text-xs text-dark-400">{winner.entries} tickets</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-dark-700 text-dark-400">
                Picked {new Date(winner.pickedAt).toLocaleString()}
              </span>
            </div>

            {/* Prize */}
            {activeCampaign && (
              <div className="bg-dark-700 rounded-xl p-4 mb-6 text-left">
                <p className="text-xs text-dark-400 mb-1">Prize Awarded</p>
                <p className="text-sm font-semibold text-white">{activeCampaign.prize}</p>
                {activeCampaign.prizeValue && <p className="text-xs text-brand-green">{activeCampaign.prizeValue}</p>}
              </div>
            )}

            {/* Proof URL */}
            <div className="bg-dark-700 rounded-xl p-4 mb-6 text-left">
              <div className="flex items-center gap-2 mb-2">
                <Shield size={13} className="text-brand-green" />
                <p className="text-xs font-semibold text-white">Verifiable Proof URL</p>
              </div>
              <div className="flex items-center gap-2">
                <code className="text-xs text-brand-teal flex-1 truncate">{winner.proofUrl}</code>
                <button className="text-dark-400 hover:text-white transition-colors">
                  <ExternalLink size={13} />
                </button>
              </div>
              <p className="text-[11px] text-dark-400 mt-1">Share this URL publicly to prove the draw was fair</p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-center gap-3">
              {!notified ? (
                <button
                  onClick={handleNotify}
                  className="flex items-center gap-2 px-5 py-2.5 bg-brand-green text-dark-900 font-semibold rounded-lg text-sm hover:bg-brand-green/80 transition-colors"
                >
                  <Mail size={14} /> Notify Winner by Email
                </button>
              ) : (
                <div className="flex items-center gap-2 px-5 py-2.5 bg-brand-green/10 text-brand-green border border-brand-green/30 rounded-lg text-sm">
                  <Check size={14} /> Email sent to {winner.email}
                </div>
              )}
              <button
                onClick={clearWinner}
                className="flex items-center gap-2 px-4 py-2.5 bg-dark-700 border border-dark-500 text-dark-400 hover:text-white rounded-lg text-sm transition-colors"
              >
                <RefreshCw size={14} /> Pick Again
              </button>
            </div>
          </>
        )}
      </div>

      {/* Eligibility list */}
      <div className="bg-dark-800 border border-dark-500 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Eligible Participants ({validEntries.length})</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {validEntries.map((e) => (
            <div key={e.id} className={`flex items-center justify-between p-2.5 rounded-lg ${winner?.email === e.email ? 'bg-brand-green/10 border border-brand-green/30' : 'bg-dark-700'}`}>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-dark-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                  {e.name[0]}
                </div>
                <div>
                  <p className="text-xs font-medium text-white">{e.name}</p>
                  <p className="text-[10px] text-dark-400">{e.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {winner?.email === e.email && <Trophy size={12} className="text-brand-green" />}
                <span className="text-xs font-semibold text-dark-400">{e.entries}×</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
