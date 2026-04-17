import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Mail, Upload, Lock, Plus, ChevronUp, ChevronDown,
  Shield, Zap, PlugZap, FileText, MapPin, UserCheck, Share2, FlaskConical, Sliders, Trash2, Sparkles, Loader2, X, Gift,
  Palette, Settings2, Globe, AlertTriangle, ExternalLink, Save, Search,
} from 'lucide-react'
import { generateTitle, generateDescription, generateRules } from '../lib/groq'
import { fetchShopifyProducts } from '../lib/shopify'
import { useStore } from '../store/useStore'

// Minimal inline brand icons
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
      { key: 'listId', label: 'Audience ID',    placeholder: 'e.g. a1b2c3d4e5' },
      { key: 'apiKey', label: 'API Key',         placeholder: 'e.g. abc123-us1', type: 'password' },
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
      { key: 'apiUrl', label: 'Account URL', placeholder: 'https://yourname.api-us1.com' },
      { key: 'apiKey', label: 'API Key',     placeholder: 'Your API key', type: 'password' },
      { key: 'listId', label: 'List ID',     placeholder: 'e.g. 1' },
    ],
  },
  {
    key: 'webhook',
    name: 'Custom Webhook',
    color: '#6366F1',
    letter: 'W',
    desc: 'POST entry data to any custom URL',
    fields: [
      { key: 'url',    label: 'Endpoint URL',       placeholder: 'https://yoursite.com/webhook' },
      { key: 'secret', label: 'Secret (optional)',   placeholder: 'HMAC signing secret' },
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
  { key: 'twitter',   label: 'X',  bg: 'bg-black/80',  text: 'text-white' },
  { key: 'facebook',  label: 'f',  bg: 'bg-blue-600',  text: 'text-white' },
  { key: 'instagram', label: 'Ig', bg: 'bg-pink-500',  text: 'text-white' },
  { key: 'messenger', label: 'm',  bg: 'bg-blue-400',  text: 'text-white' },
  { key: 'linkedin',  label: 'in', bg: 'bg-blue-700',  text: 'text-white' },
  { key: 'pinterest', label: 'P',  bg: 'bg-red-600',   text: 'text-white' },
  { key: 'email',     label: '@',  bg: 'bg-dark-600',  text: 'text-dark-300' },
]

// Legacy ENTRY_ACTION_GROUPS kept for backwards-compat (not shown in UI but referenced by ENTRY_ACTION_CONFIG)
const ENTRY_ACTION_GROUPS_LEGACY = [
  {
    label: 'Social Follow',
    options: ['Facebook Like', 'Instagram Follow', 'X Follow', 'YouTube Subscribe', 'Podcast Subscribe'],
  },
  {
    label: 'Other',
    options: ['Daily Entries', 'Click a Link', 'Watch a YouTube Video', 'Phone Number', 'Answer a Question', 'Refer a Friend', 'Leave a Review'],
  },
]

// Per-action field configuration (keeps legacy keys + new GN keys)
const ENTRY_ACTION_CONFIG = {
  'Facebook Like':              { urlLabel: 'Facebook Page URL',   urlPlaceholder: 'https://facebook.com',  defaultText: 'Like us on Facebook!',               locked: false },
  'Instagram Follow':           { urlLabel: 'Instagram Username',   urlPlaceholder: '',                      defaultText: 'Follow me on Instagram!',             locked: false },
  'X Follow':                   { urlLabel: 'X Username',           urlPlaceholder: '',                      defaultText: 'Follow me on X!',                    locked: false },
  'YouTube Subscribe':          { urlLabel: 'YouTube Channel URL',  urlPlaceholder: 'http://youtube.com/',   defaultText: 'Subscribe to my channel on YouTube', locked: false },
  'Podcast Subscribe':          { urlLabel: 'Podcast URL',          urlPlaceholder: '',                      defaultText: 'Subscribe to my podcast!',           locked: false },
  'Daily Entries':              { urlLabel: null,                   urlPlaceholder: '',                      defaultText: 'Click here every day for more entries', locked: false },
  'Click a Link':               { urlLabel: 'Action URL',           urlPlaceholder: 'http://',               defaultText: 'Visit our site!',                    locked: false },
  'Watch a YouTube Video':      { urlLabel: 'YouTube Video URL',    urlPlaceholder: 'http://youtube.com/',   defaultText: 'Watch my YouTube video!',            locked: false },
  'Phone Number':               { urlLabel: null,                   urlPlaceholder: '',                      defaultText: 'Enter your phone number',            locked: false },
  'Answer a Question':          { urlLabel: null,                   urlPlaceholder: '',                      defaultText: 'Answer a question',                  locked: false },
  'Refer a Friend':             { urlLabel: null,                   urlPlaceholder: '',                      defaultText: 'Refer a friend',                     locked: false },
  'Leave a Review':             { urlLabel: 'Review URL',           urlPlaceholder: '',                      defaultText: 'Leave a review',                     locked: false },
  // GN action keys
  'Make a purchase':            { urlLabel: 'Store URL',            urlPlaceholder: 'https://',              defaultText: 'Make a purchase',                    locked: false },
  'Refer a friend':             { urlLabel: null,                   urlPlaceholder: '',                      defaultText: 'Refer a friend',                     locked: false },
  'Tweet a Message':            { urlLabel: 'Tweet Text / URL',     urlPlaceholder: 'https://twitter.com',  defaultText: 'Tweet about us!',                    locked: false },
  'Visit a Page':               { urlLabel: 'Page URL',             urlPlaceholder: 'https://',              defaultText: 'Visit our page!',                    locked: false },
  'Visit us on Facebook':       { urlLabel: 'Facebook Page URL',    urlPlaceholder: 'https://facebook.com', defaultText: 'Visit us on Facebook!',              locked: false },
  'Follow us on X (Twitter)':   { urlLabel: 'X Profile URL',        urlPlaceholder: 'https://x.com/',       defaultText: 'Follow us on X!',                    locked: false },
  'Follow us on Tik Tok':       { urlLabel: 'TikTok Profile URL',   urlPlaceholder: 'https://tiktok.com/',  defaultText: 'Follow us on TikTok!',               locked: false },
  'Visit us on Instagram':      { urlLabel: 'Instagram URL',        urlPlaceholder: 'https://instagram.com/', defaultText: 'Visit us on Instagram!',           locked: false },
  'Follow us on Pinterest':     { urlLabel: 'Pinterest URL',        urlPlaceholder: 'https://pinterest.com/', defaultText: 'Follow us on Pinterest!',          locked: false },
  'Visit a YouTube Channel':    { urlLabel: 'YouTube Channel URL',  urlPlaceholder: 'https://youtube.com/', defaultText: 'Visit our YouTube channel!',         locked: false },
  'View Facebook Post/Video':   { urlLabel: 'Facebook Post URL',    urlPlaceholder: 'https://facebook.com/', defaultText: 'View our Facebook post!',           locked: false },
  'View Instagram Post/Video':  { urlLabel: 'Instagram Post URL',   urlPlaceholder: 'https://instagram.com/', defaultText: 'View our Instagram post!',         locked: false },
  'View TikTok Post':           { urlLabel: 'TikTok Post URL',      urlPlaceholder: 'https://tiktok.com/',  defaultText: 'View our TikTok post!',              locked: false },
  'Watch a Video':              { urlLabel: 'Video URL',            urlPlaceholder: 'https://',              defaultText: 'Watch our video!',                   locked: false },
  'Sign-up bonus entries':      { urlLabel: null,                   urlPlaceholder: '',                      defaultText: 'Sign up for bonus entries!',          locked: false },
  'Polls & Surveys':            { urlLabel: 'Survey URL',           urlPlaceholder: 'https://',              defaultText: 'Complete our survey!',               locked: false },
  'Submit an Image':            { urlLabel: null,                   urlPlaceholder: '',                      defaultText: 'Submit an image!',                   locked: false },
  'Custom action':              { urlLabel: 'Action URL',           urlPlaceholder: 'https://',              defaultText: 'Complete this action!',              locked: false },
}

// GiveawayNinja action groups for Tab 2
const GN_ACTION_GROUPS = [
  {
    title: 'Boost sales',
    items: [
      { key: 'Make a purchase', label: 'Make a purchase', color: '#6b7280' },
    ],
  },
  {
    title: 'Get More Traffic',
    items: [
      { key: 'Refer a friend',  label: 'Refer a friend',  color: '#6b7280' },
      { key: 'Tweet a Message', label: 'Tweet a Message', color: '#1d9bf0' },
      { key: 'Visit a Page',    label: 'Visit a Page',    color: '#22c55e' },
    ],
  },
  {
    title: 'Get More Subscribers',
    items: [
      { key: 'Visit us on Facebook',     label: 'Visit us on Facebook',     color: '#1877f2' },
      { key: 'Follow us on X (Twitter)', label: 'Follow us on X (Twitter)', color: '#1d9bf0' },
      { key: 'Follow us on Tik Tok',     label: 'Follow us on Tik Tok',     color: '#010101' },
      { key: 'Visit us on Instagram',    label: 'Visit us on Instagram',    color: '#e1306c' },
      { key: 'Follow us on Pinterest',   label: 'Follow us on Pinterest',   color: '#e60023' },
      { key: 'Visit a YouTube Channel',  label: 'Visit a YouTube Channel',  color: '#ff0000' },
    ],
  },
  {
    title: 'Boost Social Engagement',
    items: [
      { key: 'View Facebook Post/Video',  label: 'View Facebook Post/Video',  color: '#1877f2' },
      { key: 'View Instagram Post/Video', label: 'View Instagram Post/Video', color: '#e1306c' },
      { key: 'View TikTok Post',          label: 'View TikTok Post',          color: '#010101' },
      { key: 'Watch a Video',             label: 'Watch a Video',             color: '#ff0000' },
    ],
  },
  {
    title: 'Boost On-site Engagement',
    items: [
      { key: 'Sign-up bonus entries', label: 'Sign-up bonus entries', color: '#eab308' },
      { key: 'Answer a Question',     label: 'Answer a Question',     color: '#f97316' },
      { key: 'Polls & Surveys',       label: 'Polls & Surveys',       color: '#22c55e' },
      { key: 'Submit an Image',       label: 'Submit an Image',       color: '#3b82f6' },
      { key: 'Custom action',         label: 'Custom action',         color: '#6b7280' },
    ],
  },
]

const TABS = [
  { label: 'Giveaway',      icon: Gift },
  { label: 'Sign Up Form',  icon: Mail },
  { label: 'Entry Actions', icon: Zap },
  { label: 'Design',        icon: Palette },
  { label: 'Advanced',      icon: Settings2 },
  { label: 'Translations',  icon: Globe },
  { label: 'SEO',           icon: Search },
]

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

const Toggle = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={onChange}
    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0 ${checked ? 'bg-brand-green' : 'bg-dark-600'}`}
  >
    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-4' : 'translate-x-1'}`} />
  </button>
)

