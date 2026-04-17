import { useState } from 'react'
import { Copy, Check, RefreshCw, Save, FileText } from 'lucide-react'

const inputCls = 'w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-brand-green transition-colors'

function CopyableKey({ value, label }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1.5">{label}</label>
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 gap-2">
          <span className="flex-1 text-sm font-mono text-gray-600 truncate">{value}</span>
          <button
            onClick={handleCopy}
            className="shrink-0 text-gray-400 hover:text-gray-700 transition-colors"
            title="Copy to clipboard"
          >
            {copied ? <Check size={15} className="text-green-600" /> : <Copy size={15} />}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ApiSettings() {
  const [publicKey, setPublicKey] = useState('3b334062-4aae-45d3-b093-d4af092da66')
  const [privateKey, setPrivateKey] = useState('29687876-5b72-4617-aa0f-9536e2fe608b')
  const [allowedOrigins, setAllowedOrigins] = useState('')
  const [generating, setGenerating] = useState(false)
  const [saved, setSaved] = useState(false)

  const generateKeys = () => {
    if (!window.confirm('Generate new API keys? Existing keys will stop working immediately.')) return
    setGenerating(true)
    setTimeout(() => {
      const rand = () => Math.random().toString(36).slice(2, 10)
      setPublicKey(`${rand()}${rand()}-${rand()}-${rand()}-${rand()}-${rand()}${rand()}${rand()}`.slice(0, 36))
      setPrivateKey(`${rand()}${rand()}-${rand()}-${rand()}-${rand()}-${rand()}${rand()}${rand()}`.slice(0, 36))
      setGenerating(false)
    }, 900)
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-xl font-bold text-white mb-6">API</h1>

      <div className="bg-white rounded-xl p-6 space-y-5">
        {/* Public Key */}
        <CopyableKey value={publicKey} label="Public API Key (Client-Side)" />

        {/* Allowed Origins */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Allowed Origins <span className="text-gray-400 font-normal">(ex. myshop.myshopify.com, custoshop.com)</span>
          </label>
          <input
            value={allowedOrigins}
            onChange={(e) => setAllowedOrigins(e.target.value)}
            placeholder="myshop.myshopify.com, example.com"
            className={inputCls}
          />
          <p className="mt-1.5 text-xs text-gray-500">
            Add <span className="font-mono text-gray-700">extensions.shopifycdn.com</span> to use the API in Shopify Checkout and Thank You pages.
          </p>
        </div>

        {/* Private Key */}
        <CopyableKey value={privateKey} label="Private API Key (Server-Side)" />

        {/* Actions row */}
        <div className="flex items-center justify-between pt-1">
          <a
            href="#"
            className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 transition-colors"
            onClick={(e) => e.preventDefault()}
          >
            <FileText size={14} />
            Download the documentation here
          </a>

          <div className="flex items-center gap-2">
            <button
              onClick={generateKeys}
              disabled={generating}
              className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 text-gray-600 hover:text-gray-900 hover:border-gray-400 rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
            >
              <RefreshCw size={13} className={generating ? 'animate-spin' : ''} />
              Generate API Keys
            </button>

            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 bg-brand-green text-dark-900 font-semibold rounded-lg text-sm hover:bg-brand-green/80 transition-colors"
            >
              {saved ? <><Check size={13} /> Saved!</> : <><Save size={13} /> Save</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
