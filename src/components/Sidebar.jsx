import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Plus, Users, Trophy, Eye, Settings, Zap, Gift,
  BarChart2, Shield, Share2, Code, Megaphone, Mail, X
} from 'lucide-react'

const NAV_SECTIONS = [
  {
    label: 'Main',
    items: [
      { to: '/dashboard',      icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/campaigns/new',  icon: Plus,            label: 'New Campaign' },
      { to: '/participants',   icon: Users,           label: 'Participants' },
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
      { to: '/analytics',    icon: BarChart2, label: 'Analytics' },
      { to: '/leaderboard',  icon: Share2,    label: 'Leaderboard' },
      { to: '/bot-detection',icon: Shield,    label: 'Bot Detection' },
    ],
  },
  {
    label: 'Tools',
    items: [
      { to: '/email-editor', icon: Mail,  label: 'Email Templates' },
      { to: '/embed',        icon: Code,  label: 'Embed & Share' },
      { to: '/preview',      icon: Eye,   label: 'Landing Page' },
    ],
  },
  {
    label: 'Config',
    items: [
      { to: '/setup',    icon: Zap,      label: 'Setup Wizard' },
      { to: '/settings', icon: Settings, label: 'Settings' },
    ],
  },
]

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-dark-800 border-r border-dark-500 flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
          md:relative md:translate-x-0 md:w-56 md:shrink-0
        `}
      >
        {/* Logo + mobile close */}
        <div className="px-4 py-5 border-b border-dark-500 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-green flex items-center justify-center shrink-0">
              <Gift size={16} className="text-dark-900" />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-none">GiveShop</p>
              <p className="text-xs text-dark-400 mt-0.5">Giveaway App</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="md:hidden w-7 h-7 flex items-center justify-center text-dark-400 hover:text-white rounded-lg hover:bg-dark-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 overflow-y-auto space-y-4">
          {NAV_SECTIONS.map(({ label, items }) => (
            <div key={label}>
              <p className="px-3 mb-1 text-[10px] font-semibold text-dark-500 uppercase tracking-wider">{label}</p>
              <div className="space-y-0.5">
                {items.map(({ to, icon: Icon, label: itemLabel }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                        isActive
                          ? 'bg-brand-green/10 text-brand-green font-medium'
                          : 'text-dark-400 hover:text-white hover:bg-dark-600'
                      }`
                    }
                  >
                    <Icon size={15} />
                    {itemLabel}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Plan badge */}
        <div className="px-4 py-4 border-t border-dark-500">
          <div className="bg-dark-700 rounded-lg p-3">
            <p className="text-xs text-dark-400 mb-1">Current Plan</p>
            <p className="text-sm font-semibold text-brand-green">Pro Plan</p>
            <p className="text-xs text-dark-400 mt-1">All features unlocked</p>
          </div>
        </div>
      </aside>
    </>
  )
}
