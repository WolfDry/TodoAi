import { useEffect, useState, useRef } from 'react'
import { CategoryList } from './CategoryList'
import { Category, Priority } from '../types/todo.types'
import { supabase } from '../utils/supabase'
import '../styles/TodoPanel.css'
import { CalendarEvent, CalendarEventDetail } from '../types/calendar.types'

const PRIORITY_RANK: Record<Priority, number> = { high: 0, medium: 1, low: 2 }

type SlotDef = { startHour: number; endHour: number }

const WORK_SLOTS: SlotDef[] = [
  { startHour: 10, endHour: 12 },
  { startHour: 14, endHour: 19 },
]
const LEISURE_SLOTS: SlotDef[] = [
  { startHour: 21, endHour: 24 },
]

function slotMinutes(slot: SlotDef) {
  return (slot.endHour - slot.startHour) * 60
}

function toDateWithMinutes(base: Date, hourOffset: number, minuteOffset: number): Date {
  const d = new Date(base)
  d.setHours(0, 0, 0, 0)
  d.setMinutes(hourOffset * 60 + minuteOffset)
  return d
}

type ScheduleItem = {
  id: string
  text: string
  duration: number | null
  priority: Priority
  categoryColor: string
  parentTaskId?: number
  detail?: CalendarEventDetail
}

function getCategorySlotType(name: string): 'work' | 'leisure' | null {
  const n = name.toLowerCase()
  if (n === 'loisir') return 'leisure'
  return 'work'
}

function buildOrderedQueue(items: ScheduleItem[]): ScheduleItem[] {
  // Group by parent task (or standalone)
  const groupMap = new Map<string, ScheduleItem[]>()
  for (const item of items) {
    const key = item.parentTaskId != null ? `t${item.parentTaskId}` : `s${item.id}`
    if (!groupMap.has(key)) groupMap.set(key, [])
    groupMap.get(key)!.push(item)
  }
  // Sort within each group by priority
  groupMap.forEach(g => {
    g.sort((a: ScheduleItem, b: ScheduleItem) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority])
  })
  // Sort groups by their top-priority item
  const groups = Array.from(groupMap.values()).sort(
    (a: ScheduleItem[], b: ScheduleItem[]) => PRIORITY_RANK[a[0].priority] - PRIORITY_RANK[b[0].priority]
  )
  return ([] as ScheduleItem[]).concat(...groups)
}

function scheduleQueue(queue: ScheduleItem[], slots: SlotDef[], startDay: Date): CalendarEvent[] {
  const events: CalendarEvent[] = []
  const pending: ScheduleItem[] = [...queue]
  let dayOffset = 0
  let slotIdx = 0

  while (pending.length > 0) {
    const slot = slots[slotIdx]
    const day = new Date(startDay)
    day.setDate(day.getDate() + dayOffset)
    const totalMin = slotMinutes(slot)
    let slotUsed = 0
    let lastParentId: number | undefined

    if (pending[0].duration === null) {
      // No-duration item: occupies the whole slot alone
      const item = pending.shift()!
      events.push({
        id: item.id,
        title: item.text,
        start: toDateWithMinutes(day, slot.startHour, 0).toISOString(),
        end: toDateWithMinutes(day, slot.endHour, 0).toISOString(),
        color: item.categoryColor,
        extendedProps: item.detail,
      })
    } else {
      // Greedy fill: pack as many items as possible into this slot
      while (slotUsed < totalMin && pending.length > 0) {
        const available = totalMin - slotUsed
        let idx = -1

        // 1. Prefer a sibling of the last placed item
        if (lastParentId !== undefined) {
          idx = pending.findIndex(i => i.parentTaskId === lastParentId && i.duration !== null)
        }
        // 2. Otherwise take the first item with a duration (skip no-duration items)
        if (idx === -1) {
          idx = pending.findIndex(i => i.duration !== null)
        }
        if (idx === -1) break // only no-duration items remain; leave them for their own slot

        const item = pending[idx]
        const dur = item.duration!
        const chunk = Math.min(dur, available)

        events.push({
          id: item.id,
          title: item.text,
          start: toDateWithMinutes(day, slot.startHour, slotUsed).toISOString(),
          end: toDateWithMinutes(day, slot.startHour, slotUsed + chunk).toISOString(),
          color: item.categoryColor,
          extendedProps: item.detail,
        })
        slotUsed += chunk
        lastParentId = item.parentTaskId

        if (chunk >= dur) {
          pending.splice(idx, 1)
        } else {
          // Partial: keep remainder and move to front for next slot
          const partial: ScheduleItem = {
            ...item,
            duration: dur - chunk,
            id: item.id.replace(/-cont$/, '') + '-cont',
            text: item.text.endsWith(' (suite)') ? item.text : `${item.text} (suite)`,
          }
          pending.splice(idx, 1)
          pending.unshift(partial)
          // chunk == available so slotUsed == totalMin, inner loop will exit
        }
      }
    }

    // Advance to next slot
    slotIdx++
    if (slotIdx >= slots.length) {
      slotIdx = 0
      dayOffset++
    }
  }

  return events
}

