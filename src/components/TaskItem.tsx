import React from 'react'
import { Task } from '../types/todo.types'
import { AddForm } from './AddForm'
import '../styles/TaskItem.css'

interface Props {
  task: Task
  onToggle: () => void
  onRemove: () => void
  onAddSubtask: (text: string) => void
  onToggleSubtask: (subtaskId: number) => void
  onRemoveSubtask: (subtaskId: number) => void
}

export function TaskItem({ task, onToggle, onRemove, onAddSubtask, onToggleSubtask, onRemoveSubtask }: Props) {
  return (
    <div className="task-item">
      <div className="task-item__row">
        <input type="checkbox" checked={task.done} onChange={onToggle} />
        <span className={`task-item__text${task.done ? ' task-item__text--done' : ''}`}>
          {task.text}
        </span>
        <button className="remove-btn" onClick={onRemove}>✕</button>
      </div>

      {task.subtasks.length > 0 && (
        <ul className="task-item__subtasks">
          {task.subtasks.map(sub => (
            <li key={sub.id} className="subtask-item">
              <input type="checkbox" checked={sub.done} onChange={() => onToggleSubtask(sub.id)} />
              <span className={`subtask-item__text${sub.done ? ' subtask-item__text--done' : ''}`}>
                {sub.text}
              </span>
              <button className="remove-btn" onClick={() => onRemoveSubtask(sub.id)}>✕</button>
            </li>
          ))}
        </ul>
      )}

      <AddForm
        onAdd={onAddSubtask}
        placeholder="Nouvelle sous-tâche…"
        buttonLabel="+"
        className="add-subtask-form"
      />
    </div>
  )
}
