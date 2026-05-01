'use client'
import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, X } from 'lucide-react'

interface AlertProps {
  type: 'success' | 'error'
  message: string
  onClose?: () => void
}

export default function Alert({ type, message, onClose }: AlertProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => { setVisible(false); onClose?.() }, 5000)
    return () => clearTimeout(t)
  }, [onClose])

  if (!visible) return null

  const isSuccess = type === 'success'
  return (
    <div className={`flex items-center gap-2.5 px-4 py-3 rounded-lg text-sm font-medium mb-5 border
      ${isSuccess ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
      {isSuccess ? <CheckCircle size={16} /> : <XCircle size={16} />}
      <span className="flex-1">{message}</span>
      <button onClick={() => { setVisible(false); onClose?.() }} className="opacity-50 hover:opacity-100">
        <X size={14} />
      </button>
    </div>
  )
}
