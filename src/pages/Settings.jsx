import { useState } from 'react'
import {
  Save, Check, Eye, EyeOff, Trash2, Monitor, Lock, Key,
  Upload, RefreshCw, Copy, Plus, ExternalLink, Shield,
  BarChart2, Mail, Zap, BookOpen, AlertTriangle, CheckCircle, XCircle, Clock
} from 'lucide-react'
import { useStore } from '../store/useStore'

const TABS = ['Account', 'Security', 'Plan & Billing', 'Integrations', 'API']

const CURRENCIES = ['$ Dollar', '€ Euro', '£ Pound', 'A$ Australian Dollar', 'C$ Canadian Dollar', '¥ Japanese Yen']
const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Portuguese', 'Italian', 'Dutch', 'Japanese']
const TIMEZONES = [
  '(UTC-12:00) International Date Line West',
  '(UTC-8:00) Pacific Time (US & Canada)',
  '(UTC-7:00) Mountain Time (US & Canada)',
  '(UTC-6:00) Central Time (US & Canada)',
  '(UTC-5:00) Eastern Time (US & Canada)',
  '(UTC+0:00) London',
  '(UTC+1:00) Paris, Berlin',
  '(UTC+3:00) Moscow',
  '(UTC+5:30) Chennai, Mumbai, New Delhi',
  '(UTC+6:00) Dhaka — Asia/Dhaka',
  '(UTC+7:00) Bangkok, Hanoi',
  '(UTC+8:00) Beijing, Shanghai',
  '(UTC+9:00) Tokyo',
  '(UTC+10:00) Sydney',
  '(UTC+12:00) Auckland',
]

const PLANS = [
  {
    id: 'free', name: 'Free', price: '$0', period: '/month',
    features: ['1 active giveaway', 'Unlimited entries', 'Email entry method', 'Basic sharing', 'AppSumo branding shown'],
    cta: 'Current Plan',
  },
  {
    id: 'starter', name: 'Starter', price: '$19', period: '/month', popular: false,
    features: ['5 active giveaways', 'All entry methods', 'Custom logo / branding', 'Klaviyo & Mailchimp', 'Facebook Pixel tracking', 'Remove AppSumo branding'],
    cta: 'Upgrade',
  },
  {
    id: 'pro', name: 'Pro', price: '$49', period: '/month', popular: true,
    features: ['Unlimited giveaways', 'Everything in Starter', 'API access & webhooks', 'OAuth & access tokens', 'Custom rules & terms', 'Priority support'],
    cta: 'Upgrade',
  },
]

const inputCls = 'w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-sm text-white placeholder-dark-400 focus:outline-none focus:border-brand-green transition-colors'

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${checked ? 'bg-brand-green' : 'bg-dark-600'}`}
    >
      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${checked ? 'left-6' : 'left-1'}`} />
    </button>
  )
}

function SectionCard({ title, description, children }) {
  return (
    <div className="bg-dark-800 border border-dark-500 rounded-xl p-6">
      {(title || description) && (
        <div className="mb-4">
          {title && <h3 className="text-sm font-semibold text-white">{title}</h3>}
          {description && <p className="text-xs text-dark-400 mt-0.5">{description}</p>}
        </div>
      )}
      {children}
    </div>
  )
}

