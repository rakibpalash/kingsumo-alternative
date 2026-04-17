import { useState } from 'react'
import { Download, Search, ChevronDown, Filter, Trash2, AlertTriangle, Mail, Share2 } from 'lucide-react'
import { useStore, getLeadQuality } from '../store/useStore'

function OverviewTab({ entries, allEntries, campaigns, filterGiveaway, setFilterGiveaway, filterSearch, setFilterSearch, filterDate, setFilterDate, filterSort, setFilterSort, filterStatus, setFilterStatus, onApply, showExportMenu, setShowExportMenu, onExportCSV, removeEntry }) {
  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="bg-dark-800 border border-dark-600 rounded-xl p-4 space-y-3">
        {/* Row 1: filter dropdowns */}
        <div className="flex flex-wrap items-end gap-3">
          {/* GIVEAWAY dropdown */}
          <div>
            <label className="block text-[10px] font-bold text-dark-500 uppercase tracking-wider mb-1">GIVEAWAY</label>
            <div className="relative">
              <select
                value={filterGiveaway}
                onChange={e => setFilterGiveaway(e.target.value)}
                className="appearance-none bg-dark-700 border border-dark-500 rounded-lg pl-3 pr-8 py-2 text-sm text-white focus:outline-none focus:border-brand-green"
              >
                <option value="all">All</option>
                {campaigns.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none" />
            </div>
          </div>

          {/* SEARCH input */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[10px] font-bold text-dark-500 uppercase tracking-wider mb-1">SEARCH</label>
            <div className="relative">
              <input
                type="text"
                value={filterSearch}
                onChange={e => setFilterSearch(e.target.value)}
                placeholder="Search e-mail or name"
                className="w-full bg-dark-700 border border-dark-500 rounded-lg pl-3 pr-3 py-2 text-sm text-white placeholder-dark-500 focus:outline-none focus:border-brand-green"
              />
            </div>
          </div>

          {/* DATE dropdown */}
          <div>
            <label className="block text-[10px] font-bold text-dark-500 uppercase tracking-wider mb-1">DATE</label>
            <div className="relative">
              <select
                value={filterDate}
                onChange={e => setFilterDate(e.target.value)}
                className="appearance-none bg-dark-700 border border-dark-500 rounded-lg pl-3 pr-8 py-2 text-sm text-white focus:outline-none focus:border-brand-green"
              >
                <option value="all-times">Date range &gt; All Times</option>
                <option value="today">Today</option>
                <option value="week">Last 7 days</option>
                <option value="month">Last 30 days</option>
              </select>
              <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none" />
            </div>
          </div>

          {/* SORT BY dropdown */}
          <div>
            <label className="block text-[10px] font-bold text-dark-500 uppercase tracking-wider mb-1">SORT BY</label>
            <div className="relative">
              <select
                value={filterSort}
                onChange={e => setFilterSort(e.target.value)}
                className="appearance-none bg-dark-700 border border-dark-500 rounded-lg pl-3 pr-8 py-2 text-sm text-white focus:outline-none focus:border-brand-green"
              >
                <option value="most-recent">Sort By &gt; Most Recent</option>
                <option value="sale-value">Sale Value</option>
                <option value="entries">Entries</option>
                <option value="referrals">Referrals</option>
              </select>
              <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none" />
            </div>
          </div>

          {/* USER STATUS dropdown */}
          <div>
            <label className="block text-[10px] font-bold text-dark-500 uppercase tracking-wider mb-1">USER STATUS</label>
            <div className="relative">
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="appearance-none bg-dark-700 border border-dark-500 rounded-lg pl-3 pr-8 py-2 text-sm text-white focus:outline-none focus:border-brand-green"
              >
                <option value="all-users">User Status &gt; All users</option>
                <option value="missing-actions">Missing mandatory actions</option>
                <option value="completed-actions">Completed all actions</option>
                <option value="winners">Winners</option>
                <option value="disqualified">Disqualified</option>
              </select>
              <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Row 2: Export + Apply Filter */}
        <div className="flex items-center justify-between">
          {/* Export button with dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-1.5 px-3 py-2 border border-dark-500 rounded-lg text-sm text-dark-300 hover:text-white hover:border-dark-400 transition-colors"
            >
              <Download size={13} /> EXPORT <ChevronDown size={12} />
            </button>
            {showExportMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)} />
                <div className="absolute left-0 top-10 z-20 bg-dark-700 border border-dark-500 rounded-xl shadow-xl overflow-hidden w-40">
                  <button onClick={onExportCSV} className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-dark-600 transition-colors">
                    Export as CSV
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Apply Filter button - teal/cyan like GiveawayNinja */}
          <button
            onClick={onApply}
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Filter size={13} /> APPLY FILTER
          </button>
        </div>
      </div>

      {/* Table or empty state */}
      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <h3 className="text-2xl font-semibold text-dark-300 mb-2">Ooops, no users.</h3>
          <p className="text-sm text-dark-500">Hey, looks like there are no users for this filter.</p>
        </div>
      ) : (
        <div className="bg-dark-800 border border-dark-600 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-600">
                <th className="text-left text-xs text-dark-400 font-medium px-4 py-3">Participant</th>
                <th className="text-left text-xs text-dark-400 font-medium px-4 py-3">Entries</th>
                <th className="text-left text-xs text-dark-400 font-medium px-4 py-3 hidden sm:table-cell">Referrals</th>
                <th className="text-left text-xs text-dark-400 font-medium px-4 py-3">Status</th>
                <th className="text-left text-xs text-dark-400 font-medium px-4 py-3 hidden lg:table-cell">Entered</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {entries.map(e => (
                <tr key={e.id} className="hover:bg-dark-700/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-dark-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                        {(e.name || e.email || '?')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-white">{e.name || '—'}</p>
                        <p className="text-[11px] text-dark-400">{e.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs font-semibold text-white">{e.entries}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">
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
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function EmailValidationTab({ entries, emailValStatus, setEmailValStatus, appliedEmailStatus, onApply }) {
  const validations = entries.filter(e => {
    if (appliedEmailStatus === 'all') return true
    if (appliedEmailStatus === 'rejected') return e.suspicious
    if (appliedEmailStatus === 'ok') return !e.suspicious
    return true
  })

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="bg-dark-800 border border-dark-600 rounded-xl p-4">
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-[10px] font-bold text-dark-500 uppercase tracking-wider mb-1">STATUS</label>
            <div className="relative">
              <select
                value={emailValStatus}
                onChange={e => setEmailValStatus(e.target.value)}
                className="appearance-none bg-dark-700 border border-dark-500 rounded-lg pl-3 pr-8 py-2 text-sm text-white focus:outline-none focus:border-brand-green"
              >
                <option value="all">All</option>
                <option value="rejected">Rejected</option>
                <option value="ok">Ok</option>
              </select>
              <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none" />
            </div>
          </div>

          <button
            onClick={onApply}
            className="self-end flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Filter size={13} /> APPLY FILTER
          </button>
        </div>
      </div>

      {/* Empty state or table */}
      {validations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <h3 className="text-2xl font-semibold text-dark-300 mb-2">Ooops, no validations yet.</h3>
          <p className="text-sm text-dark-500">Hey, looks like there are no validations for this filter.</p>
        </div>
      ) : (
        <div className="bg-dark-800 border border-dark-600 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-600">
                <th className="text-left text-xs text-dark-400 font-medium px-4 py-3">Email</th>
                <th className="text-left text-xs text-dark-400 font-medium px-4 py-3">Status</th>
                <th className="text-left text-xs text-dark-400 font-medium px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {validations.map(e => (
                <tr key={e.id} className="hover:bg-dark-700/50 transition-colors">
                  <td className="px-4 py-3 text-sm text-white">{e.email}</td>
                  <td className="px-4 py-3">
                    {e.suspicious ? (
                      <span className="text-[10px] px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full">Rejected</span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full">Ok</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[11px] text-dark-400">{new Date(e.enteredAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function Participants() {
  const { entries, removeEntry, campaigns } = useStore()
  const [subPage, setSubPage] = useState('overview') // 'overview' | 'email-validation'

  // Overview filters
  const [filterGiveaway, setFilterGiveaway] = useState('all')
  const [filterSearch, setFilterSearch] = useState('')
  const [filterDate, setFilterDate] = useState('all-times')
  const [filterSort, setFilterSort] = useState('most-recent')
  const [filterStatus, setFilterStatus] = useState('all-users')

  // Email validation filters
  const [emailValStatus, setEmailValStatus] = useState('all')

  // Applied filters (only update on Apply Filter click)
  const [applied, setApplied] = useState({
    giveaway: 'all', search: '', date: 'all-times', sort: 'most-recent', status: 'all-users'
  })
  const [appliedEmailStatus, setAppliedEmailStatus] = useState('all')

  // Export dropdown
  const [showExportMenu, setShowExportMenu] = useState(false)

  const exportCSV = () => {
    const valid = entries.filter(e => !e.suspicious)
    const csv = [
      ['Name', 'Email', 'Entries', 'Referrals', 'Status', 'Entered At'],
      ...valid.map(e => [e.name, e.email, e.entries, e.referrals || 0, e.suspicious ? 'Blocked' : 'Valid', e.enteredAt])
    ].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'users-export.csv'
    a.click()
    setShowExportMenu(false)
  }

  // Filter entries based on applied filters
  const filteredEntries = entries.filter(e => {
    const matchSearch = !applied.search ||
      e.name?.toLowerCase().includes(applied.search.toLowerCase()) ||
      e.email?.toLowerCase().includes(applied.search.toLowerCase())
    const matchStatus = applied.status === 'all-users' ||
      (applied.status === 'missing-actions' && !e.suspicious) ||
      (applied.status === 'completed-actions' && !e.suspicious) ||
      (applied.status === 'winners' && false) ||
      (applied.status === 'disqualified' && e.suspicious)
    return matchSearch && matchStatus
  })

  // Sort entries
  const sortedEntries = [...filteredEntries].sort((a, b) => {
    if (applied.sort === 'most-recent') return new Date(b.enteredAt) - new Date(a.enteredAt)
    if (applied.sort === 'entries') return b.entries - a.entries
    if (applied.sort === 'referrals') return (b.referrals || 0) - (a.referrals || 0)
    return 0
  })

  return (
    <div className="space-y-0 -m-4 sm:-m-6">
      {/* Sub-navigation */}
      <div className="flex border-b border-dark-600 bg-dark-800 px-4 sm:px-6">
        {['Overview', 'E-mail Validation'].map((tab) => {
          const key = tab === 'Overview' ? 'overview' : 'email-validation'
          return (
            <button
              key={key}
              onClick={() => setSubPage(key)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                subPage === key
                  ? 'border-brand-green text-brand-green'
                  : 'border-transparent text-dark-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          )
        })}
      </div>

      <div className="p-4 sm:p-6">
        {subPage === 'overview' ? (
          <OverviewTab
            entries={sortedEntries}
            allEntries={entries}
            campaigns={campaigns || []}
            filterGiveaway={filterGiveaway} setFilterGiveaway={setFilterGiveaway}
            filterSearch={filterSearch} setFilterSearch={setFilterSearch}
            filterDate={filterDate} setFilterDate={setFilterDate}
            filterSort={filterSort} setFilterSort={setFilterSort}
            filterStatus={filterStatus} setFilterStatus={setFilterStatus}
            onApply={() => setApplied({ giveaway: filterGiveaway, search: filterSearch, date: filterDate, sort: filterSort, status: filterStatus })}
            showExportMenu={showExportMenu} setShowExportMenu={setShowExportMenu}
            onExportCSV={exportCSV}
            removeEntry={removeEntry}
          />
        ) : (
          <EmailValidationTab
            entries={entries}
            emailValStatus={emailValStatus} setEmailValStatus={setEmailValStatus}
            appliedEmailStatus={appliedEmailStatus}
            onApply={() => setAppliedEmailStatus(emailValStatus)}
          />
        )}
      </div>
    </div>
  )
}
