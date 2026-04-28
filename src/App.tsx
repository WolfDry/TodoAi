import { useState } from 'react'
import { TodoPanel } from './components/TodoPanel'
import { CalendarPanel } from './components/CalendarPanel'
import { CalendarEvent } from './types/calendar.types'
import './styles/App.css'

function App() {
  const [events, setEvents] = useState<CalendarEvent[]>([])

  return (
    <div className="app-root">
      <TodoPanel onScheduled={setEvents} />
      <CalendarPanel events={events} />
    </div>
  )
}

export default App