function scheduleTasks(categories: Category[]): CalendarEvent[] {
  const workItems: ScheduleItem[] = []
  const leisureItems: ScheduleItem[] = []

  for (const cat of categories) {
    const slotType = getCategorySlotType(cat.name)
    if (!slotType) continue

    console.log(`Scheduling category "${cat.name}" in ${slotType} slots`)

    const target = slotType === 'work' ? workItems : leisureItems

    for (const task of cat.tasks) {
      if (task.done) continue
      if (task.subtasks.length === 0) {
        target.push({
          id: `task-${task.id}`,
          text: task.text,
          duration: task.duration ?? null,
          priority: task.priority,
          categoryColor: cat.color,
          detail: {
            taskTitle: task.text,
            categoryName: cat.name,
            categoryColor: cat.color,
            priority: task.priority,
            duration: task.duration ?? null,
          } satisfies CalendarEventDetail,
        })
      } else {
        for (const sub of task.subtasks) {
          if (sub.done) continue
          target.push({
            id: `subtask-${sub.id}`,
            text: `${task.text} — ${sub.text}`,
            duration: sub.duration ?? null,
            priority: sub.priority,
            categoryColor: cat.color,
            parentTaskId: task.id,
            detail: {
              taskTitle: task.text,
              subtaskTitle: sub.text,
              categoryName: cat.name,
              categoryColor: cat.color,
              priority: sub.priority,
              duration: sub.duration ?? null,
            } satisfies CalendarEventDetail,
          })
        }
      }
    }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return [
    ...scheduleQueue(buildOrderedQueue(workItems), WORK_SLOTS, today),
    ...scheduleQueue(buildOrderedQueue(leisureItems), LEISURE_SLOTS, today),
  ]
}

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

type Props = { onScheduled: (events: CalendarEvent[]) => void }

export function TodoPanel({ onScheduled }: Props) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState<boolean>(false)

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

  // --- State updater helpers ---
  const patchCategory = (id: number, patch: object) =>
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c))

  const patchTask = (catId: number, taskId: number, patch: object) =>
    setCategories(prev => prev.map(c =>
      c.id === catId
        ? { ...c, tasks: c.tasks.map(t => t.id === taskId ? { ...t, ...patch } : t) }
        : c
    ))

  const patchSubtask = (catId: number, taskId: number, subtaskId: number, patch: object) =>
    setCategories(prev => prev.map(c =>
      c.id === catId
        ? {
          ...c, tasks: c.tasks.map(t =>
            t.id === taskId
              ? { ...t, subtasks: t.subtasks.map(s => s.id === subtaskId ? { ...s, ...patch } : s) }
              : t
          )
        }
        : c
    ))

  // --- Category ---
  const addCategory = async (name: string) => {
    const color = CAT_COLORS[categories.length % CAT_COLORS.length]
    const { data, error } = await supabase.from('category').insert({ name, color }).select().single()
    if (error) { console.error(error); return }
    setCategories(prev => [...prev, { ...data, tasks: [] }])
  }

  const removeCategory = async (categoryId: number) => {
    const { error } = await supabase.from('category').delete().eq('id', categoryId)
    if (error) { console.error(error); return }
    setCategories(prev => prev.filter(c => c.id !== categoryId))
  }

  const updateCategory = async (categoryId: number, patch: { name?: string; color?: string }) => {
    const { error } = await supabase.from('category').update(patch).eq('id', categoryId)
    if (error) { console.error(error); return }
    patchCategory(categoryId, patch)
  }

  // --- Task ---
  const addTask = async (categoryId: number, text: string, priority: Priority = 'low', duration?: number | null) => {
    const { data, error } = await supabase
      .from('task')
      .insert({ text, done: false, category_id: categoryId, priority, duration: duration ?? null })
      .select().single()
    if (error) { console.error(error); return }
    patchCategory(categoryId, { tasks: [...(categories.find(c => c.id === categoryId)?.tasks ?? []), { ...data, subtasks: [] }] })
  }

  const removeTask = async (categoryId: number, taskId: number) => {
    const { error } = await supabase.from('task').delete().eq('id', taskId)
    if (error) { console.error(error); return }
    setCategories(prev => prev.map(c =>
      c.id === categoryId ? { ...c, tasks: c.tasks.filter(t => t.id !== taskId) } : c
    ))
  }

  const updateTask = async (categoryId: number, taskId: number, patch: { text?: string; priority?: Priority; duration?: number | null; done?: boolean }) => {
    const { error } = await supabase.from('task').update(patch).eq('id', taskId)
    if (error) { console.error(error); return }
    patchTask(categoryId, taskId, patch)
  }

  const toggleTask = (categoryId: number, taskId: number) => {
    const task = categories.find(c => c.id === categoryId)?.tasks.find(t => t.id === taskId)
    if (task) updateTask(categoryId, taskId, { done: !task.done })
  }

  // --- Subtask ---
  const addSubtask = async (categoryId: number, taskId: number, text: string, priority: Priority = 'medium', duration?: number | null) => {
    const { data, error } = await supabase
      .from('subtask')
      .insert({ text, done: false, task_id: taskId, priority, duration: duration ?? null })
      .select().single()
    if (error) { console.error(error); return }
    const task = categories.find(c => c.id === categoryId)?.tasks.find(t => t.id === taskId)
    if (task) patchTask(categoryId, taskId, { subtasks: [...task.subtasks, data] })
  }

  const removeSubtask = async (categoryId: number, taskId: number, subtaskId: number) => {
    const { error } = await supabase.from('subtask').delete().eq('id', subtaskId)
    if (error) { console.error(error); return }
    setCategories(prev => prev.map(c =>
      c.id === categoryId
        ? {
          ...c, tasks: c.tasks.map(t =>
            t.id === taskId ? { ...t, subtasks: t.subtasks.filter(s => s.id !== subtaskId) } : t
          )
        }
        : c
    ))
  }

  const updateSubtask = async (categoryId: number, taskId: number, subtaskId: number, patch: { text?: string; priority?: Priority; duration?: number | null; done?: boolean }) => {
    const { error } = await supabase.from('subtask').update(patch).eq('id', subtaskId)
    if (error) { console.error(error); return }
    patchSubtask(categoryId, taskId, subtaskId, patch)
  }

  const toggleSubtask = (categoryId: number, taskId: number, subtaskId: number) => {
    const subtask = categories.find(c => c.id === categoryId)?.tasks.find(t => t.id === taskId)?.subtasks.find(s => s.id === subtaskId)
    if (subtask) updateSubtask(categoryId, taskId, subtaskId, { done: !subtask.done })
  }

  const totalTasks = categories.reduce((n, c) => n + c.tasks.length, 0)
  const doneTasks = categories.reduce((n, c) => n + c.tasks.filter(t => t.done).length, 0)

  return (
    <div className="todo">
      <div className="todo-header">
        <div className="todo-header__row">
          <h1 className="todo-title">Ma Todo</h1>
          <button
            className={`plan-btn${loading ? ' plan-btn--loading' : ''}`}
            onClick={() => onScheduled(scheduleTasks(categories))}
            disabled={loading}
          >
            {loading ? 'Planification…' : 'Planifier'}
          </button>
        </div>
        {totalTasks > 0 && (
          <div className="todo-progress">
            <span>{doneTasks}/{totalTasks} tâches accomplies</span>
            <span className="todo-progress__track">
              <span className="todo-progress__bar" style={{ width: `${totalTasks ? (doneTasks / totalTasks) * 100 : 0}%` }} />
            </span>
          </div>
        )}
      </div>

      <CategoryList
        categories={categories}
        onRemoveCategory={removeCategory}
        onUpdateColor={(id, color) => updateCategory(id, { color })}
        onUpdateName={(id, name) => updateCategory(id, { name })}
        onAddTask={addTask}
        onToggleTask={toggleTask}
        onRemoveTask={removeTask}
        onAddSubtask={addSubtask}
        onToggleSubtask={toggleSubtask}
        onRemoveSubtask={removeSubtask}
        onUpdateTask={(cId, tId, text, priority, duration) => updateTask(cId, tId, { text, priority, duration })}
        onUpdateSubtask={(cId, tId, sId, text, priority, duration) => updateSubtask(cId, tId, sId, { text, priority, duration })}
      />

      <AddCategoryInline onAdd={addCategory} />
    </div>
  )
}