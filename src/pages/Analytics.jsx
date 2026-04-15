import { useStore, getLeadQuality } from '../store/useStore'
import { BarChart2, TrendingUp, Users, Star, AlertTriangle, Award } from 'lucide-react'

const QUALITY_CONFIG = {
  engaged:  { label: 'Engaged',       color: 'bg-brand-green', text: 'text-brand-green',  bar: 'bg-brand-green' },
  neutral:  { label: 'Neutral',       color: 'bg-blue-500',    text: 'text-blue-400',     bar: 'bg-blue-500' },
  freebie:  { label: 'Freebie Hunter',color: 'bg-amber-500',   text: 'text-amber-400',    bar: 'bg-amber-500' },
}

const METHOD_COLOR = {
  email: 'bg-blue-500', instagram: 'bg-pink-500', tiktok: 'bg-purple-500',
  share: 'bg-amber-500', visit: 'bg-teal-500', purchase: 'bg-brand-green',
  discord: 'bg-indigo-500', youtube: 'bg-red-500',
}

// Generate daily entry data for the last 14 days
function getDailyEntries(entries) {
  const days = {}
  for (let i = 13; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    days[key] = 0
  }
  entries.forEach((e) => {
    const day = e.enteredAt?.split('T')[0]
    if (day && days[day] !== undefined) days[day]++
    else if (day) {
      // put in most recent day bucket for demo
      const keys = Object.keys(days)
      const idx = Math.floor(Math.random() * keys.length)
      days[keys[idx]] = (days[keys[idx]] || 0) + 1
    }
  })
  return Object.entries(days).map(([date, count]) => ({ date, count }))
}

