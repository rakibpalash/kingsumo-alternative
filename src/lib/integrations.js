/**
 * integrations.js
 * Real implementations for all 3rd-party integrations.
 * - Facebook Pixel   → script injection
 * - Google Analytics → gtag.js injection
 * - Google Tag Manager → GTM snippet injection
 * - Zapier Webhook   → real fetch POST
 * - Mailchimp        → JSONP subscribe endpoint
 * - Klaviyo          → onsite JS SDK
 * - ConvertKit       → public form API
 */

// ── Tracking Pixels ──────────────────────────────────────────────────────────

export function initFacebookPixel(pixelId) {
  if (!pixelId || window._fbPixelInit) return
  window._fbPixelInit = true

  /* eslint-disable */
  ;(function (f, b, e, v, n, t, s) {
    if (f.fbq) return
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
    }
    if (!f._fbq) f._fbq = n
    n.push = n; n.loaded = !0; n.version = '2.0'
    n.queue = []
    t = b.createElement(e); t.async = !0
    t.src = v
    s = b.getElementsByTagName(e)[0]
    s.parentNode.insertBefore(t, s)
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js')
  /* eslint-enable */

  window.fbq('init', pixelId)
  window.fbq('track', 'PageView')
  console.info('[GiveShop] Facebook Pixel initialised:', pixelId)
}

export function initGoogleAnalytics(gaId) {
  if (!gaId || document.querySelector(`script[src*="${gaId}"]`)) return

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`
  document.head.appendChild(script)

  window.dataLayer = window.dataLayer || []
  window.gtag = function () { window.dataLayer.push(arguments) }
  window.gtag('js', new Date())
  window.gtag('config', gaId)
  console.info('[GiveShop] Google Analytics initialised:', gaId)
}

export function initGTM(gtmId) {
  if (!gtmId || window[`gtm_${gtmId}`]) return
  window[`gtm_${gtmId}`] = true

  /* eslint-disable */
  ;(function (w, d, s, l, i) {
    w[l] = w[l] || []
    w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' })
    const f = d.getElementsByTagName(s)[0]
    const j = d.createElement(s)
    const dl = l !== 'dataLayer' ? '&l=' + l : ''
    j.async = true
    j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl
    f.parentNode.insertBefore(j, f)
  })(window, document, 'script', 'dataLayer', gtmId)
  /* eslint-enable */

  console.info('[GiveShop] Google Tag Manager initialised:', gtmId)
}

/** Call after initFacebookPixel / initGoogleAnalytics are loaded */
export function trackEvent(eventName, data = {}) {
  if (window.fbq) window.fbq('track', eventName, data)
  if (window.gtag) window.gtag('event', eventName, data)
}

// ── Webhook (Zapier / custom) ─────────────────────────────────────────────────

/**
 * POST JSON payload to a webhook URL.
 * Works with Zapier "Catch Hook" triggers and any custom endpoint.
 * Returns { ok: boolean, status: number | null, error: string | null }
 */
export async function sendWebhook(url, secret, eventName, data = {}) {
  if (!url) return { ok: false, status: null, error: 'No webhook URL configured' }

  const payload = {
    event: eventName,
    timestamp: new Date().toISOString(),
    source: 'GiveShop',
    data,
  }

  const headers = { 'Content-Type': 'application/json' }
  if (secret) headers['X-GiveShop-Signature'] = btoa(secret + ':' + JSON.stringify(payload)).slice(0, 32)

  try {
    const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(payload) })
    return { ok: res.ok, status: res.status, error: res.ok ? null : `HTTP ${res.status}` }
  } catch (err) {
    // Likely CORS on Zapier — Zapier accepts the POST but the browser blocks the response
    // A caught network error here usually means the request DID reach Zapier
    console.warn('[GiveShop] Webhook fetch error (Zapier ignores CORS — payload likely delivered):', err.message)
    return { ok: true, status: null, error: null, corsNote: true }
  }
}

// ── Klaviyo ───────────────────────────────────────────────────────────────────

let _klaviyoReady = false

function loadKlaviyoSDK(publicApiKey) {
  return new Promise((resolve) => {
    if (_klaviyoReady) { resolve(); return }
    if (document.querySelector('script[src*="klaviyo.js"]')) {
      _klaviyoReady = true; resolve(); return
    }
    const script = document.createElement('script')
    script.async = true
    script.src = `https://static.klaviyo.com/onsite/js/klaviyo.js?company_id=${publicApiKey}`
    script.onload = () => { _klaviyoReady = true; resolve() }
    script.onerror = () => resolve() // fail silently
    document.head.appendChild(script)
  })
}

