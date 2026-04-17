import { useState } from 'react'
import { useStore } from '../store/useStore'
import { Check } from 'lucide-react'

const inputCls = 'w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-teal-500 transition-colors'
const labelCls = 'block text-xs font-bold text-gray-700 mb-1.5'
const requiredStar = <span className="text-red-500 ml-0.5">*</span>

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${checked ? 'bg-gray-700' : 'bg-gray-300'}`}
    >
      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow flex items-center justify-center transition-all ${checked ? 'left-6' : 'left-1'}`}>
        {checked && <Check size={9} className="text-gray-700" />}
      </span>
    </button>
  )
}

export default function MyAccount() {
  const { user } = useStore()
  const [username, setUsername] = useState('Shopify test')
  const [email, setEmail]       = useState(user?.email || 'eincome0@gmail.com')
  const [notify, setNotify]     = useState(true)
  const [saved, setSaved]       = useState(false)
  const [error, setError]       = useState('')

  const handleSave = () => {
    if (!username.trim()) { setError('Username is required'); return }
    if (!email.trim())    { setError('E-mail is required'); return }
    setError('')
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-xl font-bold text-white mb-6">My Account</h1>

      <div className="bg-white rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">My Profile</h2>

        <div>
          <label className={labelCls}>Username {requiredStar}</label>
          <input
            value={username}
            onChange={(e) => { setUsername(e.target.value); setError('') }}
            placeholder="Your username"
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>E-mail {requiredStar}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError('') }}
            placeholder="you@example.com"
            className={inputCls}
          />
        </div>

        <label className="flex items-center gap-3 cursor-pointer select-none">
          <Toggle checked={notify} onChange={() => setNotify((v) => !v)} />
          <span className="text-sm text-gray-700">Notify me if I reach my usage quota.</span>
        </label>

        {error && <p className="text-xs text-red-500">{error}</p>}
        <p className="text-xs text-red-500">* Required fields</p>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-8 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-sm uppercase tracking-wide transition-colors"
          >
            {saved ? <><Check size={13} /> Updated!</> : 'Update Profile'}
          </button>
        </div>
      </div>
    </div>
  )
}
