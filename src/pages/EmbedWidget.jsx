import { useState, useEffect, useRef } from 'react'
import { useStore } from '../store/useStore'
import { Code, QrCode, Copy, Check, Download, Smartphone, Monitor } from 'lucide-react'
import QRCode from 'qrcode'

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
    </div>
  )
}
