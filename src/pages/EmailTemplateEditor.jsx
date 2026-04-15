import { useState } from 'react'
import { useStore } from '../store/useStore'
import { Mail, Eye, Save, Check, Send } from 'lucide-react'

const TEMPLATES = [
  {
    id: 'winner',
    name: 'Winner Notification',
    subject: "🎉 Congratulations! You've won {{prize}}!",
    body: `Hi {{name}},\n\nAmazing news — you've been selected as the winner of our {{campaign}} giveaway!\n\n🏆 Prize: {{prize}}\n\nTo claim your prize, please reply to this email within 48 hours with your shipping address.\n\nProof of fair draw: {{proof_url}}\n\nThank you for participating!\n\n{{sender_name}}\n{{store_name}}`,
  },
  {
    id: 'confirmation',
    name: 'Entry Confirmation',
    subject: "✅ You're entered! {{campaign}}",
    body: `Hi {{name}},\n\nYou're officially entered in our {{campaign}} giveaway!\n\n🎁 Prize: {{prize}}\n📅 Draw Date: {{end_date}}\n🔗 Your referral link: {{referral_link}}\n\nShare your referral link to earn bonus entries — each friend who enters earns you +{{bonus_entries}} extra entries!\n\nGood luck!\n\n{{sender_name}}`,
  },
  {
    id: 'reminder',
    name: 'Ending Soon Reminder',
    subject: "⏰ Last chance! {{campaign}} ends in 24 hours",
    body: `Hi {{name}},\n\nJust a reminder — the {{campaign}} giveaway closes in 24 hours!\n\n🎁 Prize: {{prize}}\n⏰ Ends: {{end_date}}\n\nYou currently have {{entry_count}} entries. Share your link to get more:\n{{referral_link}}\n\nDon't miss out!\n\n{{sender_name}}`,
  },
  {
    id: 'custom',
    name: 'Custom Template',
    subject: '',
    body: '',
  },
]

const VARIABLES = ['{{name}}','{{email}}','{{campaign}}','{{prize}}','{{end_date}}','{{referral_link}}','{{proof_url}}','{{sender_name}}','{{store_name}}','{{bonus_entries}}','{{entry_count}}']

