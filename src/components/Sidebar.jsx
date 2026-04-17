import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Plus, Users, Trophy, Eye, Settings, Gift,
  BarChart2, Shield, Share2, Code, Megaphone, Mail, X, LogOut,
  Plug, ClipboardList, Upload, Globe, ChevronDown, ChevronUp, Wrench, HelpCircle, BookOpen,
} from 'lucide-react'
import { useStore } from '../store/useStore'

const MAIN_SECTIONS = [
  {
    label: 'Main',
    items: [
      { to: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/campaigns/new', icon: Plus,            label: 'New Campaign' },
      { to: '/participants',  icon: Users,           label: 'Participants' },
    ],
  },
  {
    label: 'Winner',
    items: [
      { to: '/winner',              icon: Trophy,    label: 'Pick Winner' },
      { to: '/winner-announcement', icon: Megaphone, label: 'Announce Winner' },
    ],
  },
  {
    label: 'Growth',
    items: [
      { to: '/analytics',     icon: BarChart2, label: 'Analytics' },
      { to: '/leaderboard',   icon: Share2,    label: 'Leaderboard' },
      { to: '/bot-detection', icon: Shield,    label: 'Bot Detection' },
    ],
  },
  {
    label: 'Tools',
    items: [
      { to: '/email-editor',  icon: Mail,   label: 'Email Templates' },
      { to: '/embed',         icon: Code,   label: 'Embed & Share' },
      { to: '/preview',       icon: Eye,    label: 'Landing Page' },
      { to: '/import',        icon: Upload, label: 'Import Data' },
      { to: '/custom-domain', icon: Globe,     label: 'Custom Domain' },
      { to: '/overview',      icon: BookOpen,  label: 'Project Overview' },
    ],
  },
]

const DROPDOWN_GROUPS = [
  {
    key: 'setup',
    label: 'Setup',
    icon: Settings,
    prefixes: ['/api-settings', '/integrations-setup', '/subscriptions', '/my-account', '/setup', '/settings'],
    items: [
      { to: '/api-settings',       label: 'API Settings' },
      { to: '/integrations-setup', label: 'Integrations' },
      { to: '/subscriptions',      label: 'Subscriptions' },
      { to: '/my-account',         label: 'My Account' },
    ],
  },
  {
    key: 'logs',
    label: 'Logs',
    icon: ClipboardList,
    prefixes: ['/logs/'],
    items: [
      { to: '/logs/api',           label: 'API Logs' },
      { to: '/logs/orders',        label: 'Orders' },
      { to: '/logs/notifications', label: 'Notifications' },
    ],
  },
]

function DropdownGroup({ group, onClose }) {
  const location = useLocation()
  const isAnyActive = group.prefixes.some((p) => location.pathname.startsWith(p))
  const [open, setOpen] = useState(isAnyActive)
  const Icon = group.icon

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
          isAnyActive
            ? 'text-brand-adaptive font-medium'
            : 'text-themed-subtle hover:text-themed-primary hover:bg-dark-700'
        }`}
      >
        <Icon size={15} className="shrink-0" />
        <span className="flex-1 text-left">{group.label}</span>
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      {open && (
        <div className="ml-6 mt-0.5 space-y-0.5 border-l border-dark-500 pl-3">
          {group.items.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `block px-2 py-1.5 rounded-md text-sm transition-all duration-150 ${
                  isActive
                    ? 'text-brand-adaptive font-medium'
                    : 'text-themed-subtle hover:text-themed-primary hover:bg-dark-700'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Sidebar({ open, onClose }) {
  const { user, signOut } = useStore()

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-60 bg-dark-800 border-r border-dark-500 flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
          md:relative md:translate-x-0 md:shrink-0
        `}
      >
        {/* Logo */}
        <div className="px-4 py-4 border-b border-dark-500 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-green flex items-center justify-center shrink-0 shadow-sm">
              <Gift size={15} className="text-white" style={{ color: '#064e3b' }} />
            </div>
            <div>
              <p className="text-sm font-bold text-themed-heading leading-none">GiveShop</p>
              <p className="text-[11px] text-themed-subtle mt-0.5">Giveaway App</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="md:hidden w-7 h-7 flex items-center justify-center text-themed-subtle hover:text-themed-primary hover:bg-dark-700 rounded-lg transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 overflow-y-auto space-y-5">
          {MAIN_SECTIONS.map(({ label, items }) => (
            <div key={label}>
              <p className="px-3 mb-1.5 text-[10px] font-semibold text-themed-subtle uppercase tracking-widest opacity-70">
                {label}
              </p>
              <div className="space-y-0.5">
                {items.map(({ to, icon: Icon, label: itemLabel }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                        isActive
                          ? 'active-nav-item font-medium'
                          : 'text-themed-subtle hover:text-themed-primary hover:bg-dark-700'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon size={15} className={isActive ? 'text-brand-adaptive' : ''} />
                        {itemLabel}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}

          {DROPDOWN_GROUPS.map((group) => (
            <div key={group.key}>
              <p className="px-3 mb-1.5 text-[10px] font-semibold text-themed-subtle uppercase tracking-widest opacity-70">
                {group.label}
              </p>
              <DropdownGroup group={group} onClose={onClose} />
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-3 border-t border-dark-500 space-y-2">
          <div className="bg-dark-700 rounded-xl p-3 border border-dark-500">
            <p className="text-[10px] font-medium text-themed-subtle uppercase tracking-wider mb-1">Current Plan</p>
            <p className="text-sm font-bold text-brand-adaptive">Pro Plan</p>
            <p className="text-[11px] text-themed-subtle mt-0.5">All features unlocked</p>
          </div>
          {user && (
            <div className="flex items-center justify-between gap-2 px-1">
              <p className="text-[11px] text-themed-subtle truncate">{user.email}</p>
              <button
                onClick={signOut}
                title="Sign out"
                className="shrink-0 w-7 h-7 flex items-center justify-center text-themed-subtle hover:text-red-500 hover:bg-dark-700 rounded-lg transition-colors"
              >
                <LogOut size={13} />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
