import React, { useState, useRef, useEffect } from 'react'
import { Category, Priority } from '../types/todo.types'
import { TaskItem } from './TaskItem'
import { AddForm } from './AddForm'
import '../styles/CategoryItem.css'

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
  onUpdateTask: (categoryId: number, taskId: number, text: string, priority: Priority) => void
  onUpdateSubtask: (categoryId: number, taskId: number, subtaskId: number, text: string, priority: Priority) => void
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
  onUpdateTask,
  onUpdateSubtask,
}: Props) {
  const [editingName, setEditingName] = useState(false)
  const [nameVal, setNameVal] = useState(category.name)
  const nameRef = useRef<HTMLInputElement>(null)
  const colorRef = useRef<HTMLInputElement>(null)
  const pickingColor = useRef(false)

  useEffect(() => { if (editingName) nameRef.current?.select() }, [editingName])

  function submitName() {
    if (pickingColor.current) return
    const t = nameVal.trim()
    if (t && t !== category.name) onUpdateName(category.id, t)
    else setNameVal(category.name)
    setEditingName(false)
  }

  function handleColorMouseDown(e: React.MouseEvent) {
    e.preventDefault()
    pickingColor.current = true
    colorRef.current?.click()
    // reset after the picker closes (focus returns)
    const onFocus = () => { pickingColor.current = false; window.removeEventListener('focus', onFocus) }
    window.addEventListener('focus', onFocus)
  }

  return (
    <div className="category-item">
      <div className="category-item__header">
        <div className="category-item__title-area">
          {editingName && (
            <div
              className="category-item__color-dot"
              style={{ background: category.color }}
              onMouseDown={handleColorMouseDown}
              title="Changer la couleur"
            >
              <input
                ref={colorRef}
                type="color"
                value={category.color}
                onChange={e => onUpdateColor(category.id, e.target.value)}
                className="category-item__color-input"
                tabIndex={-1}
              />
            </div>
          )}
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
              className="category-item__name-input"
            />
          ) : (
            <h2
              className="category-item__name"
              onDoubleClick={() => setEditingName(true)}
              title="Double-cliquer pour renommer"
              style={{ borderBottom: `1px solid ${category.color}` }}
            >{category.name}</h2>
          )}
        </div>
        <button className="remove-btn" onClick={() => onRemoveCategory(category.id)}>✕</button>
      </div>

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
            onUpdateTask={(text, priority) => onUpdateTask(category.id, task.id, text, priority)}
            onUpdateSubtask={(sid, text, priority) => onUpdateSubtask(category.id, task.id, sid, text, priority)}
          />
        ))}
      </div>

      <AddForm
        onAdd={(text, p) => onAddTask(category.id, text, p!)}
        withPriority
        placeholder="Nouvelle tâche…"
        buttonLabel="+ Nouvelle tâche"
        className="add-task-form"
      />
    </div>
  )
}
