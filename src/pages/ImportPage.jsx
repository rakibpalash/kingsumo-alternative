import { useState, useRef } from 'react'
import { Upload, ChevronRight, Check, AlertTriangle, RefreshCw, FileText, X } from 'lucide-react'

/* ─── Competitor presets ─────────────────────────────────────── */
const COMPETITORS = [
  {
    id: 'viralsweep',
    name: 'ViralSweep',
    color: '#4f46e5',
    letter: 'V',
    description: 'Import participants exported from ViralSweep giveaways.',
    mapping: {
      email:        'email',
      name:         'first_name',
      entries:      'entries',
      date:         'date_entered',
      referral:     'referral_code',
    },
    sampleColumns: ['email', 'first_name', 'last_name', 'entries', 'date_entered', 'referral_code'],
  },
  {
    id: 'yotpo',
    name: 'Yotpo',
    color: '#0ea5e9',
    letter: 'Y',
    description: 'Import loyalty & giveaway participants from Yotpo exports.',
    mapping: {
      email:    'email',
      name:     'name',
      entries:  'points',
      date:     'created_at',
      referral: '',
    },
    sampleColumns: ['email', 'name', 'phone', 'created_at', 'points'],
  },
  {
    id: 'giveawayninja',
    name: 'Giveaway Ninja',
    color: '#ef4444',
    letter: 'G',
    description: 'Import contestants directly from a Giveaway Ninja CSV export.',
    mapping: {
      email:    'email',
      name:     'name',
      entries:  'entries',
      date:     'created_at',
      referral: '',
    },
    sampleColumns: ['email', 'name', 'entries', 'created_at', 'country'],
  },
  {
    id: 'generic',
    name: 'Generic CSV',
    color: '#6b7280',
    letter: '#',
    description: 'Upload any CSV and map the columns manually.',
    mapping: { email: '', name: '', entries: '', date: '', referral: '' },
    sampleColumns: [],
  },
]

const OUR_FIELDS = [
  { key: 'email',    label: 'Email',         required: true },
  { key: 'name',     label: 'Name',          required: false },
  { key: 'entries',  label: 'Entries / Points', required: false },
  { key: 'date',     label: 'Join Date',     required: false },
  { key: 'referral', label: 'Referral Code', required: false },
]

/* ─── Parse CSV string → { headers, rows } ──────────────────── */
function parseCSV(text) {
  const lines = text.trim().split('\n').filter(Boolean)
  if (lines.length < 2) return { headers: [], rows: [] }
  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''))
  const rows = lines.slice(1).map((line) =>
    line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''))
  )
  return { headers, rows }
}

const stepCls = (active, done) =>
  `w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
    done  ? 'bg-brand-green text-dark-900' :
    active ? 'bg-brand-green/20 border-2 border-brand-green text-brand-green' :
    'bg-dark-700 text-dark-500'
  }`

const inputCls = 'w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-green transition-colors'

