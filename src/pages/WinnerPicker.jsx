import { useState, useRef } from 'react'
import { Trophy, RefreshCw, Check, ExternalLink, Mail, Shield, Zap, RotateCcw, Copy, X, Link } from 'lucide-react'
import { useStore } from '../store/useStore'

const SEGMENT_COLORS = [
  '#00d084','#3b82f6','#f59e0b','#ef4444','#8b5cf6',
  '#06b6d4','#f97316','#ec4899','#10b981','#6366f1',
  '#84cc16','#14b8a6','#f43f5e','#a855f7','#0ea5e9',
]

/* ── Spin Wheel ─────────────────────────────────────────────── */
function SpinWheel({ entries, onWinner }) {
  const [rotation, setRotation]   = useState(0)
  const [spinning, setSpinning]   = useState(false)
  const [localWinner, setLocalWinner] = useState(null)
  const currentRot = useRef(0)

  // Cap display at 30, prioritise by ticket count for fairness
  const display = [...entries].sort((a, b) => b.entries - a.entries).slice(0, 30)
  const totalTickets = display.reduce((s, e) => s + e.entries, 0)

  // Build segments with cumulative start angles
  let cum = 0
  const segments = display.map((e, i) => {
    const angle = (e.entries / totalTickets) * 360
    const seg = { ...e, angle, startAngle: cum, color: SEGMENT_COLORS[i % SEGMENT_COLORS.length] }
    cum += angle
    return seg
  })

  // SVG arc path helper (300×300 canvas, cx=cy=150, r=130)
  const arc = (startDeg, endDeg, r = 130) => {
    const cx = 150, cy = 150
    const rad = (d) => (d - 90) * (Math.PI / 180)
    const x1 = cx + r * Math.cos(rad(startDeg)), y1 = cy + r * Math.sin(rad(startDeg))
    const x2 = cx + r * Math.cos(rad(endDeg)),   y2 = cy + r * Math.sin(rad(endDeg))
    const large = endDeg - startDeg > 180 ? 1 : 0
    return `M${cx} ${cy} L${x1} ${y1} A${r} ${r} 0 ${large} 1 ${x2} ${y2}Z`
  }

  const spin = () => {
    if (spinning || !entries.length) return

    // Weighted random pick
    const pool = entries.flatMap((e) => Array(e.entries).fill(e))
    const picked = pool[Math.floor(Math.random() * pool.length)]

    // Find segment for the winner (use first match)
    const seg = segments.find((s) => s.id === picked.id || s.email === picked.email)
    if (!seg) return

    // Land pointer (top = 0°) on middle of winning segment
    const targetAngle = seg.startAngle + seg.angle / 2
    const offset = (360 - targetAngle % 360) % 360
    const newRot = currentRot.current + 5 * 360 + offset + 10 // +10 to avoid exact edge

    setSpinning(true)
    setLocalWinner(null)
    setRotation(newRot)
    currentRot.current = newRot

    setTimeout(() => {
      setSpinning(false)
      setLocalWinner(picked)
      onWinner(picked)
    }, 4600)
  }

  const reset = () => {
    setLocalWinner(null)
    setRotation(0)
    currentRot.current = 0
  }

  const size = 300

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Wheel + pointer */}
      <div className="relative" style={{ width: size, height: size }}>
        {/* Pointer arrow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10 drop-shadow-lg">
          <div style={{
            width: 0, height: 0,
            borderLeft: '10px solid transparent',
            borderRight: '10px solid transparent',
            borderTop: '22px solid #ffffff',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'
          }} />
        </div>

        {/* Spinning SVG */}
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: spinning
              ? 'transform 4.5s cubic-bezier(0.17, 0.67, 0.08, 1.0)'
              : 'none',
          }}
        >
          {segments.length === 0 ? (
            <circle cx="150" cy="150" r="130" fill="#1e2635" stroke="#2a3a4a" strokeWidth="2" />
          ) : (
            segments.map((seg) => {
              const mid = seg.startAngle + seg.angle / 2
              const rad = (d) => (d - 90) * (Math.PI / 180)
              const tr  = 90 // text radius
              const tx  = 150 + tr * Math.cos(rad(mid))
              const ty  = 150 + tr * Math.sin(rad(mid))

              return (
                <g key={seg.id || seg.email}>
                  <path d={arc(seg.startAngle, seg.startAngle + seg.angle)} fill={seg.color} stroke="#111827" strokeWidth="1.5" />
                  {seg.angle > 12 && (
                    <text
                      x={tx} y={ty}
                      fill="white"
                      fontSize={seg.angle > 30 ? '10' : '8'}
                      fontWeight="700"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${mid}, ${tx}, ${ty})`}
                      style={{ pointerEvents: 'none', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
                    >
                      {seg.name.length > 11 ? seg.name.slice(0, 10) + '…' : seg.name}
                    </text>
                  )}
                </g>
              )
            })
          )}

          {/* Outer ring */}
          <circle cx="150" cy="150" r="130" fill="none" stroke="#ffffff18" strokeWidth="3" />
          {/* Center hub */}
          <circle cx="150" cy="150" r="22" fill="#111827" stroke="#374151" strokeWidth="3" />
          <circle cx="150" cy="150" r="10" fill="#00d084" />
        </svg>
      </div>

      {/* Action */}
      {!localWinner ? (
        <button
          onClick={spin}
          disabled={spinning || !entries.length}
          className="flex items-center gap-2 px-10 py-3 bg-brand-green text-dark-900 font-bold rounded-xl text-base hover:bg-brand-green/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
        >
          {spinning
            ? <><RefreshCw size={16} className="animate-spin" /> Spinning…</>
            : <><Zap size={16} /> Spin the Wheel!</>}
        </button>
      ) : (
        <div className="text-center space-y-2">
          <p className="text-brand-green font-bold text-xl flex items-center justify-center gap-2"><Trophy size={18} /> {localWinner.name}!</p>
          <p className="text-xs text-dark-400">{localWinner.email}</p>
          <button
            onClick={reset}
            className="flex items-center gap-1.5 text-xs text-dark-400 hover:text-white mx-auto transition-colors mt-1"
          >
            <RotateCcw size={11} /> Spin again
          </button>
        </div>
      )}

      {!entries.length && (
        <p className="text-xs text-red-400">No valid entries to spin</p>
      )}
    </div>
  )
}

/* ── Main Page ──────────────────────────────────────────────── */
export default function WinnerPicker() {
  const { entries, activeCampaign, winner, pickWinner, clearWinner } = useStore()
  const [mode, setMode]         = useState('wheel') // 'quick' | 'wheel'
  const [spinning, setSpinning] = useState(false)
  const [notified, setNotified] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [emailCopied, setEmailCopied] = useState(false)

  const validEntries = entries.filter((e) => !e.suspicious)
  const pool = validEntries.flatMap((e) => Array(e.entries).fill(e))

  const handleQuickPick = () => {
    if (!validEntries.length) return
    setSpinning(true)
    setNotified(false)
    setTimeout(() => { pickWinner(); setSpinning(false) }, 2000)
  }

  const handleWheelWinner = (picked) => {
    // Persist wheel result the same way as quick pick
    pickWinner(picked)
    setNotified(false)
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {[
          { label: 'Eligible',        value: validEntries.length,                              color: 'text-white' },
          { label: 'Total Tickets',   value: pool.length,                                       color: 'text-brand-green' },
          { label: 'Blocked',         value: entries.filter((e) => e.suspicious).length,        color: 'text-red-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-dark-800 border border-dark-500 rounded-xl p-3 sm:p-4 text-center">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-dark-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Mode toggle */}
      <div className="flex items-center gap-1 bg-dark-800 border border-dark-500 rounded-xl p-1 w-fit">
        {[
          { id: 'wheel', label: 'Spin Wheel' },
          { id: 'quick', label: 'Quick Pick' },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setMode(id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === id ? 'bg-brand-green text-dark-900' : 'text-dark-400 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── SPIN WHEEL MODE ── */}
      {mode === 'wheel' && !winner && (
        <div className="bg-dark-800 border border-dark-500 rounded-xl p-6 sm:p-8 flex flex-col items-center">
          <SpinWheel entries={validEntries} onWinner={handleWheelWinner} />
        </div>
      )}

      {/* ── QUICK PICK MODE ── */}
      {mode === 'quick' && !winner && (
        <div className="bg-dark-800 border border-dark-500 rounded-xl p-8 text-center">
          {!spinning ? (
            <>
              <div className="w-20 h-20 rounded-full bg-dark-700 border-2 border-dashed border-dark-500 flex items-center justify-center mx-auto mb-6">
                <Trophy size={32} className="text-dark-400" />
              </div>
              <h2 className="text-lg font-bold text-white mb-2">Ready to Pick a Winner?</h2>
              <p className="text-sm text-dark-400 mb-6">
                Weighted random selection — more tickets = higher odds. Suspicious entries excluded.
              </p>
              <button
                onClick={handleQuickPick}
                disabled={!validEntries.length}
                className="px-8 py-3 bg-brand-green text-dark-900 font-bold rounded-xl hover:bg-brand-green/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
              >
                Pick Winner Now
              </button>
              {!validEntries.length && <p className="text-xs text-red-400 mt-3">No valid entries</p>}
            </>
          ) : (
            <div className="py-8">
              <div className="w-20 h-20 rounded-full bg-brand-green/10 border-2 border-brand-green/40 flex items-center justify-center mx-auto mb-6 animate-spin">
                <Trophy size={32} className="text-brand-green" />
              </div>
              <h2 className="text-lg font-bold text-white mb-2 animate-pulse">Drawing winner…</h2>
              <p className="text-sm text-dark-400">Selecting from {pool.length} tickets</p>
              <div className="mt-6 bg-dark-700 rounded-lg p-3 overflow-hidden h-10">
                <div className="flex gap-3 animate-bounce text-xs text-dark-400">
                  {validEntries.slice(0, 6).map((e, i) => <span key={i} className="whitespace-nowrap">{e.name}</span>)}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── WINNER RESULT (both modes) ── */}
      {winner && (
        <div className="bg-dark-800 border border-dark-500 rounded-xl p-6 sm:p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-brand-green/10 border-2 border-brand-green flex items-center justify-center mx-auto mb-5">
            <Trophy size={32} className="text-brand-green" />
          </div>
          <p className="text-xs font-semibold text-brand-green uppercase tracking-widest mb-2 flex items-center justify-center gap-1.5"><Trophy size={12} /> Winner Selected!</p>
          <h2 className="text-2xl font-bold text-white mb-1">{winner.name}</h2>
          <p className="text-sm text-dark-400 mb-3">{winner.email}</p>
          <div className="flex items-center justify-center gap-2 flex-wrap mb-6">
            <span className="text-xs px-2 py-0.5 rounded-full bg-brand-green/10 text-brand-green border border-brand-green/20 capitalize">via {winner.method}</span>
            <span className="text-xs text-dark-400">{winner.entries} tickets</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-dark-700 text-dark-400">{new Date(winner.pickedAt).toLocaleString()}</span>
          </div>

          {activeCampaign && (
            <div className="bg-dark-700 rounded-xl p-4 mb-4 text-left">
              <p className="text-xs text-dark-400 mb-1">Prize Awarded</p>
              <p className="text-sm font-semibold text-white">{activeCampaign.prize}</p>
              {activeCampaign.prizeValue && <p className="text-xs text-brand-green">{activeCampaign.prizeValue}</p>}
            </div>
          )}

          <div className="bg-dark-700 rounded-xl p-4 mb-6 text-left">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={13} className="text-brand-green" />
              <p className="text-xs font-semibold text-white">Verifiable Proof URL</p>
            </div>
            <div className="flex items-center gap-2">
              <code className="text-xs text-brand-teal flex-1 truncate">{winner.proofUrl}</code>
              <a href={winner.proofUrl} target="_blank" rel="noopener noreferrer" className="text-dark-400 hover:text-white transition-colors shrink-0"><ExternalLink size={13} /></a>
            </div>
            <p className="text-[11px] text-dark-400 mt-1">Share this URL publicly to prove the draw was fair</p>
          </div>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <div className="w-full max-w-sm mx-auto space-y-3 mb-2">
              {/* Claim link */}
              <div className="bg-dark-700 rounded-xl border border-dark-600 p-3">
                <p className="text-[10px] text-dark-400 mb-1.5">Winner Claim Link — send this to {winner.name}</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs text-brand-green flex-1 truncate">{`${window.location.origin}/claim/${activeCampaign?.id}`}</code>
                  <button
                    type="button"
                    onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/claim/${activeCampaign?.id}`); setNotified(true); setTimeout(() => setNotified(false), 2000) }}
                    className="shrink-0 text-dark-400 hover:text-white transition-colors"
                  >
                    {notified ? <Check size={13} className="text-brand-green" /> : <Copy size={13} />}
                  </button>
                </div>
              </div>
              {/* Email winner */}
              <button
                type="button"
                onClick={() => setShowEmailModal(true)}
                className="flex items-center justify-center gap-2 w-full px-5 py-2.5 bg-brand-green text-dark-900 font-semibold rounded-lg text-sm hover:bg-brand-green/80 transition-colors"
              >
                <Mail size={14} /> Send Winner Notification
              </button>
            </div>
            <button onClick={() => { clearWinner(); setNotified(false) }}
              className="flex items-center gap-2 px-4 py-2.5 bg-dark-700 border border-dark-500 text-dark-400 hover:text-white rounded-lg text-sm transition-colors">
              <RefreshCw size={14} /> Pick Again
            </button>
          </div>
        </div>
      )}

      {/* ── Email Notification Modal ── */}
      {showEmailModal && winner && (() => {
        const claimLink = `${window.location.origin}/claim/${activeCampaign?.id}`
        const subject = `Congratulations! You won ${activeCampaign?.prize || 'our giveaway'}!`
        const body = `Hi ${winner.name},\n\nCongratulations! You've been selected as the winner of our "${activeCampaign?.title || 'giveaway'}" giveaway!\n\nPrize: ${activeCampaign?.prize || ''}${activeCampaign?.prizeValue ? ` (valued at $${activeCampaign.prizeValue})` : ''}\n\nPlease visit the link below to claim your prize and submit your shipping address:\n${claimLink}\n\nThis link expires in 7 days. If you have any questions, reply to this email.\n\nCongratulations again!\n`
        const gmailUrl = `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(winner.email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
        const outlookUrl = `https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(winner.email)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
        const copyEmail = () => {
          navigator.clipboard.writeText(`To: ${winner.email}\nSubject: ${subject}\n\n${body}`)
          setEmailCopied(true); setTimeout(() => setEmailCopied(false), 2000)
        }
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
            <div className="bg-dark-800 border border-dark-500 rounded-2xl w-full max-w-lg">
              <div className="flex items-center justify-between px-5 py-4 border-b border-dark-600">
                <p className="text-sm font-bold text-white flex items-center gap-2"><Mail size={14} className="text-brand-green" /> Notify Winner</p>
                <button onClick={() => setShowEmailModal(false)} className="text-dark-400 hover:text-white transition-colors"><X size={16} /></button>
              </div>
              <div className="p-5 space-y-4">
                {/* Recipient */}
                <div className="bg-dark-700 rounded-xl p-3">
                  <p className="text-[10px] text-dark-400 mb-0.5">To</p>
                  <p className="text-sm font-semibold text-white">{winner.name} <span className="text-dark-400 font-normal">— {winner.email}</span></p>
                </div>
                {/* Subject */}
                <div className="bg-dark-700 rounded-xl p-3">
                  <p className="text-[10px] text-dark-400 mb-0.5">Subject</p>
                  <p className="text-sm text-white">{subject}</p>
                </div>
                {/* Body preview */}
                <div className="bg-dark-700 rounded-xl p-3">
                  <p className="text-[10px] text-dark-400 mb-1">Message</p>
                  <pre className="text-xs text-dark-300 whitespace-pre-wrap font-sans leading-relaxed max-h-40 overflow-y-auto">{body}</pre>
                </div>
                {/* Actions */}
                <div className="space-y-2">
                  <p className="text-[10px] text-dark-400 uppercase tracking-wider">Send via</p>
                  <div className="grid grid-cols-2 gap-2">
                    <a href={gmailUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-3 py-2.5 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg text-xs transition-colors">
                      <Mail size={13} /> Open in Gmail
                    </a>
                    <a href={outlookUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs transition-colors">
                      <Mail size={13} /> Open in Outlook
                    </a>
                  </div>
                  <button onClick={copyEmail}
                    className="flex items-center justify-center gap-2 w-full px-3 py-2.5 bg-dark-700 border border-dark-500 hover:border-dark-400 text-white rounded-lg text-xs transition-colors">
                    {emailCopied ? <><Check size={13} className="text-brand-green" /> Copied!</> : <><Copy size={13} /> Copy Full Email to Clipboard</>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Eligible list */}
      <div className="bg-dark-800 border border-dark-500 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Eligible Participants ({validEntries.length})</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {validEntries.map((e) => (
            <div key={e.id} className={`flex items-center justify-between p-2.5 rounded-lg ${winner?.email === e.email ? 'bg-brand-green/10 border border-brand-green/30' : 'bg-dark-700'}`}>
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-full bg-dark-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                  {e.name[0]}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-white truncate">{e.name}</p>
                  <p className="text-[10px] text-dark-400 truncate">{e.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
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
