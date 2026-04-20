import React, { useEffect, useRef, useState } from 'react'
import { Priority, Task } from '../types/todo.types'
import { AddForm } from './AddForm'
import '../styles/TaskItem.css'

interface Props {
  task: Task
  onToggle: () => void
  onRemove: () => void
  onAddSubtask: (text: string, priority?: Priority) => void
  onToggleSubtask: (subtaskId: number) => void
  onRemoveSubtask: (subtaskId: number) => void
  onUpdateTask: (text: string, priority: Priority) => void
  onUpdateSubtask: (subtaskId: number, text: string, priority: Priority) => void
}

const PRIORITY_OPTIONS: Priority[] = ['low', 'medium', 'high']
const PRIORITY_LABELS: Record<Priority, string> = { low: 'Basse', medium: 'Moyenne', high: 'Haute' }

function InlineEdit({ initialText, initialPriority, onSave, onCancel }: {
  initialText: string
  initialPriority: Priority
  onSave: (text: string, priority: Priority) => void
  onCancel: () => void
}) {
  const [text, setText] = useState(initialText)
  const [priority, setPriority] = useState<Priority>(initialPriority)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => { inputRef.current?.select() }, [])

  function submit() {
    const t = text.trim()
    if (t) onSave(t, priority)
    else onCancel()
  }

  function handleBlur(e: React.FocusEvent) {
    if (containerRef.current?.contains(e.relatedTarget as Node)) return
    submit()
  }

  return (
    <div ref={containerRef} className="inline-edit">
      <input
        ref={inputRef}
        value={text}
        onChange={e => setText(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={e => {
          if (e.key === 'Enter') submit()
          if (e.key === 'Escape') onCancel()
        }}
        className="inline-edit__input"
      />
      <select
        value={priority}
        onChange={e => setPriority(e.target.value as Priority)}
        onBlur={handleBlur}
        onMouseDown={e => e.stopPropagation()}
        className="inline-edit__select"
      >
        {PRIORITY_OPTIONS.map(p => (
          <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
        ))}
      </select>
    </div>
  )
}

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string }> = {
  high: { label: '●', color: '#e05252' },
  medium: { label: '●', color: '#c9933a' },
  low: { label: '●', color: '#5a9e6f' },
}

function PriorityDot({ priority, done }: { priority: Priority; done: boolean }) {
  const { label, color } = PRIORITY_CONFIG[priority]
  return (
    <span
      className="priority-dot"
      title={priority}
      style={{ color: done ? 'var(--ink-muted)' : color }}
    >
      {label}
    </span>
  )
}

export function TaskItem({ task, onToggle, onRemove, onAddSubtask, onToggleSubtask, onRemoveSubtask, onUpdateTask, onUpdateSubtask }: Props) {
  const [editingTask, setEditingTask] = useState(false)
  const [editingSubtaskId, setEditingSubtaskId] = useState<number | null>(null)

  return (
    <div className="task-item">
      <div className="task-item__row">
        <input type="checkbox" checked={task.done} onChange={onToggle} />
        {editingTask ? (
          <InlineEdit
            initialText={task.text}
            initialPriority={task.priority}
            onSave={(text, priority) => { onUpdateTask(text, priority); setEditingTask(false) }}
            onCancel={() => setEditingTask(false)}
          />
        ) : (
          <>
            <PriorityDot priority={task.priority} done={task.done} />
            <span
              className={`task-item__text${task.done ? ' task-item__text--done' : ''}`}
              onDoubleClick={() => setEditingTask(true)}
              title="Double-cliquer pour modifier"
            >
              {task.text}
            </span>
          </>
        )}
        <button className="remove-btn" onClick={onRemove}>✕</button>
      </div>

      {task.subtasks.length > 0 && (
        <ul className="task-item__subtasks">
          {task.subtasks.map(sub => (
            <li key={sub.id} className="subtask-item">
              <input type="checkbox" checked={sub.done} onChange={() => onToggleSubtask(sub.id)} />
              {editingSubtaskId === sub.id ? (
                <InlineEdit
                  initialText={sub.text}
                  initialPriority={sub.priority}
                  onSave={(text, priority) => { onUpdateSubtask(sub.id, text, priority); setEditingSubtaskId(null) }}
                  onCancel={() => setEditingSubtaskId(null)}
                />
              ) : (
                <>
                  <PriorityDot priority={sub.priority} done={sub.done} />
                  <span
                    className={`subtask-item__text${sub.done ? ' subtask-item__text--done' : ''}`}
                    onDoubleClick={() => setEditingSubtaskId(sub.id)}
                    title="Double-cliquer pour modifier"
                  >
                    {sub.text}
                  </span>
                </>
              )}
              <button className="remove-btn" onClick={() => onRemoveSubtask(sub.id)}>✕</button>
            </li>
          ))}
        </ul>
      )}

      <AddForm
        onAdd={onAddSubtask}
        withPriority
        placeholder="Nouvelle sous-tâche…"
        buttonLabel="+"
        className="add-subtask-form"
      />
    </div>
  )
}
