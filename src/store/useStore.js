import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const BURNER_DOMAINS = [
  'mailinator.com','guerrillamail.com','temp-mail.org','throwaway.email',
  'sharklasers.com','yopmail.com','trashmail.com','dispostable.com',
  'mailnull.com','spam4.me','tempmail.com','fakeinbox.com','tempinbox.com',
  'getairmail.com','mailforspam.com','guerrillamail.info','grr.la',
]

export function getLeadQuality(entry) {
  if (!entry) return 'neutral'
  const domain = entry.email?.split('@')[1]?.toLowerCase() || ''
  if (entry.suspicious || BURNER_DOMAINS.includes(domain)) return 'freebie'
  if (entry.entries >= 3 || entry.method === 'purchase' || entry.referrals > 0) return 'engaged'
  return 'neutral'
}

function generateReferralCode(name) {
  const base = (name || 'user').replace(/\s+/g, '').toLowerCase().slice(0, 6)
  return `${base}${Math.random().toString(36).slice(2, 6).toUpperCase()}`
}

const SAMPLE_ENTRIES = [
  { id: 1, name: 'Alex Johnson',    email: 'alex@gmail.com',       method: 'email',     ip: '192.168.1.1', enteredAt: '2024-01-15T10:23:00', suspicious: false, entries: 1, referrals: 3, referralCode: 'alexjAB3C', referredBy: null },
  { id: 2, name: 'Maria Garcia',    email: 'maria@gmail.com',      method: 'instagram', ip: '192.168.1.2', enteredAt: '2024-01-15T11:05:00', suspicious: false, entries: 2, referrals: 1, referralCode: 'mariaXY7Z', referredBy: null },
  { id: 3, name: 'James Wilson',    email: 'james@outlook.com',    method: 'purchase',  ip: '192.168.1.3', enteredAt: '2024-01-15T12:30:00', suspicious: false, entries: 5, referrals: 0, referralCode: 'jamesW2QR', referredBy: null },
  { id: 4, name: 'BOT ENTRY',       email: 'bot123@mailinator.com',method: 'email',     ip: '192.168.1.1', enteredAt: '2024-01-15T12:31:00', suspicious: true,  entries: 1, referrals: 0, referralCode: null,       referredBy: null },
  { id: 5, name: 'Sophie Chen',     email: 'sophie@yahoo.com',     method: 'tiktok',    ip: '10.0.0.5',    enteredAt: '2024-01-15T13:00:00', suspicious: false, entries: 2, referrals: 2, referralCode: 'sophiPQ4M', referredBy: 'alexjAB3C' },
  { id: 6, name: 'Ryan Lee',        email: 'ryan@gmail.com',       method: 'share',     ip: '10.0.0.6',    enteredAt: '2024-01-15T13:45:00', suspicious: false, entries: 3, referrals: 1, referralCode: 'ryanLEE9X', referredBy: 'alexjAB3C' },
  { id: 7, name: 'Emma Brown',      email: 'emma@hotmail.com',     method: 'visit',     ip: '10.0.0.7',    enteredAt: '2024-01-15T14:00:00', suspicious: false, entries: 1, referrals: 0, referralCode: 'emmaB5KL', referredBy: 'mariaXY7Z' },
  { id: 8, name: 'Noah Davis',      email: 'noah@gmail.com',       method: 'purchase',  ip: '10.0.0.8',    enteredAt: '2024-01-15T14:30:00', suspicious: false, entries: 5, referrals: 0, referralCode: 'noahDQ1W', referredBy: null },
  { id: 9, name: 'Olivia Martinez', email: 'olivia@icloud.com',    method: 'email',     ip: '10.0.0.9',    enteredAt: '2024-01-15T15:00:00', suspicious: false, entries: 1, referrals: 0, referralCode: 'oliviM8NP', referredBy: 'alexjAB3C' },
  { id:10, name: 'DUPLICATE',       email: 'alex@gmail.com',       method: 'email',     ip: '192.168.1.1', enteredAt: '2024-01-15T15:05:00', suspicious: true,  entries: 1, referrals: 0, referralCode: null,       referredBy: null },
  { id:11, name: 'Liam Parker',     email: 'liam@yopmail.com',     method: 'email',     ip: '10.0.0.11',   enteredAt: '2024-01-15T15:20:00', suspicious: false, entries: 1, referrals: 0, referralCode: 'liamPZZ2', referredBy: null },
  { id:12, name: 'Zara Khan',       email: 'zara@gmail.com',       method: 'discord',   ip: '10.0.0.12',   enteredAt: '2024-01-15T15:40:00', suspicious: false, entries: 2, referrals: 1, referralCode: 'zaraK7TY', referredBy: 'ryanLEE9X' },
]

