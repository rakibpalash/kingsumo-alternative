import { useState } from 'react'
import { useStore } from '../store/useStore'
import { Shield, AlertTriangle, CheckCircle, X, Ban, Activity, Wifi, Clock, Check, Trash2 } from 'lucide-react'

const SEVERITY_CONFIG = {
  high:   { color: 'text-red-400',    bg: 'bg-red-900/20',   border: 'border-red-800/50',   dot: 'bg-red-400' },
  medium: { color: 'text-amber-400',  bg: 'bg-amber-900/20', border: 'border-amber-800/50', dot: 'bg-amber-400' },
  low:    { color: 'text-blue-400',   bg: 'bg-blue-900/20',  border: 'border-blue-800/50',  dot: 'bg-blue-400' },
}

const TYPE_LABEL = {
  velocity:  'Velocity Burst',
  burner:    'Burner Email',
  duplicate: 'Duplicate Entry',
  proxy:     'Proxy/VPN Detected',
  pattern:   'Suspicious Pattern',
}

const BLOCKED_IPS = [
  { ip: '45.33.32.156', reason: 'Velocity burst (47 entries/2min)', blockedAt: '2024-01-15T12:31:00', attempts: 47 },
  { ip: '192.168.1.1',  reason: 'Duplicate IP — multiple accounts',  blockedAt: '2024-01-15T15:05:00', attempts: 3 },
  { ip: '185.220.101.5',reason: 'Known Tor exit node',               blockedAt: '2024-01-14T08:12:00', attempts: 12 },
]

