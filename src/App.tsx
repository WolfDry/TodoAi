import React, { useEffect, useState, useRef } from 'react'
import { CategoryList } from './components/CategoryList'
import { Category, Priority } from './types/todo.types'
import { supabase } from './utils/supabase'
import './styles/App.css'

const CAT_COLORS = [
  'oklch(72% 0.14 38)',
  'oklch(65% 0.14 240)',
  'oklch(68% 0.16 20)',
  'oklch(65% 0.13 160)',
  'oklch(65% 0.13 300)',
]

function AddCategoryInline({ onAdd }: { onAdd: (name: string) => void }) {
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
      <div className="add-category-inline-active">
        <input
          ref={ref}
          value={val}
          onChange={e => setVal(e.target.value)}
          onBlur={submit}
          onKeyDown={e => {
            if (e.key === 'Enter') submit()
            if (e.key === 'Escape') { setVal(''); setActive(false) }
          }}
          placeholder="Nom de la catégorie"
          className="add-category-inline-active__input"
        />
      </div>
    )
  }

  return (
    <button
      onClick={() => setActive(true)}
      className="add-category-inline-btn"
    >
      + Nouvelle catégorie
    </button>
  )
}

function App() {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('category')
        .select('*, tasks:task(*, subtasks:subtask(*))')
        .order('id')

      if (data) {
        const normalized = data.map((cat: any) => ({
          ...cat,
          tasks: (cat.tasks ?? []).map((t: any) => ({
            ...t,
            subtasks: t.subtasks ?? [],
          })),
        }))
        setCategories(normalized)
      }
    }
    load()
  }, [])

  const addCategory = async (name: string) => {
    const color = CAT_COLORS[categories.length % CAT_COLORS.length]
    const { data, error } = await supabase
      .from('category')
      .insert({ name, color })
      .select()
      .single()
    if (error) { console.error(error); return }
    setCategories(prev => [...prev, { ...data, tasks: [] }])
  }

  const removeCategory = async (categoryId: number) => {
    const { error } = await supabase.from('category').delete().eq('id', categoryId)
    if (error) { console.error(error); return }
    setCategories(prev => prev.filter(c => c.id !== categoryId))
  }

  const updateCategoryName = async (categoryId: number, name: string) => {
    const { error } = await supabase.from('category').update({ name }).eq('id', categoryId)
    if (error) { console.error(error); return }
    setCategories(prev => prev.map(c => c.id === categoryId ? { ...c, name } : c))
  }

  const updateCategoryColor = async (categoryId: number, color: string) => {
    const { error } = await supabase.from('category').update({ color }).eq('id', categoryId)
    if (error) { console.error(error); return }
    setCategories(prev => prev.map(c => c.id === categoryId ? { ...c, color } : c))
  }

  const addTask = async (categoryId: number, text: string, priority: Priority = 'low') => {
    const { data, error } = await supabase
      .from('task')
      .insert({ text, done: false, category_id: categoryId, priority })
      .select()
      .single()
    if (error) { console.error(error); return }
    setCategories(prev => prev.map(c =>
      c.id === categoryId ? { ...c, tasks: [...c.tasks, { ...data, subtasks: [] }] } : c
    ))
  }

  const toggleTask = async (categoryId: number, taskId: number) => {
    const task = categories.find(c => c.id === categoryId)?.tasks.find(t => t.id === taskId)
    if (!task) return
    const { error } = await supabase.from('task').update({ done: !task.done }).eq('id', taskId)
    if (error) { console.error(error); return }
    setCategories(prev => prev.map(c =>
      c.id === categoryId
        ? { ...c, tasks: c.tasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t) }
        : c
    ))
  }

  const removeTask = async (categoryId: number, taskId: number) => {
    const { error } = await supabase.from('task').delete().eq('id', taskId)
    if (error) { console.error(error); return }
    setCategories(prev => prev.map(c =>
      c.id === categoryId ? { ...c, tasks: c.tasks.filter(t => t.id !== taskId) } : c
    ))
  }

  const addSubtask = async (categoryId: number, taskId: number, text: string, priority: Priority = 'medium') => {
    const { data, error } = await supabase
      .from('subtask')
      .insert({ text, done: false, task_id: taskId, priority })
      .select()
      .single()
    if (error) { console.error(error); return }
    setCategories(prev => prev.map(c =>
      c.id === categoryId
        ? { ...c, tasks: c.tasks.map(t => t.id === taskId ? { ...t, subtasks: [...t.subtasks, data] } : t) }
        : c
    ))
  }

  const toggleSubtask = async (categoryId: number, taskId: number, subtaskId: number) => {
    const subtask = categories
      .find(c => c.id === categoryId)?.tasks
      .find(t => t.id === taskId)?.subtasks
      .find(s => s.id === subtaskId)
    if (!subtask) return
    const { error } = await supabase.from('subtask').update({ done: !subtask.done }).eq('id', subtaskId)
    if (error) { console.error(error); return }
    setCategories(prev => prev.map(c =>
      c.id === categoryId
        ? {
          ...c,
          tasks: c.tasks.map(t =>
            t.id === taskId
              ? { ...t, subtasks: t.subtasks.map(s => s.id === subtaskId ? { ...s, done: !s.done } : s) }
              : t
          ),
        }
        : c
    ))
  }

  const removeSubtask = async (categoryId: number, taskId: number, subtaskId: number) => {
    const { error } = await supabase.from('subtask').delete().eq('id', subtaskId)
    if (error) { console.error(error); return }
    setCategories(prev => prev.map(c =>
      c.id === categoryId
        ? {
          ...c,
          tasks: c.tasks.map(t =>
            t.id === taskId
              ? { ...t, subtasks: t.subtasks.filter(s => s.id !== subtaskId) }
              : t
          ),
        }
        : c
    ))
  }

  const updateTask = async (categoryId: number, taskId: number, text: string, priority: Priority) => {
    const { error } = await supabase.from('task').update({ text, priority }).eq('id', taskId)
    if (error) { console.error(error); return }
    setCategories(prev => prev.map(c =>
      c.id === categoryId
        ? { ...c, tasks: c.tasks.map(t => t.id === taskId ? { ...t, text, priority } : t) }
        : c
    ))
  }

  const updateSubtask = async (categoryId: number, taskId: number, subtaskId: number, text: string, priority: Priority) => {
    const { error } = await supabase.from('subtask').update({ text, priority }).eq('id', subtaskId)
    if (error) { console.error(error); return }
    setCategories(prev => prev.map(c =>
      c.id === categoryId
        ? {
          ...c,
          tasks: c.tasks.map(t =>
            t.id === taskId
              ? { ...t, subtasks: t.subtasks.map(s => s.id === subtaskId ? { ...s, text, priority } : s) }
              : t
          ),
        }
        : c
    ))
  }

  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  const totalTasks = categories.reduce((n, c) => n + c.tasks.length, 0)
  const doneTasks = categories.reduce((n, c) => n + c.tasks.filter(t => t.done).length, 0)

  return (
    <div className="app-root">
      <div className="app-header">
        <div className="app-date">{today}</div>
        <h1 className="app-title">Ma Todo</h1>
        {totalTasks > 0 && (
          <div className="app-progress">
            <span>{doneTasks}/{totalTasks} tâches accomplies</span>
            <span className="app-progress__track">
              <span className="app-progress__bar" style={{ width: `${totalTasks ? (doneTasks / totalTasks) * 100 : 0}%` }} />
            </span>
          </div>
        )}
      </div>

      <CategoryList
        categories={categories}
        onRemoveCategory={removeCategory}
        onUpdateColor={updateCategoryColor}
        onUpdateName={updateCategoryName}
        onAddTask={addTask}
        onToggleTask={toggleTask}
        onRemoveTask={removeTask}
        onAddSubtask={(cId, tId, text, priority) => addSubtask(cId, tId, text, priority)}
        onToggleSubtask={toggleSubtask}
        onRemoveSubtask={removeSubtask}
        onUpdateTask={updateTask}
        onUpdateSubtask={updateSubtask}
      />

      <AddCategoryInline onAdd={addCategory} />
    </div>
  )
}

export default App