const SAMPLE_CAMPAIGN = {
  id: 'camp_001',
  title: 'Summer Sale Giveaway',
  prize: 'AirPods Pro 2nd Gen',
  prizeValue: '$249',
  description: 'Enter to win a pair of AirPods Pro! Share with friends to increase your chances.',
  startDate: '2024-01-15',
  endDate: '2024-02-15',
  status: 'active',
  entryMethods: { email: true, instagram: true, tiktok: true, share: true, visit: true, purchase: true, discord: false, youtube: false },
  entryValues:  { email: 1, instagram: 2, tiktok: 2, share: 3, visit: 1, purchase: 5, discord: 2, youtube: 2 },
  fraudDetection: { blockDuplicateIP: true, blockDuplicateEmail: true, recaptcha: true },
  branding: { showPoweredBy: true, customColor: '#00d084', storeName: 'My Shopify Store' },
  password: '',
  geoRestrictions: { enabled: false, mode: 'allow', countries: [] },
  ageVerification: { enabled: false, minAge: 18 },
  referralTracking: { enabled: true, bonusEntries: 2 },
  abTest: { enabled: false, variantA: { title: '', description: '' }, variantB: { title: '', description: '' } },
  customFields: [],
  customThankYouUrl: '',
  winner: null,
  createdAt: '2024-01-10T09:00:00',
}