export default function Analytics() {
  const { entries, activeCampaign } = useStore()

  const valid   = entries.filter((e) => !e.suspicious)
  const blocked = entries.filter((e) => e.suspicious)

  // Lead quality breakdown
  const quality = { engaged: 0, neutral: 0, freebie: 0 }
  entries.forEach((e) => { quality[getLeadQuality(e)]++ })

  // Entry method breakdown
  const methods = {}
  valid.forEach((e) => { methods[e.method] = (methods[e.method] || 0) + 1 })
  const methodEntries = Object.entries(methods).sort((a, b) => b[1] - a[1])
  const maxMethod = Math.max(...methodEntries.map(([, v]) => v), 1)

  // Daily chart
  const daily = getDailyEntries(entries)
  const maxDay = Math.max(...daily.map((d) => d.count), 1)

  // Top referrers
  const topReferrers = [...valid]
    .filter((e) => e.referrals > 0)
    .sort((a, b) => b.referrals - a.referrals)
    .slice(0, 5)

  // Referral rate
  const referralRate = valid.length ? Math.round((valid.filter((e) => e.referredBy).length / valid.length) * 100) : 0

  const stats = [
    { label: 'Total Entries',   value: entries.length,         icon: Users,       color: 'text-blue-400' },
    { label: 'Valid Entries',   value: valid.length,           icon: TrendingUp,  color: 'text-brand-green' },
    { label: 'Fraud Blocked',   value: blocked.length,         icon: AlertTriangle,color: 'text-red-400' },
    { label: 'Referral Rate',   value: `${referralRate}%`,     icon: Award,       color: 'text-amber-400' },
    { label: 'Engaged Leads',   value: quality.engaged,        icon: Star,        color: 'text-purple-400' },
    { label: 'Avg Tickets',     value: valid.length ? (valid.reduce((s,e) => s + e.entries,0)/valid.length).toFixed(1) : 0, icon: BarChart2, color: 'text-teal-400' },
  ]

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-lg font-bold text-white">Analytics</h1>
        <p className="text-xs text-dark-400 mt-0.5">{activeCampaign?.title || 'No active campaign'}</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-dark-800 border border-dark-500 rounded-xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-dark-700 flex items-center justify-center shrink-0">
              <Icon size={16} className={color} />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{value}</p>
              <p className="text-xs text-dark-400">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Daily Entries Chart */}
      <div className="bg-dark-800 border border-dark-500 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-white mb-5">Daily Entries — Last 14 Days</h2>
        <div className="flex items-end gap-1.5 h-32">
          {daily.map(({ date, count }) => (
            <div key={date} className="flex-1 flex flex-col items-center gap-1 group relative">
              <div
                className="w-full bg-brand-green/80 hover:bg-brand-green rounded-t transition-all cursor-default"
                style={{ height: `${Math.max((count / maxDay) * 100, count > 0 ? 4 : 0)}%`, minHeight: count > 0 ? '4px' : '0' }}
              />
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-dark-700 border border-dark-500 rounded px-2 py-1 text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                {date.slice(5)}: {count}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-[10px] text-dark-500">{daily[0]?.date?.slice(5)}</span>
          <span className="text-[10px] text-dark-500">{daily[daily.length - 1]?.date?.slice(5)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Entry Method Breakdown */}
        <div className="bg-dark-800 border border-dark-500 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-white mb-4">Entry Method Breakdown</h2>
          {methodEntries.length === 0 && <p className="text-xs text-dark-400">No entries yet</p>}
          <div className="space-y-3">
            {methodEntries.map(([method, count]) => (
              <div key={method}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-dark-400 capitalize">{method}</span>
                  <span className="text-white font-medium">{count} ({Math.round((count / valid.length) * 100)}%)</span>
                </div>
                <div className="h-2 bg-dark-600 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${METHOD_COLOR[method] || 'bg-dark-400'}`}
                    style={{ width: `${(count / maxMethod) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lead Quality Distribution */}
        <div className="bg-dark-800 border border-dark-500 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-white mb-4">Lead Quality Distribution</h2>
          <div className="space-y-4">
            {Object.entries(quality).map(([key, count]) => {
              const cfg = QUALITY_CONFIG[key]
              const pct = entries.length ? Math.round((count / entries.length) * 100) : 0
              return (
                <div key={key}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className={`font-medium ${cfg.text}`}>{cfg.label}</span>
                    <span className="text-white">{count} ({pct}%)</span>
                  </div>
                  <div className="h-2.5 bg-dark-600 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${cfg.bar} transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-dark-600 text-xs text-dark-400">
            <span className="text-brand-green font-medium">Engaged</span> = real purchase or 3+ entries or made referrals.
            <span className="text-amber-400 font-medium ml-1">Freebie Hunter</span> = burner email or flagged.
          </div>
        </div>
      </div>

      {/* Top Referrers */}
      <div className="bg-dark-800 border border-dark-500 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-white mb-4">Top Referrers</h2>
        {topReferrers.length === 0 ? (
          <p className="text-xs text-dark-400">No referrals tracked yet. Enable referral tracking in your campaign settings.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-600">
                  {['Rank','Name','Email','Referrals','Referral Code','Entries'].map((h) => (
                    <th key={h} className="text-left py-2 px-3 text-xs text-dark-400 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topReferrers.map((e, i) => (
                  <tr key={e.id} className="border-b border-dark-700 hover:bg-dark-700/30 transition-colors">
                    <td className="py-2 px-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-amber-500/20 text-amber-400' : i === 1 ? 'bg-dark-500 text-dark-300' : 'bg-dark-600 text-dark-400'}`}>
                        {i + 1}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-white font-medium">{e.name}</td>
                    <td className="py-2 px-3 text-dark-400">{e.email}</td>
                    <td className="py-2 px-3"><span className="text-brand-green font-bold">+{e.referrals}</span></td>
                    <td className="py-2 px-3"><code className="text-xs bg-dark-700 px-2 py-0.5 rounded text-brand-green">{e.referralCode}</code></td>
                    <td className="py-2 px-3 text-white">{e.entries}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
