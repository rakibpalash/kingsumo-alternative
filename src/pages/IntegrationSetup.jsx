import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { RefreshCw, ChevronRight, AlertTriangle, Send, Save, Check } from 'lucide-react'

const inputCls = 'w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-teal-500 transition-colors'
const labelCls = 'block text-xs font-bold text-gray-700 mb-1.5'
const requiredStar = <span className="text-red-500 ml-0.5">*</span>

const MOCK_LISTS = {
  mailchimp:       ['Newsletter', 'Giveaway Subscribers', 'All Contacts'],
  klaviyo:         ['Giveaway Entrants', 'Newsletter', 'VIP Customers'],
  activecampaign:  ['Giveaway List', 'Main Newsletter', 'Customers'],
  omnisend:        ['Newsletter', 'Promotions'],
  campaignmonitor: ['Giveaway List', 'Newsletter', 'Welcome Series'],
}

/* ─── List selector with Refresh button ─────────────────────── */
function ListSelect({ serviceId, value, onChange }) {
  const [loading, setLoading] = useState(false)
  const [lists, setLists]     = useState([])

  const handleRefresh = () => {
    setLoading(true)
    setTimeout(() => {
      setLists(MOCK_LISTS[serviceId] || [])
      setLoading(false)
    }, 800)
  }

  return (
    <div>
      <label className={labelCls}>Select a list (audience) {requiredStar}</label>
      <div className="flex gap-2">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputCls + ' flex-1'}
        >
          <option value="">Nothing selected</option>
          {lists.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-60 whitespace-nowrap shrink-0"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Refresh list
        </button>
      </div>
    </div>
  )
}

