import React from 'react'
import { Todo } from '../types/todo.types'

interface Props {
  todo: Todo
  onToggle: (id: number) => void
  onRemove: (id: number) => void
}

export function TodoItem({ todo, onToggle, onRemove }: Props) {
  return (
    <li style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
      <input type="checkbox" checked={todo.done} onChange={() => onToggle(todo.id)} />
      <span style={{ flex: 1, textDecoration: todo.done ? 'line-through' : 'none', color: todo.done ? '#999' : 'inherit' }}>
        {todo.text}
      </span>
      <button onClick={() => onRemove(todo.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c00' }}>
        ✕
      </button>
    </li>
  )
}
