import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Mail, Upload, Lock, Plus, ChevronRight, ChevronUp, ChevronDown,
  Shield, Zap, PlugZap, FileText, MapPin, UserCheck, Share2, FlaskConical, Sliders, Trash2, Sparkles, Loader2
} from 'lucide-react'
import { generateTitle, generateDescription, generateRules } from '../lib/groq'

// Minimal inline brand icons (no external dependency)
const BrandIcon = ({ letter, color }) => (
  <span className="text-xs font-bold" style={{ color }}>{letter}</span>
)
import { useStore } from '../store/useStore'

const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'New Zealand',
  'Germany', 'France', 'Netherlands', 'Spain', 'Italy', 'Sweden', 'Norway',
  'Denmark', 'Finland', 'Switzerland', 'Austria', 'Belgium', 'Ireland',
  'Singapore', 'Japan', 'South Korea', 'India', 'Brazil', 'Mexico',
]

const CUSTOM_FIELD_TYPES = ['text', 'number', 'email', 'phone', 'address', 'dropdown', 'checkbox']

const TIMEZONES = [
  'Pacific/Midway', 'US/Hawaii', 'US/Alaska', 'US/Pacific', 'US/Mountain',
  'US/Central', 'US/Eastern', 'America/Sao_Paulo', 'Atlantic/Azores',
  'Europe/London', 'Europe/Paris', 'Europe/Helsinki', 'Asia/Dubai',
  'Asia/Kolkata', 'Asia/Dhaka', 'Asia/Bangkok', 'Asia/Shanghai',
  'Asia/Tokyo', 'Australia/Sydney', 'Pacific/Auckland',
]

const SHARING_PLATFORMS = [
  { key: 'twitter',   label: 'X',  bg: 'bg-black/80',        text: 'text-white' },
  { key: 'facebook',  label: 'f',  bg: 'bg-blue-600',        text: 'text-white' },
  { key: 'instagram', label: '📷', bg: 'bg-pink-500',         text: 'text-white' },
  { key: 'messenger', label: 'm',  bg: 'bg-blue-400',        text: 'text-white' },
  { key: 'linkedin',  label: 'in', bg: 'bg-blue-700',        text: 'text-white' },
  { key: 'pinterest', label: 'P',  bg: 'bg-red-600',         text: 'text-white' },
  { key: 'email',     label: '✉',  bg: 'bg-dark-600',        text: 'text-dark-300' },
]

const ENTRY_ACTION_GROUPS = [
  {
    label: 'Social Follow',
    options: ['Facebook Like', 'Instagram Follow', 'X Follow', 'YouTube Subscribe', 'Podcast Subscribe'],
  },
  {
    label: 'Other',
    options: ['Daily Entries', 'Click a Link', 'Watch a YouTube Video', 'Phone Number', 'Answer a Question', 'Refer a Friend', 'Leave a Review'],
  },
]

// Per-action field configuration
const ENTRY_ACTION_CONFIG = {
  'Facebook Like':         { urlLabel: 'Facebook Page URL',  urlPlaceholder: 'https://facebook.com', defaultText: 'Like us on Facebook!',               locked: false },
  'Instagram Follow':      { urlLabel: 'Instagram Username', urlPlaceholder: '',                     defaultText: 'Follow me on Instagram!',             locked: false },
  'X Follow':              { urlLabel: 'X Username',         urlPlaceholder: '',                     defaultText: 'Follow me on X!',                    locked: false },
  'YouTube Subscribe':     { urlLabel: 'YouTube Channel URL',urlPlaceholder: 'http://youtube.com/', defaultText: 'Subscribe to my channel on YouTube', locked: false },
  'Podcast Subscribe':     { urlLabel: 'Podcast URL',        urlPlaceholder: '',                     defaultText: 'Subscribe to my podcast!',           locked: false },
  'Daily Entries':         { urlLabel: null,                 urlPlaceholder: '',                     defaultText: 'Click here every day for more entries', locked: false },
  'Click a Link':          { urlLabel: 'Action URL',         urlPlaceholder: 'http://',              defaultText: 'Visit our site!',                    locked: false },
  'Watch a YouTube Video': { urlLabel: 'YouTube Video URL',  urlPlaceholder: 'http://youtube.com/', defaultText: 'Watch my YouTube video!',            locked: false },
  'Phone Number':          { urlLabel: null,                 urlPlaceholder: '',                     defaultText: 'Enter your phone number',            locked: false },
  'Answer a Question':     { urlLabel: null,                 urlPlaceholder: '',                     defaultText: 'Answer a question',                  locked: false },
  'Refer a Friend':        { urlLabel: null,                 urlPlaceholder: '',                     defaultText: 'Refer a friend',                     locked: false },
  'Leave a Review':        { urlLabel: 'Review URL',         urlPlaceholder: '',                     defaultText: 'Leave a review',                     locked: false },
}

