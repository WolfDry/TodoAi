import React, { useState } from 'react'
import { TodoForm } from './components/TodoForm'
import { TodoList } from './components/TodoList'
import { Todo } from './types/todo.types'

function App() {
  const [todos, setTodos] = useState<Todo[]>([])

  const add = (text: string) =>
    setTodos([...todos, { id: Date.now(), text, done: false }])

  const toggle = (id: number) =>
    setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t))

  const remove = (id: number) =>
    setTodos(todos.filter(t => t.id !== id))

  return (
    <div style={{ maxWidth: 480, margin: '60px auto', fontFamily: 'sans-serif' }}>
      <h1>Todo</h1>
      <TodoForm onAdd={add} />
      <TodoList todos={todos} onToggle={toggle} onRemove={remove} />
    </div>
  )
}

export default App
