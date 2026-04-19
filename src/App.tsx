import React, { useEffect, useState } from 'react'
import { TodoForm } from './components/TodoForm'
import { TodoList } from './components/TodoList'
import { Todo } from './types/todo.types'
import { supabase } from './utils/supabase'

function App() {
  const [todos, setTodos] = useState<Todo[]>([])

  useEffect(() => {
    async function getTodos() {
      const { data: todos } = await supabase.from('todos').select()

      if (todos) {
        setTodos(todos)
      }
    }
    getTodos()

  }, [])

  const add = async (text: string) => {
    const { data, error } = await supabase
      .from('todo')
      .insert({ text, done: false })
      .select()
      .single()

    if (error) {
      console.error(error)
      return
    }

    setTodos([...todos, data])
  }

  const toggle = async (id: number) => {
    const todo = todos.find(t => t.id === id)
    if (!todo) return

    const { error } = await supabase
      .from('todo')
      .update({ done: !todo.done })
      .eq('id', id)

    if (error) {
      console.error(error)
      return
    }

    setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  const remove = async (id: number) => {
    const { error } = await supabase
      .from('todo')
      .delete()
      .eq('id', id)

    if (error) {
      console.error(error)
      return
    }

    setTodos(todos.filter(t => t.id !== id))
  }

  return (
    <div style={{ maxWidth: 480, margin: '60px auto', fontFamily: 'sans-serif' }}>
      <h1>Todo</h1>
      <TodoForm onAdd={add} />
      <TodoList todos={todos} onToggle={toggle} onRemove={remove} />
    </div>
  )
}

export default App
