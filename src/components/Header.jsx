import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Bell, Sun, Moon, X, Shield, ChevronRight, Menu } from 'lucide-react'
import { useStore } from '../store/useStore'
import { useTheme } from '../hooks/useTheme'

const TITLES = {
  '/dashboard':            'Dashboard',
  '/campaigns/new':        'New Campaign',
  '/campaigns':            'Edit Campaign',
  '/participants':         'Participants',
  '/winner':               'Pick Winner',
  '/winner-announcement':  'Winner Announcement',
  '/preview':              'Landing Page Preview',
  '/setup':                'Setup Wizard',
  '/settings':             'Settings',
  '/analytics':            'Analytics',
  '/bot-detection':        'Bot & Fraud Detection',
  '/leaderboard':          'Referral Leaderboard',
  '/embed':                'Embed & Share',
  '/email-editor':         'Email Templates',
}

export default function Header({ onMenuToggle }) {
  const location  = useLocation()
  const navigate  = useNavigate()
  const { activeCampaign, botAlerts, dismissBotAlert } = useStore()
  const { isDark, toggle } = useTheme()
  const [notifOpen, setNotifOpen] = useState(false)

  const title = Object.entries(TITLES).find(([k]) => location.pathname.startsWith(k))?.[1] || 'GiveShop'

  return (
    <header className="h-14 bg-dark-800 border-b border-dark-500 flex items-center justify-between px-4 sm:px-6 shrink-0 relative z-30">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuToggle}
          className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg text-themed-subtle hover:text-themed-primary hover:bg-dark-700 transition-colors shrink-0"
        >
          <Menu size={18} />
        </button>

        <div className="min-w-0">
          <h1 className="text-sm font-semibold text-themed-heading truncate">{title}</h1>
          {activeCampaign && (
            <p className="text-xs text-themed-subtle mt-0.5 leading-none truncate">
              Active: <span className="text-brand-adaptive font-medium">{activeCampaign.title}</span>
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* Theme toggle */}
        <button
          onClick={toggle}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-dark-500 bg-dark-700 text-themed-subtle hover:text-themed-primary hover:border-dark-400 transition-all"
        >
          {isDark ? <Sun size={14} /> : <Moon size={14} />}
        </button>

        {/* Notification bell */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative w-8 h-8 flex items-center justify-center bg-dark-700 border border-dark-500 rounded-lg text-themed-subtle hover:text-themed-primary hover:border-dark-400 transition-all"
          >
            <Bell size={14} />
            {botAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {botAlerts.length > 9 ? '9+' : botAlerts.length}
              </span>
            )}
          </button>

          {notifOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} />
              <div className="absolute right-0 top-10 z-20 w-72 sm:w-80 bg-dark-800 border border-dark-500 rounded-xl shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-dark-500">
                  <span className="text-sm font-semibold text-themed-heading">Notifications</span>
                  {botAlerts.length > 0 && (
                    <span className="text-xs text-themed-subtle">{botAlerts.length} alert{botAlerts.length > 1 ? 's' : ''}</span>
                  )}
                </div>

                {botAlerts.length === 0 ? (
                  <div className="py-8 text-center">
                    <Bell size={24} className="text-themed-subtle mx-auto mb-2" />
                    <p className="text-sm text-themed-subtle">All clear — no alerts</p>
                  </div>
                ) : (
                  <div className="max-h-72 overflow-y-auto divide-y divide-dark-500">
                    {botAlerts.map((alert) => (
                      <div key={alert.id} className="flex items-start gap-3 px-4 py-3 hover:bg-dark-700 transition-colors">
                        <Shield size={13} className="text-red-400 mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-themed-primary truncate">{alert.message}</p>
                          <p className="text-[10px] text-themed-subtle mt-0.5">{new Date(alert.time).toLocaleTimeString()}</p>
                        </div>
                        <button onClick={() => dismissBotAlert(alert.id)} className="text-themed-subtle hover:text-red-400 transition-colors shrink-0">
                          <X size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t border-dark-500 p-2">
                  <button
                    onClick={() => { navigate('/bot-detection'); setNotifOpen(false) }}
                    className="w-full flex items-center justify-center gap-1.5 text-xs text-brand-adaptive hover:opacity-80 py-2 transition-opacity font-medium"
                  >
                    View Bot Detection <ChevronRight size={11} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
