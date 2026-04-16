import { useState, useContext, createContext } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Mail, Upload, Lock, Plus, ChevronRight, ChevronUp, ChevronDown,
  Shield, Zap, PlugZap, FileText, MapPin, UserCheck, Share2, FlaskConical, Sliders, Trash2, Sparkles, Loader2, X, Gift
} from 'lucide-react'
import { generateTitle, generateDescription, generateRules } from '../lib/groq'
import { fetchShopifyProducts } from '../lib/shopify'

import { useStore } from '../store/useStore'

// Minimal inline brand icons (no external dependency)
const BrandIcon = ({ letter, color }) => (
  <span className="text-xs font-bold" style={{ color }}>{letter}</span>
)

const INTEGRATIONS_CATALOG = [
  {
    key: 'mailchimp',
    name: 'Mailchimp',
    color: '#FFE01B',
    letter: 'M',
    desc: 'Add contestants to a Mailchimp audience',
    fields: [
      { key: 'listId',   label: 'Audience ID',    placeholder: 'e.g. a1b2c3d4e5' },
      { key: 'apiKey',   label: 'API Key',         placeholder: 'e.g. abc123-us1', type: 'password' },
    ],
  },
  {
    key: 'klaviyo',
    name: 'Klaviyo',
    color: '#000000',
    letter: 'K',
    desc: 'Subscribe contestants to a Klaviyo list',
    fields: [
      { key: 'publicKey', label: 'Public API Key', placeholder: 'e.g. pk_abc123' },
      { key: 'listId',    label: 'List ID',        placeholder: 'e.g. ABCDEF' },
    ],
  },
  {
    key: 'convertkit',
    name: 'ConvertKit',
    color: '#FB6970',
    letter: 'C',
    desc: 'Add contestants to a ConvertKit form',
    fields: [
      { key: 'formId', label: 'Form ID', placeholder: 'e.g. 1234567' },
    ],
  },
  {
    key: 'zapier',
    name: 'Zapier',
    color: '#FF4A00',
    letter: 'Z',
    desc: 'Send entry data to any Zapier webhook',
    fields: [
      { key: 'webhookUrl', label: 'Webhook URL', placeholder: 'https://hooks.zapier.com/...' },
    ],
  },
  {
    key: 'activecampaign',
    name: 'ActiveCampaign',
    color: '#356AE6',
    letter: 'A',
    desc: 'Add contacts to an ActiveCampaign list',
    fields: [
      { key: 'apiUrl',  label: 'Account URL', placeholder: 'https://yourname.api-us1.com' },
      { key: 'apiKey',  label: 'API Key',     placeholder: 'Your API key', type: 'password' },
      { key: 'listId',  label: 'List ID',     placeholder: 'e.g. 1' },
    ],
  },
  {
    key: 'webhook',
    name: 'Custom Webhook',
    color: '#6366F1',
    letter: 'W',
    desc: 'POST entry data to any custom URL',
    fields: [
      { key: 'url',    label: 'Endpoint URL', placeholder: 'https://yoursite.com/webhook' },
      { key: 'secret', label: 'Secret (optional)', placeholder: 'HMAC signing secret' },
    ],
  },
]

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
  { key: 'instagram', label: 'Ig', bg: 'bg-pink-500',         text: 'text-white' },
  { key: 'messenger', label: 'm',  bg: 'bg-blue-400',        text: 'text-white' },
  { key: 'linkedin',  label: 'in', bg: 'bg-blue-700',        text: 'text-white' },
  { key: 'pinterest', label: 'P',  bg: 'bg-red-600',         text: 'text-white' },
  { key: 'email',     label: '@',  bg: 'bg-dark-600',        text: 'text-dark-300' },
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

const SectionContext = createContext({ forceOpen: null, resetForce: () => {} })

