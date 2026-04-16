import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'
import { triggerEntryIntegrations } from '../lib/integrations'

// ── Fraud helpers ─────────────────────────────────────────────
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

// ── DB mappers ────────────────────────────────────────────────
function mapCampaignFromDB(row) {
  const s = row.settings || {}
  return {
    id: row.id,
    title: row.title,
    prize: row.prize || '',
    prizeValue: row.prize_value || '',
    status: row.status || 'draft',
    endDate: row.end_date || '',
    createdAt: row.created_at,
    description: s.description || '',
    startDate: s.startDate || '',
    entryMethods:    s.entryMethods    || { email: true },
    entryValues:     s.entryValues     || { email: 1 },
    fraudDetection:  s.fraudDetection  || { blockDuplicateIP: true, blockDuplicateEmail: true, recaptcha: true },
    branding:        s.branding        || { showPoweredBy: true, customColor: '#00d084', storeName: '' },
    password:        s.password        || '',
    geoRestrictions: s.geoRestrictions || { enabled: false, mode: 'allow', countries: [] },
    ageVerification: s.ageVerification || { enabled: false, minAge: 18 },
    referralTracking:s.referralTracking|| { enabled: true, bonusEntries: 2 },
    abTest:          s.abTest          || { enabled: false, variantA: {}, variantB: {} },
    customFields:    s.customFields    || [],
    customThankYouUrl: s.customThankYouUrl || '',
    winner: s.winner || null,
  }
}

function mapEntryFromDB(row) {
  return {
    id: row.id,
    campaignId: row.campaign_id,
    name: row.name,
    email: row.email,
    entries: row.entries,
    method: row.method || 'email',
    suspicious: row.suspicious || false,
    referralCode: row.referral_code || null,
    referredBy: row.referred_by || null,
    referrals: row.referrals || 0,
    ip: row.ip || '',
    enteredAt: row.entered_at,
  }
}