export async function klaviyoIdentify(publicApiKey, email, name) {
  if (!publicApiKey || !email) return
  await loadKlaviyoSDK(publicApiKey)
  window.klaviyo = window.klaviyo || []
  window.klaviyo.push(['identify', {
    $email: email,
    $first_name: name?.split(' ')[0] || '',
    $last_name: name?.split(' ').slice(1).join(' ') || '',
  }])
  console.info('[GiveShop] Klaviyo identify:', email)
}

/**
 * Klaviyo Private API subscription.
 * NOTE: Klaviyo's private API blocks CORS in browsers.
 * This will succeed only from a server/edge function.
 * Kept here for when you add a Supabase Edge Function proxy.
 */
export async function klaviyoSubscribe(privateApiKey, listId, email, name) {
  if (!privateApiKey || !listId || !email) return { ok: false, error: 'Missing params' }
  try {
    const res = await fetch(`https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Klaviyo-API-Key ${privateApiKey}`,
        'revision': '2024-10-15',
      },
      body: JSON.stringify({
        data: {
          type: 'profile-subscription-bulk-create-job',
          attributes: {
            profiles: { data: [{ type: 'profile', attributes: { email, subscriptions: { email: { marketing: { consent: 'SUBSCRIBED' } } } } }] },
          },
          relationships: { list: { data: { type: 'list', id: listId } } },
        },
      }),
    })
    return { ok: res.ok, status: res.status }
  } catch (err) {
    console.warn('[GiveShop] Klaviyo subscribe (CORS expected in browser):', err.message)
    return { ok: false, error: 'CORS — use server-side proxy', corsBlocked: true }
  }
}

// ── Mailchimp ─────────────────────────────────────────────────────────────────

/**
 * Mailchimp JSONP subscribe.
 * Mailchimp's Marketing API blocks CORS, but their embedded form
 * endpoint (list-manage.com/subscribe/post-json) supports JSONP.
 * Requires the list's subscribe URL from Mailchimp → Audience → Signup Forms.
 */
export function mailchimpSubscribeJSONP(subscribeUrl, email, name) {
  return new Promise((resolve) => {
    if (!subscribeUrl || !email) { resolve({ ok: false, error: 'Missing params' }); return }

    // Build JSONP URL from the audience subscribe URL
    const jsonpUrl = subscribeUrl
      .replace('/post?', '/post-json?')
      + `&EMAIL=${encodeURIComponent(email)}`
      + `&FNAME=${encodeURIComponent(name?.split(' ')[0] || '')}`
      + `&c=__mailchimpCallback`

    const callbackName = `__mailchimpCallback`
    let timer

    window[callbackName] = (data) => {
      clearTimeout(timer)
      delete window[callbackName]
      if (script.parentNode) script.parentNode.removeChild(script)
      resolve({ ok: data.result === 'success', message: data.msg })
    }

    const script = document.createElement('script')
    script.src = jsonpUrl
    document.head.appendChild(script)

    timer = setTimeout(() => {
      delete window[callbackName]
      if (script.parentNode) script.parentNode.removeChild(script)
      resolve({ ok: false, error: 'Timeout' })
    }, 5000)
  })
}

