import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, Search, Trophy, Users, TrendingUp, AlertTriangle,
  MoreVertical, Edit2, Copy, Eye, Trash2, Megaphone, Shield,
  X, ChevronRight, Gift, BarChart2
} from 'lucide-react'
import { useStore } from '../store/useStore'

const STATUS_CONFIG = {
  draft:          { label: 'Draft',          color: 'text-dark-400',     bg: 'bg-dark-600',          dot: 'bg-dark-400' },
  active:         { label: 'Active',         color: 'text-brand-green',  bg: 'bg-brand-green/10',    dot: 'bg-brand-green animate-pulse' },
  'ready-to-award': { label: 'Ready to Award', color: 'text-amber-400', bg: 'bg-amber-900/20',      dot: 'bg-amber-400' },
  completed:      { label: 'Completed',      color: 'text-blue-400',     bg: 'bg-blue-900/20',       dot: 'bg-blue-400' },
  paused:         { label: 'Paused',         color: 'text-orange-400',   bg: 'bg-orange-900/20',     dot: 'bg-orange-400' },
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.draft
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

function ActionMenu({ campaign, onEdit, onDuplicate, onView, onDelete, onSetStatus }) {
  const [open, setOpen] = useState(false)
  const [dropPos, setDropPos] = useState({ top: 0, right: 0 })
  const btnRef = useRef(null)

  const items = [
    { label: 'Edit',       icon: Edit2,      action: onEdit,      color: '' },
    { label: 'Duplicate',  icon: Copy,        action: onDuplicate, color: '' },
    { label: 'View Live',  icon: Eye,         action: onView,      color: '' },
    ...(campaign.status === 'active' ? [{ label: 'Mark Ready to Award', icon: Trophy, action: () => onSetStatus('ready-to-award'), color: 'text-amber-400' }] : []),
    ...(campaign.status !== 'active' && campaign.status !== 'completed' ? [{ label: 'Activate', icon: TrendingUp, action: () => onSetStatus('active'), color: 'text-brand-green' }] : []),
    { label: 'Delete',     icon: Trash2,      action: onDelete,    color: 'text-red-400' },
  ]

  const handleOpen = (e) => {
    e.stopPropagation()
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      setDropPos({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
      })
    }
    setOpen(!open)
  }

  return (
    <div>
      <button
        ref={btnRef}
        onClick={handleOpen}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-dark-400 hover:text-white hover:bg-dark-600 transition-colors"
      >
        <MoreVertical size={15} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="fixed z-50 w-48 bg-dark-700 border border-dark-500 rounded-xl shadow-2xl overflow-hidden"
            style={{ top: dropPos.top, right: dropPos.right }}
          >
            {items.map(({ label, icon: Icon, action, color }) => (
              <button
                key={label}
                onClick={(e) => { e.stopPropagation(); action(); setOpen(false) }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-dark-600 transition-colors text-left ${color || 'text-dark-300 hover:text-white'}`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const {
    campaigns, entries, activeCampaign, setActiveCampaign,
    botAlerts, dismissBotAlert, duplicateCampaign, deleteCampaign, setCampaignStatus,
  } = useStore()

  const [search, setSearch] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const validEntries  = entries.filter((e) => !e.suspicious)
  const totalEntries  = campaigns.reduce((s) => s + validEntries.length, 0)
  const activeCount   = campaigns.filter((c) => c.status === 'active').length
  const fraudCount    = entries.filter((e) => e.suspicious).length

  const filtered = campaigns.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.prize?.toLowerCase().includes(search.toLowerCase())
  )

  const daysLeft = (camp) => {
    if (!camp.endDate) return null
    const d = Math.ceil((new Date(camp.endDate) - new Date()) / 86400000)
    return d > 0 ? d : 0
  }

  const handleDelete = (id) => {
    if (deleteConfirm === id) {
      deleteCampaign(id)
      setDeleteConfirm(null)
    } else {
      setDeleteConfirm(id)
      setTimeout(() => setDeleteConfirm(null), 3000)
    }
  }

  return (
    <div className="space-y-5 max-w-6xl">

      {/* Bot alert banner */}
      {botAlerts.length > 0 && (
        <div className="bg-red-900/20 border border-red-800/40 rounded-xl px-5 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield size={14} className="text-red-400 shrink-0" />
              <div>
                <span className="text-sm font-semibold text-red-400">{botAlerts.length} fraud alert{botAlerts.length > 1 ? 's' : ''} detected</span>
                <span className="text-xs text-red-400/70 ml-2">{botAlerts[0]?.message}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => navigate('/bot-detection')} className="text-xs text-red-400 hover:text-red-300 border border-red-800/50 rounded-lg px-3 py-1 transition-colors">
                View Details
              </button>
              <button onClick={() => dismissBotAlert(botAlerts[0]?.id)} className="text-red-500 hover:text-red-300 transition-colors"><X size={14} /></button>
            </div>
          </div>
        </div>
      )}

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Campaigns', value: campaigns.length,  icon: Gift,          color: 'text-brand-green', bg: 'bg-brand-green/10' },
          { label: 'Active Now',      value: activeCount,       icon: TrendingUp,    color: 'text-blue-400',    bg: 'bg-blue-500/10' },
          { label: 'Total Entries',   value: validEntries.length, icon: Users,       color: 'text-purple-400',  bg: 'bg-purple-500/10' },
          { label: 'Fraud Blocked',   value: fraudCount,        icon: AlertTriangle, color: 'text-red-400',     bg: 'bg-red-500/10' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-dark-800 border border-dark-500 rounded-xl p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
              <Icon size={15} className={color} />
            </div>
            <div>
              <p className={`text-xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-dark-400">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Campaign list */}
      <div className="bg-dark-800 border border-dark-500 rounded-xl overflow-hidden">
        {/* Header row */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-dark-500 gap-3">
          <h1 className="text-base font-bold text-white shrink-0">Your Giveaways</h1>
          <div className="flex items-center gap-2 flex-1 justify-end">
            {/* Search */}
            <div className="relative flex-1 max-w-xs">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full bg-dark-700 border border-dark-500 rounded-lg pl-8 pr-3 py-1.5 text-sm text-white placeholder-dark-500 focus:outline-none focus:border-brand-green transition-colors"
              />
            </div>
            <button
              onClick={() => navigate('/campaigns/new')}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-brand-green text-dark-900 font-semibold text-sm rounded-lg hover:bg-brand-green/80 transition-colors shrink-0 whitespace-nowrap"
            >
              <Plus size={14} /> <span className="hidden sm:inline">New Giveaway</span><span className="sm:hidden">New</span>
            </button>
          </div>
        </div>

        {/* Table header — hidden on mobile */}
        <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-6 py-2.5 border-b border-dark-700 bg-dark-900/40">
          {['Title', 'Entries', 'Status', 'Ends In', ''].map((h) => (
            <span key={h} className="text-[11px] font-semibold text-dark-500 uppercase tracking-wider">{h}</span>
          ))}
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div className="py-16 text-center px-4">
            <Gift size={40} className="text-dark-600 mx-auto mb-3" />
            <p className="text-sm font-medium text-white mb-1">No giveaways yet</p>
            <p className="text-xs text-dark-400 mb-5">Create your first campaign to get started</p>
            <button
              onClick={() => navigate('/campaigns/new')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-green text-dark-900 font-semibold text-sm rounded-lg hover:bg-brand-green/80 transition-colors"
            >
              <Plus size={14} /> New Giveaway
            </button>
          </div>
        ) : (
          <div className="divide-y divide-dark-700">
            {filtered.map((camp) => {
              const contestantCount = camp.id === activeCampaign?.id ? validEntries.length : Math.floor(Math.random() * 50)
              const entryCount      = camp.id === activeCampaign?.id ? entries.length : contestantCount
              const days            = daysLeft(camp)
              const isActive        = activeCampaign?.id === camp.id

              return (
                <div
                  key={camp.id}
                  onClick={() => { setActiveCampaign(camp); navigate('/participants') }}
                  className={`cursor-pointer transition-colors hover:bg-dark-700/40 ${isActive ? 'bg-brand-green/5' : ''}`}
                >
                  {/* Mobile layout */}
                  <div className="sm:hidden px-4 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          {isActive && <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse shrink-0" />}
                          <p className="text-sm font-semibold text-white truncate">{camp.title}</p>
                        </div>
                        <p className="text-xs text-dark-400 truncate">🏆 {camp.prize}</p>
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          <StatusBadge status={camp.status} />
                          <span className="text-xs text-dark-500 flex items-center gap-1"><Users size={11} /> {contestantCount}</span>
                          <span className="text-xs text-dark-500">
                            {camp.status === 'completed' ? 'Ended'
                              : days === 0 ? <span className="text-red-400">Today</span>
                              : days !== null ? `${days}d left` : '—'}
                          </span>
                        </div>
                      </div>
                      <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                        <ActionMenu
                          campaign={camp}
                          onEdit={() => navigate(`/campaigns/${camp.id}/edit`)}
                          onDuplicate={() => duplicateCampaign(camp.id)}
                          onView={() => { setActiveCampaign(camp); navigate('/preview') }}
                          onDelete={() => handleDelete(camp.id)}
                          onSetStatus={(s) => setCampaignStatus(camp.id, s)}
                        />
                      </div>
                    </div>
                    {deleteConfirm === camp.id && (
                      <p className="text-[10px] text-red-400 animate-pulse mt-1">Tap again to confirm delete</p>
                    )}
                  </div>

                  {/* Desktop layout */}
                  <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 items-center px-6 py-4">
                  {/* Title */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse shrink-0" />}
                      <p className="text-sm font-semibold text-white truncate hover:text-brand-green transition-colors">{camp.title}</p>
                    </div>
                    <p className="text-xs text-dark-400 mt-0.5 truncate">
                      🏆 {camp.prize}
                      {camp.prizeValue && <span className="ml-1 text-dark-500">· {camp.prizeValue}</span>}
                    </p>
                    <p className="text-[10px] text-dark-600 mt-0.5">{new Date(camp.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>

                  {/* Entries */}
                  <div className="flex items-center gap-1.5">
                    <BarChart2 size={13} className="text-dark-500" />
                    <span className="text-sm font-semibold text-white">{entryCount}</span>
                  </div>

                  {/* Status */}
                  <div onClick={(e) => e.stopPropagation()}>
                    <StatusBadge status={camp.status} />
                  </div>

                  {/* Ends in */}
                  <div className="text-xs text-dark-400">
                    {camp.status === 'completed' ? (
                      <span className="text-blue-400">Ended</span>
                    ) : days === 0 ? (
                      <span className="text-red-400 font-medium">Ends today</span>
                    ) : days !== null ? (
                      <span>{days}d left</span>
                    ) : (
                      <span className="text-dark-600">—</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    {/* Promote / Quick action */}
                    {camp.status === 'active' && (
                      <button
                        onClick={() => { setActiveCampaign(camp); navigate('/winner') }}
                        className="hidden sm:flex items-center gap-1.5 text-xs px-3 py-1.5 bg-amber-900/30 border border-amber-700/40 text-amber-400 hover:bg-amber-900/50 rounded-lg font-medium transition-colors whitespace-nowrap"
                      >
                        <Trophy size={12} /> Pick Winner
                      </button>
                    )}
                    {camp.status === 'ready-to-award' && (
                      <button
                        onClick={() => { setActiveCampaign(camp); navigate('/winner') }}
                        className="hidden sm:flex items-center gap-1.5 text-xs px-3 py-1.5 bg-amber-500 text-dark-900 hover:bg-amber-400 rounded-lg font-semibold transition-colors whitespace-nowrap"
                      >
                        <Trophy size={12} /> Award Winner
                      </button>
                    )}
                    {camp.status === 'draft' && (
                      <button
                        onClick={() => { setCampaignStatus(camp.id, 'active'); setActiveCampaign({ ...camp, status: 'active' }) }}
                        className="hidden sm:flex items-center gap-1.5 text-xs px-3 py-1.5 bg-brand-green/20 border border-brand-green/30 text-brand-green hover:bg-brand-green/30 rounded-lg font-medium transition-colors whitespace-nowrap"
                      >
                        Activate
                      </button>
                    )}

                    <ActionMenu
                      campaign={camp}
                      onEdit={() => navigate(`/campaigns/${camp.id}/edit`)}
                      onDuplicate={() => duplicateCampaign(camp.id)}
                      onView={() => { setActiveCampaign(camp); navigate('/preview') }}
                      onDelete={() => handleDelete(camp.id)}
                      onSetStatus={(s) => setCampaignStatus(camp.id, s)}
                    />

                    {deleteConfirm === camp.id && (
                      <span className="text-[10px] text-red-400 animate-pulse whitespace-nowrap">Click again</span>
                    )}
                  </div>
                  </div>{/* end desktop grid */}
                </div>{/* end row wrapper */}
              )
            })}
          </div>
        )}
      </div>

      {/* Quick actions row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Analytics',      icon: BarChart2,  to: '/analytics',      color: 'text-teal-400',   bg: 'hover:bg-teal-900/20 hover:border-teal-700/40' },
          { label: 'Leaderboard',    icon: Trophy,     to: '/leaderboard',    color: 'text-amber-400',  bg: 'hover:bg-amber-900/20 hover:border-amber-700/40' },
          { label: 'Email Templates',icon: Megaphone,  to: '/email-editor',   color: 'text-blue-400',   bg: 'hover:bg-blue-900/20 hover:border-blue-700/40' },
          { label: 'Embed & Share',  icon: ChevronRight,to:'/embed',          color: 'text-purple-400', bg: 'hover:bg-purple-900/20 hover:border-purple-700/40' },
        ].map(({ label, icon: Icon, to, color, bg }) => (
          <button
            key={to}
            onClick={() => navigate(to)}
            className={`flex items-center gap-3 px-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-sm font-medium ${color} transition-all ${bg}`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
