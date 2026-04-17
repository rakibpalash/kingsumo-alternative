import { useState, useEffect, useRef } from 'react'
import { useStore } from '../store/useStore'
import { Code, QrCode, Copy, Check, Download, Smartphone, Monitor, Puzzle } from 'lucide-react'
import QRCode from 'qrcode'

/* ─── Page Builder configs ───────────────────────────────────── */
const PAGE_BUILDERS = [
  {
    id: 'gempages',
    name: 'GemPages',
    color: '#6366f1',
    steps: [
      'Open GemPages editor and navigate to the page you want to add the giveaway.',
      'In the left panel, click "Elements" and search for "Custom HTML".',
      'Drag the "Custom HTML" element onto your page where you want the giveaway to appear.',
      'Click the element to open its settings, then paste your embed code into the HTML field.',
      'Click "Save" then "Publish" to make it live.',
    ],
    note: 'GemPages Custom HTML element supports iFrame and JS widgets. Use iFrame for best compatibility.',
  },
  {
    id: 'ecomposer',
    name: 'EComposer',
    color: '#f59e0b',
    steps: [
      'Open EComposer and edit your target page.',
      'Click the "+" icon to add a new element, then select "Custom Code" from the list.',
      'Place the Custom Code block where you want the giveaway to appear.',
      'Click the block to open the code editor, then paste your embed code.',
      'Hit "Save Changes" and publish the page.',
    ],
    note: 'EComposer\'s Custom Code block renders HTML server-side — iFrame embed is recommended.',
  },
  {
    id: 'pagefly',
    name: 'PageFly',
    color: '#10b981',
    steps: [
      'Open PageFly editor and select the page to edit.',
      'Click "Add Element" (the blue + button) and choose "Custom HTML Code" from the elements library.',
      'Drop the element into the desired section of your page.',
      'Click the element, then click "Edit HTML" in the toolbar on the right.',
      'Paste your embed code and click "Apply", then save and publish.',
    ],
    note: 'PageFly fully supports iFrame embeds. For JS Widget, enable "Allow custom scripts" in PageFly settings.',
  },
  {
    id: 'shogun',
    name: 'Shogun',
    color: '#ef4444',
    steps: [
      'Open Shogun Page Builder and edit your landing page.',
      'In the left sidebar under "Elements", find and drag "Custom HTML" onto the canvas.',
      'Click the element to open the inspector panel on the right.',
      'Paste your embed code into the "HTML" text area.',
      'Click "Save" at the top right, then publish.',
    ],
    note: 'Shogun supports both iFrame and JS embeds. If JS Widget does not load, switch to iFrame embed.',
  },
]

