import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { useStore } from './store/useStore'
import { initFacebookPixel, initGoogleAnalytics, initGTM } from './lib/integrations'
import { Gift } from 'lucide-react'
import Layout from './components/Layout'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import CampaignBuilder from './pages/CampaignBuilder'
import Participants from './pages/Participants'
import WinnerPicker from './pages/WinnerPicker'
import LandingPreview from './pages/LandingPreview'
import PublicLanding from './pages/PublicLanding'
import SetupWizard from './pages/SetupWizard'
import Settings from './pages/Settings'
import Analytics from './pages/Analytics'
import BotDetection from './pages/BotDetection'
import Leaderboard from './pages/Leaderboard'
import EmbedWidget from './pages/EmbedWidget'
import WinnerAnnouncement from './pages/WinnerAnnouncement'
import EmailTemplateEditor from './pages/EmailTemplateEditor'
import EntryPage from './pages/EntryPage'
import ProofPage from './pages/ProofPage'

function AppShell({ session }) {
  if (!session) return <AuthPage />
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"           element={<Dashboard />} />
        <Route path="campaigns/new"       element={<CampaignBuilder />} />
        <Route path="campaigns/:id/edit"  element={<CampaignBuilder />} />
        <Route path="participants"        element={<Participants />} />
        <Route path="winner"              element={<WinnerPicker />} />
        <Route path="winner-announcement" element={<WinnerAnnouncement />} />
        <Route path="preview"             element={<LandingPreview />} />
        <Route path="setup"               element={<SetupWizard />} />
        <Route path="settings"            element={<Settings />} />
        <Route path="analytics"           element={<Analytics />} />
        <Route path="bot-detection"       element={<BotDetection />} />
        <Route path="leaderboard"         element={<Leaderboard />} />
        <Route path="embed"               element={<EmbedWidget />} />
        <Route path="email-editor"        element={<EmailTemplateEditor />} />
      </Route>
    </Routes>
  )
}

function Spinner() {
  return (
    <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-brand-green flex items-center justify-center animate-pulse">
        <Gift size={22} className="text-dark-900" />
      </div>
      <p className="text-sm text-dark-400">Loading GiveShop…</p>
    </div>
  )
}

export default function App() {
  // undefined = checking, null = not logged in, object = logged in
  const [session, setSession] = useState(undefined)
  const { setUser, loadFromDB, trackingPixels } = useStore()

  // Initialize tracking pixels from saved config on app start
  useEffect(() => {
    if (trackingPixels?.fbPixelId) initFacebookPixel(trackingPixels.fbPixelId)
    if (trackingPixels?.gaId)      initGoogleAnalytics(trackingPixels.gaId)
    if (trackingPixels?.gtmId)     initGTM(trackingPixels.gtmId)
  }, []) // eslint-disable-line

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        setUser(session.user)
        loadFromDB(session.user.id)
      }
    })

    // Listen for auth changes (login / logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        setUser(session.user)
        loadFromDB(session.user.id)
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  if (session === undefined) return <Spinner />

  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public — no login required ── */}
        <Route path="/g/:id"               element={<PublicLanding />} />
        <Route path="/enter/:id"           element={<EntryPage />} />
        <Route path="/proof/:campaignId"   element={<ProofPage />} />

        {/* ── Everything else goes through the auth gate ── */}
        <Route path="/*" element={<AppShell session={session} />} />
      </Routes>
    </BrowserRouter>
  )
}
