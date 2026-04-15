import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import CampaignBuilder from './pages/CampaignBuilder'
import Participants from './pages/Participants'
import WinnerPicker from './pages/WinnerPicker'
import LandingPreview from './pages/LandingPreview'
import SetupWizard from './pages/SetupWizard'
import Settings from './pages/Settings'
import Analytics from './pages/Analytics'
import BotDetection from './pages/BotDetection'
import Leaderboard from './pages/Leaderboard'
import EmbedWidget from './pages/EmbedWidget'
import WinnerAnnouncement from './pages/WinnerAnnouncement'
import EmailTemplateEditor from './pages/EmailTemplateEditor'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="campaigns/new" element={<CampaignBuilder />} />
          <Route path="campaigns/:id/edit" element={<CampaignBuilder />} />
          <Route path="participants" element={<Participants />} />
          <Route path="winner" element={<WinnerPicker />} />
          <Route path="winner-announcement" element={<WinnerAnnouncement />} />
          <Route path="preview" element={<LandingPreview />} />
          <Route path="setup" element={<SetupWizard />} />
          <Route path="settings" element={<Settings />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="bot-detection" element={<BotDetection />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="embed" element={<EmbedWidget />} />
          <Route path="email-editor" element={<EmailTemplateEditor />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