export default function EmbedWidget() {
  const { activeCampaign } = useStore()
  const [copied, setCopied] = useState(null)
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [embedType, setEmbedType] = useState('iframe')
  const [width, setWidth] = useState(500)
  const [theme, setTheme] = useState('dark')
  const canvasRef = useRef(null)

  const BASE_URL = `${window.location.origin}/g/${activeCampaign?.id || 'campaign-id'}`
  const giveawayUrl = `${BASE_URL}?theme=${theme}`

  useEffect(() => {
    QRCode.toDataURL(giveawayUrl, {
      width: 256, margin: 2,
      color: { dark: theme === 'dark' ? '#00d084' : '#1a1a2e', light: theme === 'dark' ? '#0d1117' : '#ffffff' },
    }).then(setQrDataUrl).catch(() => {})
  }, [giveawayUrl, theme])

  const copy = (text, key) => {
    navigator.clipboard.writeText(text)
    setCopied(key); setTimeout(() => setCopied(null), 2000)
  }

  const iframeCode = `<iframe
  src="${giveawayUrl}"
  width="${width}"
  height="600"
  frameborder="0"
  style="border-radius:12px;overflow:hidden;"
  title="${activeCampaign?.title || 'Giveaway'}"
></iframe>`

  const jsCode = `<!-- GiveShop Widget -->
<div id="giveshop-widget" data-campaign="${activeCampaign?.id || 'camp_001'}" data-theme="${theme}"></div>
<script src="https://give.shop/widget.js" async></script>`

  const downloadQR = () => {
    const link = document.createElement('a')
    link.href = qrDataUrl
    link.download = `${(activeCampaign?.title || 'giveaway').replace(/\s+/g, '-').toLowerCase()}-qr.png`
    link.click()
  }

  const [activeBuilder, setActiveBuilder] = useState('gempages')
  const currentBuilder = PAGE_BUILDERS.find((b) => b.id === activeBuilder)

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-lg font-bold text-white flex items-center gap-2"><Code size={18} className="text-brand-green" /> Embed & Share</h1>
        <p className="text-xs text-dark-400 mt-0.5">Add your giveaway to any website or generate a QR code for print</p>
      </div>

      {/* Options */}
      <div className="bg-dark-800 border border-dark-500 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-white mb-4">Customise Embed</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-dark-400 mb-1.5">Embed Type</label>
            <select value={embedType} onChange={(e) => setEmbedType(e.target.value)}
              className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-green transition-colors">
              <option value="iframe">iFrame (universal)</option>
              <option value="js">JS Widget (lightweight)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-dark-400 mb-1.5">Width (px)</label>
            <input type="number" value={width} onChange={(e) => setWidth(Number(e.target.value))} min={300} max={1200}
              className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-green transition-colors" />
          </div>
          <div>
            <label className="block text-xs text-dark-400 mb-1.5">Theme</label>
            <select value={theme} onChange={(e) => setTheme(e.target.value)}
              className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-green transition-colors">
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="brand">Brand Color</option>
            </select>
          </div>
        </div>
      </div>

      {/* Embed Code */}
      <div className="bg-dark-800 border border-dark-500 rounded-xl p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            {embedType === 'iframe' ? <Monitor size={14} className="text-brand-green" /> : <Smartphone size={14} className="text-brand-green" />}
            {embedType === 'iframe' ? 'iFrame Embed Code' : 'JavaScript Widget Code'}
          </h2>
          <button onClick={() => copy(embedType === 'iframe' ? iframeCode : jsCode, 'embed')}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-dark-700 border border-dark-500 rounded-lg text-dark-400 hover:text-white transition-colors">
            {copied === 'embed' ? <><Check size={12} className="text-brand-green" />Copied!</> : <><Copy size={12} />Copy Code</>}
          </button>
        </div>
        <pre className="bg-dark-900 border border-dark-600 rounded-xl p-4 text-xs text-brand-green font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
          {embedType === 'iframe' ? iframeCode : jsCode}
        </pre>
        <p className="text-xs text-dark-500 mt-2">
          {embedType === 'iframe' ? 'Works on any website. Paste into your HTML where you want the giveaway to appear.' : 'Lightweight async script. Add the div and script tag to your page — the widget loads automatically.'}
        </p>
      </div>

      {/* QR Code */}
      <div className="bg-dark-800 border border-dark-500 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><QrCode size={14} className="text-brand-green" /> QR Code</h2>
        <p className="text-xs text-dark-400 mb-5">Perfect for flyers, product packaging, in-store displays, and print ads.</p>
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {qrDataUrl ? (
            <div className="shrink-0 p-3 bg-dark-900 border border-dark-600 rounded-xl">
              <img src={qrDataUrl} alt="QR Code" className="w-48 h-48" />
            </div>
          ) : (
            <div className="w-48 h-48 bg-dark-900 border border-dark-600 rounded-xl flex items-center justify-center shrink-0">
              <QrCode size={48} className="text-dark-500" />
            </div>
          )}
          <div className="space-y-3 flex-1">
            <div>
              <p className="text-xs text-dark-400 mb-1">Giveaway URL</p>
              <div className="bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-xs text-brand-green font-mono break-all">{giveawayUrl}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={downloadQR} disabled={!qrDataUrl}
                className="flex items-center gap-2 px-4 py-2 bg-brand-green text-dark-900 font-semibold text-sm rounded-lg hover:bg-brand-green/80 transition-colors disabled:opacity-50">
                <Download size={14} /> Download PNG
              </button>
              <button onClick={() => copy(giveawayUrl, 'url')}
                className="flex items-center gap-2 px-4 py-2 bg-dark-700 border border-dark-500 text-dark-400 hover:text-white font-semibold text-sm rounded-lg transition-colors">
                {copied === 'url' ? <><Check size={14} className="text-brand-green" />Copied!</> : <><Copy size={14} />Copy URL</>}
              </button>
            </div>
            <p className="text-xs text-dark-500">
              Scan with any phone camera to open the giveaway page. Change theme above to match your brand colors.
            </p>
          </div>
        </div>
      </div>
      {/* Page Builder Integrations */}
      <div className="bg-dark-800 border border-dark-500 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
          <Puzzle size={14} className="text-brand-green" />
          Page Builder Integration
        </h2>
        <p className="text-xs text-dark-400 mb-4">
          Using a Shopify page builder? Follow these steps to embed your giveaway directly in your landing page.
        </p>

        {/* Builder tabs */}
        <div className="flex gap-1 mb-5 flex-wrap">
          {PAGE_BUILDERS.map((b) => (
            <button
              key={b.id}
              onClick={() => setActiveBuilder(b.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeBuilder === b.id
                  ? 'text-dark-900'
                  : 'bg-dark-700 text-dark-400 hover:text-white'
              }`}
              style={activeBuilder === b.id ? { backgroundColor: b.color } : {}}
            >
              {b.name}
            </button>
          ))}
        </div>

        {currentBuilder && (
          <div className="space-y-4">
            {/* Steps */}
            <ol className="space-y-2.5">
              {currentBuilder.steps.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span
                    className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-dark-900 mt-0.5"
                    style={{ backgroundColor: currentBuilder.color }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-sm text-dark-300 leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>

            {/* Note */}
            <div className="flex items-start gap-2 bg-dark-700/60 border border-dark-600 rounded-lg px-3 py-2.5">
              <span className="text-brand-green mt-0.5 shrink-0 text-xs font-bold">TIP</span>
              <p className="text-xs text-dark-400 leading-relaxed">{currentBuilder.note}</p>
            </div>

            {/* Embed code inline */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-dark-400 font-semibold">Your embed code — copy and paste into the custom HTML block:</p>
                <button
                  onClick={() => copy(embedType === 'iframe' ? iframeCode : jsCode, `builder-${activeBuilder}`)}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-dark-700 border border-dark-500 rounded-lg text-dark-400 hover:text-white transition-colors"
                >
                  {copied === `builder-${activeBuilder}`
                    ? <><Check size={12} className="text-brand-green" />Copied!</>
                    : <><Copy size={12} />Copy</>}
                </button>
              </div>
              <pre className="bg-dark-900 border border-dark-600 rounded-xl p-4 text-xs text-brand-green font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {embedType === 'iframe' ? iframeCode : jsCode}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
