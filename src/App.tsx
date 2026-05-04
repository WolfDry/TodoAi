import { useState } from 'react'
import { TodoPanel } from './components/TodoPanel'
import { CalendarPanel } from './components/CalendarPanel'
import { CalendarEvent } from './types/calendar.types'
import '../styles/App.css'

function App() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [calendarKey, setCalendarKey] = useState(0)

  function handleScheduled(newEvents: CalendarEvent[]) {
    setEvents(newEvents)
    setCalendarKey(k => k + 1)
  }

  return (
    <div className="app-root">
      <TodoPanel onScheduled={handleScheduled} />
      <CalendarPanel events={events} calendarKey={calendarKey} />
    </div>
  )
}

export default App