export default function ImportPage() {
  const [step, setStep]           = useState(0) // 0=pick, 1=upload, 2=map, 3=preview, 4=done
  const [competitor, setCompetitor] = useState(null)
  const [csvData, setCsvData]     = useState(null)   // { headers, rows }
  const [mapping, setMapping]     = useState({})     // our field → csv column
  const [importing, setImporting] = useState(false)
  const [importedCount, setImportedCount] = useState(0)
  const [dragOver, setDragOver]   = useState(false)
  const fileRef = useRef()

  /* ── Step 0: pick competitor ── */
  const pickCompetitor = (c) => {
    setCompetitor(c)
    setMapping(c.mapping)
    setCsvData(null)
    setStep(1)
  }

  /* ── Step 1: upload CSV ── */
  const handleFile = (file) => {
    if (!file || !file.name.endsWith('.csv')) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const parsed = parseCSV(e.target.result)
      if (!parsed.headers.length) return
      setCsvData(parsed)
      // Auto-map: if column name matches our preset, keep; else find closest in file headers
      const autoMap = {}
      OUR_FIELDS.forEach(({ key }) => {
        const preset = competitor.mapping[key]
        if (preset && parsed.headers.includes(preset)) {
          autoMap[key] = preset
        } else {
          // fuzzy: find header containing our field key
          const found = parsed.headers.find((h) => h.toLowerCase().includes(key))
          autoMap[key] = found || ''
        }
      })
      setMapping(autoMap)
      setStep(2)
    }
    reader.readAsText(file)
  }

  const onDrop = (e) => {
    e.preventDefault(); setDragOver(false)
    handleFile(e.dataTransfer.files[0])
  }

  /* ── Step 3: import ── */
  const handleImport = () => {
    setImporting(true)
    setTimeout(() => {
      setImportedCount(csvData.rows.length)
      setImporting(false)
      setStep(4)
    }, 1200)
  }

  const reset = () => {
    setStep(0); setCompetitor(null); setCsvData(null)
    setMapping({}); setImportedCount(0)
  }

  const STEPS = ['Select Source', 'Upload CSV', 'Map Columns', 'Review & Import']

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <div>
        <h1 className="text-lg font-bold text-white flex items-center gap-2">
          <Upload size={18} className="text-brand-green" /> Import Participants
        </h1>
        <p className="text-xs text-dark-400 mt-0.5">Migrate from ViralSweep, Yotpo, Giveaway Ninja, or any CSV.</p>
      </div>

      {/* Progress stepper */}
      {step < 4 && (
        <div className="flex items-center gap-2">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className={stepCls(step === i, step > i)}>
                  {step > i ? <Check size={12} /> : i + 1}
                </div>
                <span className={`text-xs hidden sm:block ${step === i ? 'text-white font-semibold' : step > i ? 'text-brand-green' : 'text-dark-500'}`}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-px w-6 sm:w-10 ${step > i ? 'bg-brand-green' : 'bg-dark-600'}`} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Step 0: Pick competitor ── */}
      {step === 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {COMPETITORS.map((c) => (
            <button
              key={c.id}
              onClick={() => pickCompetitor(c)}
              className="text-left bg-dark-800 border border-dark-500 hover:border-dark-400 rounded-xl p-5 transition-all group"
            >
              <div className="flex items-center gap-3 mb-2">
                <span
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black text-white shrink-0"
                  style={{ background: c.color }}
                >
                  {c.letter}
                </span>
                <span className="text-sm font-semibold text-white group-hover:text-brand-green transition-colors">{c.name}</span>
                <ChevronRight size={14} className="text-dark-500 ml-auto group-hover:text-brand-green transition-colors" />
              </div>
              <p className="text-xs text-dark-400 leading-relaxed">{c.description}</p>
            </button>
          ))}
        </div>
      )}

      {/* ── Step 1: Upload CSV ── */}
      {step === 1 && (
        <div className="bg-dark-800 border border-dark-500 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black text-white shrink-0"
              style={{ background: competitor.color }}>{competitor.letter}</span>
            <h2 className="text-sm font-semibold text-white">{competitor.name} — Upload Export File</h2>
          </div>

          {competitor.sampleColumns.length > 0 && (
            <div className="bg-dark-700 rounded-lg px-4 py-3">
              <p className="text-xs text-dark-400 mb-1.5">Expected CSV columns:</p>
              <div className="flex flex-wrap gap-1.5">
                {competitor.sampleColumns.map((col) => (
                  <span key={col} className="text-[10px] font-mono bg-dark-600 text-dark-300 px-2 py-0.5 rounded">{col}</span>
                ))}
              </div>
            </div>
          )}

          {/* Drag & drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-xl py-10 flex flex-col items-center gap-3 cursor-pointer transition-colors ${
              dragOver ? 'border-brand-green bg-brand-green/5' : 'border-dark-500 hover:border-dark-400'
            }`}
          >
            <FileText size={32} className={dragOver ? 'text-brand-green' : 'text-dark-500'} />
            <p className="text-sm text-dark-400">Drag & drop your CSV here, or <span className="text-brand-green underline">browse</span></p>
            <p className="text-xs text-dark-500">.csv files only</p>
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
          </div>

          <button onClick={() => setStep(0)} className="text-xs text-dark-500 hover:text-dark-400 transition-colors">
            ← Back
          </button>
        </div>
      )}

      {/* ── Step 2: Map columns ── */}
      {step === 2 && csvData && (
        <div className="bg-dark-800 border border-dark-500 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-white">Map CSV Columns</h2>
          <p className="text-xs text-dark-400">Match your CSV columns to GiveShop fields. Required: Email.</p>

          <div className="space-y-3">
            {OUR_FIELDS.map(({ key, label, required }) => (
              <div key={key} className="flex items-center gap-3">
                <div className="w-36 shrink-0">
                  <span className="text-xs font-semibold text-white">{label}</span>
                  {required && <span className="text-red-500 ml-0.5 text-xs">*</span>}
                </div>
                <select
                  value={mapping[key] || ''}
                  onChange={(e) => setMapping((m) => ({ ...m, [key]: e.target.value }))}
                  className={inputCls + ' flex-1'}
                >
                  <option value="">— skip —</option>
                  {csvData.headers.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
                {mapping[key]
                  ? <Check size={14} className="text-brand-green shrink-0" />
                  : <div className="w-3.5 shrink-0" />}
              </div>
            ))}
          </div>

          {!mapping.email && (
            <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-900/20 border border-amber-800/40 rounded-lg px-3 py-2">
              <AlertTriangle size={13} /> Email column must be mapped before continuing.
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={() => setStep(1)} className="text-xs text-dark-500 hover:text-dark-400 transition-colors">← Back</button>
            <button
              onClick={() => setStep(3)}
              disabled={!mapping.email}
              className="flex items-center gap-1.5 px-4 py-2 bg-brand-green text-dark-900 font-semibold text-sm rounded-lg hover:bg-brand-green/80 transition-colors disabled:opacity-40 ml-auto"
            >
              Preview Import <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: Preview + confirm ── */}
      {step === 3 && csvData && (
        <div className="bg-dark-800 border border-dark-500 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Review Import</h2>
            <span className="text-xs text-dark-400">{csvData.rows.length} participant{csvData.rows.length !== 1 ? 's' : ''} found</span>
          </div>

          {/* Preview table */}
          <div className="overflow-x-auto rounded-xl border border-dark-600">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-dark-600 bg-dark-700">
                  {OUR_FIELDS.filter((f) => mapping[f.key]).map(({ key, label }) => (
                    <th key={key} className="text-left px-3 py-2.5 text-dark-400 font-semibold whitespace-nowrap">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {csvData.rows.slice(0, 8).map((row, ri) => (
                  <tr key={ri} className="border-b border-dark-700/50 hover:bg-dark-700/30">
                    {OUR_FIELDS.filter((f) => mapping[f.key]).map(({ key }) => {
                      const colIdx = csvData.headers.indexOf(mapping[key])
                      return (
                        <td key={key} className="px-3 py-2.5 text-dark-300 font-mono truncate max-w-[160px]">
                          {colIdx >= 0 ? row[colIdx] || '—' : '—'}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {csvData.rows.length > 8 && (
            <p className="text-xs text-dark-500 text-center">Showing 8 of {csvData.rows.length} rows</p>
          )}

          <div className="flex gap-2 items-center">
            <button onClick={() => setStep(2)} className="text-xs text-dark-500 hover:text-dark-400 transition-colors">← Back</button>
            <button
              onClick={handleImport}
              disabled={importing}
              className="flex items-center gap-2 px-5 py-2 bg-brand-green text-dark-900 font-semibold text-sm rounded-lg hover:bg-brand-green/80 transition-colors disabled:opacity-60 ml-auto"
            >
              {importing
                ? <><RefreshCw size={13} className="animate-spin" /> Importing…</>
                : <><Upload size={13} /> Import {csvData.rows.length} Participants</>}
            </button>
          </div>
        </div>
      )}

      {/* ── Step 4: Success ── */}
      {step === 4 && (
        <div className="bg-dark-800 border border-dark-500 rounded-xl p-10 flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-brand-green/10 border-2 border-brand-green flex items-center justify-center">
            <Check size={28} className="text-brand-green" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Import Complete!</h2>
            <p className="text-sm text-dark-400 mt-1">
              <span className="text-brand-green font-semibold">{importedCount} participants</span> imported from {competitor.name} successfully.
            </p>
          </div>
          <div className="flex gap-3 mt-2">
            <button
              onClick={reset}
              className="px-5 py-2 border border-dark-500 text-dark-400 hover:text-white rounded-lg text-sm transition-colors"
            >
              Import Another
            </button>
            <a
              href="/participants"
              className="flex items-center gap-1.5 px-5 py-2 bg-brand-green text-dark-900 font-semibold rounded-lg text-sm hover:bg-brand-green/80 transition-colors"
            >
              View Participants <ChevronRight size={13} />
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
