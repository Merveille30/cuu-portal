import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  icon: LucideIcon
  value: string
  label: string
  color: 'blue' | 'green' | 'purple' | 'yellow' | 'red' | 'cyan'
}

const colorMap = {
  blue:   { bg: 'bg-blue-50',   text: 'text-blue-600' },
  green:  { bg: 'bg-emerald-50',text: 'text-emerald-600' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600' },
  yellow: { bg: 'bg-amber-50',  text: 'text-amber-600' },
  red:    { bg: 'bg-red-50',    text: 'text-red-600' },
  cyan:   { bg: 'bg-cyan-50',   text: 'text-cyan-600' },
}

export default function StatCard({ icon: Icon, value, label, color }: StatCardProps) {
  const c = colorMap[color]
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex items-center gap-4 hover:-translate-y-0.5 hover:shadow-md transition-all">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${c.bg} ${c.text}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-2xl font-extrabold text-gray-900 leading-none">{value}</p>
        <p className="text-xs text-gray-500 font-medium mt-1">{label}</p>
      </div>
    </div>
  )
}
