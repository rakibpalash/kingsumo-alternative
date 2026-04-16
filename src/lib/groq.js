import Groq from 'groq-sdk'

const MODEL = 'llama-3.3-70b-versatile'

function getGroq() {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY
  if (!apiKey) throw new Error('VITE_GROQ_API_KEY not configured')
  return new Groq({ apiKey, dangerouslyAllowBrowser: true })
}

export async function generateTitle({ prizeName, prizeValue, runnerName }, onChunk) {
  const prompt = `Generate a short, catchy giveaway title for this contest:
- Prize: ${prizeName || 'an amazing prize'}${prizeValue ? ` (worth $${prizeValue})` : ''}
- Hosted by: ${runnerName || 'us'}

Output ONLY the title — one line, no quotes, no labels, max 10 words.`

  const stream = await getGroq().chat.completions.create({
    model: MODEL,
    max_tokens: 30,
    stream: true,
    messages: [{ role: 'user', content: prompt }],
  })

  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content
    if (text) onChunk(text)
  }
}

export async function generateDescription({ title, prizeName, prizeValue, runnerName, startsAt, endsAt }, onChunk) {
  const prompt = `Write an engaging giveaway description for this contest:
- Title: ${title || 'Giveaway'}
- Prize: ${prizeName || 'an amazing prize'}${prizeValue ? ` (worth $${prizeValue})` : ''}
- Hosted by: ${runnerName || 'us'}
- Starts: ${startsAt ? new Date(startsAt).toLocaleDateString() : 'soon'}
- Ends: ${endsAt ? new Date(endsAt).toLocaleDateString() : 'soon'}

Write 2-3 short exciting paragraphs. Be persuasive and highlight the prize. Max 180 words. Output only the description text, no headings or labels.`

  const stream = await getGroq().chat.completions.create({
    model: MODEL,
    max_tokens: 400,
    stream: true,
    messages: [{ role: 'user', content: prompt }],
  })

  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content
    if (text) onChunk(text)
  }
}

export async function generateRules({ prizeName, runnerName, runnerUrl, endsAt, minimumAge, ageVerification, geoEnabled, allowedCountries }, onChunk) {
  const geo = geoEnabled && allowedCountries.length > 0
    ? `Open only to residents of: ${allowedCountries.join(', ')}`
    : 'Open internationally'

  const prompt = `Write formal numbered giveaway rules:
- Prize: ${prizeName || 'as described'}
- Organizer: ${runnerName || 'The organizer'}${runnerUrl ? ` (${runnerUrl})` : ''}
- End date: ${endsAt ? new Date(endsAt).toLocaleDateString() : 'as specified'}
- Age requirement: Must be ${ageVerification ? minimumAge : 18}+ years old
- Geographic eligibility: ${geo}

Write exactly 6 numbered rules covering: eligibility, entry, winner selection, prize, disqualification, general terms. Output only the numbered rules, no extra text.`

  const stream = await getGroq().chat.completions.create({
    model: MODEL,
    max_tokens: 500,
    stream: true,
    messages: [{ role: 'user', content: prompt }],
  })

  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content
    if (text) onChunk(text)
  }
}