export default function EmailTemplateEditor() {
  const { activeCampaign, saveEmailTemplate, savedTemplates } = useStore()
  const [activeTemplate, setActiveTemplate] = useState(TEMPLATES[0])
  const [subject, setSubject] = useState(savedTemplates?.[TEMPLATES[0].id]?.subject || TEMPLATES[0].subject)
  const [body, setBody]     = useState(savedTemplates?.[TEMPLATES[0].id]?.body || TEMPLATES[0].body)
  const [preview, setPreview] = useState(false)
  const [saved, setSaved]     = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [sent, setSent]     = useState(false)
  const [testError, setTestError] = useState('')

  const loadTemplate = (tpl) => {
    setActiveTemplate(tpl)
    // Load saved version if available, else defaults
    setSubject(savedTemplates?.[tpl.id]?.subject ?? tpl.subject)
    setBody(savedTemplates?.[tpl.id]?.body ?? tpl.body)
    setPreview(false)
  }

  const save = () => {
    saveEmailTemplate(activeTemplate.id, { subject, body })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const sendTest = () => {
    if (!testEmail.includes('@')) { setTestError('Enter a valid email'); return }
    setTestError('')
    setSent(true)
    setTimeout(() => setSent(false), 3000)
  }

  const insertVar = (v) => setBody((b) => b + v)

  // Resolve preview text
  const resolve = (text) => text
    .replace(/\{\{name\}\}/g, 'Alex Johnson')
    .replace(/\{\{email\}\}/g, 'alex@gmail.com')
    .replace(/\{\{campaign\}\}/g, activeCampaign?.title || 'Summer Sale Giveaway')
    .replace(/\{\{prize\}\}/g, activeCampaign?.prize || 'AirPods Pro')
    .replace(/\{\{end_date\}\}/g, activeCampaign?.endDate || '2024-02-15')
    .replace(/\{\{referral_link\}\}/g, 'https://give.shop/c/summer-sale?ref=alexjAB3C')
    .replace(/\{\{proof_url\}\}/g, 'https://giveshop.app/proof/12345')
    .replace(/\{\{sender_name\}\}/g, 'The Team')
    .replace(/\{\{store_name\}\}/g, 'My Store')
    .replace(/\{\{bonus_entries\}\}/g, '2')
    .replace(/\{\{entry_count\}\}/g, '3')

  return (
    <div className="max-w-4xl space-y-5">
      <div>
        <h1 className="text-lg font-bold text-white flex items-center gap-2"><Mail size={18} className="text-brand-green" /> Email Template Editor</h1>
        <p className="text-xs text-dark-400 mt-0.5">Customize automated emails sent to your contestants</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        {/* Template Picker */}
        <div className="sm:col-span-1 space-y-2">
          <p className="text-xs font-semibold text-dark-400 uppercase tracking-wider">Templates</p>
          {TEMPLATES.map((tpl) => (
            <button key={tpl.id} onClick={() => loadTemplate(tpl)}
              className={`w-full text-left px-3 py-2.5 rounded-xl border text-sm transition-all ${activeTemplate.id === tpl.id ? 'border-brand-green/50 bg-brand-green/10 text-white' : 'border-dark-600 text-dark-400 hover:text-white hover:border-dark-400'}`}>
              <span className="flex items-center justify-between">
                {tpl.name}
                {savedTemplates?.[tpl.id] && <Check size={11} className="text-brand-green shrink-0" />}
              </span>
            </button>
          ))}

          {/* Variable reference */}
          <div className="mt-4">
            <p className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-2">Variables</p>
            <div className="space-y-1">
              {VARIABLES.map((v) => (
                <button key={v} onClick={() => insertVar(v)}
                  className="w-full text-left px-2 py-1 rounded-lg text-[10px] font-mono text-brand-green/70 hover:text-brand-green hover:bg-dark-700 transition-colors">
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="sm:col-span-3 space-y-4">
          {/* Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => setPreview(false)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${!preview ? 'bg-brand-green text-dark-900' : 'text-dark-400 hover:text-white border border-dark-500'}`}>
              <Bold size={12} /> Edit
            </button>
            <button onClick={() => setPreview(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${preview ? 'bg-brand-green text-dark-900' : 'text-dark-400 hover:text-white border border-dark-500'}`}>
              <Eye size={12} /> Preview
            </button>
            <div className="flex-1" />
            <button onClick={save}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-dark-700 border border-dark-500 text-dark-400 hover:text-white rounded-lg text-xs transition-colors">
              {saved ? <><Check size={12} className="text-brand-green" />Saved</> : <><Save size={12} />Save</>}
            </button>
          </div>

          {!preview ? (
            <div className="bg-dark-800 border border-dark-500 rounded-xl overflow-hidden">
              {/* Subject */}
              <div className="border-b border-dark-500 p-4">
                <label className="block text-xs text-dark-400 mb-1.5">Subject Line</label>
                <input value={subject} onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-transparent text-sm text-white placeholder-dark-400 focus:outline-none" placeholder="Email subject..." />
              </div>
              {/* Body */}
              <div className="p-4">
                <label className="block text-xs text-dark-400 mb-1.5">Email Body</label>
                <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={16}
                  className="w-full bg-transparent text-sm text-white placeholder-dark-400 focus:outline-none resize-none font-mono leading-relaxed" />
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl overflow-hidden border border-dark-500">
              {/* Email chrome */}
              <div className="bg-gray-100 px-5 py-3 border-b border-gray-200">
                <p className="text-xs text-gray-500 font-medium">Subject: <span className="text-gray-800">{resolve(subject)}</span></p>
                <p className="text-xs text-gray-400 mt-0.5">To: alex@gmail.com · From: noreply@mystore.com</p>
              </div>
              {/* Email body */}
              <div className="p-6">
                <div className="max-w-lg mx-auto">
                  {activeCampaign && (
                    <div className="bg-brand-green rounded-xl p-4 mb-5 text-center">
                      <p className="text-white font-bold text-lg">{activeCampaign.title}</p>
                      <p className="text-white/80 text-sm">{activeCampaign.prize}</p>
                    </div>
                  )}
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">{resolve(body)}</pre>
                  <div className="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-400 text-center">
                    You are receiving this email because you entered a giveaway.<br />
                    <span className="underline cursor-pointer">Unsubscribe</span> · Powered by GiveShop
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Send test */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <input value={testEmail} onChange={(e) => { setTestEmail(e.target.value); setTestError('') }}
                onKeyDown={(e) => e.key === 'Enter' && sendTest()}
                placeholder="Send test to email address..."
                className={`flex-1 bg-dark-700 border rounded-lg px-3 py-2 text-sm text-white placeholder-dark-400 focus:outline-none transition-colors ${testError ? 'border-red-500' : 'border-dark-500 focus:border-brand-green'}`} />
              <button onClick={sendTest}
                className="flex items-center gap-2 px-4 py-2 bg-brand-green text-dark-900 font-semibold text-sm rounded-lg hover:bg-brand-green/80 transition-colors shrink-0">
                {sent ? <><Check size={14} />Sent!</> : <><Send size={14} />Send Test</>}
              </button>
            </div>
            {testError && <p className="text-xs text-red-400">{testError}</p>}
            {sent && <p className="text-xs text-brand-green">Test email queued for {testEmail} — check your inbox shortly.</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