export default function CampaignBuilder() {
  const navigate = useNavigate()
  const { createCampaign, publishCampaign, activeCampaign } = useStore()

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
    // Sharing
    sharing: { twitter: true, facebook: true, instagram: true, messenger: true, linkedin: true, pinterest: true, email: true },
    // Entry actions
    entryActions: [],
    // reCAPTCHA
    recaptcha: true,
    // Rules and terms
    rulesText: '',
    termsUrl: '',
    eligibility: '',
    // Marketing consent
    marketingConsent: false,
    // Password protection
    passwordProtected: false,
    password: '',
    // Geo restrictions
    geoEnabled: false,
    allowedCountries: [],
    // Age verification
    ageVerification: false,
    minimumAge: 18,
    ageConsentText: 'I confirm I am 18 years of age or older.',
    // Referral tracking
    referralEnabled: true,
    referralBonusEntries: 2,
    // A/B test
    abTestEnabled: false,
    abVariantA: { name: 'Variant A', description: '' },
    abVariantB: { name: 'Variant B', description: '' },
    abSplit: 50,
    // Custom fields
    customFields: [],
    // Integrations
    integrations: [],
    // Sign Up Form tab
    emailLabel: 'Enter with your email',
    enterButtonText: 'ENTER NOW',
    optinMode: 'explicit',
    optinLabel: 'I agree to receive marketing messages',
    gdprRequireEU: true,
    gdprRequireNonEU: false,
    gdprCheckboxText: 'I accept the terms and privacy policy.',
    privacyPolicyLink: '',
    customTag: 'giveaway-ninja',
    createShopifyCustomer: false,
    // Design tab
    coverImages: [null, null, null],
    launchButtonIcon: true,
    launchButtonLabel: 'Giveaway',
    launchButtonDesktopPos: 'Bottom Left',
    launchButtonMobilePos: 'Bottom Left',
    launchButtonColor: '#ffffff',
    launchButtonBg: '#000000',
    launchButtonFont: 'Nunito',
    leaderboardEnabled: false,
    galleryEnabled: false,
    widgetCss: '',
    pageCss: '',
    giveawayEndedHeader: 'Giveaway ended',
    giveawayEndedMessage: "Ouch! This giveaway has ended, stay tuned for our next amazing giveaway 😊",
    // Advanced tab
    urlShowOn: '',
    urlHideOn: '',
    queryTriggerIf: '',
    queryDontTriggerIf: '',
    referrerTriggerIf: '',
    referrerDontTriggerIf: '',
    countryTriggerFor: '',
    countryDontTriggerFor: '',
    // Translations
    languages: [],
    // SEO
    seoTitle: '',
    seoDescription: '',
    ogImage: '',
  })

  const [errors, setErrors] = useState({})
  const [showIntegrationPicker, setShowIntegrationPicker] = useState(false)
  const [aiLoading, setAiLoading] = useState({ title: false, description: false, rules: false })
  const [aiError, setAiError] = useState('')
  const [shopify, setShopify] = useState({ domain: '', token: '', products: [], loading: false, error: '', connected: false })
  const [showProductPicker, setShowProductPicker] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const [previewMode, setPreviewMode] = useState('signup')

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

  const buildCampaignData = (status = 'draft') => ({
    title: form.title,
    prize: form.prizeName,
    prizeValue: form.prizeValue,
    description: form.description,
    startDate: form.startsAt?.split('T')[0],
    endDate: form.endsAt?.split('T')[0],
    status,
    numberOfWinners: form.numberOfWinners || 1,
    entryMethods: {
      email:     true,
      instagram: !!form.sharing.instagram,
      tiktok:    !!form.sharing.instagram,
      share:     !!form.sharing.twitter || !!form.sharing.facebook,
      visit:     false,
      purchase:  false,
    },
    entryValues: { email: 1, instagram: 2, tiktok: 2, share: 3, visit: 1, purchase: 5 },
    entryActions:  form.entryActions,
    integrations:  form.integrations,
    rulesText:     form.rulesText,
    termsUrl:      form.termsUrl,
    eligibility:   form.eligibility,
    customFields:  form.customFields,
    fraudDetection: { blockDuplicateIP: true, blockDuplicateEmail: true, recaptcha: form.recaptcha },
    branding: {
      showPoweredBy: true,
      customColor:   form.brandColor || '#00d084',
      storeName:     form.runnerName,
      logoUrl:       form.logoUrl || '',
    },
    geoEnabled:      form.geoEnabled,
    allowedCountries: form.allowedCountries,
    ageVerification: form.ageVerification,
    minimumAge:      form.minimumAge,
    referralEnabled:      form.referralEnabled,
    referralBonusEntries: form.referralBonusEntries,
    passwordProtected: form.passwordProtected,
    password:          form.password,
    marketingConsent: form.marketingConsent,
    seoTitle:       form.seoTitle,
    seoDescription: form.seoDescription,
    ogImage:        form.ogImage,
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    createCampaign(buildCampaignData('draft'))
    navigate('/dashboard')
  }

  const handlePublish = () => {
    if (!validate()) return
    createCampaign(buildCampaignData('active'))
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

  // ── Tab content renderers ──────────────────────────────────────────────────

  const renderTabGiveaway = () => (
    <div className="space-y-5">
      {/* Competition Information */}
      <div>
        <h3 className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-3">Competition Information</h3>
        <div className="space-y-4">
          {/* Title */}
          <InputField label="Title" required error={errors.title}>
            <div className="flex gap-2">
              <input
                type="text"
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="e.g. Win a $500 Gift Card!"
                className={inputCls}
              />
              <button
                type="button"
                onClick={handleGenerateTitle}
                disabled={aiLoading.title}
                className="shrink-0 flex items-center gap-1.5 px-3 py-2 border border-dark-500 rounded-lg text-xs text-dark-300 hover:text-white hover:border-dark-400 transition-colors disabled:opacity-50"
              >
                {aiLoading.title ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                {aiLoading.title ? 'Generating…' : 'AI'}
              </button>
            </div>
          </InputField>

          {/* Description */}
          <InputField label="Description">
            <div className="space-y-1.5">
              <textarea
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                rows={4}
                placeholder="Describe your giveaway or click 'AI' to generate…"
                className={inputCls + ' resize-none'}
              />
              <button
                type="button"
                onClick={handleGenerateDescription}
                disabled={aiLoading.description}
                className="flex items-center gap-1.5 text-xs text-dark-300 hover:text-white border border-dark-500 hover:border-dark-400 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
              >
                {aiLoading.description ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                {aiLoading.description ? 'Generating…' : 'Generate with AI'}
              </button>
            </div>
          </InputField>

          {/* Starts / Ends */}
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Starts At" required>
              <input type="datetime-local" value={form.startsAt} onChange={(e) => set('startsAt', e.target.value)} className={inputCls} />
            </InputField>
            <InputField label="Ends At" required error={errors.endsAt}>
              <input type="datetime-local" value={form.endsAt} onChange={(e) => set('endsAt', e.target.value)} className={inputCls} />
            </InputField>
          </div>

          {/* Awarded / Winners */}
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Awarded At" required>
              <input type="datetime-local" value={form.awardedAt} onChange={(e) => set('awardedAt', e.target.value)} className={inputCls} />
            </InputField>
            <InputField label="Number of Winners" required>
              <input type="number" min="1" value={form.numberOfWinners} onChange={(e) => set('numberOfWinners', parseInt(e.target.value) || 1)} className={inputCls} />
            </InputField>
          </div>

          {/* Timezone */}
          <InputField label="Timezone">
            <select value={form.timezone} onChange={(e) => set('timezone', e.target.value)} className={inputCls}>
              {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
            </select>
          </InputField>
        </div>
      </div>

      {/* Who's running */}
      <div>
        <h3 className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-3">Who's Running This Giveaway?</h3>
        <div className="grid grid-cols-2 gap-3">
          <InputField label="Name" required>
            <input type="text" value={form.runnerName} onChange={(e) => set('runnerName', e.target.value)} className={inputCls} />
          </InputField>
          <InputField label="URL" required>
            <input type="text" value={form.runnerUrl} onChange={(e) => set('runnerUrl', e.target.value)} placeholder="http://" className={inputCls} />
          </InputField>
        </div>
      </div>

      {/* Shopify Product Picker */}
      <div>
        <h3 className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-3">Import Prize from Shopify</h3>
        <div className="border border-dark-600 rounded-xl p-4 bg-dark-700/30">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-white flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-[#96bf48] flex items-center justify-center text-[10px] font-black text-white">S</span>
              Shopify Store
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
      </div>

      {/* Prize details */}
      <div>
        <h3 className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-3">What Are You Giving Away?</h3>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Prize Name" required error={errors.prizeName}>
              <input type="text" value={form.prizeName} onChange={(e) => set('prizeName', e.target.value)} className={inputCls} />
            </InputField>
            <InputField label="Prize Value">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 text-sm">$</span>
                <input type="text" value={form.prizeValue} onChange={(e) => set('prizeValue', e.target.value)} className={inputCls + ' pl-6'} />
              </div>
            </InputField>
          </div>

          {/* Prize image */}
          <InputField label="Prize Image">
            <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-dark-500 rounded-xl py-5 cursor-pointer hover:border-brand-green/50 transition-colors bg-dark-700">
              <Upload size={18} className="text-dark-400" />
              <span className="text-xs text-dark-400">Add Cover Image</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => set('prizeImage', e.target.files?.[0] || null)} />
            </label>
            {form.prizeImageUrl && (
              <div className="mt-2 flex items-center gap-2">
                <img src={form.prizeImageUrl} alt="Prize" className="w-14 h-14 rounded-lg object-cover border border-dark-500" />
                <div>
                  <p className="text-xs text-brand-green">Product image imported from Shopify</p>
                  <button type="button" onClick={() => set('prizeImageUrl', '')} className="text-[10px] text-dark-400 hover:text-white transition-colors mt-0.5">Remove</button>
                </div>
              </div>
            )}
          </InputField>
        </div>
      </div>

      {/* Contestants Must Provide */}
      <div>
        <h3 className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-3">Contestants Must Provide</h3>
        <div className="flex items-center gap-5">
          {[
            { key: 'email', label: 'Email' },
            { key: 'name', label: 'Name' },
            { key: 'phone', label: 'Phone Number' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={!!form.contestantsProvide[key]}
                onChange={() => setForm((f) => ({ ...f, contestantsProvide: { ...f.contestantsProvide, [key]: !f.contestantsProvide[key] } }))}
                className="rounded border-dark-500 bg-dark-700 text-brand-green focus:ring-brand-green"
              />
              <span className="text-sm text-white">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Rules and Terms */}
      <div>
        <h3 className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-3">Rules and Terms</h3>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2 mb-1">
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
              <button key={label} type="button" onClick={() => set('rulesText', text)}
                className="text-xs px-2.5 py-1 border border-dark-500 rounded-lg text-dark-300 hover:text-white hover:border-dark-400 transition-colors">
                {label}
              </button>
            ))}
            {form.rulesText && (
              <button type="button" onClick={() => set('rulesText', '')}
                className="text-xs px-2.5 py-1 border border-red-800/50 rounded-lg text-red-400 hover:border-red-600 transition-colors">
                Clear
              </button>
            )}
          </div>

          <InputField label="Giveaway Rules">
            <div className="space-y-1.5">
              <textarea
                value={form.rulesText}
                onChange={(e) => set('rulesText', e.target.value)}
                rows={6}
                placeholder={`Example:\n1. Open to residents of [Country] aged 18+.\n2. One entry per person.\n3. Winner will be selected randomly and notified by email.`}
                className={inputCls + ' resize-none'}
              />
              <button
                type="button"
                onClick={handleGenerateRules}
                disabled={aiLoading.rules}
                className="flex items-center gap-1.5 text-xs text-dark-300 hover:text-white border border-dark-500 hover:border-dark-400 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
              >
                {aiLoading.rules ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                {aiLoading.rules ? 'Generating…' : 'Generate with AI'}
              </button>
            </div>
          </InputField>

          <div className="grid grid-cols-2 gap-3">
            <InputField label="Eligibility">
              <input type="text" value={form.eligibility} onChange={(e) => set('eligibility', e.target.value)} placeholder="e.g. US residents, 18+" className={inputCls} />
            </InputField>
            <InputField label="Full T&C URL">
              <input type="text" value={form.termsUrl} onChange={(e) => set('termsUrl', e.target.value)} placeholder="https://yoursite.com/terms" className={inputCls} />
            </InputField>
          </div>

          {form.rulesText && (
            <p className="text-xs text-dark-500 text-right">
              {form.rulesText.length} characters · {form.rulesText.split('\n').filter(Boolean).length} rules
            </p>
          )}
        </div>
      </div>

      {/* reCAPTCHA */}
      <div>
        <h3 className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-3">Invisible reCAPTCHA</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white">Enable invisible reCAPTCHA</p>
            <p className="text-xs text-dark-400 mt-0.5">Reduces spam signups by bot mitigation technology.</p>
          </div>
          <Toggle checked={form.recaptcha} onChange={() => set('recaptcha', !form.recaptcha)} />
        </div>
      </div>

      {/* Marketing Consent */}
      <div>
        <h3 className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-3">Marketing Consent</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white">Show marketing consent checkbox</p>
            <p className="text-xs text-dark-400 mt-0.5">Recommended for GDPR, CAN, and other regulations.</p>
          </div>
          <Toggle checked={form.marketingConsent} onChange={() => set('marketingConsent', !form.marketingConsent)} />
        </div>
      </div>
    </div>
  )

  const renderTabSignUpForm = () => (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-3">Header</h3>
        <div className="space-y-3">
          <InputField label="Email Label">
            <input type="text" value={form.emailLabel} onChange={(e) => set('emailLabel', e.target.value)} className={inputCls} />
          </InputField>
          <InputField label="Enter Button Text">
            <input type="text" value={form.enterButtonText} onChange={(e) => set('enterButtonText', e.target.value)} className={inputCls} />
          </InputField>
        </div>
      </div>

      {/* Opt-in Marketing */}
      <div>
        <h3 className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-3">Opt-in Marketing</h3>
        <div className="space-y-3">
          <InputField label="Opt-in Mode">
            <select value={form.optinMode} onChange={(e) => set('optinMode', e.target.value)} className={inputCls}>
              <option value="explicit">Explicit opt-in is optional</option>
              <option value="implicit">Implicit opt-in</option>
            </select>
          </InputField>
          <InputField label="Opt-in Label">
            <input type="text" value={form.optinLabel} onChange={(e) => set('optinLabel', e.target.value)} className={inputCls} />
          </InputField>
        </div>
      </div>

      {/* GDPR */}
      <div>
        <h3 className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-3">Privacy &amp; GDPR Policy</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white">Require GDPR for EU visitors</p>
              <p className="text-xs text-dark-400 mt-0.5">Show consent checkbox to EU/EEA visitors.</p>
            </div>
            <Toggle checked={form.gdprRequireEU} onChange={() => set('gdprRequireEU', !form.gdprRequireEU)} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white">Require GDPR for non-EU visitors</p>
              <p className="text-xs text-dark-400 mt-0.5">Show consent checkbox to all visitors.</p>
            </div>
            <Toggle checked={form.gdprRequireNonEU} onChange={() => set('gdprRequireNonEU', !form.gdprRequireNonEU)} />
          </div>
          <InputField label="GDPR Checkbox Text">
            <input type="text" value={form.gdprCheckboxText} onChange={(e) => set('gdprCheckboxText', e.target.value)} className={inputCls} />
          </InputField>
          <InputField label="Privacy Policy Link">
            <input type="text" value={form.privacyPolicyLink} onChange={(e) => set('privacyPolicyLink', e.target.value)} placeholder="https://yoursite.com/privacy" className={inputCls} />
          </InputField>
        </div>
      </div>

      {/* Integrations */}
      <div>
        <h3 className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-3">Integrations</h3>
        <p className="text-xs text-dark-400 mb-4">Send new contestant data to third-party services automatically.</p>

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
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, integrations: f.integrations.filter((i) => i.id !== intg.id) }))}
                      className="text-dark-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="p-4 bg-dark-800 grid grid-cols-1 gap-3">
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

        {showIntegrationPicker ? (
          <div className="border border-dark-500 rounded-xl p-4 mb-3">
            <p className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-3">Choose an Integration</p>
            <div className="grid grid-cols-2 gap-2">
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
          <button
            type="button"
            onClick={() => setShowIntegrationPicker(true)}
            className="flex items-center gap-1.5 px-3 py-2 border border-dark-500 rounded-lg text-sm text-dark-300 hover:text-white hover:border-dark-400 transition-colors"
          >
            <Plus size={14} /> Add an Integration
          </button>
        )}
      </div>

      {/* Custom Tag */}
      <div>
        <h3 className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-3">Custom Tag</h3>
        <InputField label="Tag">
          <input type="text" value={form.customTag} onChange={(e) => set('customTag', e.target.value)} placeholder="giveaway-ninja" className={inputCls} />
        </InputField>
      </div>

      {/* Shopify Customer */}
      <div>
        <h3 className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-3">Shopify Customer Sync</h3>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-white">Create or Update Shopify Customer</p>
            <p className="text-xs text-dark-400 mt-0.5">Sync contestant emails as Shopify customers.</p>
          </div>
          <Toggle checked={form.createShopifyCustomer} onChange={() => set('createShopifyCustomer', !form.createShopifyCustomer)} />
        </div>
        <div className="bg-dark-700/50 border border-dark-600 rounded-lg px-4 py-3">
          <p className="text-xs text-dark-300">
            When enabled, each new contestant will be created (or updated) as a customer in your Shopify store.
            The <code className="bg-dark-600 px-1 rounded text-brand-green">customTag</code> value will be added as a customer tag so you can segment them later.
            Existing customers are updated — their data will not be duplicated.
          </p>
        </div>
      </div>
    </div>
  )

  const renderTabEntryActions = () => (
    <div className="space-y-4">
      {/* Added actions */}
      {form.entryActions.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-3">Added Actions</h3>
          <div className="space-y-3">
            {form.entryActions.map((action, idx) => {
              const cfg = ENTRY_ACTION_CONFIG[action.type] || {}
              const isFirst = idx === 0
              const isLast = idx === form.entryActions.length - 1
              return (
                <div key={action.id} className="border border-dark-500 rounded-lg overflow-hidden">
                  <div className="flex items-center gap-2 px-3 py-2 border-b border-dark-500 bg-dark-700">
                    <div className="flex flex-col mr-1">
                      <button type="button" onClick={() => moveEntryAction(action.id, -1)} disabled={isFirst} className="text-dark-500 hover:text-white disabled:opacity-30 leading-none"><ChevronUp size={13} /></button>
                      <button type="button" onClick={() => moveEntryAction(action.id, 1)} disabled={isLast} className="text-dark-500 hover:text-white disabled:opacity-30 leading-none"><ChevronDown size={13} /></button>
                    </div>
                    <span className="text-sm font-semibold text-white flex-1">{action.label}</span>
                    <button type="button" onClick={() => removeEntryAction(action.id)} className="text-dark-400 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                  </div>
                  <div className="p-3 bg-dark-800 space-y-2.5">
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
                    <InputField label="Number of Entries" required>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={action.entries}
                          onChange={(e) => updateEntryAction(action.id, 'entries', parseInt(e.target.value) || 1)}
                          className={inputCls + ' max-w-[90px]'}
                        />
                        <span className="text-xs text-dark-400">entries awarded</span>
                      </div>
                    </InputField>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* GN Action Groups */}
      <div>
        <h3 className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-2">Add Entry Actions</h3>
        {GN_ACTION_GROUPS.map((group) => (
          <div key={group.title}>
            <p className="text-xs font-bold text-dark-300 uppercase mb-1 mt-4">{group.title}</p>
            {group.items.map((item) => (
              <div key={item.key} className="flex items-center justify-between py-2.5 border-b border-dark-700">
                <span className="text-sm text-white">{item.label}</span>
                <button
                  type="button"
                  onClick={() => addEntryAction(item.key)}
                  className="w-6 h-6 rounded-full border flex items-center justify-center font-bold text-lg hover:opacity-70 transition-opacity"
                  style={{ color: item.color, borderColor: item.color }}
                >
                  +
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )

  const renderTabDesign = () => (
    <div className="space-y-6">
      {/* Header / Cover Images */}
      <div>
        <h3 className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-1">Header</h3>
        <p className="text-xs text-dark-500 mb-3">Required image size is 500 × 250px.</p>
        <div className="space-y-2">
          {[1, 2, 3].map((num) => (
            <label key={num} className="flex items-center gap-3 border border-dashed border-dark-500 rounded-lg px-4 py-3 cursor-pointer hover:border-brand-green/50 transition-colors bg-dark-700/30">
              <Upload size={15} className="text-dark-400 shrink-0" />
              <span className="text-xs text-dark-400 flex-1">Cover Image #{num}</span>
              <span className="text-xs text-dark-500 border border-dark-500 rounded px-2 py-0.5">Upload</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null
                  setForm((f) => {
                    const imgs = [...f.coverImages]
                    imgs[num - 1] = file
                    return { ...f, coverImages: imgs }
                  })
                }}
              />
            </label>
          ))}
        </div>
      </div>

      {/* Launch Button */}
      <div>
        <h3 className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-3">Launch Button</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-white">Show icon</p>
            <Toggle checked={form.launchButtonIcon} onChange={() => set('launchButtonIcon', !form.launchButtonIcon)} />
          </div>
          <InputField label="Label">
            <input type="text" value={form.launchButtonLabel} onChange={(e) => set('launchButtonLabel', e.target.value)} className={inputCls} />
          </InputField>
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Desktop Position">
              <select value={form.launchButtonDesktopPos} onChange={(e) => set('launchButtonDesktopPos', e.target.value)} className={inputCls}>
                {['Bottom Left', 'Bottom Right', 'Top Left', 'Top Right'].map((p) => <option key={p}>{p}</option>)}
              </select>
            </InputField>
            <InputField label="Mobile Position">
              <select value={form.launchButtonMobilePos} onChange={(e) => set('launchButtonMobilePos', e.target.value)} className={inputCls}>
                {['Bottom Left', 'Bottom Right', 'Top Left', 'Top Right'].map((p) => <option key={p}>{p}</option>)}
              </select>
            </InputField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Text Color">
              <div className="flex items-center gap-2">
                <input type="color" value={form.launchButtonColor} onChange={(e) => set('launchButtonColor', e.target.value)} className="w-8 h-8 rounded border border-dark-500 bg-dark-700 cursor-pointer" />
                <input type="text" value={form.launchButtonColor} onChange={(e) => set('launchButtonColor', e.target.value)} className={inputCls} />
              </div>
            </InputField>
            <InputField label="Background Color">
              <div className="flex items-center gap-2">
                <input type="color" value={form.launchButtonBg} onChange={(e) => set('launchButtonBg', e.target.value)} className="w-8 h-8 rounded border border-dark-500 bg-dark-700 cursor-pointer" />
                <input type="text" value={form.launchButtonBg} onChange={(e) => set('launchButtonBg', e.target.value)} className={inputCls} />
              </div>
            </InputField>
          </div>
          <InputField label="Font">
            <select value={form.launchButtonFont} onChange={(e) => set('launchButtonFont', e.target.value)} className={inputCls}>
              {['Nunito', 'Roboto', 'Open Sans', 'Lato'].map((f) => <option key={f}>{f}</option>)}
            </select>
          </InputField>
        </div>
      </div>

      {/* Leaderboard */}
      <div>
        <h3 className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-3">Leaderboard</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white">Enable leaderboard</p>
            <p className="text-xs text-dark-400 mt-0.5">Show a ranking of top contestants.</p>
          </div>
          <Toggle checked={form.leaderboardEnabled} onChange={() => set('leaderboardEnabled', !form.leaderboardEnabled)} />
        </div>
      </div>

      {/* Gallery */}
      <div>
        <h3 className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-3">Gallery</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white">Enable gallery</p>
            <p className="text-xs text-dark-400 mt-0.5">Show a gallery of submitted images.</p>
          </div>
          <Toggle checked={form.galleryEnabled} onChange={() => set('galleryEnabled', !form.galleryEnabled)} />
        </div>
      </div>

      {/* Other Content & Labels */}
      <div>
        <h3 className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-3">Other Content &amp; Labels</h3>
        <div className="space-y-3">
          <InputField label="Giveaway Ended Header">
            <input type="text" value={form.giveawayEndedHeader} onChange={(e) => set('giveawayEndedHeader', e.target.value)} className={inputCls} />
          </InputField>
          <InputField label="Giveaway Ended Message">
            <textarea value={form.giveawayEndedMessage} onChange={(e) => set('giveawayEndedMessage', e.target.value)} rows={3} className={inputCls + ' resize-none'} />
          </InputField>
        </div>
      </div>

      {/* Custom CSS */}
      <div>
        <h3 className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-3">Custom CSS</h3>
        <div className="space-y-3">
          <InputField label="WIDGET CSS (customize elements inside the widget)">
            <textarea
              value={form.widgetCss}
              onChange={(e) => set('widgetCss', e.target.value)}
              rows={4}
              placeholder=".gn-widget { ... }"
              className={inputCls + ' resize-none font-mono text-xs'}
            />
          </InputField>
          <InputField label="PAGE CSS (customize elements on the landing page)">
            <textarea
              value={form.pageCss}
              onChange={(e) => set('pageCss', e.target.value)}
              rows={4}
              placeholder=".gn-page { ... }"
              className={inputCls + ' resize-none font-mono text-xs'}
            />
          </InputField>
        </div>
      </div>
    </div>
  )

  const renderTabAdvanced = () => (
    <div className="space-y-6">
      {/* URL Filter */}
      <div>
        <h3 className="text-sm font-bold text-red-400 uppercase mb-3">URL Filter</h3>
        <div className="space-y-3">
          <InputField label="SHOW the widget ONLY on page URLs containing">
            <textarea value={form.urlShowOn} onChange={(e) => set('urlShowOn', e.target.value)} rows={3} placeholder="One URL per line…" className={inputCls + ' resize-none'} />
          </InputField>
          <InputField label="HIDE the widget on page URLs containing">
            <textarea value={form.urlHideOn} onChange={(e) => set('urlHideOn', e.target.value)} rows={3} placeholder="One URL per line…" className={inputCls + ' resize-none'} />
          </InputField>
        </div>
      </div>

      {/* Initial Page */}
      <div>
        <h3 className="text-sm font-bold text-red-400 uppercase mb-3">Initial Page (first page reached by the user)</h3>
        <div className="space-y-3">
          <InputField label="Trigger this giveaway if the landing's querystring contains">
            <input type="text" value={form.queryTriggerIf} onChange={(e) => set('queryTriggerIf', e.target.value)} placeholder="e.g. utm_source=newsletter" className={inputCls} />
          </InputField>
          <InputField label="Do not trigger if the landing's querystring contains">
            <input type="text" value={form.queryDontTriggerIf} onChange={(e) => set('queryDontTriggerIf', e.target.value)} placeholder="e.g. no-popup" className={inputCls} />
          </InputField>
        </div>
      </div>

      {/* Referrer */}
      <div>
        <h3 className="text-sm font-bold text-red-400 uppercase mb-3">Referrer</h3>
        <div className="space-y-3">
          <InputField label="Trigger this giveaway if the referrer contains">
            <input type="text" value={form.referrerTriggerIf} onChange={(e) => set('referrerTriggerIf', e.target.value)} placeholder="e.g. google.com" className={inputCls} />
          </InputField>
          <InputField label="Do not trigger if the referrer contains">
            <input type="text" value={form.referrerDontTriggerIf} onChange={(e) => set('referrerDontTriggerIf', e.target.value)} placeholder="e.g. facebook.com" className={inputCls} />
          </InputField>
        </div>
      </div>

      {/* Country */}
      <div>
        <h3 className="text-sm font-bold text-red-400 uppercase mb-3">Country</h3>
        <div className="space-y-3">
          <InputField label="Trigger this giveaway for the following country/countries (enter the country code(s), ex. US, ES, CH...):">
            <input type="text" value={form.countryTriggerFor} onChange={(e) => set('countryTriggerFor', e.target.value)} placeholder="US, GB, AU" className={inputCls} />
          </InputField>
          <InputField label="Do not trigger this giveaway for the following country/countries:">
            <input type="text" value={form.countryDontTriggerFor} onChange={(e) => set('countryDontTriggerFor', e.target.value)} placeholder="CN, RU" className={inputCls} />
          </InputField>
        </div>
      </div>
    </div>
  )

  const renderTabTranslations = () => (
    <div className="space-y-4">
      <p className="text-sm text-dark-300">
        Add translations for different languages. The widget detects{' '}
        <code className="bg-dark-700 px-1 rounded text-brand-green text-xs">Shopify.locale</code>{' '}
        and displays the matching language automatically.
      </p>
      {form.languages.length === 0 && (
        <p className="text-sm text-dark-400">
          No translations added yet.{' '}
          <button type="button" className="text-brand-green hover:underline">Add a language</button>{' '}
          to get started.
        </p>
      )}
      <div className="flex items-center gap-2">
        <select className={inputCls + ' flex-1'}>
          <option value="">Select language...</option>
          {['English', 'French', 'German', 'Spanish', 'Italian', 'Portuguese', 'Dutch'].map((l) => (
            <option key={l}>{l}</option>
          ))}
        </select>
        <button
          type="button"
          className="px-3 py-2 border border-dark-500 rounded-lg text-sm text-dark-300 hover:text-white hover:border-dark-400 flex items-center gap-1.5 shrink-0 transition-colors"
        >
          <Plus size={13} /> Add Language
        </button>
      </div>
    </div>
  )

  const renderTabSEO = () => {
    const previewTitle = form.seoTitle || form.title || 'Your Giveaway Title'
    const previewDesc  = form.seoDescription || form.description || 'Enter for a chance to win an amazing prize!'
    const pageUrl      = `${window.location.origin}/g/${activeCampaign?.id || 'your-campaign-id'}`

    return (
      <div className="space-y-4 p-4">
        <div>
          <label className="block text-xs text-dark-400 mb-1.5">SEO Title <span className="text-dark-500">(shown in Google & browser tab)</span></label>
          <input
            value={form.seoTitle}
            onChange={(e) => set('seoTitle', e.target.value)}
            placeholder={form.title || 'Win a free iPhone 15 Pro — Enter Now'}
            maxLength={60}
            className={inputCls}
          />
          <p className="text-xs text-dark-500 mt-1">{form.seoTitle.length}/60 characters · Leave blank to use giveaway title</p>
        </div>

        <div>
          <label className="block text-xs text-dark-400 mb-1.5">SEO Description <span className="text-dark-500">(shown in Google search results)</span></label>
          <textarea
            value={form.seoDescription}
            onChange={(e) => set('seoDescription', e.target.value)}
            placeholder={form.description || 'Enter our giveaway for a chance to win…'}
            maxLength={160}
            rows={3}
            className={inputCls + ' resize-none'}
          />
          <p className="text-xs text-dark-500 mt-1">{form.seoDescription.length}/160 characters · Leave blank to use giveaway description</p>
        </div>

        <div>
          <label className="block text-xs text-dark-400 mb-1.5">OG / Social Share Image URL <span className="text-dark-500">(shown when shared on Facebook, WhatsApp, etc.)</span></label>
          <input
            value={form.ogImage}
            onChange={(e) => set('ogImage', e.target.value)}
            placeholder="https://yoursite.com/og-image.jpg (1200×630px recommended)"
            className={inputCls}
          />
          {form.prizeImageUrl && !form.ogImage && (
            <p className="text-xs text-dark-400 mt-1">
              Tip: Leave blank to auto-use your prize image.{' '}
              <button type="button" onClick={() => set('ogImage', form.prizeImageUrl)} className="text-brand-green underline">Use prize image</button>
            </p>
          )}
        </div>

        {/* Live preview */}
        <div>
          <p className="text-xs text-dark-400 mb-2 font-semibold">Google Search Preview</p>
          <div className="bg-white rounded-xl p-4 space-y-0.5">
            <p className="text-xs text-green-700 font-mono truncate">{pageUrl}</p>
            <p className="text-base text-blue-700 font-medium leading-tight line-clamp-1">{previewTitle}</p>
            <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{previewDesc}</p>
          </div>
        </div>

        <div>
          <p className="text-xs text-dark-400 mb-2 font-semibold">Social Share Preview (OG)</p>
          <div className="bg-white rounded-xl overflow-hidden border border-gray-200 max-w-sm">
            <div className="h-32 bg-gray-100 flex items-center justify-center overflow-hidden">
              {(form.ogImage || form.prizeImageUrl)
                ? <img src={form.ogImage || form.prizeImageUrl} alt="OG preview" className="w-full h-full object-cover" />
                : <p className="text-xs text-gray-400">No image — add OG image above</p>}
            </div>
            <div className="px-3 py-2.5 border-t border-gray-100">
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">{window.location.hostname}</p>
              <p className="text-sm font-semibold text-gray-800 line-clamp-1">{previewTitle}</p>
              <p className="text-xs text-gray-500 line-clamp-2">{previewDesc}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const tabContent = [
    renderTabGiveaway,
    renderTabSignUpForm,
    renderTabEntryActions,
    renderTabDesign,
    renderTabAdvanced,
    renderTabTranslations,
    renderTabSEO,
  ]

  const daysLeft = form.endsAt
    ? Math.max(0, Math.floor((new Date(form.endsAt) - new Date()) / 86400000))
    : 14

  return (
    <form onSubmit={handleSubmit}>
      <div className="-m-4 sm:-m-6 flex" style={{ height: 'calc(100vh - 57px)' }}>

        {/* ── Left panel ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col border-r border-dark-600 bg-dark-800" style={{ width: '420px', minWidth: '360px' }}>

          {/* 1. Top bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-dark-800 border-b border-dark-600 shrink-0">
            <h2 className="text-sm font-bold text-white">Edit Giveaway</h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="w-8 h-8 border border-dark-500 rounded-lg flex items-center justify-center text-dark-400 hover:text-white transition-colors"
                onClick={() => navigate('/dashboard')}
                title="Back to dashboard"
              >
                <ExternalLink size={14} />
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-3 py-1.5 border border-dark-400 text-dark-300 hover:text-white hover:border-dark-300 text-xs font-medium rounded-lg transition-colors"
              >
                <Save size={13} /> Save Draft
              </button>
              <button
                type="button"
                onClick={handlePublish}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-green hover:bg-brand-green/80 text-dark-900 text-xs font-bold rounded-lg transition-colors"
              >
                <Zap size={13} /> Publish
              </button>
            </div>
          </div>

          {/* 2. Warning banner */}
          {aiError ? (
            <div className="bg-red-500/10 border-b border-red-500/40 px-4 py-2 flex items-center gap-2 shrink-0">
              <AlertTriangle size={13} className="text-red-400 shrink-0" />
              <p className="text-xs text-red-400"><strong>AI Error:</strong> {aiError}</p>
            </div>
          ) : (
            <div className="bg-red-50 border-b border-red-200 px-4 py-2 flex items-center gap-2 shrink-0">
              <AlertTriangle size={13} className="text-red-600 shrink-0" />
              <p className="text-xs text-red-700"><strong>Complete Your Setup</strong> · To show the giveaway, you need to save it first.</p>
            </div>
          )}

          {/* 3. Tab bar */}
          <div className="flex border-b border-dark-600 bg-dark-800 overflow-x-auto shrink-0">
            {TABS.map((tab, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveTab(i)}
                className={`flex flex-col items-center gap-1 px-3 py-2.5 text-[10px] font-medium border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === i
                    ? 'border-brand-green text-brand-green'
                    : 'border-transparent text-dark-400 hover:text-white'
                }`}
              >
                <tab.icon size={15} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* 4. Form content */}
          <div className="flex-1 overflow-y-auto p-5">
            {tabContent[activeTab]?.()}
          </div>
        </div>

        {/* ── Right panel: Preview ─────────────────────────────────────────────── */}
        <div className="flex-1 bg-dark-900 flex flex-col overflow-hidden">

          {/* Preview state toggles */}
          <div className="flex items-center justify-center gap-1 py-3 border-b border-dark-700 shrink-0">
            {['signup', 'loggedin', 'ended'].map((s) => {
              const label = s === 'signup' ? 'Sign up' : s === 'loggedin' ? 'Logged-in' : 'Ended'
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setPreviewMode(s)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    previewMode === s
                      ? 'bg-dark-600 text-white border border-dark-400'
                      : 'text-dark-400 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>

          {/* Widget preview */}
          <div className="flex-1 flex flex-col items-center pt-6 px-6 overflow-y-auto">
            <div className="w-full max-w-xs bg-white rounded-2xl shadow-2xl overflow-hidden text-gray-800">

              {/* Widget header */}
              <div className="relative px-5 pt-5 pb-4 border-b border-gray-100">
                <button type="button" className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
                <h3 className="text-center text-base font-bold text-gray-900 mb-3">
                  {form.title || 'Amazing Giveaway'}
                </h3>
                {/* Countdown */}
                <div className="flex justify-center gap-3 mb-1">
                  {[
                    { n: daysLeft, l: 'DAYS' },
                    { n: 4, l: 'HOURS' },
                    { n: 1, l: 'MIN' },
                    { n: 54, l: 'SEC' },
                  ].map(({ n, l }) => (
                    <div key={l} className="text-center">
                      <div className="text-lg font-bold text-gray-900 leading-none">{String(n).padStart(2, '0')}</div>
                      <div className="text-[9px] text-gray-400 font-medium">{l}</div>
                    </div>
                  ))}
                </div>
                {/* Entries count */}
                <div className="text-center">
                  <span className="text-xs text-gray-500">Your entries <strong className="text-gray-700">0</strong></span>
                  <span className="mx-2 text-gray-300">·</span>
                  <span className="text-xs text-gray-500">Total entries <strong className="text-gray-700">0</strong></span>
                </div>
              </div>

              {/* Widget body */}
              <div className="px-5 py-4">
                {previewMode === 'signup' && (
                  <div className="space-y-3">
                    <p className="text-xs text-center text-gray-500">{form.description || 'Describe your Giveaway'}</p>
                    <input
                      type="email"
                      placeholder={form.emailLabel || 'Enter with your email'}
                      disabled
                      className="w-full border border-gray-200 rounded px-3 py-2 text-xs text-gray-400 bg-gray-50"
                    />
                    {form.marketingConsent && (
                      <label className="flex items-start gap-2 text-[10px] text-gray-500">
                        <input type="checkbox" className="mt-0.5 shrink-0" readOnly /> {form.optinLabel || 'I agree to receive marketing messages'}
                      </label>
                    )}
                    <label className="flex items-start gap-2 text-[10px] text-gray-500">
                      <input type="checkbox" className="mt-0.5 shrink-0" readOnly /> {form.gdprCheckboxText || 'I accept the terms and privacy policy.'}
                    </label>
                    <button disabled className="w-full py-2 rounded-full border-2 border-gray-800 text-gray-800 text-xs font-bold tracking-wide">
                      {form.enterButtonText || 'ENTER NOW'}
                    </button>
                  </div>
                )}
                {previewMode === 'loggedin' && (
                  <div className="space-y-3">
                    <div className="flex border border-gray-200 rounded-lg overflow-hidden text-[10px] font-medium">
                      {['🎫 Entries', '🏆 Leaderboard', '🖼 Gallery'].map((t) => (
                        <button key={t} type="button" className="flex-1 py-1.5 hover:bg-gray-50 border-r border-gray-200 last:border-r-0 text-gray-600">{t}</button>
                      ))}
                    </div>
                    <p className="text-center text-sm font-semibold text-gray-800">Congratulations, you are in! 👍</p>
                    <p className="text-center text-xs text-gray-500">Earn your entries by completing the actions below.</p>
                    <div className="bg-red-50 border border-red-200 rounded text-[10px] text-red-600 px-2 py-1.5 flex items-center gap-1">
                      <span>⚠</span> Please complete all the mandatory (*) actions to be eligible to win.
                      <button type="button" className="ml-auto text-red-400">×</button>
                    </div>
                  </div>
                )}
                {previewMode === 'ended' && (
                  <div className="text-center py-2 space-y-2">
                    <div className="text-3xl">🎁</div>
                    <p className="text-sm font-bold text-gray-800">{form.giveawayEndedHeader || 'Giveaway ended.'}</p>
                    <p className="text-xs text-gray-500">{form.giveawayEndedMessage || "Ouch! This giveaway has ended, stay tuned for our next amazing giveaway 😊"}</p>
                  </div>
                )}
              </div>

              {/* Widget footer */}
              <div className="px-5 pb-4">
                <p className="text-center text-[9px] text-gray-300">Terms &amp; Rules</p>
              </div>
            </div>

            {/* Widget launcher tab */}
            <div className="mt-3 flex justify-center mb-6">
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium"
                style={{ background: form.launchButtonBg || '#000', color: form.launchButtonColor || '#fff' }}
              >
                {form.launchButtonIcon && <Gift size={13} />}
                {form.launchButtonLabel || 'Giveaway'}
              </div>
            </div>
          </div>
        </div>
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
    </form>
  )
}