/* ─── MailChimp ──────────────────────────────────────────────── */
function MailChimpSetup({ onSave }) {
  const [apiKey, setApiKey]   = useState('')
  const [list, setList]       = useState('')
  const [error, setError]     = useState('')
  const [saving, setSaving]   = useState(false)

  const handleSave = () => {
    if (!apiKey.trim()) { setError('API KEY is required'); return }
    setError('')
    setSaving(true)
    setTimeout(() => { setSaving(false); onSave() }, 800)
  }

  return (
    <div className="bg-white rounded-xl p-6 space-y-4">
      <h2 className="text-lg font-bold text-gray-800">MailChimp Setup</h2>

      <div>
        <label className={labelCls}>API KEY {requiredStar}</label>
        <input
          value={apiKey}
          onChange={(e) => { setApiKey(e.target.value); setError('') }}
          placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-us1"
          className={inputCls}
        />
      </div>

      <ListSelect serviceId="mailchimp" value={list} onChange={setList} />

      {error && <p className="text-xs text-red-500">{error}</p>}
      <p className="text-xs text-red-500">* Required fields</p>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-sm transition-colors disabled:opacity-60 uppercase tracking-wide"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  )
}

/* ─── Klaviyo (4-step wizard) ────────────────────────────────── */
const KLAVIYO_STEPS = ['1) ENTER YOUR API KEY', '2) SETUP THE LIST', '3) TEST CONNECTION', '4) SAVE THE SETTINGS']

function KlaviyoSetup({ onSave }) {
  const [step, setStep]     = useState(0)
  const [apiKey, setApiKey] = useState('')
  const [list, setList]     = useState('')
  const [testing, setTesting] = useState(false)
  const [tested, setTested]   = useState(false)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')

  const next = () => {
    if (step === 0 && !apiKey.trim()) { setError('API KEY is required'); return }
    setError('')
    setStep((s) => s + 1)
  }

  const handleTest = () => {
    setTesting(true)
    setTimeout(() => { setTesting(false); setTested(true) }, 1000)
  }

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => { setSaving(false); onSave() }, 800)
  }

  return (
    <div className="bg-white rounded-xl overflow-hidden">
      {/* Step tabs */}
      <div className="flex">
        {KLAVIYO_STEPS.map((label, i) => (
          <div
            key={i}
            className={`flex-1 text-center py-3 text-xs font-semibold border-b-2 transition-colors ${
              i === step
                ? 'border-teal-500 bg-teal-500 text-white'
                : i < step
                  ? 'border-teal-300 bg-teal-50 text-teal-700'
                  : 'border-gray-200 bg-gray-50 text-gray-400'
            }`}
          >
            {label}
          </div>
        ))}
      </div>

      <div className="p-6 space-y-4">
        {/* Step 1: Enter API Key */}
        {step === 0 && (
          <>
            <p className="text-sm text-gray-700">
              Log in to your Klaviyo account and click on{' '}
              <span className="text-teal-600 font-semibold">Account &gt; Settings &gt; API Keys</span>{' '}
              to generate a PRIVATE API KEY.
            </p>
            <div>
              <label className={labelCls}>API KEY {requiredStar}</label>
              <input
                value={apiKey}
                onChange={(e) => { setApiKey(e.target.value); setError('') }}
                placeholder="ex: pk_xXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx"
                className={inputCls}
                autoFocus
              />
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-700">
              <AlertTriangle size={15} className="text-amber-500 mt-0.5 shrink-0" />
              <span>
                <strong>IMPORTANT:</strong> Ensure to grant FULL ACCESS for: Data Privacy, Events, Flows, List, Profiles, Subscriptions, Tags
              </span>
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex justify-end">
              <button
                onClick={next}
                className="px-8 py-2 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg text-sm transition-colors"
              >
                Next
              </button>
            </div>
          </>
        )}

        {/* Step 2: Setup the list */}
        {step === 1 && (
          <>
            <p className="text-sm text-gray-700">Select which Klaviyo list new entrants should be added to.</p>
            <ListSelect serviceId="klaviyo" value={list} onChange={setList} />
            <div className="flex justify-between">
              <button onClick={() => setStep(0)} className="px-6 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors">Back</button>
              <button onClick={next} className="px-8 py-2 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg text-sm transition-colors">Next</button>
            </div>
          </>
        )}

        {/* Step 3: Test connection */}
        {step === 2 && (
          <>
            <p className="text-sm text-gray-700">Test your Klaviyo connection to make sure everything is configured correctly.</p>
            {tested && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg">
                <Check size={15} />
                Connection successful! Klaviyo is reachable with the provided API key.
              </div>
            )}
            <div className="flex justify-between">
              <button onClick={() => setStep(1)} className="px-6 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors">Back</button>
              <div className="flex gap-2">
                <button
                  onClick={handleTest}
                  disabled={testing}
                  className="flex items-center gap-1.5 px-6 py-2 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg text-sm transition-colors disabled:opacity-60"
                >
                  <Send size={13} className={testing ? 'animate-pulse' : ''} />
                  {testing ? 'Testing…' : 'Test Connection'}
                </button>
                {tested && (
                  <button onClick={next} className="px-8 py-2 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg text-sm transition-colors">Next</button>
                )}
              </div>
            </div>
          </>
        )}

        {/* Step 4: Save */}
        {step === 3 && (
          <>
            <p className="text-sm text-gray-700">Everything looks good! Save your Klaviyo integration settings.</p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs text-gray-600 space-y-1">
              <p><span className="font-semibold">API Key:</span> {apiKey.slice(0, 6)}{'•'.repeat(Math.max(0, apiKey.length - 6))}</p>
              {list && <p><span className="font-semibold">List:</span> {list}</p>}
            </div>
            <div className="flex justify-between">
              <button onClick={() => setStep(2)} className="px-6 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors">Back</button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-8 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-sm uppercase tracking-wide transition-colors disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/* ─── ActiveCampaign ─────────────────────────────────────────── */
function ActiveCampaignSetup({ onSave }) {
  const [apiUrl, setApiUrl] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [list, setList]     = useState('')
  const [error, setError]   = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = () => {
    if (!apiUrl.trim() || !apiKey.trim()) { setError('All required fields must be filled'); return }
    setError('')
    setSaving(true)
    setTimeout(() => { setSaving(false); onSave() }, 800)
  }

  return (
    <div className="bg-white rounded-xl p-6 space-y-4">
      <h2 className="text-lg font-bold text-gray-800">ActiveCampaign Setup</h2>
      <div>
        <label className={labelCls}>API URL {requiredStar}</label>
        <input value={apiUrl} onChange={(e) => { setApiUrl(e.target.value); setError('') }} placeholder="ex: https://xxxxx.api-us1.com" className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>API KEY {requiredStar}</label>
        <input value={apiKey} onChange={(e) => { setApiKey(e.target.value); setError('') }} placeholder="ex: fe948934833cfa0e3316757d4ad485" className={inputCls} />
      </div>
      <ListSelect serviceId="activecampaign" value={list} onChange={setList} />
      {error && <p className="text-xs text-red-500">{error}</p>}
      <p className="text-xs text-red-500">* Required fields</p>
      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="px-8 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-sm uppercase tracking-wide transition-colors disabled:opacity-60">
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  )
}

/* ─── Omnisend ───────────────────────────────────────────────── */
function OmnisendSetup({ onSave }) {
  const [apiKey, setApiKey] = useState('')
  const [error, setError]   = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = () => {
    if (!apiKey.trim()) { setError('API KEY is required'); return }
    setError('')
    setSaving(true)
    setTimeout(() => { setSaving(false); onSave() }, 800)
  }

  return (
    <div className="bg-white rounded-xl p-6 space-y-4">
      <h2 className="text-lg font-bold text-gray-800">Omnisend Setup</h2>
      <div>
        <label className={labelCls}>API KEY {requiredStar}</label>
        <input value={apiKey} onChange={(e) => { setApiKey(e.target.value); setError('') }} placeholder="ex: fe948934833cfa0e3316757d4ad485" className={inputCls} />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <p className="text-xs text-red-500">* Required fields</p>
      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="px-8 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-sm uppercase tracking-wide transition-colors disabled:opacity-60">
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  )
}

/* ─── CampaignMonitor ────────────────────────────────────────── */
function CampaignMonitorSetup({ onSave }) {
  const [apiKey, setApiKey]     = useState('')
  const [clientId, setClientId] = useState('')
  const [list, setList]         = useState('')
  const [error, setError]       = useState('')
  const [saving, setSaving]     = useState(false)

  const handleSave = () => {
    if (!apiKey.trim() || !clientId.trim()) { setError('All required fields must be filled'); return }
    setError('')
    setSaving(true)
    setTimeout(() => { setSaving(false); onSave() }, 800)
  }

  return (
    <div className="bg-white rounded-xl p-6 space-y-4">
      <h2 className="text-lg font-bold text-gray-800">CampaignMonitor Setup</h2>
      <div>
        <label className={labelCls}>API Key {requiredStar}</label>
        <input value={apiKey} onChange={(e) => { setApiKey(e.target.value); setError('') }} placeholder="ex: cgLmB7eF7k9O5oat44yI0NC590u..." className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Client ID {requiredStar}</label>
        <input value={clientId} onChange={(e) => { setClientId(e.target.value); setError('') }} placeholder="ex: 323169232eddcc91791cdfa2138b5cd31" className={inputCls} />
      </div>
      <ListSelect serviceId="campaignmonitor" value={list} onChange={setList} />
      {error && <p className="text-xs text-red-500">{error}</p>}
      <p className="text-xs text-red-500">* Required fields</p>
      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="px-8 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-sm uppercase tracking-wide transition-colors disabled:opacity-60">
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  )
}

/* ─── Zapier Webhook ─────────────────────────────────────────── */
function ZapierSetup({ onSave }) {
  const [url, setUrl]         = useState('')
  const [error, setError]     = useState('')
  const [testing, setTesting] = useState(false)
  const [testOk, setTestOk]   = useState(false)
  const [saving, setSaving]   = useState(false)

  const handleTest = () => {
    if (!url.trim()) { setError('Webhook URL is required'); return }
    setError('')
    setTesting(true)
    setTimeout(() => { setTesting(false); setTestOk(true) }, 1000)
  }

  const handleSave = () => {
    if (!url.trim()) { setError('Webhook URL is required'); return }
    setError('')
    setSaving(true)
    setTimeout(() => { setSaving(false); onSave() }, 800)
  }

  return (
    <div className="bg-white rounded-xl p-6 space-y-4">
      <h2 className="text-lg font-bold text-gray-800">Zapier Webhooks Setup</h2>
      <div>
        <label className={labelCls}>Custom Webhook URL {requiredStar}</label>
        <input value={url} onChange={(e) => { setUrl(e.target.value); setError(''); setTestOk(false) }} placeholder="ex: https://hooks.zapier.com/hooks/catch/12345678/xxxxx/" className={inputCls} />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <p className="text-xs text-red-500">* Required fields</p>

      {testOk && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-2.5 rounded-lg">
          <Check size={14} /> Test event sent successfully.
        </div>
      )}

      <p className="text-sm text-gray-600">
        Do you need help?{' '}
        <a href="#" className="text-teal-600 hover:underline" onClick={(e) => e.preventDefault()}>
          Check the step-by-step Zapier Webhook guide here.
        </a>
      </p>

      <div className="flex justify-end gap-2">
        <button
          onClick={handleTest}
          disabled={testing}
          className="flex items-center gap-1.5 px-6 py-2 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-lg text-sm uppercase tracking-wide transition-colors disabled:opacity-60"
        >
          <Send size={13} className={testing ? 'animate-pulse' : ''} />
          {testing ? 'Sending…' : 'Send Test'}
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-sm uppercase tracking-wide transition-colors disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  )
}

/* ─── Setup page wrapper ─────────────────────────────────────── */
const SERVICE_NAMES = {
  mailchimp:       'MailChimp',
  klaviyo:         'Klaviyo',
  activecampaign:  'ActiveCampaign',
  omnisend:        'Omnisend',
  campaignmonitor: 'CampaignMonitor',
  zapier:          'Zapier Webhook',
}

const SETUP_COMPONENTS = {
  mailchimp:       MailChimpSetup,
  klaviyo:         KlaviyoSetup,
  activecampaign:  ActiveCampaignSetup,
  omnisend:        OmnisendSetup,
  campaignmonitor: CampaignMonitorSetup,
  zapier:          ZapierSetup,
}

export default function IntegrationSetup() {
  const { service } = useParams()
  const navigate    = useNavigate()

  const name     = SERVICE_NAMES[service]
  const SetupCmp = SETUP_COMPONENTS[service]

  if (!SetupCmp) {
    return (
      <div className="p-6">
        <p className="text-red-400">Unknown integration: {service}</p>
        <Link to="/integrations-setup" className="text-brand-green text-sm underline mt-2 block">Back to Integrations</Link>
      </div>
    )
  }

  const handleSave = () => {
    navigate('/integrations-setup')
  }

  return (
    <div className="p-6 max-w-2xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-dark-400 mb-6">
        <Link to="/integrations-setup" className="hover:text-white transition-colors">Integrations</Link>
        <ChevronRight size={13} />
        <span className="text-white">{name}</span>
      </div>

      <SetupCmp onSave={handleSave} />
    </div>
  )
}