/* ─── Tab: Account ─────────────────────────────────────────── */
function AccountTab() {
  const [saved, setSaved] = useState(false)
  const [profile, setProfile] = useState({ name: 'John Doe', email: 'john@example.com', timezone: TIMEZONES[9], emailUpdates: true })
  const [defaults, setDefaults] = useState({ currency: CURRENCIES[0], language: LANGUAGES[0], offeredByName: '', offeredByUrl: '' })
  const [pw, setPw] = useState({ current: '', new: '', confirm: '' })
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false })
  const [showDelete, setShowDelete] = useState(false)

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  return (
    <div className="space-y-5">
      {/* Profile */}
      <SectionCard title="Profile" description="Your personal information and preferences.">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-dark-400 mb-1.5">Name</label>
            <input value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs text-dark-400 mb-1.5">Email</label>
            <input type="email" value={profile.email} onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs text-dark-400 mb-1.5">Default Timezone</label>
            <select value={profile.timezone} onChange={(e) => setProfile((p) => ({ ...p, timezone: e.target.value }))} className={inputCls}>
              {TIMEZONES.map((tz) => <option key={tz}>{tz}</option>)}
            </select>
            <p className="text-xs text-dark-500 mt-1">This timezone will be used as the default for new giveaways.</p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={profile.emailUpdates} onChange={() => setProfile((p) => ({ ...p, emailUpdates: !p.emailUpdates }))} className="w-4 h-4 accent-brand-green" />
            <span className="text-sm text-dark-400">Receive occasional email updates from GiveShop</span>
          </label>
        </div>
      </SectionCard>

      {/* Giveaway Defaults */}
      <SectionCard title="Giveaway Defaults" description="These settings will be used as defaults when you create new giveaways.">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs text-dark-400 mb-1.5">Currency</label>
            <select value={defaults.currency} onChange={(e) => setDefaults((d) => ({ ...d, currency: e.target.value }))} className={inputCls}>
              {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-dark-400 mb-1.5">Giveaway Language</label>
            <select value={defaults.language} onChange={(e) => setDefaults((d) => ({ ...d, language: e.target.value }))} className={inputCls}>
              {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-dark-400 mb-1.5">Offered By Name</label>
            <input value={defaults.offeredByName} onChange={(e) => setDefaults((d) => ({ ...d, offeredByName: e.target.value }))} placeholder="Your company or name" className={inputCls} />
            <p className="text-xs text-dark-500 mt-1">Displayed on your giveaway pages as the sponsor.</p>
          </div>
          <div>
            <label className="block text-xs text-dark-400 mb-1.5">Offered By URL</label>
            <input value={defaults.offeredByUrl} onChange={(e) => setDefaults((d) => ({ ...d, offeredByUrl: e.target.value }))} placeholder="https://yourwebsite.com" className={inputCls} />
          </div>
        </div>
        <button onClick={save} className="flex items-center gap-2 px-4 py-2 bg-brand-green text-dark-900 font-semibold rounded-lg text-sm hover:bg-brand-green/80 transition-colors">
          {saved ? <><Check size={13} /> Saved!</> : <><Save size={13} /> Save Changes</>}
        </button>
      </SectionCard>

      {/* Change Password */}
      <SectionCard title="Change Password" description="Update your account password.">
        <div className="space-y-4">
          {[
            { key: 'current', label: 'Current Password' },
            { key: 'new', label: 'New Password' },
            { key: 'confirm', label: 'Confirm New Password' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="block text-xs text-dark-400 mb-1.5">{label}</label>
              <div className="relative">
                <input
                  type={showPw[key] ? 'text' : 'password'}
                  value={pw[key]}
                  onChange={(e) => setPw((p) => ({ ...p, [key]: e.target.value }))}
                  className={inputCls + ' pr-10'}
                />
                <button type="button" onClick={() => setShowPw((s) => ({ ...s, [key]: !s[key] }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white">
                  {showPw[key] ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {key === 'new' && <p className="text-xs text-dark-500 mt-1">Must be 8-30 characters.</p>}
            </div>
          ))}
          <button className="flex items-center gap-2 px-4 py-2 bg-brand-green text-dark-900 font-semibold rounded-lg text-sm hover:bg-brand-green/80 transition-colors">
            <Key size={13} /> Update Password
          </button>
        </div>
      </SectionCard>

      {/* Delete Account */}
      <div className="bg-red-950/40 border border-red-900/50 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle size={14} className="text-red-400" />
          <h3 className="text-sm font-semibold text-red-400">Delete Account</h3>
        </div>
        <p className="text-xs text-dark-400 mb-3">Permanently delete your account and all associated data. This action cannot be undone.</p>
        {!showDelete ? (
          <button onClick={() => setShowDelete(true)} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-sm transition-colors">
            Delete Account
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-red-400">A notification email will be sent to your account email address. Follow the link in the email to confirm deletion.</p>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-sm transition-colors">Confirm Delete</button>
              <button onClick={() => setShowDelete(false)} className="px-4 py-2 border border-dark-500 text-dark-400 hover:text-white rounded-lg text-sm transition-colors">Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Tab: Security ────────────────────────────────────────── */
const MOCK_DEVICES = [
  { id: 1, name: 'Chrome on Windows', lastUsed: '10 minutes ago', ip: '103.111.226.46', current: true },
  { id: 2, name: 'Chrome on Windows', lastUsed: '1 month ago', ip: '103.121.39.41', current: false },
  { id: 3, name: 'Safari on iPhone', lastUsed: '3 weeks ago', ip: '202.56.78.90', current: false },
]

function SecurityTab() {
  const [deviceVerification, setDeviceVerification] = useState(true)
  const [devices, setDevices] = useState(MOCK_DEVICES)
  const [twoFactor, setTwoFactor] = useState(false)

  const removeDevice = (id) => setDevices((d) => d.filter((x) => x.id !== id))
  const removeOthers = () => setDevices((d) => d.filter((x) => x.current))

  return (
    <div className="space-y-5">
      <SectionCard title="Security Settings">
        <div className="flex items-center justify-between py-2 border border-dark-600 rounded-xl px-4">
          <div>
            <p className="text-sm font-medium text-white">Device Verification</p>
            <p className="text-xs text-dark-400">Require a verification code when signing in from a new device.</p>
          </div>
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-lg ${deviceVerification ? 'bg-brand-green text-dark-900 cursor-pointer' : 'bg-dark-600 text-dark-400 cursor-pointer'}`}
            onClick={() => setDeviceVerification((v) => !v)}>
            {deviceVerification ? 'Enabled' : 'Disabled'}
          </span>
        </div>
      </SectionCard>

      {/* Two-Factor Authentication */}
      <SectionCard title="Two-Factor Authentication" description="Add an extra layer of security to your account.">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white">{twoFactor ? 'Enabled' : 'Disabled'}</p>
            <p className="text-xs text-dark-400">Use an authenticator app to generate one-time codes.</p>
          </div>
          <Toggle checked={twoFactor} onChange={() => setTwoFactor((v) => !v)} />
        </div>
      </SectionCard>

      {/* Trusted Devices */}
      <SectionCard title="Trusted Devices" description="These devices are trusted and won't require verification when signing in.">
        <div className="space-y-2 mb-4">
          {devices.map((d) => (
            <div key={d.id} className="flex items-center gap-3 border border-dark-600 rounded-xl px-4 py-3">
              <div className="w-9 h-9 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                <Monitor size={16} className="text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-white">{d.name}</p>
                  {d.current && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-green text-dark-900">Current</span>}
                </div>
                <p className="text-xs text-dark-400">Last used {d.lastUsed} · {d.ip}</p>
              </div>
              <button
                onClick={() => !d.current && removeDevice(d.id)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${d.current ? 'border-dark-600 text-dark-600 cursor-not-allowed' : 'border-red-800 text-red-500 hover:bg-red-900/20'}`}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        {devices.filter((d) => !d.current).length > 0 && (
          <button onClick={removeOthers} className="text-sm px-4 py-2 border border-red-800 text-red-500 hover:bg-red-900/20 rounded-lg transition-colors">
            Remove all other devices
          </button>
        )}
      </SectionCard>
    </div>
  )
}

/* ─── Tab: Plan & Billing ──────────────────────────────────── */
function BillingTab() {
  const [currentPlan] = useState('free')

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {PLANS.map((p) => {
          const active = currentPlan === p.id
          return (
            <div key={p.id} className={`rounded-xl p-5 border-2 transition-all relative ${active ? 'border-brand-green bg-brand-green/5' : p.popular ? 'border-dark-400 bg-dark-700' : 'border-dark-600 bg-dark-800'}`}>
              {p.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] px-3 py-0.5 rounded-full bg-brand-green text-dark-900 font-bold whitespace-nowrap">
                  Most Popular
                </span>
              )}
              <p className="text-sm font-bold text-white">{p.name}</p>
              <p className="text-2xl font-bold text-brand-green mt-1">{p.price}<span className="text-xs font-normal text-dark-400">{p.period}</span></p>
              <ul className="mt-4 space-y-2">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-1.5 text-xs text-dark-400">
                    <span className="text-brand-green mt-0.5 shrink-0">✓</span> {f}
                  </li>
                ))}
              </ul>
              {active ? (
                <p className="mt-4 text-center text-xs text-brand-green font-semibold">Current Plan</p>
              ) : (
                <button className="mt-4 w-full py-2 bg-brand-green text-dark-900 font-semibold text-sm rounded-lg hover:bg-brand-green/80 transition-colors">
                  {p.cta}
                </button>
              )}
            </div>
          )
        })}
      </div>

      <SectionCard title="Billing Information" description="Manage your payment method and invoices.">
        <div className="flex flex-col items-center gap-3 py-6 border border-dashed border-dark-500 rounded-xl">
          <p className="text-sm text-dark-400">You are on the Free plan — no billing information required.</p>
          <button className="flex items-center gap-2 px-4 py-2 bg-brand-green text-dark-900 font-semibold rounded-lg text-sm hover:bg-brand-green/80 transition-colors">
            <Plus size={13} /> Upgrade to Starter
          </button>
        </div>
      </SectionCard>
    </div>
  )
}

/* ─── Tab: Integrations ────────────────────────────────────── */
const EMAIL_INTEGRATIONS = [
  { id: 'sendfox',    name: 'SendFox',        logo: '📧', description: 'A better, more affordable email tool.',          placeholder: 'SendFox API key' },
  { id: 'zapier',     name: 'Zapier',          logo: '⚡', description: 'Automate GiveShop with 5,000+ apps.',            placeholder: 'Zapier webhook URL' },
  { id: 'mailchimp',  name: 'Mailchimp',       logo: '🐵', description: 'Sync new entrants to your Mailchimp lists.',     placeholder: 'Mailchimp API key' },
  { id: 'klaviyo',    name: 'Klaviyo',         logo: '📊', description: 'Sync entrants to Klaviyo flows and lists.',      placeholder: 'Klaviyo private API key' },
  { id: 'convertkit', name: 'ConvertKit',      logo: '✉️', description: 'Add entrants directly to ConvertKit sequences.', placeholder: 'ConvertKit API key' },
  { id: 'activecamp', name: 'ActiveCampaign',  logo: '🎯', description: 'Sync contacts and automate follow-ups.',         placeholder: 'ActiveCampaign API key' },
]

const STATUS_ICON = {
  connected: <CheckCircle size={13} className="text-brand-green" />,
  error:     <XCircle    size={13} className="text-red-400" />,
  idle:      <Clock      size={13} className="text-dark-500" />,
}

function IntegrationsTab() {
  const { integrationConnections, integrationHealth, connectIntegration, disconnectIntegration, trackingPixels, saveTrackingPixels, webhookConfig, saveWebhook } = useStore()
  const [customLogo, setCustomLogo] = useState(null)
  const [pixels, setPixels] = useState({ fbPixelId: trackingPixels?.fbPixelId || '', gaId: trackingPixels?.gaId || '', gtmId: trackingPixels?.gtmId || '' })
  const [pixelSaved, setPixelSaved] = useState(false)
  const [webhook, setWebhook] = useState({ url: webhookConfig?.url || '', events: webhookConfig?.events || { 'entry.created': true, 'winner.picked': true, 'campaign.ended': false }, secret: webhookConfig?.secret || '' })
  const [webhookSaved, setWebhookSaved] = useState(false)
  const [apiInputs, setApiInputs] = useState({})
  const [expandedService, setExpandedService] = useState(null)
  const [testingWebhook, setTestingWebhook] = useState(false)

  const handleSavePixels = () => {
    saveTrackingPixels(pixels)
    setPixelSaved(true)
    setTimeout(() => setPixelSaved(false), 2000)
  }

  const handleSaveWebhook = () => {
    saveWebhook(webhook)
    setWebhookSaved(true)
    setTimeout(() => setWebhookSaved(false), 2000)
  }

  const handleTestWebhook = () => {
    if (!webhook.url) return
    setTestingWebhook(true)
    setTimeout(() => setTestingWebhook(false), 1500)
  }

  const handleConnect = (id) => {
    const key = apiInputs[id] || ''
    if (!key.trim()) { setExpandedService(id); return }
    connectIntegration(id, { apiKey: key.replace(/.(?=.{4})/g, '•'), syncEnabled: true })
    setExpandedService(null)
    setApiInputs((p) => ({ ...p, [id]: '' }))
  }

  const handleDisconnect = (id) => {
    disconnectIntegration(id)
    setExpandedService(null)
  }

  return (
    <div className="space-y-5">
      {/* Branding */}
      <SectionCard title="Branding" description="Upload your own logo to appear in the footer of giveaways and related emails.">
        {customLogo ? (
          <div className="flex items-center gap-3 border border-dark-500 rounded-xl p-3">
            <img src={URL.createObjectURL(customLogo)} alt="logo" className="h-10 object-contain" />
            <p className="text-sm text-white flex-1">{customLogo.name}</p>
            <button onClick={() => setCustomLogo(null)} className="text-xs text-red-400 hover:text-red-300 transition-colors">Remove</button>
          </div>
        ) : (
          <label className="flex flex-col items-center gap-2 border-2 border-dashed border-dark-500 rounded-xl py-6 cursor-pointer hover:border-brand-green/50 transition-colors">
            <Upload size={20} className="text-dark-400" />
            <span className="text-sm text-dark-400">Upload Logo</span>
            <span className="text-xs text-dark-500">PNG, SVG recommended · max 1MB</span>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => setCustomLogo(e.target.files?.[0] || null)} />
          </label>
        )}
      </SectionCard>

      {/* Email Integrations */}
      <SectionCard title="Email Integrations" description="Sync new contestants to your ESP automatically after every entry.">
        <div className="space-y-2">
          {EMAIL_INTEGRATIONS.map(({ id, name, logo, description, placeholder }) => {
            const conn = integrationConnections?.[id]
            const health = integrationHealth?.[id]
            const isConnected = conn?.connected
            const isExpanded = expandedService === id

            return (
              <div key={id} className={`border rounded-xl transition-colors ${isConnected ? 'border-brand-green/20 bg-brand-green/5' : 'border-dark-600'}`}>
                <div className="flex items-center gap-3 px-4 py-3">
                  <span className="text-xl shrink-0">{logo}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white">{name}</p>
                      {health && STATUS_ICON[health.status]}
                      {isConnected && health?.lastSync && (
                        <span className="text-[10px] text-dark-500">Synced {new Date(health.lastSync).toLocaleDateString()}</span>
                      )}
                    </div>
                    <p className="text-xs text-dark-400">{description}</p>
                  </div>
                  {isConnected ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-brand-green font-medium">Connected</span>
                      <button
                        onClick={() => handleDisconnect(id)}
                        className="text-xs px-3 py-1.5 border border-dark-500 text-dark-400 hover:text-red-400 hover:border-red-800/50 rounded-lg transition-colors"
                      >
                        Disconnect
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setExpandedService(isExpanded ? null : id)}
                      className="text-xs font-semibold px-4 py-1.5 bg-brand-green text-dark-900 hover:bg-brand-green/80 rounded-lg transition-colors shrink-0"
                    >
                      Connect
                    </button>
                  )}
                </div>
                {isExpanded && !isConnected && (
                  <div className="px-4 pb-4 flex gap-2">
                    <input
                      autoFocus
                      value={apiInputs[id] || ''}
                      onChange={(e) => setApiInputs((p) => ({ ...p, [id]: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && handleConnect(id)}
                      placeholder={placeholder}
                      className={`${inputCls} flex-1`}
                    />
                    <button onClick={() => handleConnect(id)} className="px-4 py-2 bg-brand-green text-dark-900 font-semibold text-sm rounded-lg hover:bg-brand-green/80 transition-colors shrink-0">
                      Save
                    </button>
                    <button onClick={() => setExpandedService(null)} className="px-3 py-2 border border-dark-500 text-dark-400 rounded-lg text-sm hover:text-white transition-colors">
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </SectionCard>

      {/* Tracking Pixels */}
      <SectionCard title="Tracking Pixels" description="Add tracking pixels to measure conversions and audience growth.">
        <div className="space-y-3">
          {[
            { key: 'fbPixelId', label: 'Facebook / Meta Pixel ID', placeholder: 'e.g. 123456789012345' },
            { key: 'gaId',      label: 'Google Analytics Measurement ID', placeholder: 'e.g. G-XXXXXXXXXX' },
            { key: 'gtmId',     label: 'Google Tag Manager ID', placeholder: 'e.g. GTM-XXXXXXX' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-xs text-dark-400 mb-1.5">{label}</label>
              <input
                value={pixels[key]}
                onChange={(e) => setPixels((p) => ({ ...p, [key]: e.target.value }))}
                placeholder={placeholder}
                className={inputCls}
              />
            </div>
          ))}
          <button onClick={handleSavePixels} className="flex items-center gap-2 px-4 py-2 bg-brand-green text-dark-900 font-semibold rounded-lg text-sm hover:bg-brand-green/80 transition-colors">
            {pixelSaved ? <><Check size={13} />Saved!</> : <><Save size={13} />Save Pixels</>}
          </button>
        </div>
      </SectionCard>

      {/* Webhooks */}
      <SectionCard title="Webhooks" description="Receive real-time POST requests to your server on key events.">
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-dark-400 mb-1.5">Endpoint URL</label>
            <input
              value={webhook.url}
              onChange={(e) => setWebhook((w) => ({ ...w, url: e.target.value }))}
              placeholder="https://your-server.com/webhook"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs text-dark-400 mb-2">Events to send</label>
            <div className="flex flex-wrap gap-3">
              {Object.keys(webhook.events).map((event) => (
                <label key={event} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={webhook.events[event]}
                    onChange={(e) => setWebhook((w) => ({ ...w, events: { ...w.events, [event]: e.target.checked } }))}
                    className="w-3.5 h-3.5 accent-brand-green"
                  />
                  <span className="text-xs text-dark-300 font-mono">{event}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs text-dark-400 mb-1.5">Signing Secret <span className="text-dark-600 font-normal">(optional — used to verify payloads)</span></label>
            <input
              value={webhook.secret}
              onChange={(e) => setWebhook((w) => ({ ...w, secret: e.target.value }))}
              placeholder="whsec_..."
              className={inputCls}
            />
          </div>
          <div className="flex gap-2">
            <button onClick={handleSaveWebhook} className="flex items-center gap-2 px-4 py-2 bg-brand-green text-dark-900 font-semibold rounded-lg text-sm hover:bg-brand-green/80 transition-colors">
              {webhookSaved ? <><Check size={13} />Saved!</> : <><Save size={13} />Save Webhook</>}
            </button>
            {webhook.url && (
              <button onClick={handleTestWebhook} className="flex items-center gap-2 px-4 py-2 border border-dark-500 text-dark-400 hover:text-white rounded-lg text-sm transition-colors">
                {testingWebhook ? <><RefreshCw size={13} className="animate-spin" />Sending...</> : <><Zap size={13} />Send Test</>}
              </button>
            )}
          </div>
          {webhookSaved && (
            <p className="text-xs text-brand-green">Webhook configuration saved. Events will be delivered to your endpoint.</p>
          )}
        </div>
      </SectionCard>
    </div>
  )
}

/* ─── Tab: API ─────────────────────────────────────────────── */
function ApiTab() {
  const [apiKey] = useState('gsh_live_a8f3k2j9d1m7n4p6q0r5s8t2u3v1w9x')
  const [copied, setCopied] = useState(false)
  const [showKey, setShowKey] = useState(false)

  const copyKey = () => {
    navigator.clipboard.writeText(apiKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-5">
      {/* API Secret */}
      <SectionCard title="API Secret" description="Use this key to authenticate your API requests. Keep it private.">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <input
                readOnly
                value={showKey ? apiKey : '•'.repeat(apiKey.length)}
                className={inputCls + ' font-mono pr-20'}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                <button type="button" onClick={() => setShowKey((v) => !v)} className="p-1.5 text-dark-400 hover:text-white rounded transition-colors">
                  {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
                <button type="button" onClick={copyKey} className="p-1.5 text-dark-400 hover:text-white rounded transition-colors">
                  {copied ? <Check size={13} className="text-brand-green" /> : <Copy size={13} />}
                </button>
              </div>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-2 bg-dark-700 border border-dark-500 text-dark-400 hover:text-white rounded-lg text-xs transition-colors">
              <RefreshCw size={12} /> Regenerate
            </button>
          </div>
          <p className="text-xs text-red-400/70">Never share your API key. Regenerating it will invalidate the current key.</p>
        </div>
      </SectionCard>

      {/* OAuth & Access Tokens */}
      <SectionCard title="OAuth & Access Tokens" description="Manage OAuth clients and personal access tokens for API integrations.">
        <div className="space-y-3">
          <div className="border border-dark-600 rounded-xl divide-y divide-dark-600">
            {[
              { name: 'My Integration App', scopes: 'read:entries write:campaigns', created: '2026-03-01' },
            ].map((token) => (
              <div key={token.name} className="flex items-center gap-3 px-4 py-3">
                <Key size={14} className="text-brand-green shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{token.name}</p>
                  <p className="text-xs text-dark-400">Scopes: {token.scopes} · Created {token.created}</p>
                </div>
                <button className="text-xs text-red-400 hover:text-red-300 border border-red-900/50 px-3 py-1.5 rounded-lg transition-colors">Revoke</button>
              </div>
            ))}
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-brand-green text-dark-900 font-semibold rounded-lg text-sm hover:bg-brand-green/80 transition-colors">
            <Plus size={13} /> Create New Token
          </button>
        </div>
      </SectionCard>

      {/* Documentation */}
      <SectionCard title="Documentation" description="Learn how to integrate with the GiveShop API.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { title: 'REST API Reference', desc: 'Full endpoint documentation for campaigns, entries, and winners.', icon: BookOpen },
            { title: 'Webhooks Guide', desc: 'Learn how to receive real-time events from GiveShop.', icon: Zap },
            { title: 'OAuth 2.0 Setup', desc: 'Connect your app using the OAuth 2.0 authorization flow.', icon: Shield },
            { title: 'SDK Libraries', desc: 'Official SDKs for JavaScript, Python, PHP, and more.', icon: Lock },
          ].map(({ title, desc, icon: Icon }) => (
            <div key={title} className="flex items-start gap-3 border border-dark-600 rounded-xl p-4 hover:border-brand-green/40 transition-colors cursor-pointer group">
              <Icon size={15} className="text-brand-green shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-white group-hover:text-brand-green transition-colors">{title}</p>
                <p className="text-xs text-dark-400 mt-0.5">{desc}</p>
              </div>
              <ExternalLink size={12} className="text-dark-500 shrink-0 mt-0.5 ml-auto" />
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}

/* ─── Main Settings Page ───────────────────────────────────── */
export default function Settings() {
  const [activeTab, setActiveTab] = useState('Account')

  return (
    <div className="max-w-3xl">
      {/* Tab Bar */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
              activeTab === tab
                ? 'bg-brand-green text-dark-900 border-brand-green'
                : 'border-dark-500 text-dark-400 hover:text-white hover:border-dark-400'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Account' && <AccountTab />}
      {activeTab === 'Security' && <SecurityTab />}
      {activeTab === 'Plan & Billing' && <BillingTab />}
      {activeTab === 'Integrations' && <IntegrationsTab />}
      {activeTab === 'API' && <ApiTab />}
    </div>
  )
}