export const useStore = create(
  persist(
    (set, get) => ({
      campaigns: [SAMPLE_CAMPAIGN],
      activeCampaign: SAMPLE_CAMPAIGN,
      entries: SAMPLE_ENTRIES,
      winner: null,
      wizardStep: null,

      // Bot / fraud
      botAlerts: [
        { id: 1, type: 'velocity', message: '47 entries in 2 minutes from IP 45.33.32.156', severity: 'high', time: '2024-01-15T12:31:00', blocked: true },
        { id: 2, type: 'burner',   message: 'Burner email detected: bot123@mailinator.com',  severity: 'medium', time: '2024-01-15T12:31:00', blocked: true },
        { id: 3, type: 'duplicate',message: 'Duplicate IP 192.168.1.1 attempted re-entry',  severity: 'low',    time: '2024-01-15T15:05:00', blocked: true },
      ],
      botRules: { velocity: true, burner: true, proxy: true, duplicate: true },

      // Integrations
      integrationHealth: {
        mailchimp:  { status: 'connected', lastSync: '2024-01-15T15:00:00', entries: 9 },
        klaviyo:    { status: 'error',     lastSync: '2024-01-15T12:00:00', entries: 0 },
        sendfox:    { status: 'idle',      lastSync: null,                   entries: 0 },
        zapier:     { status: 'connected', lastSync: '2024-01-15T15:00:00', entries: 9 },
      },
      integrationConnections: {
        mailchimp:     { connected: true,  apiKey: 'mc_••••••••••••XYZQ', listId: 'abc123', syncEnabled: true },
        klaviyo:       { connected: false, apiKey: '',   listId: '',      syncEnabled: false },
        sendfox:       { connected: false, apiKey: '',   listId: '',      syncEnabled: false },
        convertkit:    { connected: false, apiKey: '',   listId: '',      syncEnabled: false },
        activecamp:    { connected: false, apiKey: '',   listId: '',      syncEnabled: false },
        zapier:        { connected: true,  webhookUrl: 'https://hooks.zapier.com/hooks/catch/123/abc', syncEnabled: true },
      },
      trackingPixels: { fbPixelId: '', gaId: '', gtmId: '' },
      webhookConfig: { url: '', events: { 'entry.created': true, 'winner.picked': true, 'campaign.ended': false }, secret: '' },

      // Email templates
      savedTemplates: {},

      // ── Campaign actions ──
      createCampaign: (data) => {
        const newCamp = {
          id: `camp_${Date.now()}`,
          ...data,
          entryMethods: { ...(data.entryMethods || {}), discord: false, youtube: false },
          entryValues:  { ...(data.entryValues  || {}), discord: 2, youtube: 2 },
          password: data.password || '',
          geoRestrictions: data.geoRestrictions || { enabled: false, mode: 'allow', countries: [] },
          ageVerification: data.ageVerification || { enabled: false, minAge: 18 },
          referralTracking: data.referralTracking || { enabled: true, bonusEntries: 2 },
          abTest: data.abTest || { enabled: false, variantA: {}, variantB: {} },
          customFields: data.customFields || [],
          customThankYouUrl: data.customThankYouUrl || '',
          status: 'draft',
          winner: null,
          createdAt: new Date().toISOString(),
        }
        set((s) => ({ campaigns: [newCamp, ...s.campaigns], activeCampaign: newCamp, entries: [], winner: null }))
      },

      updateCampaign: (id, data) => {
        set((s) => ({
          campaigns: s.campaigns.map((c) => (c.id === id ? { ...c, ...data } : c)),
          activeCampaign: s.activeCampaign?.id === id ? { ...s.activeCampaign, ...data } : s.activeCampaign,
        }))
      },

      duplicateCampaign: (id) => {
        const { campaigns } = get()
        const src = campaigns.find((c) => c.id === id)
        if (!src) return
        const copy = {
          ...src,
          id: `camp_${Date.now()}`,
          title: `${src.title} (Copy)`,
          status: 'draft',
          winner: null,
          createdAt: new Date().toISOString(),
        }
        set((s) => ({ campaigns: [copy, ...s.campaigns] }))
      },

      deleteCampaign: (id) => {
        set((s) => ({
          campaigns: s.campaigns.filter((c) => c.id !== id),
          activeCampaign: s.activeCampaign?.id === id
            ? (s.campaigns.filter((c) => c.id !== id)[0] || null)
            : s.activeCampaign,
        }))
      },

      setCampaignStatus: (id, status) => {
        set((s) => ({
          campaigns: s.campaigns.map((c) => (c.id === id ? { ...c, status } : c)),
          activeCampaign: s.activeCampaign?.id === id ? { ...s.activeCampaign, status } : s.activeCampaign,
        }))
      },

      setActiveCampaign: (campaign) => {
        const campEntries = SAMPLE_ENTRIES.filter(() => Math.random() > 0.3)
        set({ activeCampaign: campaign, winner: campaign.winner || null, entries: campEntries })
      },

      // ── Entry actions ──
      addEntry: (entry) => {
        const { entries, botRules } = get()
        const dupEmail = botRules.duplicate && entries.find((e) => e.email === entry.email)
        const dupIP    = botRules.duplicate && entries.filter((e) => e.ip === entry.ip).length >= 1
        const burner   = botRules.burner && BURNER_DOMAINS.includes(entry.email?.split('@')[1]?.toLowerCase())
        const suspicious = dupEmail || dupIP || burner
        const newEntry = {
          id: Date.now(),
          ...entry,
          enteredAt: new Date().toISOString(),
          suspicious: !!suspicious,
          referrals: 0,
          referralCode: generateReferralCode(entry.name),
          referredBy: entry.referredBy || null,
        }
        if (suspicious) {
          const alertType = burner ? 'burner' : dupEmail ? 'duplicate' : 'duplicate'
          set((s) => ({
            entries: [newEntry, ...s.entries],
            botAlerts: [
              { id: Date.now(), type: alertType, message: `Blocked: ${entry.email} (${alertType})`, severity: 'medium', time: new Date().toISOString(), blocked: true },
              ...s.botAlerts,
            ],
          }))
        } else {
          set((s) => ({ entries: [newEntry, ...s.entries] }))
        }
        return { success: !suspicious, suspicious }
      },

      removeEntry: (id) => set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),

      // ── Bot / fraud ──
      dismissBotAlert: (id) => set((s) => ({ botAlerts: s.botAlerts.filter((a) => a.id !== id) })),
      clearAllBotAlerts: () => set({ botAlerts: [] }),
      updateBotRules: (rules) => set({ botRules: rules }),

      // ── Integrations ──
      connectIntegration: (service, config) => {
        set((s) => ({
          integrationConnections: {
            ...s.integrationConnections,
            [service]: { ...s.integrationConnections[service], ...config, connected: true },
          },
          integrationHealth: {
            ...s.integrationHealth,
            [service]: { status: 'connected', lastSync: new Date().toISOString(), entries: 0 },
          },
        }))
      },

      disconnectIntegration: (service) => {
        set((s) => ({
          integrationConnections: {
            ...s.integrationConnections,
            [service]: { ...s.integrationConnections[service], connected: false },
          },
          integrationHealth: {
            ...s.integrationHealth,
            [service]: { ...s.integrationHealth?.[service], status: 'idle' },
          },
        }))
      },

      saveTrackingPixels: (pixels) => set({ trackingPixels: pixels }),

      saveWebhook: (config) => set({ webhookConfig: config }),

      // ── Email templates ──
      saveEmailTemplate: (id, template) => {
        set((s) => ({ savedTemplates: { ...s.savedTemplates, [id]: { ...template, savedAt: new Date().toISOString() } } }))
      },

      // ── Winner ──
      pickWinner: (preSelected) => {
        const { entries, activeCampaign } = get()
        const valid = entries.filter((e) => !e.suspicious)
        if (!valid.length) return null
        const pool   = valid.flatMap((e) => Array(e.entries).fill(e))
        const winner = preSelected || pool[Math.floor(Math.random() * pool.length)]
        const winnerData = { ...winner, pickedAt: new Date().toISOString(), proofUrl: `giveshop.app/proof/${Date.now()}` }
        set((s) => ({
          winner: winnerData,
          activeCampaign: s.activeCampaign ? { ...s.activeCampaign, winner: winnerData, status: 'completed' } : null,
          campaigns: s.campaigns.map((c) =>
            c.id === activeCampaign?.id ? { ...c, winner: winnerData, status: 'completed' } : c
          ),
        }))
        return winnerData
      },

      clearWinner: () => set({ winner: null }),
    }),
    { name: 'giveaway-store-v2' }
  )
)
