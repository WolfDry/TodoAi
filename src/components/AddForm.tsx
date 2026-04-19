import React, { useState } from 'react'
import '../styles/AddForm.css'

interface Props {
  onAdd: (text: string) => void
  placeholder?: string
  buttonLabel?: string
  className?: string
}

export function AddForm({ onAdd, placeholder = 'Ajouter…', buttonLabel = '+', className }: Props) {
  const [input, setInput] = useState('')

  const submit = () => {
    const trimmed = input.trim()
    if (!trimmed) return
    onAdd(trimmed)
    setInput('')
  }

  return (
    <div className={`add-form${className ? ' ' + className : ''}`}>
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && submit()}
        placeholder={placeholder}
      />
      <button onClick={submit}>{buttonLabel}</button>
    </div>
  )
}
