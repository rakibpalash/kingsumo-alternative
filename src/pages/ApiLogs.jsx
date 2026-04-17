import { FileText } from 'lucide-react'

const TYPE_LABELS = {
  api:           { title: 'API LOGS',           empty: 'There are no API logs at the moment.' },
  orders:        { title: 'ORDER LOGS',         empty: 'There are no order logs at the moment.' },
  notifications: { title: 'NOTIFICATION LOGS',  empty: 'There are no notification logs at the moment.' },
}

export default function ApiLogs({ type = 'api' }) {
  const { title, empty } = TYPE_LABELS[type] || TYPE_LABELS.api

  return (
    <div className="flex flex-col h-full">
      {/* Page header strip */}
      <div className="flex items-center gap-2 px-6 py-4 border-b border-dark-600">
        <FileText size={16} className="text-dark-400" />
        <span className="text-sm font-semibold text-white tracking-wide">{title}</span>
      </div>

      {/* Empty state — centered in remaining space */}
      <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center px-6">
        <p className="text-lg font-semibold text-gray-500">No logs yet :)</p>
        <p className="text-sm text-gray-400">Hey! {empty}</p>
      </div>
    </div>
  )
}