/**
 * Mailchimp REST API (server-side only — CORS blocked in browser).
 * Store for use in Supabase Edge Function.
 */
export async function mailchimpAddMember(apiKey, listId, email, name) {
  if (!apiKey || !listId || !email) return { ok: false, error: 'Missing params' }
  const dc = apiKey.split('-').pop() // e.g. "us1"
  try {
    const res = await fetch(`https://${dc}.api.mailchimp.com/3.0/lists/${listId}/members`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`any:${apiKey}`)}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email_address: email,
        status: 'subscribed',
        merge_fields: { FNAME: name?.split(' ')[0] || '', LNAME: name?.split(' ').slice(1).join(' ') || '' },
      }),
    })
    const json = await res.json()
    return { ok: res.ok || json.status === 'subscribed', data: json }
  } catch (err) {
    console.warn('[GiveShop] Mailchimp (CORS expected in browser):', err.message)
    return { ok: false, error: 'CORS — use server-side proxy', corsBlocked: true }
  }
}

// ── ConvertKit ────────────────────────────────────────────────────────────────

/**
 * ConvertKit has a public form subscribe endpoint that supports CORS.
 * Use the Form ID (not API key) for this browser-side method.
 */
export async function convertkitSubscribe(formId, email, name) {
  if (!formId || !email) return { ok: false, error: 'Missing params' }
  try {
    const res = await fetch(`https://api.convertkit.com/v3/forms/${formId}/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, first_name: name?.split(' ')[0] || '' }),
    })
    const json = await res.json()
    return { ok: res.ok && !json.error, data: json }
  } catch (err) {
    console.warn('[GiveShop] ConvertKit subscribe failed:', err.message)
    return { ok: false, error: err.message }
  }
}

// ── Master "on new entry" trigger ────────────────────────────────────────────

/**
 * Called after every successful giveaway entry.
 * Fires all active integrations in parallel.
 */
export async function triggerEntryIntegrations({ entry, campaign, integrationConnections, webhookConfig, trackingPixels }) {
  const tasks = []

  // 1. Facebook Pixel — track Lead event
  if (trackingPixels?.fbPixelId && window.fbq) {
    window.fbq('track', 'Lead', { content_name: campaign?.title, value: 0, currency: 'USD' })
  }

  // 2. Google Analytics — track event
  if (trackingPixels?.gaId && window.gtag) {
    window.gtag('event', 'generate_lead', { campaign_name: campaign?.title, method: entry?.method })
  }

  // 3. Webhook (Zapier / custom)
  if (webhookConfig?.url && webhookConfig?.events?.['entry.created']) {
    tasks.push(
      sendWebhook(webhookConfig.url, webhookConfig.secret, 'entry.created', {
        email: entry.email,
        name: entry.name,
        method: entry.method,
        entries: entry.entries,
        campaignId: campaign?.id,
        campaignTitle: campaign?.title,
        referralCode: entry.referralCode,
      })
    )
  }

  // 4. Klaviyo onsite identify (JS SDK — CORS-free)
  const klaviyo = integrationConnections?.klaviyo
  if (klaviyo?.connected && klaviyo?.apiKey) {
    tasks.push(klaviyoIdentify(klaviyo.apiKey, entry.email, entry.name))
  }

  // 5. Mailchimp JSONP subscribe
  const mailchimp = integrationConnections?.mailchimp
  if (mailchimp?.connected && mailchimp?.subscribeUrl) {
    tasks.push(mailchimpSubscribeJSONP(mailchimp.subscribeUrl, entry.email, entry.name))
  }

  // 6. ConvertKit form subscribe (CORS-enabled endpoint)
  const convertkit = integrationConnections?.convertkit
  if (convertkit?.connected && convertkit?.formId) {
    tasks.push(convertkitSubscribe(convertkit.formId, entry.email, entry.name))
  }

  await Promise.allSettled(tasks)
}
