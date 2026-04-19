import React from 'react'
import { TodoItem } from './TodoItem'
import { Todo } from '../types/todo.types'

interface Props {
  todos: Todo[]
  onToggle: (id: number) => void
  onRemove: (id: number) => void
}

export function TodoList({ todos, onToggle, onRemove }: Props) {
  if (todos.length === 0) {
    return <p style={{ color: '#aaa' }}>Aucune tâche pour l'instant.</p>
  }

  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {todos.map(todo => (
        <TodoItem key={todo.id} todo={todo} onToggle={onToggle} onRemove={onRemove} />
      ))}
    </ul>
  )
}
