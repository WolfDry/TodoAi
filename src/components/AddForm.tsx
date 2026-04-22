import React, { useEffect, useRef, useState } from 'react'
import { Priority } from '../types/todo.types'
import '../styles/AddForm.css'

interface Props {
  onAdd: (text: string, priority?: Priority, duration?: number | null) => void
  withPriority?: boolean
  withDuration?: boolean
  placeholder?: string
  buttonLabel?: string
  className?: string
}

function parseDuration(raw: string): number | null {
  const s = raw.trim().toLowerCase()
  if (!s) return null
  const hm = s.match(/^(\d+)h(\d+)?$/)
  if (hm) return parseInt(hm[1]) * 60 + (hm[2] ? parseInt(hm[2]) : 0)
  const h = s.match(/^(\d+)\s*h$/)
  if (h) return parseInt(h[1]) * 60
  const m = s.match(/^(\d+)\s*(min)?$/)
  if (m) return parseInt(m[1])
  return null
}

export function AddForm({ onAdd, withPriority = false, withDuration = false, placeholder = 'Ajouter…', buttonLabel = '+ Ajouter', className }: Props) {
  const [active, setActive] = useState(false)
  const [val, setVal] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [durationRaw, setDurationRaw] = useState('')
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => { if (active) ref.current?.focus() }, [active])

  function submit() {
    const t = val.trim()
    if (t) {
      const duration = withDuration ? parseDuration(durationRaw) : undefined
      onAdd(t, withPriority ? priority : undefined, duration)
    }
    setVal('')
    setDurationRaw('')
    setActive(false)
  }

  if (active) {
    return (
      <div
        className={`add-form-active${className ? ` ${className}` : ''}`}
        onBlur={e => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) submit()
        }}
      >
        {withPriority && (
          <select
            value={priority}
            onChange={e => { setPriority(e.target.value as Priority); ref.current?.focus() }}
            className="add-form__select"
          >
            <option value="low">Basse</option>
            <option value="medium">Moyenne</option>
            <option value="high">Haute</option>
          </select>
        )}
        <input
          ref={ref}
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') submit()
            if (e.key === 'Escape') { setVal(''); setDurationRaw(''); setActive(false) }
          }}
          placeholder={placeholder}
          className="add-form__input"
        />
        {withDuration && (
          <input
            value={durationRaw}
            onChange={e => setDurationRaw(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') submit()
              if (e.key === 'Escape') { setVal(''); setDurationRaw(''); setActive(false) }
            }}
            placeholder="2h, 30min…"
            className="add-form__duration"
          />
        )}
      </div>
    )
  }

  return (
    <button
      className={`add-form__btn${className ? ` ${className}` : ''}`}
      onClick={() => setActive(true)}
    >
      {buttonLabel}
    </button>
  )
}