// ── Store ─────────────────────────────────────────────────────
export const useStore = create(
  persist(
    (set, get) => ({
      // Auth
      user: null,
      dbLoading: false,

      // App state
      campaigns:      [],
      activeCampaign: null,
      entries:        [],
      winner:         null,
      wizardStep:     null,

      // Bot / fraud
      botAlerts: [],
      botRules:  { velocity: true, burner: true, proxy: true, duplicate: true },

      // Integrations
      integrationHealth:      {},
      integrationConnections: {},
      trackingPixels:  { fbPixelId: '', gaId: '', gtmId: '' },
      webhookConfig:   { url: '', events: { 'entry.created': true, 'winner.picked': true, 'campaign.ended': false }, secret: '' },
      savedTemplates:  {},

      // ── Auth actions ──────────────────────────────────────
      setUser: (user) => set({ user }),

      signOut: async () => {
        await supabase.auth.signOut()
        set({ user: null, campaigns: [], entries: [], activeCampaign: null, winner: null })
      },

      // ── Load data from Supabase ───────────────────────────
      loadFromDB: async (userId) => {
        set({ dbLoading: true })
        try {
          const { data: campaigns, error: ce } = await supabase
            .from('campaigns')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

          if (ce) throw ce

          const mapped = (campaigns || []).map(mapCampaignFromDB)

          if (mapped.length === 0) {
            // DB returned empty — keep any locally-persisted campaigns instead of wiping them
            set({ dbLoading: false })
            return
          }

          const { data: entries } = await supabase
            .from('entries')
            .select('*')
            .in('campaign_id', mapped.map((c) => c.id))
            .order('entered_at', { ascending: false })

          const mappedEntries = (entries || []).map(mapEntryFromDB)
          const active = mapped[0]

          set({
            campaigns: mapped,
            activeCampaign: active,
            entries: mappedEntries.filter((e) => e.campaignId === active.id),
            dbLoading: false,
          })
        } catch (err) {
          console.error('loadFromDB:', err)
          set({ dbLoading: false })
        }
      },

      // ── Campaign actions ──────────────────────────────────
      createCampaign: async (data) => {
        const { user } = get()
        const id = crypto.randomUUID()
        const now = new Date().toISOString()
        const newCamp = {
          id,
          title: data.title || 'Untitled Campaign',
          prize: data.prize || '',
          prizeValue: data.prizeValue || '',
          description: data.description || '',
          startDate: data.startDate || '',
          endDate: data.endDate || '',
          status: 'draft',
          entryMethods: { ...(data.entryMethods || {}), discord: false, youtube: false },
          entryValues:  { ...(data.entryValues  || {}), discord: 2, youtube: 2 },
          fraudDetection:  data.fraudDetection  || { blockDuplicateIP: true, blockDuplicateEmail: true, recaptcha: true },
          branding:        data.branding        || { showPoweredBy: true, customColor: '#00d084', storeName: '' },
          password:        data.password        || '',
          geoRestrictions: data.geoRestrictions || { enabled: false, mode: 'allow', countries: [] },
          ageVerification: data.ageVerification || { enabled: false, minAge: 18 },
          referralTracking:data.referralTracking|| { enabled: true, bonusEntries: 2 },
          abTest:          data.abTest          || { enabled: false, variantA: {}, variantB: {} },
          customFields:    data.customFields    || [],
          customThankYouUrl: data.customThankYouUrl || '',
          winner: null,
          createdAt: now,
        }

        // Optimistic update
        set((s) => ({ campaigns: [newCamp, ...s.campaigns], activeCampaign: newCamp, entries: [], winner: null }))

        // Persist to DB
        if (user) {
          const { error } = await supabase.from('campaigns').insert({
            id,
            user_id: user.id,
            title:       newCamp.title,
            prize:       newCamp.prize,
            prize_value: newCamp.prizeValue,
            status:      newCamp.status,
            end_date:    newCamp.endDate || null,
            settings:    { ...data },
          })
          if (error) {
            console.error('createCampaign DB error:', error)
            // Show in UI so it's not silently lost
            alert(`Campaign saved locally but failed to sync to cloud: ${error.message}`)
          }
        }
      },

      updateCampaign: async (id, data) => {
        const { user } = get()
        set((s) => ({
          campaigns: s.campaigns.map((c) => (c.id === id ? { ...c, ...data } : c)),
          activeCampaign: s.activeCampaign?.id === id ? { ...s.activeCampaign, ...data } : s.activeCampaign,
        }))

        if (user) {
          const { error } = await supabase.from('campaigns').update({
            title:       data.title,
            prize:       data.prize,
            prize_value: data.prizeValue,
            status:      data.status,
            end_date:    data.endDate || null,
            settings:    data,
          }).eq('id', id)
          if (error) console.error('updateCampaign:', error)
        }
      },

      duplicateCampaign: async (id) => {
        const { campaigns, user } = get()
        const src = campaigns.find((c) => c.id === id)
        if (!src) return
        const newId = crypto.randomUUID()
        const copy = {
          ...src,
          id: newId,
          title: `${src.title} (Copy)`,
          status: 'draft',
          winner: null,
          createdAt: new Date().toISOString(),
        }
        set((s) => ({ campaigns: [copy, ...s.campaigns] }))

        if (user) {
          const { error } = await supabase.from('campaigns').insert({
            id: newId,
            user_id: user.id,
            title:       copy.title,
            prize:       copy.prize,
            prize_value: copy.prizeValue,
            status:      'draft',
            end_date:    copy.endDate || null,
            settings:    { ...src },
          })
          if (error) console.error('duplicateCampaign:', error)
        }
      },

      deleteCampaign: async (id) => {
        const { user } = get()
        set((s) => ({
          campaigns: s.campaigns.filter((c) => c.id !== id),
          activeCampaign: s.activeCampaign?.id === id
            ? (s.campaigns.filter((c) => c.id !== id)[0] || null)
            : s.activeCampaign,
        }))

        if (user) {
          const { error } = await supabase.from('campaigns').delete().eq('id', id)
          if (error) console.error('deleteCampaign:', error)
        }
      },

      setCampaignStatus: async (id, status) => {
        const { user } = get()
        set((s) => ({
          campaigns: s.campaigns.map((c) => (c.id === id ? { ...c, status } : c)),
          activeCampaign: s.activeCampaign?.id === id ? { ...s.activeCampaign, status } : s.activeCampaign,
        }))

        if (user) {
          const { error } = await supabase.from('campaigns').update({ status }).eq('id', id)
          if (error) console.error('setCampaignStatus:', error)
        }
      },

      setActiveCampaign: async (campaign) => {
        const { user } = get()
        set({ activeCampaign: campaign, winner: campaign.winner || null })

        // Load entries for this campaign
        if (user && campaign?.id) {
          const { data: entries } = await supabase
            .from('entries')
            .select('*')
            .eq('campaign_id', campaign.id)
            .order('entered_at', { ascending: false })

          set({ entries: (entries || []).map(mapEntryFromDB) })
        }
      },

      // ── Entry actions ─────────────────────────────────────
      addEntry: async (entry) => {
        const { entries, botRules, activeCampaign, user } = get()
        const dupEmail  = botRules.duplicate && entries.find((e) => e.email === entry.email)
        const dupIP     = botRules.duplicate && entries.filter((e) => e.ip === entry.ip).length >= 1
        const burner    = botRules.burner && BURNER_DOMAINS.includes(entry.email?.split('@')[1]?.toLowerCase())
        const suspicious = !!(dupEmail || dupIP || burner)

        const id = crypto.randomUUID()
        const newEntry = {
          id,
          campaignId: activeCampaign?.id,
          ...entry,
          enteredAt: new Date().toISOString(),
          suspicious,
          referrals: 0,
          referralCode: generateReferralCode(entry.name),
          referredBy: entry.referredBy || null,
        }

        if (suspicious) {
          const alertType = burner ? 'burner' : 'duplicate'
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

        // Persist entry to DB
        if (user && activeCampaign?.id) {
          const { error } = await supabase.from('entries').insert({
            id,
            campaign_id:   activeCampaign.id,
            name:          entry.name,
            email:         entry.email,
            entries:       entry.entries || 1,
            method:        entry.method  || 'email',
            suspicious,
            referral_code: newEntry.referralCode,
            referred_by:   newEntry.referredBy,
            referrals:     0,
            ip:            entry.ip || '',
          })
          if (error) console.error('addEntry:', error)
        }

        // Fire all active integrations (pixels, webhook, ESP sync)
        if (!suspicious) {
          const { integrationConnections, webhookConfig, trackingPixels } = get()
          triggerEntryIntegrations({
            entry: newEntry,
            campaign: activeCampaign,
            integrationConnections,
            webhookConfig,
            trackingPixels,
          })
        }

        return { success: !suspicious, suspicious }
      },

      removeEntry: async (id) => {
        const { user } = get()
        set((s) => ({ entries: s.entries.filter((e) => e.id !== id) }))

        if (user) {
          const { error } = await supabase.from('entries').delete().eq('id', id)
          if (error) console.error('removeEntry:', error)
        }
      },

      // ── Bot / fraud ───────────────────────────────────────
      dismissBotAlert:  (id)    => set((s) => ({ botAlerts: s.botAlerts.filter((a) => a.id !== id) })),
      clearAllBotAlerts:()      => set({ botAlerts: [] }),
      updateBotRules:   (rules) => set({ botRules: rules }),

      // ── Integrations ──────────────────────────────────────
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

      saveTrackingPixels: (pixels) => {
        set({ trackingPixels: pixels })
        // Inject scripts immediately when saved
        import('../lib/integrations').then(({ initFacebookPixel, initGoogleAnalytics, initGTM }) => {
          if (pixels.fbPixelId) initFacebookPixel(pixels.fbPixelId)
          if (pixels.gaId)      initGoogleAnalytics(pixels.gaId)
          if (pixels.gtmId)     initGTM(pixels.gtmId)
        })
      },
      saveWebhook: (config) => set({ webhookConfig: config }),

      // ── Email templates ───────────────────────────────────
      saveEmailTemplate: (id, template) => {
        set((s) => ({ savedTemplates: { ...s.savedTemplates, [id]: { ...template, savedAt: new Date().toISOString() } } }))
      },

      // ── Winner ────────────────────────────────────────────
      pickWinner: async (preSelected) => {
        const { entries, activeCampaign, user } = get()
        const valid = entries.filter((e) => !e.suspicious)
        if (!valid.length) return null

        const pool   = valid.flatMap((e) => Array(e.entries).fill(e))
        const winner = preSelected || pool[Math.floor(Math.random() * pool.length)]
        const winnerData = {
          ...winner,
          pickedAt: new Date().toISOString(),
          proofUrl: `${window.location.origin}/proof/${activeCampaign?.id}`,
        }

        set((s) => ({
          winner: winnerData,
          activeCampaign: s.activeCampaign ? { ...s.activeCampaign, winner: winnerData, status: 'completed' } : null,
          campaigns: s.campaigns.map((c) =>
            c.id === activeCampaign?.id ? { ...c, winner: winnerData, status: 'completed' } : c
          ),
        }))

        // Persist winner + update campaign status
        if (user && activeCampaign?.id) {
          await supabase.from('winners').insert({
            campaign_id: activeCampaign.id,
            entry_id:    winner.id,
            name:        winner.name,
            email:       winner.email,
            method:      winner.method,
            entries:     winner.entries,
            proof_url:   winnerData.proofUrl,
          })
          await supabase.from('campaigns').update({ status: 'completed' }).eq('id', activeCampaign.id)
        }

        return winnerData
      },

      clearWinner: () => set({ winner: null }),
    }),
    { name: 'giveaway-store-v3' }
  )
)
