import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, ChevronRight, Store, Palette, Shield, Zap, Rocket } from 'lucide-react'

const STEPS = [
  {
    id: 1, icon: Store, title: 'Connect Your Store',
    description: 'Link your Shopify store to enable native embed and purchase tracking.',
    fields: [
      { key: 'storeName', label: 'Store Name', placeholder: 'my-store.myshopify.com', type: 'text' },
      { key: 'apiKey', label: 'Shopify API Key', placeholder: 'shpat_...', type: 'text' },
    ],
  },
  {
    id: 2, icon: Palette, title: 'Brand Your Widget',
    description: 'Customize how the giveaway widget looks on your storefront.',
    fields: [
      { key: 'brandColor', label: 'Brand Color', placeholder: '#00d084', type: 'color' },
      { key: 'storeName2', label: 'Display Store Name', placeholder: 'My Awesome Store', type: 'text' },
    ],
  },
  {
    id: 3, icon: Shield, title: 'Fraud Protection',
    description: 'Configure security settings to keep your giveaway fair.',
    checks: [
      { key: 'blockIP', label: 'Block duplicate IPs' },
      { key: 'blockEmail', label: 'Block duplicate emails' },
      { key: 'recaptcha', label: 'Enable reCAPTCHA v3' },
      { key: 'autoSkip', label: 'Auto-skip suspicious entries in draw' },
    ],
  },
  {
    id: 4, icon: Zap, title: 'Theme Extension',
    description: 'Install the GiveShop block in your Shopify theme editor for native embedding.',
    manual: true,
    instructions: [
      'Go to Shopify Admin → Online Store → Themes',
      'Click "Customize" on your active theme',
      'Open "Add section" panel',
      'Find "GiveShop Widget" and add it to your page',
      'Configure position and visibility settings',
    ],
  },
  {
    id: 5, icon: Rocket, title: "You're All Set!",
    description: 'Your store is connected and ready for your first giveaway campaign.',
    final: true,
  },
]

export default function SetupWizard() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    storeName: '', apiKey: '', brandColor: '#00d084', storeName2: '',
    blockIP: true, blockEmail: true, recaptcha: true, autoSkip: true,
  })
  const [verified, setVerified] = useState(false)
  const [verifying, setVerifying] = useState(false)

  const current = STEPS.find((s) => s.id === step)

  const handleVerify = () => {
    setVerifying(true)
    setTimeout(() => { setVerifying(false); setVerified(true) }, 1800)
  }

  const handleNext = () => {
    if (step < STEPS.length) setStep(step + 1)
    else navigate('/campaigns/new')
  }

  return (
    <div className="max-w-2xl">
      {/* Progress */}
      <div className="flex items-center gap-0 mb-8">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center flex-1 last:flex-none">
            <button
              onClick={() => s.id < step && setStep(s.id)}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                s.id < step ? 'bg-brand-green text-dark-900 cursor-pointer' :
                s.id === step ? 'bg-brand-green/20 border-2 border-brand-green text-brand-green' :
                'bg-dark-700 border border-dark-500 text-dark-400 cursor-default'
              }`}
            >
              {s.id < step ? <Check size={13} /> : s.id}
            </button>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 ${s.id < step ? 'bg-brand-green' : 'bg-dark-600'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step card */}
      <div className="bg-dark-800 border border-dark-500 rounded-xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-brand-green/10 flex items-center justify-center">
            <current.icon size={20} className="text-brand-green" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">{current.title}</h2>
            <p className="text-xs text-dark-400 mt-0.5">{current.description}</p>
          </div>
        </div>

        {/* Fields */}
        {current.fields && (
          <div className="space-y-4 mb-6">
            {current.fields.map(({ key, label, placeholder, type }) => (
              <div key={key}>
                <label className="block text-xs text-dark-400 mb-1.5">{label}</label>
                {type === 'color' ? (
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData[key]}
                      onChange={(e) => setFormData((f) => ({ ...f, [key]: e.target.value }))}
                      className="w-10 h-10 rounded-lg border border-dark-500 bg-dark-700 cursor-pointer"
                    />
                    <span className="text-sm text-white font-mono">{formData[key]}</span>
                  </div>
                ) : (
                  <input
                    type="text"
                    value={formData[key]}
                    onChange={(e) => setFormData((f) => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-sm text-white placeholder-dark-400 focus:outline-none focus:border-brand-green transition-colors"
                  />
                )}
              </div>
            ))}
            {step === 1 && (
              <button
                onClick={handleVerify}
                disabled={verifying}
                className={`flex items-center gap-2 text-xs px-4 py-2 rounded-lg font-semibold transition-colors ${
                  verified ? 'bg-brand-green/10 text-brand-green border border-brand-green/30' :
                  'bg-dark-700 border border-dark-500 text-dark-400 hover:text-white'
                }`}
              >
                {verifying ? (
                  <span className="animate-pulse">Verifying connection...</span>
                ) : verified ? (
                  <><Check size={12} /> Store connected successfully!</>
                ) : (
                  'Test Connection'
                )}
              </button>
            )}
          </div>
        )}

        {/* Checks */}
        {current.checks && (
          <div className="space-y-3 mb-6">
            {current.checks.map(({ key, label }) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer group">
                <div
                  onClick={() => setFormData((f) => ({ ...f, [key]: !f[key] }))}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                    formData[key] ? 'border-brand-green bg-brand-green' : 'border-dark-500 group-hover:border-dark-400'
                  }`}
                >
                  {formData[key] && <Check size={11} className="text-dark-900 font-bold" />}
                </div>
                <span className="text-sm text-white">{label}</span>
              </label>
            ))}
          </div>
        )}

        {/* Manual instructions */}
        {current.manual && (
          <ol className="space-y-3 mb-6">
            {current.instructions.map((inst, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-dark-700 border border-dark-500 text-[11px] text-dark-400 flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-sm text-dark-400">{inst}</span>
              </li>
            ))}
          </ol>
        )}

        {/* Final step */}
        {current.final && (
          <div className="text-center py-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-brand-green/10 border-2 border-brand-green flex items-center justify-center mx-auto mb-4">
              <Check size={28} className="text-brand-green" />
            </div>
            <p className="text-sm text-dark-400">Your store is connected, fraud protection is active,<br />and the theme extension is installed.</p>
            <div className="grid grid-cols-3 gap-3 mt-6 text-xs">
              {['Store Connected', 'Fraud Shield ON', 'Theme Installed'].map((t) => (
                <div key={t} className="bg-brand-green/5 border border-brand-green/20 rounded-lg p-2.5 text-brand-green text-center">
                  <Check size={12} className="mx-auto mb-1" />
                  {t}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => step > 1 && setStep(step - 1)}
            disabled={step === 1}
            className="text-xs text-dark-400 hover:text-white disabled:opacity-30 transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-2.5 bg-brand-green text-dark-900 font-bold rounded-lg text-sm hover:bg-brand-green/80 transition-colors"
          >
            {step === STEPS.length ? 'Create First Campaign' : 'Continue'}
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Step labels */}
      <div className="flex justify-between mt-3 px-1">
        {STEPS.map((s) => (
          <p key={s.id} className={`text-[10px] ${s.id === step ? 'text-brand-green' : 'text-dark-400'}`}>
            {s.title.split(' ').slice(0, 2).join(' ')}
          </p>
        ))}
      </div>
    </div>
  )
}
