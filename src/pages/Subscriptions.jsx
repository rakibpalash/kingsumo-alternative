import { useState } from 'react'
import { ShoppingBag, Store, X } from 'lucide-react'

const inputCls = 'flex-1 bg-white border border-gray-300 rounded-l-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-500 transition-colors'

const MOCK_SUBSCRIPTION = {
  website: 'turfbookingbd.myshopify.com',
  plan: 'free',
  status: 'active',
  chargeStatus: '',
  expiration: '4/6/2026',
  nextCharge: '',
}

export default function Subscriptions() {
  const [subscription] = useState(MOCK_SUBSCRIPTION)
  const [stores, setStores]   = useState([])
  const [newStore, setNewStore] = useState('')
  const [cancelled, setCancelled] = useState(false)

  const handleAddStore = () => {
    const val = newStore.trim()
    if (!val) return
    setStores((s) => [...s, val])
    setNewStore('')
  }

  const handleCancel = () => {
    if (!window.confirm('Cancel your subscription? This will downgrade your plan at the end of the billing period.')) return
    setCancelled(true)
  }

  return (
    <div className="p-6 max-w-4xl space-y-8">
      <h1 className="text-xl font-bold text-white">Subscriptions</h1>

      {/* Your Subscription */}
      <div className="bg-white rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
          <ShoppingBag size={16} className="text-gray-600" />
          <h2 className="text-base font-semibold text-gray-800">Your Subscription</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3 text-gray-600 font-semibold">Website</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Plan</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Status</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Charge Status</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Expiration</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Next Charge</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-50">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    {/* Shopify bag icon */}
                    <div className="w-7 h-7 bg-green-500 rounded flex items-center justify-center shrink-0">
                      <ShoppingBag size={14} className="text-white" />
                    </div>
                    <span className="text-gray-700">{subscription.website}</span>
                  </div>
                </td>
                <td className="px-4 py-4 text-gray-700">{subscription.plan}</td>
                <td className="px-4 py-4">
                  <span className={`text-sm ${cancelled ? 'text-red-500' : 'text-gray-700'}`}>
                    {cancelled ? 'cancelled' : subscription.status}
                  </span>
                </td>
                <td className="px-4 py-4 text-gray-400">{subscription.chargeStatus || '—'}</td>
                <td className="px-4 py-4 text-gray-700">{subscription.expiration}</td>
                <td className="px-4 py-4 text-gray-400">{subscription.nextCharge || '—'}</td>
                <td className="px-4 py-4">
                  {!cancelled && (
                    <button
                      onClick={handleCancel}
                      className="flex items-center gap-1 px-3 py-1.5 border border-red-400 text-red-500 hover:bg-red-50 rounded-full text-xs font-semibold transition-colors"
                    >
                      <X size={11} /> Cancel
                    </button>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Multi-Shop Management */}
      <div className="bg-white rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
          <Store size={16} className="text-gray-600" />
          <h2 className="text-base font-semibold text-gray-800">Multi-Shop Management</h2>
        </div>

        <div className="px-5 py-6 space-y-4">
          {stores.length > 0 && (
            <div className="space-y-2">
              {stores.map((store, i) => (
                <div key={i} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-green-500 rounded flex items-center justify-center">
                      <ShoppingBag size={11} className="text-white" />
                    </div>
                    {store}
                  </div>
                  <button onClick={() => setStores((s) => s.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 transition-colors">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-center">
            <div className="flex w-80">
              <input
                value={newStore}
                onChange={(e) => setNewStore(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddStore()}
                placeholder="store-name.myshopify.com"
                className={inputCls}
              />
              <button
                onClick={handleAddStore}
                className="px-4 py-2 bg-gray-900 hover:bg-gray-700 text-white font-semibold text-sm rounded-r-lg transition-colors whitespace-nowrap"
              >
                Add Store
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 leading-relaxed">
            Add Shopify stores to your Ultimate plan.<br />
            Child stores inherit your plan and have unlimited quotas.
          </p>
        </div>
      </div>
    </div>
  )
}