const DEFAULT_ENTRY_ACTIONS = Object.entries(ENTRY_ACTION_CONFIG).map(([type, cfg], i) => ({
  id: i + 1,
  type,
  label: type,
  actionText: cfg.defaultText,
  url: '',
  entries: 2,
}))

function SectionHeader({ number, icon: Icon, title }) {
  return (
    <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
      <span className="w-5 h-5 rounded-full bg-brand-green text-dark-900 text-xs font-bold flex items-center justify-center shrink-0">
        {number}
      </span>
      {Icon && <Icon size={15} className="text-brand-green shrink-0" />}
      {title}
    </h2>
  )
}

function InputField({ label, required, error, children }) {
  return (
    <div>
      <label className="block text-xs text-dark-400 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  )
}

const inputCls =
  'w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-sm text-white placeholder-dark-400 focus:outline-none focus:border-brand-green transition-colors'

export default function CampaignBuilder() {
  const navigate = useNavigate()
  const { createCampaign } = useStore()

  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  const localDT = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`
  const awardedDT = new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000)
  const awardedStr = `${awardedDT.getFullYear()}-${pad(awardedDT.getMonth() + 1)}-${pad(awardedDT.getDate())}T${pad(awardedDT.getHours())}:${pad(awardedDT.getMinutes())}`
  const endDT = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const endStr = `${endDT.getFullYear()}-${pad(endDT.getMonth() + 1)}-${pad(endDT.getDate())}T${pad(endDT.getHours())}:${pad(endDT.getMinutes())}`

  const [form, setForm] = useState({
    // Section 1
    title: '',
    description: '',
    startsAt: localDT,
    endsAt: endStr,
    awardedAt: awardedStr,
    numberOfWinners: 1,
    timezone: 'Asia/Dhaka',
    runnerName: '',
    runnerUrl: '',
    prizeName: '',
    prizeValue: '',
    prizeImage: null,
    contestantsProvide: { email: true, name: false, phone: false },
    // Section 2 – sharing
    sharing: { twitter: true, facebook: true, instagram: true, messenger: true, linkedin: true, pinterest: true, email: true },
    // Section 3 – bonus entries
    entryActions: [],
    // Section 6 – reCAPTCHA
    recaptcha: true,
    // Section 5 – rules and terms
    rulesText: '',
    termsUrl: '',
    eligibility: '',
    // Section 7 – marketing consent
    marketingConsent: false,
    // Section 8 – password protection
    passwordProtected: false,
    password: '',
    // Section 9 – geo restrictions
    geoEnabled: false,
    allowedCountries: [],
    // Section 10 – age verification
    ageVerification: false,
    minimumAge: 18,
    ageConsentText: 'I confirm I am 18 years of age or older.',
    // Section 11 – referral tracking
    referralEnabled: true,
    referralBonusEntries: 2,
    // Section 12 – A/B test
    abTestEnabled: false,
    abVariantA: { name: 'Variant A', description: '' },
    abVariantB: { name: 'Variant B', description: '' },
    abSplit: 50,
    // Section 13 – custom fields
    customFields: [],
  })

  const [errors, setErrors] = useState({})
  const [aiLoading, setAiLoading] = useState({ title: false, description: false, rules: false })
  const [aiError, setAiError] = useState('')

  const handleGenerateTitle = async () => {
    setAiLoading((s) => ({ ...s, title: true }))
    setAiError('')
    set('title', '')
    try {
      await generateTitle(
        { prizeName: form.prizeName, prizeValue: form.prizeValue, runnerName: form.runnerName },
        (chunk) => setForm((f) => ({ ...f, title: f.title + chunk }))
      )
    } catch (e) {
      setAiError(e.message || 'AI generation failed')
    } finally {
      setAiLoading((s) => ({ ...s, title: false }))
    }
  }

  const handleGenerateDescription = async () => {
    setAiLoading((s) => ({ ...s, description: true }))
    setAiError('')
    set('description', '')
    try {
      await generateDescription(
        { title: form.title, prizeName: form.prizeName, prizeValue: form.prizeValue, runnerName: form.runnerName, startsAt: form.startsAt, endsAt: form.endsAt },
        (chunk) => setForm((f) => ({ ...f, description: f.description + chunk }))
      )
    } catch (e) {
      setAiError(e.message || 'AI generation failed')
    } finally {
      setAiLoading((s) => ({ ...s, description: false }))
    }
  }

  const handleGenerateRules = async () => {
    setAiLoading((s) => ({ ...s, rules: true }))
    setAiError('')
    set('rulesText', '')
    try {
      await generateRules(
        { prizeName: form.prizeName, runnerName: form.runnerName, runnerUrl: form.runnerUrl, endsAt: form.endsAt, minimumAge: form.minimumAge, ageVerification: form.ageVerification, geoEnabled: form.geoEnabled, allowedCountries: form.allowedCountries },
        (chunk) => setForm((f) => ({ ...f, rulesText: f.rulesText + chunk }))
      )
    } catch (e) {
      setAiError(e.message || 'AI generation failed')
    } finally {
      setAiLoading((s) => ({ ...s, rules: false }))
    }
  }

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }))

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Title is required'
    if (!form.prizeName.trim()) e.prizeName = 'Prize name is required'
    if (!form.endsAt) e.endsAt = 'End date is required'
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    createCampaign({
      title: form.title,
      prize: form.prizeName,
      prizeValue: form.prizeValue,
      description: form.description,
      startDate: form.startsAt?.split('T')[0],
      endDate: form.endsAt?.split('T')[0],
      entryMethods: { email: true, instagram: form.sharing.instagram, share: true, visit: false, tiktok: false, purchase: false },
      entryValues: { email: 1, instagram: 2, tiktok: 2, share: 3, visit: 1, purchase: 5 },
      fraudDetection: { blockDuplicateIP: true, blockDuplicateEmail: true, recaptcha: form.recaptcha },
      branding: { showPoweredBy: true, customColor: '#00d084', storeName: form.runnerName },
    })
    navigate('/dashboard')
  }

  const addEntryAction = (action) => {
    if (!action) return
    const cfg = ENTRY_ACTION_CONFIG[action] || { defaultText: action }
    setForm((f) => ({
      ...f,
      entryActions: [
        ...f.entryActions,
        { id: Date.now(), type: action, label: action, actionText: cfg.defaultText, url: '', entries: 2 },
      ],
    }))
  }

  const removeEntryAction = (id) =>
    setForm((f) => ({ ...f, entryActions: f.entryActions.filter((a) => a.id !== id) }))

  const updateEntryAction = (id, field, value) =>
    setForm((f) => ({
      ...f,
      entryActions: f.entryActions.map((a) => (a.id === id ? { ...a, [field]: value } : a)),
    }))

  const moveEntryAction = (id, dir) =>
    setForm((f) => {
      const arr = [...f.entryActions]
      const idx = arr.findIndex((a) => a.id === id)
      const target = idx + dir
      if (target < 0 || target >= arr.length) return f
      ;[arr[idx], arr[target]] = [arr[target], arr[idx]]
      return { ...f, entryActions: arr }
    })

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">

      {aiError && (
        <div className="bg-red-500/10 border border-red-500/40 text-red-400 text-sm rounded-lg px-4 py-3">
          <strong>AI Error:</strong> {aiError}
        </div>
      )}

      {/* ── 1. Giveaway Information ── */}
      <div className="bg-dark-800 border border-dark-500 rounded-xl p-6">
        <SectionHeader number="1" title="Giveaway Information" />

        {/* Competition Information heading */}
        <p className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-3">Competition information</p>

        <div className="space-y-4">
          {/* Title */}
          <InputField label="Title" required error={errors.title}>
            <div className="flex justify-end mb-1">
              <button
                type="button"
                onClick={handleGenerateTitle}
                disabled={aiLoading.title}
                className="flex items-center gap-1.5 text-xs font-medium text-brand-green hover:text-brand-green/80 disabled:opacity-50 transition-colors"
              >
                {aiLoading.title
                  ? <><Loader2 size={13} className="animate-spin" /> Generating…</>
                  : <><Sparkles size={13} /> Generate with AI</>}
              </button>
            </div>
            <input value={form.title} onChange={(e) => set('title', e.target.value)} className={inputCls} />
          </InputField>

          {/* Description with simple toolbar */}
          <InputField label="Description" required={false}>
            <div className="flex justify-end mb-1">
              <button
                type="button"
                onClick={handleGenerateDescription}
                disabled={aiLoading.description}
                className="flex items-center gap-1.5 text-xs font-medium text-brand-green hover:text-brand-green/80 disabled:opacity-50 transition-colors"
              >
                {aiLoading.description
                  ? <><Loader2 size={13} className="animate-spin" /> Generating…</>
                  : <><Sparkles size={13} /> Generate with AI</>}
              </button>
            </div>
            <div className="border border-dark-500 rounded-lg overflow-hidden">
              <div className="flex items-center gap-1 px-2 py-1.5 border-b border-dark-500 bg-dark-700">
                <select className="text-xs bg-transparent text-dark-400 focus:outline-none mr-1">
                  <option>Normal</option><option>Heading 1</option><option>Heading 2</option>
                </select>
                {['i','B','I','U','S'].map((t) => (
                  <button key={t} type="button" className="w-6 h-6 text-xs text-dark-400 hover:text-white rounded hover:bg-dark-600 flex items-center justify-center font-medium transition-colors">
                    {t}
                  </button>
                ))}
                <div className="w-px h-4 bg-dark-500 mx-1" />
                {['≡','#','⇤'].map((t) => (
                  <button key={t} type="button" className="w-6 h-6 text-xs text-dark-400 hover:text-white rounded hover:bg-dark-600 flex items-center justify-center transition-colors">
                    {t}
                  </button>
                ))}
              </div>
              <textarea
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                rows={4}
                className="w-full bg-dark-700 px-3 py-2 text-sm text-white placeholder-dark-400 focus:outline-none resize-none"
              />
            </div>
          </InputField>

          {/* Starts At / Ends At */}
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Starts At" required>
              <input type="datetime-local" value={form.startsAt} onChange={(e) => set('startsAt', e.target.value)} className={inputCls} />
            </InputField>
            <InputField label="Ends At" required error={errors.endsAt}>
              <input type="datetime-local" value={form.endsAt} onChange={(e) => set('endsAt', e.target.value)} className={inputCls} />
            </InputField>
          </div>

          {/* Awarded At / Number of Winners */}
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Awarded At" required>
              <input type="datetime-local" value={form.awardedAt} onChange={(e) => set('awardedAt', e.target.value)} className={inputCls} />
            </InputField>
            <InputField label="Number of Winners" required>
              <input
                type="number" min="1" value={form.numberOfWinners}
                onChange={(e) => set('numberOfWinners', parseInt(e.target.value) || 1)}
                className={inputCls}
              />
            </InputField>
          </div>

          {/* Timezone */}
          <InputField label="Timezone">
            <select value={form.timezone} onChange={(e) => set('timezone', e.target.value)} className={inputCls}>
              {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
            </select>
          </InputField>

          {/* Who's Running This Giveaway? */}
          <div>
            <p className="text-xs font-semibold text-white mb-2">Who's Running This Giveaway?</p>
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Name" required>
                <input value={form.runnerName} onChange={(e) => set('runnerName', e.target.value)} className={inputCls} />
              </InputField>
              <InputField label="URL" required>
                <input value={form.runnerUrl} onChange={(e) => set('runnerUrl', e.target.value)} placeholder="http://" className={inputCls} />
              </InputField>
            </div>
          </div>

          {/* What Are You Giving Away? */}
          <div>
            <p className="text-xs font-semibold text-white mb-2">What Are You Giving Away?</p>
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Prize Name" required error={errors.prizeName}>
                <input value={form.prizeName} onChange={(e) => set('prizeName', e.target.value)} className={inputCls} />
              </InputField>
              <InputField label="Prize Value" required>
                <div className="relative">
                  <input value={form.prizeValue} onChange={(e) => set('prizeValue', e.target.value)} className={inputCls + ' pr-8'} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 text-sm">$</span>
                </div>
              </InputField>
            </div>
          </div>

          {/* Prize Images */}
          <div>
            <label className="block text-xs text-dark-400 mb-1.5">
              Prize Images <span className="text-dark-500 font-normal">Tip: use images with a 2×1 ratio (minimum of 640px width)</span>
            </label>
            <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-dark-500 rounded-xl py-6 cursor-pointer hover:border-brand-green/50 transition-colors bg-dark-700">
              <Upload size={20} className="text-dark-400" />
              <span className="text-xs text-dark-400">Add Cover Image</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => set('prizeImage', e.target.files?.[0] || null)} />
            </label>
          </div>

          {/* Contestants Must Provide */}
          <div>
            <p className="text-xs font-semibold text-white mb-2">Contestants Must Provide:</p>
            <div className="flex items-center gap-6">
              {[
                { key: 'email', label: 'Email' },
                { key: 'name', label: 'Name' },
                { key: 'phone', label: 'Phone Number' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.contestantsProvide[key]}
                    onChange={() => setForm((f) => ({ ...f, contestantsProvide: { ...f.contestantsProvide, [key]: !f.contestantsProvide[key] } }))}
                    className="w-4 h-4 accent-brand-green"
                  />
                  <span className="text-sm text-dark-400">{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Sharing ── */}
      <div className="bg-dark-800 border border-dark-500 rounded-xl p-6">
        <SectionHeader number="2" title="Sharing" />
        <p className="text-xs text-dark-400 mb-4">Click to select the platforms you want your contestants to use to share your giveaway.</p>
        <div className="flex items-center gap-3 flex-wrap">
          {SHARING_PLATFORMS.map(({ key, label, bg, text }) => {
            const active = form.sharing[key]
            return (
              <button
                key={key}
                type="button"
                onClick={() => setForm((f) => ({ ...f, sharing: { ...f.sharing, [key]: !f.sharing[key] } }))}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border-2 text-sm font-bold ${
                  active ? `border-brand-green ${bg} ${text}` : 'border-dark-500 bg-dark-700 text-dark-500'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── 3. Bonus Entries ── */}
      <div className="bg-dark-800 border border-dark-500 rounded-xl p-6">
        <SectionHeader number="3" icon={Zap} title="Bonus Entries" />
        <p className="text-xs text-dark-400 mb-4">These are actions a contestant can take to get even more entries.</p>

        {/* Expanded entry action cards */}
        <div className="space-y-3 mb-4">
          {form.entryActions.map((action, idx) => {
            const cfg = ENTRY_ACTION_CONFIG[action.type] || {}
            const isFirst = idx === 0
            const isLast = idx === form.entryActions.length - 1

            return (
              <div key={action.id} className="border border-dark-500 rounded-lg overflow-hidden">
                {/* Card header */}
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-dark-500 bg-dark-700">
                  <div className="flex flex-col mr-1">
                    <button type="button" onClick={() => moveEntryAction(action.id, -1)} disabled={isFirst} className="text-dark-500 hover:text-white disabled:opacity-30 leading-none"><ChevronUp size={13} /></button>
                    <button type="button" onClick={() => moveEntryAction(action.id, 1)} disabled={isLast} className="text-dark-500 hover:text-white disabled:opacity-30 leading-none"><ChevronDown size={13} /></button>
                  </div>
                  <span className="text-sm font-semibold text-white flex-1">{action.label}</span>
                  <button type="button" onClick={() => removeEntryAction(action.id)} className="text-dark-400 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                </div>

                {/* Card fields */}
                <div className="p-4 bg-dark-800 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="Action Text" required>
                      <input
                        type="text"
                        value={action.actionText}
                        onChange={(e) => updateEntryAction(action.id, 'actionText', e.target.value)}
                        placeholder={cfg.defaultText || action.label}
                        className={inputCls}
                      />
                    </InputField>
                    {cfg.urlLabel && (
                      <InputField label={cfg.urlLabel} required>
                        <input
                          type="text"
                          value={action.url}
                          onChange={(e) => updateEntryAction(action.id, 'url', e.target.value)}
                          placeholder={cfg.urlPlaceholder || ''}
                          className={inputCls}
                        />
                      </InputField>
                    )}
                  </div>

                  <InputField label="Number of Entries" required>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={action.entries}
                        onChange={(e) => updateEntryAction(action.id, 'entries', parseInt(e.target.value) || 1)}
                        className={inputCls + ' max-w-[100px]'}
                      />
                      <span className="text-xs text-dark-400">How many entries this action is worth.</span>
                    </div>
                  </InputField>
                </div>
              </div>
            )
          })}
        </div>

        {/* Add Entry Action */}
        <select
          defaultValue=""
          onChange={(e) => { addEntryAction(e.target.value); e.target.value = '' }}
          className={inputCls + ' max-w-xs'}
        >
          <option value="" disabled>Add Entry Action</option>
          {ENTRY_ACTION_GROUPS.map(({ label, options }) => (
            <optgroup key={label} label={label}>
              {options.map((a) => <option key={a} value={a}>{a}</option>)}
            </optgroup>
          ))}
        </select>
      </div>

      {/* ── 4. Integrations ── */}
      <div className="bg-dark-800 border border-dark-500 rounded-xl p-6">
        <SectionHeader number="4" icon={PlugZap} title="Integrations" />
        <p className="text-xs text-dark-400 mb-4">Integrations allow you to send new contestant information to third party services.</p>
        <button type="button" className="flex items-center gap-2 bg-brand-green text-dark-900 font-semibold text-sm px-4 py-2 rounded-lg hover:bg-brand-green/80 transition-colors">
          <Plus size={14} /> Add an Integration
        </button>
      </div>

      {/* ── 5. Rules and Terms ── */}
      <div className="bg-dark-800 border border-dark-500 rounded-xl p-6">
        <SectionHeader number="5" icon={FileText} title="Rules and Terms" />
        <div className="space-y-4">
          <InputField label="Giveaway Rules" required={false}>
            <div className="flex justify-end mb-1">
              <button
                type="button"
                onClick={handleGenerateRules}
                disabled={aiLoading.rules}
                className="flex items-center gap-1.5 text-xs font-medium text-brand-green hover:text-brand-green/80 disabled:opacity-50 transition-colors"
              >
                {aiLoading.rules
                  ? <><Loader2 size={13} className="animate-spin" /> Generating…</>
                  : <><Sparkles size={13} /> Generate with AI</>}
              </button>
            </div>
            <textarea
              value={form.rulesText}
              onChange={(e) => set('rulesText', e.target.value)}
              rows={5}
              placeholder={`Example:\n1. Open to residents of [Country] aged 18+.\n2. One entry per person.\n3. Winner will be selected randomly and notified by email.\n4. Prize is non-transferable and has no cash alternative.\n5. Giveaway ends ${form.endsAt?.split('T')[0] || 'on the specified date'}.`}
              className={inputCls + ' resize-none font-sans leading-relaxed'}
            />
          </InputField>

          <div className="grid grid-cols-2 gap-4">
            <InputField label="Eligibility (e.g. US only, 18+)">
              <input
                value={form.eligibility}
                onChange={(e) => set('eligibility', e.target.value)}
                placeholder="e.g. US residents, 18 years or older"
                className={inputCls}
              />
            </InputField>
            <InputField label="Full Terms & Conditions URL">
              <input
                value={form.termsUrl}
                onChange={(e) => set('termsUrl', e.target.value)}
                placeholder="https://yoursite.com/terms"
                className={inputCls}
              />
            </InputField>
          </div>

          <p className="text-xs text-dark-500">
            Rules are displayed on your giveaway landing page. A link to your full T&amp;C appears beneath the entry form.
          </p>
        </div>
      </div>

      {/* ── 6. Invisible reCAPTCHA ── */}
      <div className="bg-dark-800 border border-dark-500 rounded-xl p-6">
        <SectionHeader number="6" icon={Shield} title="Invisible reCAPTCHA" />
        <p className="text-xs text-dark-400 mb-4">
          Enabling <span className="text-brand-green cursor-pointer hover:underline">invisible reCAPTCHA</span> helps reduce spam signups by bot mitigation technology.
        </p>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={form.recaptcha}
            onChange={() => set('recaptcha', !form.recaptcha)}
            className="w-4 h-4 accent-brand-green"
          />
          <span className="text-sm text-white">Enable invisible reCAPTCHA</span>
        </label>
      </div>

      {/* ── 7. Marketing Consent ── */}
      <div className="bg-dark-800 border border-dark-500 rounded-xl p-6">
        <SectionHeader number="7" title="Marketing Consent" />
        <p className="text-xs text-dark-400 mb-4">
          When enabled, entrants will see an optional checkbox to consent to marketing emails. This helps build trust and improves deliverability. Recommended for GDPR, CAN, and other regulations.
        </p>
        <label className="flex items-center gap-2 cursor-pointer select-none mb-3">
          <input
            type="checkbox"
            checked={form.marketingConsent}
            onChange={() => set('marketingConsent', !form.marketingConsent)}
            className="w-4 h-4 accent-brand-green"
          />
          <span className="text-sm text-white">Show marketing consent checkbox to entrants</span>
        </label>
        <p className="text-xs text-dark-500">
          Consent notice is included in your ESP report. See integration details in Section 4 for ESP-specific behavior.
        </p>
      </div>

      {/* ── 8. Password Protection ── */}
      <div className="bg-dark-800 border border-dark-500 rounded-xl p-6">
        <SectionHeader number="8" icon={Lock} title="Password Protection" />
        <p className="text-xs text-dark-400 mb-4">Restrict your giveaway to only people who have the password — great for exclusive or invite-only campaigns.</p>
        <label className="flex items-center gap-2 cursor-pointer select-none mb-4">
          <button
            type="button"
            onClick={() => set('passwordProtected', !form.passwordProtected)}
            className={`relative w-11 h-6 rounded-full transition-colors ${form.passwordProtected ? 'bg-brand-green' : 'bg-dark-600'}`}
          >
            <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${form.passwordProtected ? 'left-6' : 'left-1'}`} />
          </button>
          <span className="text-sm text-white">Enable password protection</span>
        </label>
        {form.passwordProtected && (
          <InputField label="Entry Password">
            <input
              type="text"
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              placeholder="e.g. SUMMER2024"
              className={inputCls}
            />
          </InputField>
        )}
      </div>

      {/* ── 9. Geographic Restrictions ── */}
      <div className="bg-dark-800 border border-dark-500 rounded-xl p-6">
        <SectionHeader number="9" icon={MapPin} title="Geographic Restrictions" />
        <p className="text-xs text-dark-400 mb-4">Limit entries to specific countries. Useful for prize fulfilment, legal compliance, or regional campaigns.</p>
        <label className="flex items-center gap-2 cursor-pointer select-none mb-4">
          <button
            type="button"
            onClick={() => set('geoEnabled', !form.geoEnabled)}
            className={`relative w-11 h-6 rounded-full transition-colors ${form.geoEnabled ? 'bg-brand-green' : 'bg-dark-600'}`}
          >
            <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${form.geoEnabled ? 'left-6' : 'left-1'}`} />
          </button>
          <span className="text-sm text-white">Restrict by country</span>
        </label>
        {form.geoEnabled && (
          <div>
            <p className="text-xs text-dark-400 mb-2">Select allowed countries (leave empty = all countries):</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
              {COUNTRIES.map((country) => {
                const selected = form.allowedCountries.includes(country)
                return (
                  <button
                    key={country}
                    type="button"
                    onClick={() => setForm((f) => ({
                      ...f,
                      allowedCountries: selected
                        ? f.allowedCountries.filter((c) => c !== country)
                        : [...f.allowedCountries, country],
                    }))}
                    className={`text-left text-xs px-3 py-2 rounded-lg border transition-colors ${
                      selected
                        ? 'border-brand-green/50 bg-brand-green/10 text-white'
                        : 'border-dark-600 text-dark-400 hover:text-white hover:border-dark-500'
                    }`}
                  >
                    {country}
                  </button>
                )
              })}
            </div>
            {form.allowedCountries.length > 0 && (
              <p className="text-xs text-brand-green mt-2">{form.allowedCountries.length} countries selected</p>
            )}
          </div>
        )}
      </div>

      {/* ── 10. Age Verification ── */}
      <div className="bg-dark-800 border border-dark-500 rounded-xl p-6">
        <SectionHeader number="10" icon={UserCheck} title="Age Verification" />
        <p className="text-xs text-dark-400 mb-4">Require entrants to confirm they meet a minimum age — important for legal compliance in many regions.</p>
        <label className="flex items-center gap-2 cursor-pointer select-none mb-4">
          <button
            type="button"
            onClick={() => set('ageVerification', !form.ageVerification)}
            className={`relative w-11 h-6 rounded-full transition-colors ${form.ageVerification ? 'bg-brand-green' : 'bg-dark-600'}`}
          >
            <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${form.ageVerification ? 'left-6' : 'left-1'}`} />
          </button>
          <span className="text-sm text-white">Require age confirmation</span>
        </label>
        {form.ageVerification && (
          <div className="space-y-3">
            <InputField label="Minimum Age">
              <input
                type="number" min="13" max="99"
                value={form.minimumAge}
                onChange={(e) => set('minimumAge', parseInt(e.target.value) || 18)}
                className={inputCls}
              />
            </InputField>
            <InputField label="Consent Checkbox Text">
              <input
                value={form.ageConsentText}
                onChange={(e) => set('ageConsentText', e.target.value)}
                className={inputCls}
              />
            </InputField>
          </div>
        )}
      </div>

      {/* ── 11. Referral Tracking ── */}
      <div className="bg-dark-800 border border-dark-500 rounded-xl p-6">
        <SectionHeader number="11" icon={Share2} title="Referral Tracking" />
        <p className="text-xs text-dark-400 mb-4">Auto-generate unique referral links for each entrant. When someone signs up via a referral link, both parties get bonus entries.</p>
        <label className="flex items-center gap-2 cursor-pointer select-none mb-4">
          <button
            type="button"
            onClick={() => set('referralEnabled', !form.referralEnabled)}
            className={`relative w-11 h-6 rounded-full transition-colors ${form.referralEnabled ? 'bg-brand-green' : 'bg-dark-600'}`}
          >
            <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${form.referralEnabled ? 'left-6' : 'left-1'}`} />
          </button>
          <span className="text-sm text-white">Enable referral tracking</span>
        </label>
        {form.referralEnabled && (
          <InputField label="Bonus Entries Per Referral">
            <input
              type="number" min="1" max="20"
              value={form.referralBonusEntries}
              onChange={(e) => set('referralBonusEntries', parseInt(e.target.value) || 2)}
              className={inputCls + ' max-w-[160px]'}
            />
            <p className="text-xs text-dark-500 mt-1">Both referrer and new entrant receive this many bonus entries.</p>
          </InputField>
        )}
      </div>

      {/* ── 12. A/B Testing ── */}
      <div className="bg-dark-800 border border-dark-500 rounded-xl p-6">
        <SectionHeader number="12" icon={FlaskConical} title="A/B Testing" />
        <p className="text-xs text-dark-400 mb-4">Split traffic between two landing page variants to see which converts better. The winner is determined automatically.</p>
        <label className="flex items-center gap-2 cursor-pointer select-none mb-4">
          <button
            type="button"
            onClick={() => set('abTestEnabled', !form.abTestEnabled)}
            className={`relative w-11 h-6 rounded-full transition-colors ${form.abTestEnabled ? 'bg-brand-green' : 'bg-dark-600'}`}
          >
            <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${form.abTestEnabled ? 'left-6' : 'left-1'}`} />
          </button>
          <span className="text-sm text-white">Enable A/B test</span>
        </label>
        {form.abTestEnabled && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-dark-600 rounded-xl p-4">
                <p className="text-xs font-semibold text-brand-green mb-2">Variant A</p>
                <InputField label="Name">
                  <input value={form.abVariantA.name} onChange={(e) => setForm((f) => ({ ...f, abVariantA: { ...f.abVariantA, name: e.target.value } }))} className={inputCls} />
                </InputField>
                <div className="mt-3">
                  <InputField label="Headline / Description">
                    <input value={form.abVariantA.description} onChange={(e) => setForm((f) => ({ ...f, abVariantA: { ...f.abVariantA, description: e.target.value } }))} placeholder="Original headline..." className={inputCls} />
                  </InputField>
                </div>
              </div>
              <div className="border border-dark-600 rounded-xl p-4">
                <p className="text-xs font-semibold text-amber-400 mb-2">Variant B</p>
                <InputField label="Name">
                  <input value={form.abVariantB.name} onChange={(e) => setForm((f) => ({ ...f, abVariantB: { ...f.abVariantB, name: e.target.value } }))} className={inputCls} />
                </InputField>
                <div className="mt-3">
                  <InputField label="Headline / Description">
                    <input value={form.abVariantB.description} onChange={(e) => setForm((f) => ({ ...f, abVariantB: { ...f.abVariantB, description: e.target.value } }))} placeholder="Alternative headline..." className={inputCls} />
                  </InputField>
                </div>
              </div>
            </div>
            <InputField label={`Traffic Split — Variant A: ${form.abSplit}% · Variant B: ${100 - form.abSplit}%`}>
              <input
                type="range" min="10" max="90" step="5"
                value={form.abSplit}
                onChange={(e) => set('abSplit', parseInt(e.target.value))}
                className="w-full accent-brand-green"
              />
            </InputField>
          </div>
        )}
      </div>

      {/* ── 13. Custom Entry Fields ── */}
      <div className="bg-dark-800 border border-dark-500 rounded-xl p-6">
        <SectionHeader number="13" icon={Sliders} title="Custom Entry Fields" />
        <p className="text-xs text-dark-400 mb-4">Collect extra data from entrants — phone number, shipping address, survey answers, etc.</p>

        {form.customFields.length > 0 && (
          <div className="space-y-2 mb-4">
            {form.customFields.map((field, i) => (
              <div key={field.id} className="flex items-center gap-3 bg-dark-700 border border-dark-600 rounded-lg px-3 py-2">
                <div className="flex-1 grid grid-cols-3 gap-2">
                  <input
                    value={field.label}
                    onChange={(e) => setForm((f) => ({ ...f, customFields: f.customFields.map((cf, idx) => idx === i ? { ...cf, label: e.target.value } : cf) }))}
                    placeholder="Field label"
                    className="bg-dark-800 border border-dark-500 rounded px-2 py-1 text-xs text-white placeholder-dark-400 focus:outline-none"
                  />
                  <select
                    value={field.type}
                    onChange={(e) => setForm((f) => ({ ...f, customFields: f.customFields.map((cf, idx) => idx === i ? { ...cf, type: e.target.value } : cf) }))}
                    className="bg-dark-800 border border-dark-500 rounded px-2 py-1 text-xs text-white focus:outline-none"
                  >
                    {CUSTOM_FIELD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <label className="flex items-center gap-1.5 text-xs text-dark-400">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) => setForm((f) => ({ ...f, customFields: f.customFields.map((cf, idx) => idx === i ? { ...cf, required: e.target.checked } : cf) }))}
                      className="accent-brand-green"
                    />
                    Required
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, customFields: f.customFields.filter((_, idx) => idx !== i) }))}
                  className="text-dark-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => setForm((f) => ({ ...f, customFields: [...f.customFields, { id: Date.now(), label: '', type: 'text', required: false }] }))}
          className="flex items-center gap-2 text-xs px-4 py-2 border border-dashed border-dark-500 rounded-lg text-dark-400 hover:text-white hover:border-dark-400 transition-colors"
        >
          <Plus size={13} /> Add Custom Field
        </button>
      </div>

      {/* ── Submit ── */}
      <div className="flex items-center gap-3 pb-6">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="px-5 py-2.5 border border-dark-500 text-dark-400 text-sm rounded-lg hover:text-white hover:border-dark-400 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex items-center gap-2 px-6 py-2.5 bg-brand-green text-dark-900 font-semibold rounded-lg text-sm hover:bg-brand-green/80 transition-colors"
        >
          Save <ChevronRight size={15} />
        </button>
      </div>
    </form>
  )
}
