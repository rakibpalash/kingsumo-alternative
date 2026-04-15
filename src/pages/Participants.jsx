import { useState } from 'react'
import { Download, Search, Trash2, AlertTriangle, Mail, Share2, Star } from 'lucide-react'
import { useStore, getLeadQuality } from '../store/useStore'

const QUALITY_CONFIG = {
  engaged:  { label: 'Engaged',       color: 'text-brand-green',  bg: 'bg-brand-green/10',  border: 'border-brand-green/30' },
  neutral:  { label: 'Neutral',       color: 'text-dark-400',     bg: 'bg-dark-600/40',     border: 'border-dark-600' },
  freebie:  { label: 'Freebie Hunter',color: 'text-amber-400',    bg: 'bg-amber-900/20',    border: 'border-amber-800/30' },
}

const methodColors = {
  email: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  instagram: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  tiktok: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  purchase: 'bg-brand-green/10 text-brand-green border-brand-green/20',
  share: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  visit: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
}

export default function Participants() {
  const { entries, removeEntry, addEntry } = useStore()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [testForm, setTestForm] = useState({ name: '', email: '', method: 'email', ip: '' })
  const [testResult, setTestResult] = useState(null)
  const [showAdd, setShowAdd] = useState(false)

  const filtered = entries.filter((e) => {
    const matchSearch =
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase())
    const quality = getLeadQuality(e)
    const matchFilter =
      filter === 'all' ||
      (filter === 'valid' && !e.suspicious) ||
      (filter === 'blocked' && e.suspicious) ||
      (filter === 'engaged' && quality === 'engaged') ||
      (filter === 'freebie' && quality === 'freebie')
    return matchSearch && matchFilter
  })

  const exportCSV = () => {
    const valid = entries.filter((e) => !e.suspicious)
    const csv = [
      ['Name', 'Email', 'Method', 'Tickets', 'Referrals', 'Lead Quality', 'Referral Code', 'Entered At'],
      ...valid.map((e) => [e.name, e.email, e.method, e.entries, e.referrals || 0, getLeadQuality(e), e.referralCode || '', e.enteredAt]),
    ]
      .map((r) => r.join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'giveaway-entries.csv'
    a.click()
  }

  const handleTestEntry = () => {
    if (!testForm.name || !testForm.email) return
    const result = addEntry({ ...testForm, ip: testForm.ip || `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`, entries: { email: 1, instagram: 2, tiktok: 2, share: 3, visit: 1, purchase: 5 }[testForm.method] })
    setTestResult(result)
    setTimeout(() => { setTestResult(null); setShowAdd(false); setTestForm({ name: '', email: '', method: 'email', ip: '' }) }, 2500)
  }

  const validCount = entries.filter((e) => !e.suspicious).length
  const blockedCount = entries.filter((e) => e.suspicious).length
  const engagedCount = entries.filter((e) => !e.suspicious && getLeadQuality(e) === 'engaged').length
  const freebieCount = entries.filter((e) => !e.suspicious && getLeadQuality(e) === 'freebie').length

  return (
    <div className="max-w-4xl space-y-4">
      {/* Stats bar */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-bold text-white">{validCount}</span>
          <span className="text-dark-400">valid</span>
        </div>
        <div className="w-px h-4 bg-dark-500" />
        <div className="flex items-center gap-2 text-sm">
          <AlertTriangle size={13} className="text-red-400" />
          <span className="font-bold text-red-400">{blockedCount}</span>
          <span className="text-dark-400">blocked</span>
        </div>
        <div className="w-px h-4 bg-dark-500" />
        <div className="flex items-center gap-2 text-sm">
          <Star size={12} className="text-brand-green" />
          <span className="font-bold text-brand-green">{engagedCount}</span>
          <span className="text-dark-400">engaged</span>
        </div>
        <div className="w-px h-4 bg-dark-500" />
        <div className="flex items-center gap-2 text-sm">
          <span className="font-bold text-amber-400">{freebieCount}</span>
          <span className="text-dark-400">freebie hunters</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-dark-700 border border-dark-500 text-dark-400 hover:text-white rounded-lg transition-colors"
          >
            <Mail size={12} /> Test Entry
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-brand-green text-dark-900 font-semibold rounded-lg hover:bg-brand-green/80 transition-colors"
          >
            <Download size={12} /> Export CSV
          </button>
        </div>
      </div>

      {/* Test entry form */}
      {showAdd && (
        <div className="bg-dark-800 border border-dark-500 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white mb-3">Simulate a New Entry</h3>
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="Full name"
              value={testForm.name}
              onChange={(e) => setTestForm((f) => ({ ...f, name: e.target.value }))}
              className="bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-sm text-white placeholder-dark-400 focus:outline-none focus:border-brand-green"
            />
            <input
              placeholder="Email address"
              value={testForm.email}
              onChange={(e) => setTestForm((f) => ({ ...f, email: e.target.value }))}
              className="bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-sm text-white placeholder-dark-400 focus:outline-none focus:border-brand-green"
            />
            <select
              value={testForm.method}
              onChange={(e) => setTestForm((f) => ({ ...f, method: e.target.value }))}
              className="bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-green"
            >
              {['email', 'instagram', 'tiktok', 'share', 'visit', 'purchase'].map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <input
              placeholder="IP address (optional)"
              value={testForm.ip}
              onChange={(e) => setTestForm((f) => ({ ...f, ip: e.target.value }))}
              className="bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-sm text-white placeholder-dark-400 focus:outline-none focus:border-brand-green"
            />
          </div>
          <div className="flex items-center gap-3 mt-3">
            <button onClick={handleTestEntry} className="text-xs px-4 py-2 bg-brand-green text-dark-900 font-semibold rounded-lg hover:bg-brand-green/80 transition-colors">
              Submit Entry
            </button>
            {testResult && (
              <span className={`text-xs font-medium ${testResult.success ? 'text-brand-green' : 'text-red-400'}`}>
                {testResult.success ? '✓ Entry accepted!' : '✗ Blocked — fraud detected!'}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Search + filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full bg-dark-800 border border-dark-500 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-dark-400 focus:outline-none focus:border-brand-green"
          />
        </div>
        <div className="flex items-center gap-1 bg-dark-800 border border-dark-500 rounded-lg p-1">
          {['all', 'valid', 'blocked', 'engaged', 'freebie'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-md capitalize transition-colors ${
                filter === f ? 'bg-brand-green text-dark-900 font-semibold' : 'text-dark-400 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-dark-800 border border-dark-500 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-dark-500">
              <th className="text-left text-xs text-dark-400 font-medium px-4 py-3">Participant</th>
              <th className="text-left text-xs text-dark-400 font-medium px-4 py-3">Method</th>
              <th className="text-left text-xs text-dark-400 font-medium px-4 py-3">Tickets</th>
              <th className="text-left text-xs text-dark-400 font-medium px-4 py-3 hidden sm:table-cell">Lead Quality</th>
              <th className="text-left text-xs text-dark-400 font-medium px-4 py-3 hidden md:table-cell">Referrals</th>
              <th className="text-left text-xs text-dark-400 font-medium px-4 py-3">Status</th>
              <th className="text-left text-xs text-dark-400 font-medium px-4 py-3 hidden lg:table-cell">Entered</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-700">
            {filtered.map((e) => {
              const quality = getLeadQuality(e)
              const qCfg = QUALITY_CONFIG[quality]
              return (
                <tr key={e.id} className={`${e.suspicious ? 'bg-red-500/3' : ''} hover:bg-dark-700/50 transition-colors`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-dark-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                        {e.name[0]}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-white">{e.name}</p>
                        <p className="text-[11px] text-dark-400">{e.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border capitalize ${methodColors[e.method] || 'bg-dark-600 text-dark-400 border-dark-500'}`}>
                      {e.method}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs font-semibold text-white">{e.entries}×</td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${qCfg.color} ${qCfg.bg} ${qCfg.border}`}>
                      {qCfg.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {e.referrals > 0 ? (
                      <span className="flex items-center gap-1 text-xs text-purple-400 font-medium">
                        <Share2 size={10} /> {e.referrals}
                      </span>
                    ) : (
                      <span className="text-xs text-dark-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {e.suspicious ? (
                      <span className="flex items-center gap-1 text-[10px] text-red-400">
                        <AlertTriangle size={10} /> Blocked
                      </span>
                    ) : (
                      <span className="text-[10px] text-brand-green">✓ Valid</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[11px] text-dark-400 hidden lg:table-cell">
                    {new Date(e.enteredAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => removeEntry(e.id)} className="p-1 text-dark-400 hover:text-red-400 transition-colors rounded">
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-dark-400 text-sm">No entries found</div>
        )}
      </div>
    </div>
  )
}
