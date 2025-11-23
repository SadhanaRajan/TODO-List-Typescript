import { type FC, type ReactNode, useEffect } from 'react'

type ModalProps = {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

const Modal: FC<ModalProps> = ({ open, onClose, title, children }) => {
  useEffect(() => {
    if (!open) return undefined

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKey)
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = originalOverflow
    }
  }, [open, onClose])

  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-slate-950/70 backdrop-blur"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-2xl rounded-3xl border border-white/20 bg-gradient-to-br from-white via-white to-slate-50 p-6 shadow-2xl shadow-emerald-400/10"
      >
        <div className="flex items-center justify-between gap-4 border-b border-slate-100/70 pb-4">
          {title ? (
            <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
          ) : null}
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-600 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow"
          >
            Close
          </button>
        </div>
        <div className="pt-4">{children}</div>
      </div>
    </div>
  )
}

export default Modal
