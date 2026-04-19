import React, { useState } from 'react'

interface Props {
  onAdd: (text: string) => void
}

export function TodoForm({ onAdd }: Props) {
  const [input, setInput] = useState('')

  const submit = () => {
    const trimmed = input.trim()
    if (!trimmed) return
    onAdd(trimmed)
    setInput('')
  }

  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && submit()}
        placeholder="Nouvelle tâche…"
        style={{ flex: 1, padding: '8px 12px', fontSize: 16 }}
      />
      <button onClick={submit} style={{ padding: '8px 16px', fontSize: 16 }}>
        Ajouter
      </button>
    </div>
  )
}
