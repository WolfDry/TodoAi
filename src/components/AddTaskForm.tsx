import React, { useState } from 'react'
import { Priority } from '../types/todo.types'
import '../styles/AddTaskForm.css'

interface Props {
  onAdd: (text: string, priority: Priority) => void
  placeholder?: string
  className?: string
}

export function AddTaskForm({ onAdd, placeholder = 'Ajouter…', className }: Props) {
  const [input, setInput] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')

  const submit = () => {
    const trimmed = input.trim()
    if (!trimmed) return
    onAdd(trimmed, priority)
    setInput('')
  }

  return (
    <div className={`add-task-form${className ? ' ' + className : ''}`}>
      <select
        value={priority}
        onChange={e => setPriority(e.target.value as Priority)}
        className="add-task-form__priority"
      >
        <option value="low">Basse</option>
        <option value="medium">Moyenne</option>
        <option value="high">Haute</option>
      </select>
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && submit()}
        placeholder={placeholder}
      />
      <button onClick={submit}>+</button>
    </div>
  )
}
