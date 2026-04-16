import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Shield, Trophy, Users, Clock, Gift, CheckCircle, Loader2, AlertCircle } from 'lucide-react'

function maskEmail(email) {
  if (!email) return '***'
  const [user, domain] = email.split('@')
  return `${user.slice(0, 2)}***@${domain}`
}

export default function ProofPage() {
  const { campaignId } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      // fetch campaign
      const { data: campaign, error: campErr } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .single()

      if (campErr || !campaign) {
        setError('Campaign not found.')
        setLoading(false)
        return
      }

      // fetch winner
      const { data: winner } = await supabase
        .from('winners')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('picked_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      // fetch total valid entries
      const { count: totalEntries } = await supabase
        .from('entries')
        .select('*', { count: 'exact', head: true })
        .eq('campaign_id', campaignId)
        .eq('suspicious', false)

      setData({ campaign, winner, totalEntries: totalEntries || 0 })
      setLoading(false)
    }
    load()
  }, [campaignId])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-gray-500" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-center space-y-2">
          <AlertCircle size={36} className="mx-auto text-red-400" />
          <p className="text-white font-semibold">{error || 'Not found.'}</p>
        </div>
      </div>
    )
  }

  const { campaign, winner, totalEntries } = data
  const s = campaign.settings || {}

  return (
    <div className="min-h-screen bg-[#0f0f0f]" style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div className="max-w-lg mx-auto px-4 py-12">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4 bg-green-500/20 text-green-400 border border-green-500/30">
            <Shield size={11} /> Verified Fair Draw
          </div>
          <h1 className="text-xl font-bold text-white">{campaign.title}</h1>
          <p className="text-sm text-gray-500 mt-1">Public proof of winner selection</p>
        </div>

        {/* Winner card */}
        {winner ? (
          <div className="bg-gray-900 border border-green-500/30 rounded-2xl p-6 mb-6 text-center">
            <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
              <Trophy size={24} className="text-green-400" />
            </div>
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Winner</p>
            <p className="text-xl font-bold text-white">{winner.name}</p>
            <p className="text-sm text-gray-500">{maskEmail(winner.email)}</p>

            <div className="flex items-center justify-center gap-1.5 mt-3">
              <CheckCircle size={13} className="text-green-400" />
              <span className="text-xs text-green-400 font-medium">Randomly selected from {totalEntries} eligible entries</span>
            </div>

            {winner.picked_at && (
              <p className="text-xs text-gray-600 mt-2">
                Selected {new Date(winner.picked_at).toLocaleString()}
              </p>
            )}
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6 text-center">
            <Trophy size={24} className="mx-auto text-gray-600 mb-2" />
            <p className="text-sm text-gray-500">Winner not yet selected</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { icon: Users, label: 'Total Entries', value: totalEntries },
            { icon: Gift,  label: 'Prize', value: campaign.prize || '—' },
            { icon: Clock, label: 'End Date', value: campaign.end_date ? new Date(campaign.end_date).toLocaleDateString() : '—' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
              <Icon size={14} className="mx-auto text-gray-500 mb-1" />
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-sm font-semibold text-white truncate">{value}</p>
            </div>
          ))}
        </div>

        {/* Draw method */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Shield size={13} className="text-green-400" /> How the winner was chosen
          </h2>
          <ul className="space-y-2 text-xs text-gray-400">
            <li className="flex items-start gap-2">
              <CheckCircle size={12} className="text-green-400 mt-0.5 shrink-0" />
              All suspicious and duplicate entries were filtered out before selection.
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={12} className="text-green-400 mt-0.5 shrink-0" />
              Each ticket (entry) had an equal chance of being selected.
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={12} className="text-green-400 mt-0.5 shrink-0" />
              Winner was picked using a cryptographically random draw from {totalEntries} verified entries.
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={12} className="text-green-400 mt-0.5 shrink-0" />
              This page is publicly accessible and cannot be altered after selection.
            </li>
          </ul>
        </div>

        <p className="text-center text-xs text-gray-700 mt-6">Powered by GiveShop</p>
      </div>
    </div>
  )
}
