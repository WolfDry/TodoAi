import React, { useEffect, useRef, useState } from 'react'

interface Props {
  onAdd: (text: string) => void
  placeholder?: string
  buttonLabel?: string
  className?: string
}

export function AddForm({ onAdd, placeholder = 'Ajouter…', buttonLabel = '+ Ajouter', className }: Props) {
  const [active, setActive] = useState(false)
  const [val, setVal] = useState('')
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => { if (active) ref.current?.focus() }, [active])

  function submit() {
    const t = val.trim()
    if (t) onAdd(t)
    setVal('')
    setActive(false)
  }

  if (active) {
    return (
      <div className={className} style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
        <input
          ref={ref}
          value={val}
          onChange={e => setVal(e.target.value)}
          onBlur={submit}
          onKeyDown={e => {
            if (e.key === 'Enter') submit()
            if (e.key === 'Escape') { setVal(''); setActive(false) }
          }}
          placeholder={placeholder}
          style={{
            flex: 1, background: 'none', border: 'none',
            borderBottom: '1px solid var(--accent)', outline: 'none',
            fontFamily: 'DM Mono, monospace', fontSize: 12,
            color: 'var(--ink)', padding: '2px 0',
          }}
        />
      </div>
    )
  }

  return (
    <button
      className={className}
      onClick={() => setActive(true)}
      style={{
        width: '100%', background: 'none', border: 'none',
        padding: '4px 0', textAlign: 'left',
        color: 'var(--ink-muted)', fontFamily: 'DM Mono, monospace',
        fontSize: 12, cursor: 'pointer', letterSpacing: '0.03em',
        transition: 'color 0.15s',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--ink-muted)' }}
    >
      {buttonLabel}
    </button>
  )
}
