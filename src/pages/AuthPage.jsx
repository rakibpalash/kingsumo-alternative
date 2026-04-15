import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Gift, Mail, Lock, Eye, EyeOff, Loader, Check } from 'lucide-react'

export default function AuthPage() {
  const [mode, setMode]       = useState('login') // 'login' | 'signup' | 'reset'
  const [email, setEmail]     = useState('')
  const [password, setPass]   = useState('')
  const [showPass, setShowP]  = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')

  const handle = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        // App.jsx auth listener handles redirect
      } else if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setSuccess('Account created! Check your email to confirm, then log in.')
        setMode('login')
      } else if (mode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/settings`,
        })
        if (error) throw error
        setSuccess('Password reset link sent — check your inbox.')
      }
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-brand-green flex items-center justify-center mb-3 shadow-lg shadow-brand-green/20">
            <Gift size={22} className="text-dark-900" />
          </div>
          <h1 className="text-xl font-bold text-white">GiveShop</h1>
          <p className="text-sm text-dark-400 mt-0.5">Giveaway Management Platform</p>
        </div>

        {/* Card */}
        <div className="bg-dark-800 border border-dark-500 rounded-2xl p-6 shadow-2xl">
          {/* Mode tabs */}
          {mode !== 'reset' && (
            <div className="flex gap-1 bg-dark-700 rounded-xl p-1 mb-6">
              {['login', 'signup'].map((m) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setError(''); setSuccess('') }}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    mode === m ? 'bg-brand-green text-dark-900' : 'text-dark-400 hover:text-white'
                  }`}
                >
                  {m === 'login' ? 'Log In' : 'Sign Up'}
                </button>
              ))}
            </div>
          )}

          {mode === 'reset' && (
            <div className="mb-6">
              <h2 className="text-base font-bold text-white">Reset Password</h2>
              <p className="text-xs text-dark-400 mt-0.5">Enter your email and we'll send a reset link</p>
            </div>
          )}

          <form onSubmit={handle} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs text-dark-400 mb-1.5">Email address</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-dark-700 border border-dark-500 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder-dark-500 focus:outline-none focus:border-brand-green transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            {mode !== 'reset' && (
              <div>
                <label className="block text-xs text-dark-400 mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPass(e.target.value)}
                    placeholder={mode === 'signup' ? 'Min 6 characters' : '••••••••'}
                    minLength={6}
                    className="w-full bg-dark-700 border border-dark-500 rounded-lg pl-9 pr-10 py-2.5 text-sm text-white placeholder-dark-500 focus:outline-none focus:border-brand-green transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowP(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white transition-colors"
                  >
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            )}

            {/* Error / success */}
            {error   && <p className="text-xs text-red-400 bg-red-900/20 border border-red-800/40 rounded-lg px-3 py-2">{error}</p>}
            {success && (
              <p className="text-xs text-brand-green bg-brand-green/10 border border-brand-green/30 rounded-lg px-3 py-2 flex items-center gap-1.5">
                <Check size={12} /> {success}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-brand-green text-dark-900 font-bold rounded-xl hover:bg-brand-green/80 transition-colors disabled:opacity-60 text-sm"
            >
              {loading
                ? <><Loader size={14} className="animate-spin" /> Please wait…</>
                : mode === 'login' ? 'Log In'
                : mode === 'signup' ? 'Create Account'
                : 'Send Reset Link'}
            </button>
          </form>

          {/* Forgot password */}
          {mode === 'login' && (
            <button
              onClick={() => { setMode('reset'); setError(''); setSuccess('') }}
              className="w-full text-center text-xs text-dark-500 hover:text-dark-300 mt-4 transition-colors"
            >
              Forgot your password?
            </button>
          )}
          {mode === 'reset' && (
            <button
              onClick={() => { setMode('login'); setError(''); setSuccess('') }}
              className="w-full text-center text-xs text-dark-500 hover:text-dark-300 mt-4 transition-colors"
            >
              ← Back to log in
            </button>
          )}
        </div>

        <p className="text-center text-xs text-dark-600 mt-6">
          Your data is stored securely in Supabase · Powered by GiveShop
        </p>
      </div>
    </div>
  )
}
