import React, { useEffect, useRef, useState } from 'react'
import { Priority } from '../types/todo.types'
import '../styles/AddForm.css'

interface Props {
  onAdd: (text: string, priority?: Priority) => void
  withPriority?: boolean
  placeholder?: string
  buttonLabel?: string
  className?: string
}

export function AddForm({ onAdd, withPriority = false, placeholder = 'Ajouter…', buttonLabel = '+ Ajouter', className }: Props) {
  const [active, setActive] = useState(false)
  const [val, setVal] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => { if (active) ref.current?.focus() }, [active])

  function submit() {
    const t = val.trim()
    if (t) onAdd(t, withPriority ? priority : undefined)
    setVal('')
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
            if (e.key === 'Escape') { setVal(''); setActive(false) }
          }}
          placeholder={placeholder}
          className="add-form__input"
        />
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
