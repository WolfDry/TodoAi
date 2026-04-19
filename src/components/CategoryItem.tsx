import React, { useState } from 'react'
import { Category, Priority } from '../types/todo.types'
import { TaskItem } from './TaskItem'
import { AddTaskForm } from './AddTaskForm'
import '../styles/CategoryItem.css'

const PRESET_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280']

interface Props {
  category: Category
  onRemoveCategory: (categoryId: number) => void
  onUpdateColor: (categoryId: number, color: string) => void
  onAddTask: (categoryId: number, text: string, priority: Priority) => void
  onToggleTask: (categoryId: number, taskId: number) => void
  onRemoveTask: (categoryId: number, taskId: number) => void
  onAddSubtask: (categoryId: number, taskId: number, text: string) => void
  onToggleSubtask: (categoryId: number, taskId: number, subtaskId: number) => void
  onRemoveSubtask: (categoryId: number, taskId: number, subtaskId: number) => void
}

export function CategoryItem({
  category,
  onRemoveCategory,
  onUpdateColor,
  onAddTask,
  onToggleTask,
  onRemoveTask,
  onAddSubtask,
  onToggleSubtask,
  onRemoveSubtask,
}: Props) {
  const [showPicker, setShowPicker] = useState(false)

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
          <h2 className="category-item__name">{category.name}</h2>
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
            onAddSubtask={(text: string) => onAddSubtask(category.id, task.id, text)}
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