function Section({ number, icon: Icon, title, defaultOpen = true, children }) {
  const { forceOpen, resetForce } = useContext(SectionContext)
  const [open, setOpen] = useState(defaultOpen)
  const isOpen = forceOpen === null ? open : forceOpen
  return (
    <div className="bg-dark-800 border border-dark-500 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => {
          if (forceOpen !== null) resetForce()
          setOpen((v) => (forceOpen !== null ? !forceOpen : !v))
        }}
        className="w-full flex items-center gap-2 px-6 py-4 hover:bg-dark-700/40 transition-colors text-left"
      >
        <span className="w-5 h-5 rounded-full bg-brand-green text-dark-900 text-xs font-bold flex items-center justify-center shrink-0">
          {number}
        </span>
        {Icon && <Icon size={15} className="text-brand-green shrink-0" />}
        <span className="text-base font-semibold text-white flex-1">{title}</span>
        <ChevronRight
          size={16}
          className={`text-dark-400 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
        />
      </button>
      {isOpen && <div className="px-6 pb-6">{children}</div>}
    </div>
  )
}

// Keep SectionHeader as no-op shim so old callsites don't break
function SectionHeader() { return null }

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
    prizeImageUrl: '',
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
    // Section 4 – integrations
    integrations: [],
  })

  const [errors, setErrors] = useState({})
  const [showIntegrationPicker, setShowIntegrationPicker] = useState(false)
  const [aiLoading, setAiLoading] = useState({ title: false, description: false, rules: false })
  const [aiError, setAiError] = useState('')
  const [shopify, setShopify] = useState({ domain: '', token: '', products: [], loading: false, error: '', connected: false })
  const [showProductPicker, setShowProductPicker] = useState(false)

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }))

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

  const handleShopifyConnect = async () => {
    if (!shopify.domain || !shopify.token) {
      setShopify((s) => ({ ...s, error: 'Enter your store domain and token first.' }))
      return
    }
    setShopify((s) => ({ ...s, loading: true, error: '' }))
    try {
      const products = await fetchShopifyProducts(shopify.domain, shopify.token)
      setShopify((s) => ({ ...s, products, connected: true, loading: false }))
      setShowProductPicker(true)
    } catch (e) {
      setShopify((s) => ({ ...s, error: e.message, loading: false }))
    }
  }

  const handleSelectProduct = (product) => {
    set('prizeName', product.title)
    set('prizeValue', product.price)
    set('prizeImageUrl', product.image || '')
    setShowProductPicker(false)
  }

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
      // Entry methods — email always on; others from sharing toggles
      entryMethods: {
        email:     true,
        instagram: !!form.sharing.instagram,
        tiktok:    !!form.sharing.instagram, // reuse social toggle
        share:     !!form.sharing.twitter || !!form.sharing.facebook,
        visit:     false,
        purchase:  false,
      },
      entryValues: { email: 1, instagram: 2, tiktok: 2, share: 3, visit: 1, purchase: 5 },
      // Bonus entry actions (section 3)
      entryActions:  form.entryActions,
      // Integrations (section 4)
      integrations:  form.integrations,
      // Rules & terms (section 5)
      rulesText:     form.rulesText,
      termsUrl:      form.termsUrl,
      eligibility:   form.eligibility,
      // Custom entry fields (section 13)
      customFields:  form.customFields,
      // Fraud & security
      fraudDetection: { blockDuplicateIP: true, blockDuplicateEmail: true, recaptcha: form.recaptcha },
      // Branding
      branding: {
        showPoweredBy: true,
        customColor:   form.brandColor || '#00d084',
        storeName:     form.runnerName,
        logoUrl:       form.logoUrl || '',
      },
      // Geo & age
      geoEnabled:      form.geoEnabled,
      allowedCountries: form.allowedCountries,
      ageVerification: form.ageVerification,
      minimumAge:      form.minimumAge,
      // Referral
      referralEnabled:      form.referralEnabled,
      referralBonusEntries: form.referralBonusEntries,
      // Password protection
      passwordProtected: form.passwordProtected,
      password:          form.password,
      // Marketing consent
      marketingConsent: form.marketingConsent,
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

  // null = each section controls itself, true = all expanded, false = all collapsed
  const [allOpen, setAllOpen] = useState(null)
  const toggleAllOpen = () => setAllOpen((v) => v === true ? false : true)
  const resetAllOpen  = () => setAllOpen(null)

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">

      {aiError && (
        <div className="bg-red-500/10 border border-red-500/40 text-red-400 text-sm rounded-lg px-4 py-3">
          <strong>AI Error:</strong> {aiError}
        </div>
      )}

      {/* ── Expand / Collapse All ── */}
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={toggleAllOpen}
          className="text-xs text-dark-400 hover:text-white border border-dark-600 hover:border-dark-400 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
        >
          <ChevronRight size={12} className={allOpen === false ? '-rotate-90' : 'rotate-90'} />
          {allOpen === false ? 'Expand All' : 'Collapse All'}
        </button>
      </div>

      <SectionContext.Provider value={{ forceOpen: allOpen, resetForce: resetAllOpen }}>
      {/* ── 1. Giveaway Information ── */}
      <Section number="1" title="Giveaway Information">

        {/* Competition Information heading */}
        <p className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-3">Competition information</p>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <s-text-field
              label="Title"
              required
              value={form.title}
              error={errors.title}
              onInput={(e) => set('title', e.target.value)}
            >
              <s-button
                slot="accessory"
                variant="tertiary"
                icon="sparkle"
                loading={aiLoading.title || undefined}
                onClick={handleGenerateTitle}
              >
                {aiLoading.title ? 'Generating…' : 'Generate with AI'}
              </s-button>
            </s-text-field>
          </div>

          {/* Description */}
          <div>
            <s-text-field
              label="Description"
              value={form.description}
              multiline="4"
              placeholder="Describe your giveaway or click 'Generate with AI'…"
              onInput={(e) => set('description', e.target.value)}
            >
              <s-button
                slot="accessory"
                variant="tertiary"
                icon="sparkle"
                loading={aiLoading.description || undefined}
                onClick={handleGenerateDescription}
              >
                {aiLoading.description ? 'Generating…' : 'Generate with AI'}
              </s-button>
            </s-text-field>
          </div>

          {/* Starts At / Ends At */}
          <div className="grid grid-cols-2 gap-4">
            <s-text-field
              label="Starts At"
              required
              type="datetime-local"
              value={form.startsAt}
              onInput={(e) => set('startsAt', e.target.value)}
            />
            <s-text-field
              label="Ends At"
              required
              type="datetime-local"
              value={form.endsAt}
              error={errors.endsAt}
              onInput={(e) => set('endsAt', e.target.value)}
            />
          </div>

          {/* Awarded At / Number of Winners */}
          <div className="grid grid-cols-2 gap-4">
            <s-text-field
              label="Awarded At"
              required
              type="datetime-local"
              value={form.awardedAt}
              onInput={(e) => set('awardedAt', e.target.value)}
            />
            <s-text-field
              label="Number of Winners"
              required
              type="number"
              min="1"
              value={form.numberOfWinners}
              onInput={(e) => set('numberOfWinners', parseInt(e.target.value) || 1)}
            />
          </div>

          {/* Timezone */}
          <s-select
            label="Timezone"
            value={form.timezone}
            onChange={(e) => set('timezone', e.target.value)}
          >
            {TIMEZONES.map((tz) => <s-option key={tz} value={tz}>{tz}</s-option>)}
          </s-select>

          {/* Who's Running This Giveaway? */}
          <div>
            <p className="text-xs font-semibold text-white mb-2">Who's Running This Giveaway?</p>
            <div className="grid grid-cols-2 gap-4">
              <s-text-field
                label="Name"
                required
                value={form.runnerName}
                onInput={(e) => set('runnerName', e.target.value)}
              />
              <s-text-field
                label="URL"
                required
                value={form.runnerUrl}
                placeholder="http://"
                onInput={(e) => set('runnerUrl', e.target.value)}
              />
            </div>
          </div>

          {/* Shopify Product Picker */}
          <div className="border border-dark-600 rounded-xl p-4 bg-dark-700/30">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-white flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-[#96bf48] flex items-center justify-center text-[10px] font-black text-white">S</span>
                Import Prize from Shopify
              </p>
              {shopify.connected && (
                <span className="text-[10px] text-brand-green border border-brand-green/30 bg-brand-green/10 px-2 py-0.5 rounded-full">Connected</span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <input
                type="text"
                value={shopify.domain}
                onChange={(e) => setShopify((s) => ({ ...s, domain: e.target.value }))}
                placeholder="mystore.myshopify.com"
                className="bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-xs text-white placeholder-dark-400 focus:outline-none focus:border-brand-green"
              />
              <input
                type="password"
                value={shopify.token}
                onChange={(e) => setShopify((s) => ({ ...s, token: e.target.value }))}
                placeholder="Storefront Access Token"
                className="bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-xs text-white placeholder-dark-400 focus:outline-none focus:border-brand-green"
              />
            </div>
            {shopify.error && <p className="text-[10px] text-red-400 mb-2">{shopify.error}</p>}
            <button
              type="button"
              onClick={shopify.connected ? () => setShowProductPicker(true) : handleShopifyConnect}
              disabled={shopify.loading}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-[#96bf48] text-white rounded-lg hover:bg-[#7aab2e] transition-colors disabled:opacity-50 font-semibold"
            >
              {shopify.loading ? <Loader2 size={11} className="animate-spin" /> : null}
              {shopify.loading ? 'Connecting…' : shopify.connected ? 'Browse Products' : 'Connect & Browse Products'}
            </button>
          </div>

          {/* Product Picker Modal */}
          {showProductPicker && shopify.products.length > 0 && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
              <div className="bg-dark-800 border border-dark-500 rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
                <div className="flex items-center justify-between px-5 py-4 border-b border-dark-600">
                  <p className="text-sm font-bold text-white">Select a Product</p>
                  <button type="button" onClick={() => setShowProductPicker(false)} className="text-dark-400 hover:text-white transition-colors">
                    <X size={16} />
                  </button>
                </div>
                <div className="overflow-y-auto p-4 grid grid-cols-2 gap-3">
                  {shopify.products.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectProduct(p)}
                      className="text-left border border-dark-600 hover:border-brand-green rounded-xl overflow-hidden transition-colors group"
                    >
                      {p.image ? (
                        <img src={p.image} alt={p.title} className="w-full h-28 object-cover" />
                      ) : (
                        <div className="w-full h-28 bg-dark-700 flex items-center justify-center">
                          <Gift size={24} className="text-dark-500" />
                        </div>
                      )}
                      <div className="p-2.5">
                        <p className="text-xs font-semibold text-white group-hover:text-brand-green transition-colors line-clamp-2">{p.title}</p>
                        <p className="text-xs text-brand-green mt-0.5">{p.currency} {p.price}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* What Are You Giving Away? */}
          <div>
            <p className="text-xs font-semibold text-white mb-2">What Are You Giving Away?</p>
            <div className="grid grid-cols-2 gap-4">
              <s-text-field
                label="Prize Name"
                required
                value={form.prizeName}
                error={errors.prizeName}
                onInput={(e) => set('prizeName', e.target.value)}
              />
              <s-text-field
                label="Prize Value"
                required
                value={form.prizeValue}
                prefix="$"
                onInput={(e) => set('prizeValue', e.target.value)}
              />
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
            {form.prizeImageUrl && (
              <div className="mt-2 flex items-center gap-2">
                <img src={form.prizeImageUrl} alt="Prize" className="w-16 h-16 rounded-lg object-cover border border-dark-500" />
                <div>
                  <p className="text-xs text-brand-green">Product image imported from Shopify</p>
                  <button type="button" onClick={() => set('prizeImageUrl', '')} className="text-[10px] text-dark-400 hover:text-white transition-colors mt-0.5">Remove</button>
                </div>
              </div>
            )}
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
                <s-checkbox
                  key={key}
                  label={label}
                  checked={form.contestantsProvide[key] || undefined}
                  onChange={() => setForm((f) => ({ ...f, contestantsProvide: { ...f.contestantsProvide, [key]: !f.contestantsProvide[key] } }))}
                />
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── 2. Sharing ── */}
      <Section number="2" title="Sharing" defaultOpen={false}>
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
      </Section>

      {/* ── 3. Bonus Entries ── */}
      <Section number="3" icon={Zap} title="Bonus Entries" defaultOpen={false}>
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
        <div className="flex items-center gap-2">
          <s-select
            label="Add Entry Action"
            labelaccessibilityvisibility="hidden"
            placeholder="Add Entry Action"
            onChange={(e) => { addEntryAction(e.target.value); e.target.value = '' }}
          >
            {ENTRY_ACTION_GROUPS.map(({ label, options }) => (
              <s-option-group key={label} label={label}>
                {options.map((a) => <s-option key={a} value={a}>{a}</s-option>)}
              </s-option-group>
            ))}
          </s-select>
        </div>
      </Section>

      {/* ── 4. Integrations ── */}
      <Section number="4" icon={PlugZap} title="Integrations" defaultOpen={false}>
        <p className="text-xs text-dark-400 mb-4">Send new contestant data to third-party services automatically.</p>

        {/* Added integrations */}
        {form.integrations.length > 0 && (
          <div className="space-y-3 mb-4">
            {form.integrations.map((intg) => {
              const catalog = INTEGRATIONS_CATALOG.find((c) => c.key === intg.key)
              if (!catalog) return null
              return (
                <div key={intg.id} className="border border-dark-500 rounded-xl overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-2.5 bg-dark-700 border-b border-dark-500">
                    <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: catalog.color + '22' }}>
                      <BrandIcon letter={catalog.letter} color={catalog.color} />
                    </div>
                    <span className="text-sm font-semibold text-white flex-1">{catalog.name}</span>
                    <button type="button" onClick={() => setForm((f) => ({ ...f, integrations: f.integrations.filter((i) => i.id !== intg.id) }))} className="text-dark-400 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                  </div>
                  <div className="p-4 bg-dark-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {catalog.fields.map((field) => (
                      <InputField key={field.key} label={field.label}>
                        <input
                          type={field.type || 'text'}
                          value={intg.config[field.key] || ''}
                          onChange={(e) => setForm((f) => ({ ...f, integrations: f.integrations.map((i) => i.id === intg.id ? { ...i, config: { ...i.config, [field.key]: e.target.value } } : i) }))}
                          placeholder={field.placeholder}
                          className={inputCls}
                        />
                      </InputField>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Integration picker */}
        {showIntegrationPicker ? (
          <div className="border border-dark-500 rounded-xl p-4 mb-3">
            <p className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-3">Choose an Integration</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {INTEGRATIONS_CATALOG.map((catalog) => {
                const alreadyAdded = form.integrations.some((i) => i.key === catalog.key)
                return (
                  <button
                    key={catalog.key}
                    type="button"
                    disabled={alreadyAdded}
                    onClick={() => {
                      setForm((f) => ({ ...f, integrations: [...f.integrations, { id: Date.now(), key: catalog.key, config: {} }] }))
                      setShowIntegrationPicker(false)
                    }}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm transition-all ${alreadyAdded ? 'border-dark-600 opacity-40 cursor-not-allowed' : 'border-dark-500 hover:border-brand-green hover:bg-dark-700 cursor-pointer'}`}
                  >
                    <div className="w-5 h-5 rounded flex items-center justify-center shrink-0" style={{ background: catalog.color + '22' }}>
                      <BrandIcon letter={catalog.letter} color={catalog.color} />
                    </div>
                    <span className="text-white truncate">{catalog.name}</span>
                  </button>
                )
              })}
            </div>
            <button type="button" onClick={() => setShowIntegrationPicker(false)} className="mt-3 text-xs text-dark-500 hover:text-white transition-colors">Cancel</button>
          </div>
        ) : (
          <s-button type="button" variant="primary" icon="plus" onClick={() => setShowIntegrationPicker(true)}>
            Add an Integration
          </s-button>
        )}
      </Section>

      {/* ── 5. Rules and Terms ── */}
      <Section number="5" icon={FileText} title="Rules and Terms" defaultOpen={false}>
        <div className="space-y-4">
          {/* Quick Template Buttons */}
          <div>
            <p className="text-xs text-dark-400 mb-2">Quick Templates:</p>
            <div className="flex flex-wrap gap-2">
              {[
                {
                  label: 'Standard Giveaway',
                  text: `1. Open to residents of ${form.eligibility || '[Country]'} aged 18+.\n2. One entry per person.\n3. Winner will be selected randomly and notified by email within 48 hours.\n4. Prize is non-transferable and has no cash alternative.\n5. Giveaway ends ${form.endsAt?.split('T')[0] || '[End Date]'}.\n6. By entering, you agree to these rules and our Terms & Conditions.`,
                },
                {
                  label: 'Social Media',
                  text: `1. Follow our official account to enter.\n2. Open to residents of ${form.eligibility || '[Country]'} aged 18+.\n3. One entry per person per platform.\n4. Winner announced on ${form.awardedAt?.split('T')[0] || '[Award Date]'}.\n5. Prize: ${form.prizeName || '[Prize]'} (valued at ${form.prizeValue ? '$' + form.prizeValue : '[Value]'}).\n6. This promotion is not sponsored by any social media platform.`,
                },
                {
                  label: 'Product Launch',
                  text: `1. Purchase required to enter (or see alternate entry method).\n2. Prize: ${form.prizeName || '[Prize]'}.\n3. Open to ${form.eligibility || 'all eligible participants'} aged 18+.\n4. Entries accepted from ${form.startsAt?.split('T')[0] || '[Start Date]'} to ${form.endsAt?.split('T')[0] || '[End Date]'}.\n5. Winner selected randomly and contacted via email.\n6. Unclaimed prizes will be forfeited after 7 days.`,
                },
              ].map(({ label, text }) => (
                <s-button key={label} type="button" variant="secondary" onClick={() => set('rulesText', text)}>
                  {label}
                </s-button>
              ))}
              {form.rulesText && (
                <s-button type="button" variant="tertiary" tone="critical" onClick={() => set('rulesText', '')}>
                  Clear
                </s-button>
              )}
            </div>
          </div>

          <s-text-field
            label="Giveaway Rules"
            value={form.rulesText}
            multiline="7"
            placeholder={`Example:\n1. Open to residents of [Country] aged 18+.\n2. One entry per person.\n3. Winner will be selected randomly and notified by email.\n4. Prize is non-transferable and has no cash alternative.\n5. Giveaway ends ${form.endsAt?.split('T')[0] || 'on the specified date'}.`}
            onInput={(e) => set('rulesText', e.target.value)}
          >
            <s-button
              slot="accessory"
              variant="tertiary"
              icon="sparkle"
              loading={aiLoading.rules || undefined}
              onClick={handleGenerateRules}
            >
              {aiLoading.rules ? 'Generating…' : 'Generate with AI'}
            </s-button>
          </s-text-field>

          <div className="grid grid-cols-2 gap-4">
            <s-text-field
              label="Eligibility (e.g. US only, 18+)"
              value={form.eligibility}
              placeholder="e.g. US residents, 18 years or older"
              onInput={(e) => set('eligibility', e.target.value)}
            />
            <s-text-field
              label="Full Terms & Conditions URL"
              value={form.termsUrl}
              placeholder="https://yoursite.com/terms"
              onInput={(e) => set('termsUrl', e.target.value)}
            />
          </div>

          {/* Character count */}
          {form.rulesText && (
            <p className="text-xs text-dark-500 text-right">
              {form.rulesText.length} characters · {form.rulesText.split('\n').filter(Boolean).length} rules
            </p>
          )}

          <p className="text-xs text-dark-500">
            Rules are displayed on your giveaway landing page. A link to your full T&amp;C appears beneath the entry form.
          </p>
        </div>
      </Section>

      {/* ── 6. Invisible reCAPTCHA ── */}
      <Section number="6" icon={Shield} title="Invisible reCAPTCHA" defaultOpen={false}>
        <p className="text-xs text-dark-400 mb-4">
          Enabling <span className="text-brand-green cursor-pointer hover:underline">invisible reCAPTCHA</span> helps reduce spam signups by bot mitigation technology.
        </p>
        <s-checkbox
          label="Enable invisible reCAPTCHA"
          checked={form.recaptcha || undefined}
          onChange={() => set('recaptcha', !form.recaptcha)}
        />
      </Section>

      {/* ── 7. Marketing Consent ── */}
      <Section number="7" title="Marketing Consent" defaultOpen={false}>
        <p className="text-xs text-dark-400 mb-4">
          When enabled, entrants will see an optional checkbox to consent to marketing emails. This helps build trust and improves deliverability. Recommended for GDPR, CAN, and other regulations.
        </p>
        <s-checkbox
          label="Show marketing consent checkbox to entrants"
          checked={form.marketingConsent || undefined}
          onChange={() => set('marketingConsent', !form.marketingConsent)}
        />
        <p className="text-xs text-dark-500">
          Consent notice is included in your ESP report. See integration details in Section 4 for ESP-specific behavior.
        </p>
      </Section>

      {/* ── 8. Password Protection ── */}
      <Section number="8" icon={Lock} title="Password Protection" defaultOpen={false}>
        <p className="text-xs text-dark-400 mb-4">Restrict your giveaway to only people who have the password — great for exclusive or invite-only campaigns.</p>
        <s-checkbox
          label="Enable password protection"
          checked={form.passwordProtected || undefined}
          onChange={() => set('passwordProtected', !form.passwordProtected)}
        />
        {form.passwordProtected && (
          <div className="mt-4">
            <s-text-field
              label="Entry Password"
              value={form.password}
              placeholder="e.g. SUMMER2024"
              onInput={(e) => set('password', e.target.value)}
            />
          </div>
        )}
      </Section>

      {/* ── 9. Geographic Restrictions ── */}
      <Section number="9" icon={MapPin} title="Geographic Restrictions" defaultOpen={false}>
        <p className="text-xs text-dark-400 mb-4">Limit entries to specific countries. Useful for prize fulfilment, legal compliance, or regional campaigns.</p>
        <s-checkbox
          label="Restrict by country"
          checked={form.geoEnabled || undefined}
          onChange={() => set('geoEnabled', !form.geoEnabled)}
        />
        {form.geoEnabled && (
          <div className="mt-4">
            <p className="text-xs text-dark-400 mb-2">Select allowed countries (leave empty = all countries):</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
              {COUNTRIES.map((country) => {
                const selected = form.allowedCountries.includes(country)
                return (
                  <s-button
                    key={country}
                    type="button"
                    variant={selected ? 'primary' : 'secondary'}
                    onClick={() => setForm((f) => ({
                      ...f,
                      allowedCountries: selected
                        ? f.allowedCountries.filter((c) => c !== country)
                        : [...f.allowedCountries, country],
                    }))}
                  >
                    {country}
                  </s-button>
                )
              })}
            </div>
            {form.allowedCountries.length > 0 && (
              <p className="text-xs text-brand-green mt-2">{form.allowedCountries.length} countries selected</p>
            )}
          </div>
        )}
      </Section>

      {/* ── 10. Age Verification ── */}
      <Section number="10" icon={UserCheck} title="Age Verification" defaultOpen={false}>
        <p className="text-xs text-dark-400 mb-4">Require entrants to confirm they meet a minimum age — important for legal compliance in many regions.</p>
        <s-checkbox
          label="Require age confirmation"
          checked={form.ageVerification || undefined}
          onChange={() => set('ageVerification', !form.ageVerification)}
        />
        {form.ageVerification && (
          <div className="space-y-3 mt-4">
            <s-text-field
              label="Minimum Age"
              type="number"
              min="13"
              max="99"
              value={form.minimumAge}
              onInput={(e) => set('minimumAge', parseInt(e.target.value) || 18)}
            />
            <s-text-field
              label="Consent Checkbox Text"
              value={form.ageConsentText}
              onInput={(e) => set('ageConsentText', e.target.value)}
            />
          </div>
        )}
      </Section>

      {/* ── 11. Referral Tracking ── */}
      <Section number="11" icon={Share2} title="Referral Tracking" defaultOpen={false}>
        <p className="text-xs text-dark-400 mb-4">Auto-generate unique referral links for each entrant. When someone signs up via a referral link, both parties get bonus entries.</p>
        <s-checkbox
          label="Enable referral tracking"
          checked={form.referralEnabled || undefined}
          onChange={() => set('referralEnabled', !form.referralEnabled)}
        />
        {form.referralEnabled && (
          <div className="mt-4">
            <s-text-field
              label="Bonus Entries Per Referral"
              type="number"
              min="1"
              max="20"
              value={form.referralBonusEntries}
              details="Both referrer and new entrant receive this many bonus entries."
              onInput={(e) => set('referralBonusEntries', parseInt(e.target.value) || 2)}
            />
          </div>
        )}
      </Section>

      {/* ── 12. A/B Testing ── */}
      <Section number="12" icon={FlaskConical} title="A/B Testing" defaultOpen={false}>
        <p className="text-xs text-dark-400 mb-4">Split traffic between two landing page variants to see which converts better. The winner is determined automatically.</p>
        <s-checkbox
          label="Enable A/B test"
          checked={form.abTestEnabled || undefined}
          onChange={() => set('abTestEnabled', !form.abTestEnabled)}
        />
        {form.abTestEnabled && (
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-dark-600 rounded-xl p-4">
                <p className="text-xs font-semibold text-brand-green mb-2">Variant A</p>
                <s-text-field
                  label="Name"
                  value={form.abVariantA.name}
                  onInput={(e) => setForm((f) => ({ ...f, abVariantA: { ...f.abVariantA, name: e.target.value } }))}
                />
                <div className="mt-3">
                  <s-text-field
                    label="Headline / Description"
                    value={form.abVariantA.description}
                    placeholder="Original headline..."
                    onInput={(e) => setForm((f) => ({ ...f, abVariantA: { ...f.abVariantA, description: e.target.value } }))}
                  />
                </div>
              </div>
              <div className="border border-dark-600 rounded-xl p-4">
                <p className="text-xs font-semibold text-amber-400 mb-2">Variant B</p>
                <s-text-field
                  label="Name"
                  value={form.abVariantB.name}
                  onInput={(e) => setForm((f) => ({ ...f, abVariantB: { ...f.abVariantB, name: e.target.value } }))}
                />
                <div className="mt-3">
                  <s-text-field
                    label="Headline / Description"
                    value={form.abVariantB.description}
                    placeholder="Alternative headline..."
                    onInput={(e) => setForm((f) => ({ ...f, abVariantB: { ...f.abVariantB, description: e.target.value } }))}
                  />
                </div>
              </div>
            </div>
            <div>
              <p className="text-xs text-dark-400 mb-2">Traffic Split — Variant A: {form.abSplit}% · Variant B: {100 - form.abSplit}%</p>
              <input
                type="range" min="10" max="90" step="5"
                value={form.abSplit}
                onChange={(e) => set('abSplit', parseInt(e.target.value))}
                className="w-full accent-brand-green"
              />
            </div>
          </div>
        )}
      </Section>

      {/* ── 13. Custom Entry Fields ── */}
      <Section number="13" icon={Sliders} title="Custom Entry Fields" defaultOpen={false}>
        <p className="text-xs text-dark-400 mb-4">Collect extra data from entrants — phone number, shipping address, survey answers, etc.</p>

        {form.customFields.length > 0 && (
          <div className="space-y-2 mb-4">
            {form.customFields.map((field, i) => (
              <div key={field.id} className="flex items-center gap-3 bg-dark-700 border border-dark-600 rounded-lg px-3 py-2">
                <div className="flex-1 grid grid-cols-3 gap-2">
                  <s-text-field
                    label="Field label"
                    labelaccessibilityvisibility="hidden"
                    value={field.label}
                    placeholder="Field label"
                    onInput={(e) => setForm((f) => ({ ...f, customFields: f.customFields.map((cf, idx) => idx === i ? { ...cf, label: e.target.value } : cf) }))}
                  />
                  <s-select
                    label="Field type"
                    labelaccessibilityvisibility="hidden"
                    value={field.type}
                    onChange={(e) => setForm((f) => ({ ...f, customFields: f.customFields.map((cf, idx) => idx === i ? { ...cf, type: e.target.value } : cf) }))}
                  >
                    {CUSTOM_FIELD_TYPES.map((t) => <s-option key={t} value={t}>{t}</s-option>)}
                  </s-select>
                  <s-checkbox
                    label="Required"
                    checked={field.required || undefined}
                    onChange={(e) => setForm((f) => ({ ...f, customFields: f.customFields.map((cf, idx) => idx === i ? { ...cf, required: e.target.checked } : cf) }))}
                  />
                </div>
                <s-button
                  type="button"
                  variant="tertiary"
                  tone="critical"
                  icon="delete"
                  accessibilityLabel="Remove field"
                  onClick={() => setForm((f) => ({ ...f, customFields: f.customFields.filter((_, idx) => idx !== i) }))}
                />
              </div>
            ))}
          </div>
        )}

        <s-button
          type="button"
          variant="secondary"
          icon="plus"
          onClick={() => setForm((f) => ({ ...f, customFields: [...f.customFields, { id: Date.now(), label: '', type: 'text', required: false }] }))}
        >
          Add Custom Field
        </s-button>
      </Section>

      </SectionContext.Provider>

      {/* ── Submit ── */}
      <div className="flex items-center gap-3 pb-6">
        <s-button
          type="button"
          variant="secondary"
          onClick={() => navigate('/dashboard')}
        >
          Cancel
        </s-button>
        <s-button
          type="submit"
          variant="primary"
          icon="save"
        >
          Save Giveaway
        </s-button>
      </div>
    </form>
  )
}
