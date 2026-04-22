import React, { useEffect, useRef, useState } from 'react'
import { Priority, Task } from '../types/todo.types'
import { AddForm } from './AddForm'
import '../styles/TaskItem.css'

interface Props {
  task: Task
  onToggle: () => void
  onRemove: () => void
  onAddSubtask: (text: string, priority?: Priority, duration?: number | null) => void
  onToggleSubtask: (subtaskId: number) => void
  onRemoveSubtask: (subtaskId: number) => void
  onUpdateTask: (text: string, priority: Priority, duration: number | null) => void
  onUpdateSubtask: (subtaskId: number, text: string, priority: Priority, duration: number | null) => void
}

const PRIORITY_OPTIONS: Priority[] = ['low', 'medium', 'high']
const PRIORITY_LABELS: Record<Priority, string> = { low: 'Basse', medium: 'Moyenne', high: 'Haute' }

function parseDuration(raw: string): number | null {
  const s = raw.trim().toLowerCase()
  if (!s) return null
  const hm = s.match(/^(\d+)h(\d+)?$/)
  if (hm) return parseInt(hm[1]) * 60 + (hm[2] ? parseInt(hm[2]) : 0)
  const h = s.match(/^(\d+)\s*h$/)
  if (h) return parseInt(h[1]) * 60
  const m = s.match(/^(\d+)\s*(min)?$/)
  if (m) return parseInt(m[1])
  return null
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return minutes < 2 ? `${minutes}min` : `${minutes}mins`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m ? `${h}h${m}` : `${h}h`
}

function durationToInput(minutes: number | null | undefined): string {
  if (!minutes) return ''
  return formatDuration(minutes)
}

function InlineEdit({ initialText, initialPriority, initialDuration, onSave, onCancel }: {
  initialText: string
  initialPriority: Priority
  initialDuration: number | null | undefined
  onSave: (text: string, priority: Priority, duration: number | null) => void
  onCancel: () => void
}) {
  const [text, setText] = useState(initialText)
  const [priority, setPriority] = useState<Priority>(initialPriority)
  const [durationRaw, setDurationRaw] = useState(durationToInput(initialDuration))
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => { inputRef.current?.select() }, [])

  function submit() {
    const t = text.trim()
    if (t) onSave(t, priority, parseDuration(durationRaw))
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
      <input
        value={durationRaw}
        onChange={e => setDurationRaw(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={e => {
          if (e.key === 'Enter') submit()
          if (e.key === 'Escape') onCancel()
        }}
        placeholder="2h, 30min…"
        className="inline-edit__duration"
      />
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

function DurationBadge({ duration, done, derived = false }: { duration: number | null | undefined; done: boolean; derived?: boolean }) {
  if (!duration) return null
  return (
    <span className={`duration-badge${done ? ' duration-badge--done' : ''}${derived ? ' duration-badge--derived' : ''}`}>
      {formatDuration(duration)}
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
            initialDuration={task.duration}
            onSave={(text, priority, duration) => { onUpdateTask(text, priority, duration); setEditingTask(false) }}
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
            <DurationBadge
              duration={task.duration ?? (task.subtasks.reduce((sum, s) => sum + (s.duration ?? 0), 0) || null)}
              done={task.done}
              derived={!task.duration && task.subtasks.some(s => s.duration)}
            />
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
                  initialDuration={sub.duration}
                  onSave={(text, priority, duration) => { onUpdateSubtask(sub.id, text, priority, duration); setEditingSubtaskId(null) }}
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
                  <DurationBadge duration={sub.duration} done={sub.done} />
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
        withDuration
        placeholder="Nouvelle sous-tâche…"
        buttonLabel="+"
        className="add-subtask-form"
      />
    </div>
  )
}
