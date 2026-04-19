import React, { useState } from 'react'
import '../styles/AddCategoryForm.css'

const PRESET_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280']

interface Props {
  onAdd: (name: string, color: string) => void
}

export function AddCategoryForm({ onAdd }: Props) {
  const [input, setInput] = useState('')
  const [color, setColor] = useState(PRESET_COLORS[4])

  const submit = () => {
    const trimmed = input.trim()
    if (!trimmed) return
    onAdd(trimmed, color)
    setInput('')
  }

  return (
    <div className="add-category-form">
      <div className="add-category-form__colors">
        {PRESET_COLORS.map(c => (
          <button
            key={c}
            className={`color-swatch${color === c ? ' color-swatch--active' : ''}`}
            style={{ background: c }}
            onClick={() => setColor(c)}
            aria-label={c}
          />
        ))}
      </div>
      <div className="add-category-form__row">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="Nouvelle catégorie…"
        />
        <button onClick={submit}>+</button>
      </div>
    </div>
  )
}
