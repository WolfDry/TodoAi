import React, { useState, useRef, useEffect } from 'react'
import { Category, Priority } from '../types/todo.types'
import { TaskItem } from './TaskItem'
import { AddTaskForm } from './AddTaskForm'
import '../styles/CategoryItem.css'

const PRESET_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280']

interface Props {
  category: Category
  onRemoveCategory: (categoryId: number) => void
  onUpdateColor: (categoryId: number, color: string) => void
  onUpdateName: (categoryId: number, name: string) => void
  onAddTask: (categoryId: number, text: string, priority: Priority) => void
  onToggleTask: (categoryId: number, taskId: number) => void
  onRemoveTask: (categoryId: number, taskId: number) => void
  onAddSubtask: (categoryId: number, taskId: number, text: string, priority?: Priority) => void
  onToggleSubtask: (categoryId: number, taskId: number, subtaskId: number) => void
  onRemoveSubtask: (categoryId: number, taskId: number, subtaskId: number) => void
}

export function CategoryItem({
  category,
  onRemoveCategory,
  onUpdateColor,
  onUpdateName,
  onAddTask,
  onToggleTask,
  onRemoveTask,
  onAddSubtask,
  onToggleSubtask,
  onRemoveSubtask,
}: Props) {
  const [showPicker, setShowPicker] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [nameVal, setNameVal] = useState(category.name)
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (editingName) nameRef.current?.select() }, [editingName])

  function submitName() {
    const t = nameVal.trim()
    if (t && t !== category.name) onUpdateName(category.id, t)
    else setNameVal(category.name)
    setEditingName(false)
  }

  return (
    <div className="category-item" style={{ borderLeftColor: category.color }}>
      <div className="category-item__header">
        <div className="category-item__title-area">
          <button
            className="color-dot"
            style={{ background: category.color }}
            onClick={() => setShowPicker(v => !v)}
            title="Changer la couleur"
          />
          {editingName ? (
            <input
              ref={nameRef}
              value={nameVal}
              onChange={e => setNameVal(e.target.value)}
              onBlur={submitName}
              onKeyDown={e => {
                if (e.key === 'Enter') submitName()
                if (e.key === 'Escape') { setNameVal(category.name); setEditingName(false) }
              }}
              style={{
                background: 'none', border: 'none',
                borderBottom: '1px solid var(--accent)', outline: 'none',
                fontFamily: 'DM Mono, monospace', fontSize: 15, fontWeight: 600,
                color: 'var(--ink)', padding: '2px 0', width: '100%',
              }}
            />
          ) : (
            <h2
              className="category-item__name"
              onDoubleClick={() => setEditingName(true)}
              title="Double-cliquer pour renommer"
              style={{ cursor: 'text' }}
            >{category.name}</h2>
          )}
        </div>
        <button className="remove-btn" onClick={() => onRemoveCategory(category.id)}>✕</button>
      </div>

      {showPicker && (
        <div className="color-picker">
          {PRESET_COLORS.map(c => (
            <button
              key={c}
              className={`color-swatch${category.color === c ? ' color-swatch--active' : ''}`}
              style={{ background: c }}
              onClick={() => { onUpdateColor(category.id, c); setShowPicker(false) }}
            />
          ))}
        </div>
      )}

      <div className="category-item__tasks">
        {category.tasks.map(task => (
          <TaskItem
            key={task.id}
            task={task}
            onToggle={() => onToggleTask(category.id, task.id)}
            onRemove={() => onRemoveTask(category.id, task.id)}
            onAddSubtask={(text: string, priority) => onAddSubtask(category.id, task.id, text, priority)}
            onToggleSubtask={(sid: number) => onToggleSubtask(category.id, task.id, sid)}
            onRemoveSubtask={(sid: number) => onRemoveSubtask(category.id, task.id, sid)}
          />
        ))}
      </div>

      <AddTaskForm
        onAdd={(text: string, p: Priority) => onAddTask(category.id, text, p)}
        placeholder="Nouvelle tâche…"
        className="add-task-form"
      />
    </div>
  )
}
