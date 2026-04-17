import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, Search, Trophy, Users, TrendingUp, AlertTriangle,
  MoreVertical, Edit2, Copy, Eye, Trash2, Megaphone, Shield,
  X, ChevronRight, Gift, BarChart2, Rocket, CheckCircle2, Circle,
  Zap, QrCode, Mail
} from 'lucide-react'
import { useStore } from '../store/useStore'

const STATUS_CONFIG = {
  draft:           { label: 'Draft',           color: 'text-dark-400',    bg: 'bg-dark-600',         dot: 'bg-dark-400' },
  active:          { label: 'Active',          color: 'text-brand-green', bg: 'bg-brand-green/10',   dot: 'bg-brand-green animate-pulse' },
  ended:           { label: 'Ended',           color: 'text-amber-400',   bg: 'bg-amber-900/20',     dot: 'bg-amber-400' },
  winner_picked:   { label: 'Winner Picked',   color: 'text-purple-400',  bg: 'bg-purple-900/20',    dot: 'bg-purple-400' },
  announced:       { label: 'Announced',       color: 'text-blue-400',    bg: 'bg-blue-900/20',      dot: 'bg-blue-400 animate-pulse' },
  completed:       { label: 'Completed',       color: 'text-dark-400',    bg: 'bg-dark-700',         dot: 'bg-dark-500' },
  'ready-to-award': { label: 'Ready to Award', color: 'text-amber-400',   bg: 'bg-amber-900/20',     dot: 'bg-amber-400' },
  paused:          { label: 'Paused',          color: 'text-orange-400',  bg: 'bg-orange-900/20',    dot: 'bg-orange-400' },
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
      <s-button
        ref={btnRef}
        variant="tertiary"
        icon="three-dots-horizontal"
        accessibilityLabel="Campaign actions"
        onClick={handleOpen}
      />
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="fixed z-50 w-48 bg-dark-700 border border-dark-500 rounded-xl shadow-2xl overflow-hidden"
            style={{ top: dropPos.top, right: dropPos.right }}
          >
            {items.map(({ label, action, color }) => (
              <s-button
                key={label}
                variant="tertiary"
                tone={color === 'text-red-400' ? 'critical' : 'auto'}
                onClick={(e) => { e.stopPropagation(); action(); setOpen(false) }}
                style={{ width: '100%', justifyContent: 'flex-start' }}
              >
                {label}
              </s-button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function OnboardingChecklist({ campaigns, entries, navigate }) {
  const hasCampaign  = campaigns.length > 0
  const hasActive    = campaigns.some((c) => c.status === 'active')
  const hasEntries   = entries.filter((e) => !e.suspicious).length > 0
  const hasWinner    = campaigns.some((c) => c.status === 'completed' || c.status === 'ready-to-award')

  const steps = [
    { done: hasCampaign,  icon: Gift,         label: 'Create your first giveaway',        sub: 'Set prize, dates, and entry methods',   action: () => navigate('/campaigns/new'),      cta: 'Create Giveaway' },
    { done: hasActive,    icon: Rocket,        label: 'Launch & share your giveaway',       sub: 'Activate it and share the link or QR',  action: () => navigate('/embed'),              cta: 'Get Share Link' },
    { done: hasEntries,   icon: Users,         label: 'Watch entries come in',              sub: 'Monitor participants in real-time',      action: () => navigate('/participants'),       cta: 'View Entries' },
    { done: hasWinner,    icon: Trophy,        label: 'Pick a winner & announce',           sub: 'Random draw with fraud protection',      action: () => navigate('/winner'),             cta: 'Pick Winner' },
  ]

  const completedCount = steps.filter((s) => s.done).length
  if (completedCount === steps.length) return null // all done — hide

  return (
    <div className="bg-dark-800 border border-dark-500 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2"><Rocket size={14} className="text-brand-green" /> Getting Started</h2>
          <p className="text-xs text-dark-400 mt-0.5">{completedCount} of {steps.length} steps complete</p>
        </div>
        <div className="flex items-center gap-1.5">
          {steps.map((s, i) => (
            <div key={i} className={`h-1.5 w-8 rounded-full transition-colors ${s.done ? 'bg-brand-green' : 'bg-dark-600'}`} />
          ))}
        </div>
      </div>
      <div className="space-y-2">
        {steps.map((step, i) => {
          const Icon = step.icon
          const isNext = !step.done && steps.slice(0, i).every((s) => s.done)
          return (
            <div key={i} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${isNext ? 'bg-brand-green/10 border border-brand-green/30' : 'border border-transparent'}`}>
              <div className={`shrink-0 ${step.done ? 'text-brand-green' : isNext ? 'text-brand-green/60' : 'text-dark-600'}`}>
                {step.done ? <CheckCircle2 size={18} /> : <Circle size={18} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${step.done ? 'text-dark-400 line-through' : 'text-white'}`}>{step.label}</p>
                {!step.done && <p className="text-xs text-dark-500 mt-0.5">{step.sub}</p>}
              </div>
              {isNext && (
                <button
                  onClick={step.action}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-brand-green text-dark-900 font-semibold text-xs rounded-lg hover:bg-brand-green/80 transition-colors"
                >
                  {step.cta} <ChevronRight size={12} />
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const {
    campaigns, entries, activeCampaign, setActiveCampaign,
    botAlerts, dismissBotAlert, duplicateCampaign, deleteCampaign, setCampaignStatus,
    publishCampaign, endCampaign, extendCampaign, autoEndExpiredCampaigns, announceWinners, completeCampaign,
  } = useStore()

  const [search, setSearch] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [extendModal, setExtendModal] = useState(null) // campaignId
  const [extendDate, setExtendDate] = useState('')

  // Auto-end campaigns whose end date has passed
  useEffect(() => { autoEndExpiredCampaigns() }, []) // eslint-disable-line

  const validEntries  = entries.filter((e) => !e.suspicious)
  const totalEntries  = validEntries.length
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

      {/* Onboarding checklist — shown until all 4 steps complete */}
      <OnboardingChecklist campaigns={campaigns} entries={entries} navigate={navigate} />

      {/* Ended campaigns — pick winner prompt */}
      {campaigns.filter((c) => c.status === 'ended').map((c) => (
        <div key={c.id} className="bg-amber-900/20 border border-amber-700/40 rounded-xl px-5 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Trophy size={14} className="text-amber-400 shrink-0" />
              <div>
                <span className="text-sm font-semibold text-amber-400">"{c.title}" has ended</span>
                <span className="text-xs text-amber-400/70 ml-2">Ready to pick a winner</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <s-button variant="primary" icon="trophy" onClick={() => { setActiveCampaign(c); navigate('/winner') }}>
                Pick Winner
              </s-button>
              <s-button variant="secondary" onClick={() => { setExtendModal(c.id); setExtendDate(c.endDate || '') }}>
                Extend
              </s-button>
            </div>
          </div>
        </div>
      ))}

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
              <s-button variant="secondary" tone="critical" onClick={() => navigate('/bot-detection')}>
                View Details
              </s-button>
              <s-button variant="tertiary" tone="critical" icon="x-circle" accessibilityLabel="Dismiss alert" onClick={() => dismissBotAlert(botAlerts[0]?.id)} />
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
            <div className="flex-1 max-w-xs">
              <s-text-field
                label="Search campaigns"
                labelaccessibilityvisibility="hidden"
                value={search}
                placeholder="Search..."
                icon="search"
                onInput={(e) => setSearch(e.target.value)}
              />
            </div>
            <s-button variant="primary" icon="plus" onClick={() => navigate('/campaigns/new')}>
              New Giveaway
            </s-button>
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
          campaigns.length === 0 ? (
            // True empty — no campaigns at all
            <div className="py-12 px-6">
              <div className="text-center mb-8">
                <div className="w-14 h-14 rounded-2xl bg-brand-green/10 flex items-center justify-center mx-auto mb-4">
                  <Gift size={24} className="text-brand-green" />
                </div>
                <p className="text-base font-bold text-white mb-1">Create your first giveaway</p>
                <p className="text-xs text-dark-400 max-w-xs mx-auto">Launch in minutes — set a prize, pick entry methods, and share the link.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto mb-6">
                {[
                  { icon: Zap,    title: 'Quick Launch',   desc: 'Prize + dates + go live in 2 min',    action: () => navigate('/campaigns/new') },
                  { icon: QrCode, title: 'Share via QR',   desc: 'Print & place anywhere for entries',  action: () => navigate('/embed') },
                  { icon: Mail,   title: 'Email List',     desc: 'Connect Mailchimp or Klaviyo',        action: () => navigate('/settings?tab=Integrations') },
                ].map(({ icon: Icon, title, desc, action }) => (
                  <button key={title} onClick={action}
                    className="flex flex-col items-start gap-2 p-4 bg-dark-700 border border-dark-500 rounded-xl hover:border-brand-green/50 hover:bg-dark-700/80 transition-all text-left group">
                    <Icon size={16} className="text-brand-green" />
                    <p className="text-sm font-semibold text-white group-hover:text-brand-green transition-colors">{title}</p>
                    <p className="text-xs text-dark-400">{desc}</p>
                  </button>
                ))}
              </div>
              <div className="text-center">
                <s-button variant="primary" icon="plus" onClick={() => navigate('/campaigns/new')}>
                  Create Your First Giveaway
                </s-button>
              </div>
            </div>
          ) : (
            // Has campaigns but search returned nothing
            <div className="py-12 text-center px-4">
              <Search size={28} className="text-dark-600 mx-auto mb-3" />
              <p className="text-sm font-medium text-white mb-1">No results for "{search}"</p>
              <p className="text-xs text-dark-400">Try a different title or prize name</p>
            </div>
          )
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
                        <p className="text-xs text-dark-400 truncate flex items-center gap-1"><Trophy size={10} /> {camp.prize}</p>
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
                      <Trophy size={11} className="inline mr-1 shrink-0" />{camp.prize}
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
                    {['ended','winner_picked','announced','completed'].includes(camp.status) ? (
                      <span className="text-dark-500">Ended</span>
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
                    {camp.status === 'draft' && (
                      <s-button
                        variant="primary"
                        onClick={() => { publishCampaign(camp.id); setActiveCampaign({ ...camp, status: 'active' }) }}
                      >
                        Publish
                      </s-button>
                    )}
                    {camp.status === 'active' && (
                      <s-button
                        variant="secondary"
                        icon="trophy"
                        onClick={() => { endCampaign(camp.id); setActiveCampaign({ ...camp, status: 'ended' }) }}
                      >
                        End Now
                      </s-button>
                    )}
                    {camp.status === 'ended' && (
                      <>
                        <s-button
                          variant="primary"
                          icon="trophy"
                          onClick={() => { setActiveCampaign(camp); navigate('/winner') }}
                        >
                          Pick Winner
                        </s-button>
                        <s-button
                          variant="secondary"
                          onClick={() => { setExtendModal(camp.id); setExtendDate(camp.endDate || '') }}
                        >
                          Extend
                        </s-button>
                      </>
                    )}
                    {(camp.status === 'ready-to-award' || camp.status === 'winner_picked') && (
                      <>
                        <s-button
                          variant="primary"
                          icon="trophy"
                          onClick={() => { setActiveCampaign(camp); navigate('/winner') }}
                        >
                          Pick Winner
                        </s-button>
                        <s-button
                          variant="secondary"
                          onClick={() => { setActiveCampaign(camp); navigate('/winner-announcement') }}
                        >
                          Announce
                        </s-button>
                      </>
                    )}
                    {camp.status === 'announced' && (
                      <s-button
                        variant="secondary"
                        onClick={() => completeCampaign(camp.id)}
                      >
                        Mark Complete
                      </s-button>
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
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Extend campaign modal */}
      {extendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="bg-dark-800 border border-dark-500 rounded-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-white">Extend Campaign</p>
              <button onClick={() => setExtendModal(null)} className="text-dark-400 hover:text-white transition-colors"><X size={16} /></button>
            </div>
            <p className="text-xs text-dark-400">Pick a new end date to reactivate this campaign.</p>
            <input
              type="date"
              value={extendDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setExtendDate(e.target.value)}
              className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-green"
            />
            <div className="flex gap-2 justify-end">
              <s-button variant="secondary" onClick={() => setExtendModal(null)}>Cancel</s-button>
              <s-button
                variant="primary"
                disabled={!extendDate}
                onClick={() => { extendCampaign(extendModal, extendDate); setExtendModal(null) }}
              >
                Reactivate
              </s-button>
            </div>
          </div>
        </div>
      )}

      {/* Quick actions row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Analytics',       to: '/analytics',   icon: 'chart-bar' },
          { label: 'Leaderboard',     to: '/leaderboard', icon: 'trophy' },
          { label: 'Email Templates', to: '/email-editor',icon: 'email' },
          { label: 'Embed & Share',   to: '/embed',       icon: 'link' },
        ].map(({ label, to, icon }) => (
          <s-button
            key={to}
            variant="secondary"
            icon={icon}
            onClick={() => navigate(to)}
          >
            {label}
          </s-button>
        ))}
      </div>
    </div>
  )
}
