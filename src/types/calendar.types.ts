export type CalendarEventDetail = {
  taskTitle: string
  subtaskTitle?: string
  categoryName: string
  categoryColor: string
  priority: 'low' | 'medium' | 'high'
  duration: number | null
}

export type CalendarEvent = {
  id: string
  title: string
  start: string
  end: string
  color?: string
  extendedProps?: CalendarEventDetail
}