function ThreatMeter({ level }) {
  const pct   = level === 'critical' ? 90 : level === 'high' ? 65 : level === 'medium' ? 40 : 15
  const color  = level === 'critical' ? 'text-red-400' : level === 'high' ? 'text-orange-400' : level === 'medium' ? 'text-amber-400' : 'text-brand-green'
  const barClr = level === 'critical' ? 'bg-red-500' : level === 'high' ? 'bg-orange-500' : level === 'medium' ? 'bg-amber-500' : 'bg-brand-green'
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#1e2635" strokeWidth="10" />
          <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor"
            strokeWidth="10" strokeLinecap="round"
            strokeDasharray={`${pct * 2.51} 251`}
            className={color} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-bold ${color}`}>{pct}%</span>
          <span className="text-[10px] text-dark-400 uppercase tracking-wider">threat</span>
        </div>
      </div>
      <span className={`text-sm font-semibold capitalize ${color}`}>{level} Risk</span>
    </div>
  )
}

export default function BotDetection() {
  const { entries, botAlerts, dismissBotAlert, clearAllBotAlerts, botRules, updateBotRules } = useStore()
  const [ipInput, setIpInput] = useState('')
  const [blockedIPs, setBlockedIPs] = useState(BLOCKED_IPS)
  const [autoBlock, setAutoBlock] = useState(botRules || { velocity: true, burner: true, proxy: true, duplicate: true })
  const [rulesSaved, setRulesSaved] = useState(false)

  const handleToggleRule = (key) => {
    const updated = { ...autoBlock, [key]: !autoBlock[key] }
    setAutoBlock(updated)
    updateBotRules(updated)
    setRulesSaved(true)
    setTimeout(() => setRulesSaved(false), 1500)
  }

  const suspicious = entries.filter((e) => e.suspicious)
  const threatLevel = botAlerts.length >= 3 ? 'high' : botAlerts.length >= 2 ? 'medium' : botAlerts.length >= 1 ? 'low' : 'low'

  const addBlock = () => {
    if (!ipInput.trim()) return
    setBlockedIPs((prev) => [...prev, { ip: ipInput.trim(), reason: 'Manually blocked', blockedAt: new Date().toISOString(), attempts: 0 }])
    setIpInput('')
  }

  const removeBlock = (ip) => setBlockedIPs((prev) => prev.filter((b) => b.ip !== ip))

  // Velocity data (fake hourly bins)
  const hours = Array.from({ length: 12 }, (_, i) => ({ hour: `${(new Date().getHours() - 11 + i + 24) % 24}:00`, entries: Math.floor(Math.random() * 8) }))
  const maxV = Math.max(...hours.map((h) => h.entries), 1)

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-lg font-bold text-white flex items-center gap-2"><Shield size={18} className="text-brand-green" /> Bot & Fraud Detection</h1>
        <p className="text-xs text-dark-400 mt-0.5">Real-time monitoring and protection for your giveaway</p>
      </div>

      {/* Top Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Threat Meter */}
        <div className="bg-dark-800 border border-dark-500 rounded-xl p-6 flex flex-col items-center justify-center">
          <ThreatMeter level={threatLevel} />
        </div>

        {/* Stats */}
        <div className="sm:col-span-2 grid grid-cols-2 gap-4">
          {[
            { label: 'Alerts Today',    value: botAlerts.length,     color: 'text-red-400',    bg: 'bg-red-900/20' },
            { label: 'Blocked Entries', value: suspicious.length,    color: 'text-amber-400',  bg: 'bg-amber-900/20' },
            { label: 'IPs Blocked',     value: blockedIPs.length,    color: 'text-blue-400',   bg: 'bg-blue-900/20' },
            { label: 'Protection',      value: '3 layers',           color: 'text-brand-green',bg: 'bg-brand-green/10' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`${bg} border border-dark-500 rounded-xl p-4`}>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-dark-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Auto-Block Rules */}
      <div className="bg-dark-800 border border-dark-500 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2"><Activity size={14} className="text-brand-green" /> Auto-Block Rules</h2>
          {rulesSaved && <span className="text-xs text-brand-green flex items-center gap-1"><Check size={11} /> Saved</span>}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { key: 'velocity',  label: 'Velocity Burst Detection',     desc: 'Block IPs entering >10 times in 5 minutes' },
            { key: 'burner',    label: 'Burner Email Blocklist',        desc: 'Block 30+ known disposable email domains' },
            { key: 'proxy',     label: 'Proxy / VPN Detection',         desc: 'Flag entries from known proxy networks' },
            { key: 'duplicate', label: 'Duplicate IP + Email',          desc: 'One entry per unique IP + email combination' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-start gap-3 border border-dark-600 rounded-xl p-4">
              <button
                onClick={() => handleToggleRule(key)}
                className={`relative w-11 h-6 rounded-full transition-colors shrink-0 mt-0.5 ${autoBlock[key] ? 'bg-brand-green' : 'bg-dark-600'}`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${autoBlock[key] ? 'left-6' : 'left-1'}`} />
              </button>
              <div>
                <p className="text-sm font-medium text-white">{label}</p>
                <p className="text-xs text-dark-400">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alerts + Velocity side by side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Recent Alerts */}
        <div className="bg-dark-800 border border-dark-500 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2"><AlertTriangle size={14} className="text-red-400" /> Recent Alerts</h2>
            {botAlerts.length > 0 && (
              <button onClick={clearAllBotAlerts} className="text-xs text-dark-500 hover:text-red-400 flex items-center gap-1 transition-colors">
                <Trash2 size={11} /> Clear all
              </button>
            )}
          </div>
          {botAlerts.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-6 text-center">
              <CheckCircle size={24} className="text-brand-green" />
              <p className="text-sm text-white font-medium">All clear</p>
              <p className="text-xs text-dark-400">No threats detected</p>
            </div>
          ) : (
            <div className="space-y-2">
              {botAlerts.map((alert) => {
                const cfg = SEVERITY_CONFIG[alert.severity]
                return (
                  <div key={alert.id} className={`${cfg.bg} border ${cfg.border} rounded-xl p-3 flex items-start gap-2`}>
                    <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${cfg.dot}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold ${cfg.color}`}>{TYPE_LABEL[alert.type] || alert.type}</p>
                      <p className="text-xs text-dark-400 mt-0.5 truncate">{alert.message}</p>
                      <p className="text-[10px] text-dark-500 mt-1 flex items-center gap-1">
                        <Clock size={9} /> {new Date(alert.time).toLocaleTimeString()}
                        {alert.blocked && <span className="ml-2 text-brand-green">✓ blocked</span>}
                      </p>
                    </div>
                    <button onClick={() => dismissBotAlert(alert.id)} className="text-dark-500 hover:text-dark-300 shrink-0 mt-0.5">
                      <X size={12} />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Velocity Chart */}
        <div className="bg-dark-800 border border-dark-500 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Activity size={14} className="text-brand-green" /> Entry Velocity (last 12h)</h2>
          <div className="flex items-end gap-1 h-28">
            {hours.map(({ hour, entries: cnt }) => (
              <div key={hour} className="flex-1 flex flex-col items-center gap-1 group relative">
                <div
                  className={`w-full rounded-t transition-all ${cnt > 6 ? 'bg-red-500/80 hover:bg-red-500' : 'bg-brand-green/60 hover:bg-brand-green'}`}
                  style={{ height: `${Math.max((cnt / maxV) * 100, cnt > 0 ? 4 : 2)}%` }}
                />
                <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-dark-700 border border-dark-500 rounded px-1.5 py-0.5 text-[10px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-10">
                  {hour}: {cnt}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-dark-500">{hours[0]?.hour}</span>
            <span className="text-[10px] text-dark-500">now</span>
          </div>
          <p className="text-xs text-dark-500 mt-2">Red bars = high velocity (potential bot burst)</p>
        </div>
      </div>

      {/* IP Blocklist */}
      <div className="bg-dark-800 border border-dark-500 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Ban size={14} className="text-red-400" /> IP Blocklist</h2>
        <div className="flex gap-2 mb-4">
          <input
            value={ipInput} onChange={(e) => setIpInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addBlock()}
            placeholder="Enter IP address (e.g. 192.168.1.1)"
            className="flex-1 bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-sm text-white placeholder-dark-400 focus:outline-none focus:border-brand-green transition-colors"
          />
          <button onClick={addBlock} className="px-4 py-2 bg-brand-green text-dark-900 font-semibold text-sm rounded-lg hover:bg-brand-green/80 transition-colors whitespace-nowrap">
            Block IP
          </button>
        </div>
        <div className="space-y-2">
          {blockedIPs.map(({ ip, reason, blockedAt, attempts }) => (
            <div key={ip} className="flex items-center gap-3 bg-red-900/10 border border-red-900/30 rounded-xl px-4 py-3">
              <Wifi size={14} className="text-red-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-mono text-red-400">{ip}</p>
                <p className="text-xs text-dark-400 truncate">{reason} · {attempts} attempts · {new Date(blockedAt).toLocaleDateString()}</p>
              </div>
              <button onClick={() => removeBlock(ip)} className="text-dark-500 hover:text-red-400 transition-colors text-xs border border-dark-600 hover:border-red-800 px-2 py-1 rounded-lg">
                Unblock
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
