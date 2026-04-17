import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronUp, ChevronDown, Settings2, CheckSquare, Square } from 'lucide-react'

const INTEGRATIONS = [
  { id: 'mailchimp',        name: 'MailChimp' },
  { id: 'klaviyo',          name: 'Klaviyo' },
  { id: 'activecampaign',   name: 'ActiveCampaign' },
  { id: 'omnisend',         name: 'Omnisend' },
  { id: 'campaignmonitor',  name: 'CampaignMonitor' },
  { id: 'zapier',           name: 'Zapier Webhook' },
]

/* ─── Shopify Order Webhooks ─────────────────────────────────── */
function Toast({ message, onClose }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-3 bg-green-500 text-white text-sm px-4 py-3 rounded-lg shadow-lg">
      {message}
      <button onClick={onClose} className="text-white/70 hover:text-white ml-1 text-base leading-none">&times;</button>
    </div>
  )
}

function ShopifyWebhooks() {
  const [open, setOpen]            = useState(true)
  const [orderEdits, setOrderEdits]   = useState(false)
  const [orderCancel, setOrderCancel] = useState(false)
  const [toast, setToast]          = useState('')

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const toggleOrderEdits = () => {
    const next = !orderEdits
    setOrderEdits(next)
    showToast(next ? 'Order edit webhook enabled successfully' : 'Order edit webhook disabled')
  }

  const toggleOrderCancel = () => {
    const next = !orderCancel
    setOrderCancel(next)
    showToast(next ? 'Order cancelled webhook enabled successfully' : 'Order cancellation webhook disabled')
  }

  const allEnabled = orderEdits && orderCancel

  return (
    <>
      {toast && <Toast message={toast} onClose={() => setToast('')} />}

      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            {allEnabled
              ? <CheckSquare size={16} className="text-brand-green" />
              : <Square size={16} className="text-gray-400" />}
            <span className="text-base font-semibold text-gray-800">Shopify Order Webhooks</span>
          </div>
          {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </button>

        {open && (
          <div className="border-t border-gray-100 bg-gray-50 px-5 py-4 space-y-5">
            <div className="bg-blue-50 border border-blue-200 text-blue-800 text-xs px-4 py-3 rounded-lg leading-relaxed">
              <span className="font-semibold">Order Created</span> webhook is the base of the purchase tracking system and is always enabled. The options
              below let you optionally handle order edits and cancellations. Each can be enabled independently.
            </div>

            {/* Process order edits */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-800">Process order edits (post-purchase upsells)</h4>
              <p className="text-xs text-gray-500">
                When enabled, orders that are edited (e.g., post-purchase upsell apps adding items) will be automatically reprocessed
                with updated line items and totals.
              </p>
              <div className={`text-xs px-4 py-2.5 rounded-lg text-center ${orderEdits ? 'bg-green-100 text-green-800' : 'bg-amber-500 text-white'}`}>
                {orderEdits ? 'Order edit webhook has been enabled.' : 'Order edit webhook is not enabled. Click Enable to process order editing.'}
              </div>
              <div className="flex justify-center">
                <button
                  onClick={toggleOrderEdits}
                  className={`px-8 py-1.5 border rounded-lg text-sm font-semibold transition-colors ${
                    orderEdits
                      ? 'border-red-400 text-red-500 hover:bg-red-50'
                      : 'border-brand-green text-brand-green hover:bg-brand-green hover:text-dark-900'
                  }`}
                >
                  {orderEdits ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>

            {/* Deduct entries on cancellation */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-800">Deduct entries on order cancellation</h4>
              <p className="text-xs text-gray-500">
                When enabled, if an order is cancelled the entries previously awarded for that order will be automatically deducted.
              </p>
              <div className={`text-xs px-4 py-2.5 rounded-lg text-center ${orderCancel ? 'bg-green-100 text-green-800' : 'bg-amber-500 text-white'}`}>
                {orderCancel ? 'Order cancellation webhook has been enabled.' : 'Order cancellation webhook is not enabled. Click Enable to process order cancellations.'}
              </div>
              <div className="flex justify-center">
                <button
                  onClick={toggleOrderCancel}
                  className={`px-8 py-1.5 border rounded-lg text-sm font-semibold transition-colors ${
                    orderCancel
                      ? 'border-red-400 text-red-500 hover:bg-red-50'
                      : 'border-brand-green text-brand-green hover:bg-brand-green hover:text-dark-900'
                  }`}
                >
                  {orderCancel ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

/* ─── Main list page ─────────────────────────────────────────── */
export default function IntegrationsPage() {
  const navigate = useNavigate()
  // Track which integrations are configured (persisted in local state)
  const [configured, setConfigured] = useState({})

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-xl font-bold text-white mb-6">Integrations</h1>

      <div className="space-y-3">
        {INTEGRATIONS.map((intg) => {
          const isConfigured = configured[intg.id]
          return (
            <IntegrationRow
              key={intg.id}
              integration={intg}
              isConfigured={isConfigured}
              onSetup={() => navigate(`/integrations-setup/${intg.id}`)}
              onDisconnect={() => setConfigured((p) => ({ ...p, [intg.id]: false }))}
            />
          )
        })}
        <ShopifyWebhooks />
      </div>
    </div>
  )
}

function IntegrationRow({ integration, isConfigured, onSetup, onDisconnect }) {
  const [open, setOpen] = useState(true)

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-base font-semibold text-gray-800">{integration.name}</span>
          {isConfigured && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">Connected</span>
          )}
        </div>
        {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>

      {open && (
        <div className="border-t border-gray-100 bg-gray-50 px-5 py-4 space-y-3">
          {!isConfigured ? (
            <>
              <div className="flex items-center justify-between bg-amber-500 text-white text-sm px-4 py-2.5 rounded-lg">
                <span>{integration.name} integration has not been configured yet. Click on Setup get started.</span>
              </div>
              <div className="flex justify-center">
                <button
                  onClick={onSetup}
                  className="flex items-center gap-2 px-6 py-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors"
                >
                  <Settings2 size={13} />
                  Setup
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-3 rounded-lg">
              <span>{integration.name} is connected and active.</span>
              <button
                onClick={onDisconnect}
                className="text-xs text-red-500 hover:text-red-700 ml-3 underline shrink-0"
              >
                Disconnect
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
