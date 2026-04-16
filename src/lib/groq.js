import Groq from 'groq-sdk'

const MODEL = 'llama-3.3-70b-versatile'

function getGroq() {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY
  if (!apiKey) return null
  return new Groq({ apiKey, dangerouslyAllowBrowser: true })
}

// ── Fallback template generators (no API key needed) ──────────────────────────

function fallbackTitle({ prizeName, prizeValue, runnerName }) {
  const prize = prizeName || 'Amazing Prize'
  const host = runnerName ? ` by ${runnerName}` : ''
  const val = prizeValue ? ` – Worth $${prizeValue}` : ''
  const templates = [
    `Win ${prize}${val} – Enter Now!`,
    `${prize} Giveaway${host} – Don't Miss Out!`,
    `Enter to Win: ${prize}${val}`,
    `Huge ${prize} Giveaway – One Lucky Winner!`,
    `🎁 ${prize} Giveaway${host}${val}`,
  ]
  return templates[Math.floor(Math.random() * templates.length)]
}

function fallbackDescription({ title, prizeName, prizeValue, runnerName, endsAt, numberOfWinners }) {
  const prize = prizeName || 'this amazing prize'
  const val = prizeValue ? ` valued at $${prizeValue}` : ''
  const end = endsAt ? new Date(endsAt).toLocaleDateString() : 'soon'
  const host = runnerName || 'we'
  const winners = numberOfWinners > 1 ? `${numberOfWinners} lucky winners` : 'one lucky winner'
  return `${host.charAt(0).toUpperCase() + host.slice(1)} ${host === 'we' ? 'are' : 'is'} giving away ${prize}${val}! This is your chance to win big — simply enter below for your shot at the prize.\n\nThe giveaway closes on ${end}, and ${host} will be selecting ${winners} at random from all valid entries. Complete all bonus actions to maximise your chances of winning!\n\nGood luck to everyone who enters. Share this giveaway with friends and family to spread the word!`
}

function fallbackRules({ prizeName, runnerName, endsAt, eligibility }) {
  const prize = prizeName || 'the prize'
  const org = runnerName || 'The organizer'
  const end = endsAt ? new Date(endsAt).toLocaleDateString() : '[End Date]'
  const geo = eligibility || 'all eligible countries'
  return `1. Open to residents of ${geo} aged 18 years or older.\n2. One entry per person. Duplicate entries will be disqualified.\n3. Winner will be selected randomly from all valid entries after ${end}.\n4. The prize (${prize}) is non-transferable and has no cash alternative.\n5. ${org} reserves the right to disqualify any entry that violates these rules.\n6. By entering, you agree to these official rules and the organizer's Terms & Conditions.`
}

// ── Exported generators ────────────────────────────────────────────────────────

export async function generateTitle(params, onChunk) {
  const groq = getGroq()
  if (!groq) {
    onChunk(fallbackTitle(params))
    return
  }

  const { prizeName, prizeValue, runnerName } = params
  const prompt = `Generate a short, catchy giveaway title for this contest:
- Prize: ${prizeName || 'an amazing prize'}${prizeValue ? ` (worth $${prizeValue})` : ''}
- Hosted by: ${runnerName || 'us'}

Output ONLY the title — one line, no quotes, no labels, max 10 words.`

  const stream = await groq.chat.completions.create({
    model: MODEL, max_tokens: 30, stream: true,
    messages: [{ role: 'user', content: prompt }],
  })
  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content
    if (text) onChunk(text)
  }
}

export async function generateDescription(params, onChunk) {
  const groq = getGroq()
  if (!groq) {
    onChunk(fallbackDescription(params))
    return
  }

  const { title, prizeName, prizeValue, runnerName, startsAt, endsAt } = params
  const prompt = `Write an engaging giveaway description for this contest:
- Title: ${title || 'Giveaway'}
- Prize: ${prizeName || 'an amazing prize'}${prizeValue ? ` (worth $${prizeValue})` : ''}
- Hosted by: ${runnerName || 'us'}
- Starts: ${startsAt ? new Date(startsAt).toLocaleDateString() : 'soon'}
- Ends: ${endsAt ? new Date(endsAt).toLocaleDateString() : 'soon'}

Write 2-3 short exciting paragraphs. Be persuasive and highlight the prize. Max 180 words. Output only the description text, no headings or labels.`

  const stream = await groq.chat.completions.create({
    model: MODEL, max_tokens: 400, stream: true,
    messages: [{ role: 'user', content: prompt }],
  })
  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content
    if (text) onChunk(text)
  }
}

export async function generateRules(params, onChunk) {
  const groq = getGroq()
  if (!groq) {
    onChunk(fallbackRules(params))
    return
  }

  const { prizeName, runnerName, runnerUrl, endsAt, minimumAge, ageVerification, geoEnabled, allowedCountries } = params
  const geo = geoEnabled && allowedCountries?.length > 0
    ? `Open only to residents of: ${allowedCountries.join(', ')}`
    : 'Open internationally'

  const prompt = `Write formal numbered giveaway rules:
- Prize: ${prizeName || 'as described'}
- Organizer: ${runnerName || 'The organizer'}${runnerUrl ? ` (${runnerUrl})` : ''}
- End date: ${endsAt ? new Date(endsAt).toLocaleDateString() : 'as specified'}
- Age requirement: Must be ${ageVerification ? minimumAge : 18}+ years old
- Geographic eligibility: ${geo}

Write exactly 6 numbered rules covering: eligibility, entry, winner selection, prize, disqualification, general terms. Output only the numbered rules, no extra text.`

  const stream = await groq.chat.completions.create({
    model: MODEL, max_tokens: 500, stream: true,
    messages: [{ role: 'user', content: prompt }],
  })
  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content
    if (text) onChunk(text)
  }
}
