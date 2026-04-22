import { useState } from 'react'
import { TodoPanel } from './components/TodoPanel'
import { CalendarPanel } from './components/CalendarPanel'
import { CalendarEvent } from './types/calendar.types'
import './styles/App.css'

function App() {
  const [aiEvents, setAiEvents] = useState<CalendarEvent[]>([])

  return (
    <div className="app-root">
      <TodoPanel onScheduled={setAiEvents} />
      <CalendarPanel events={aiEvents} />
    </div>
  )
}

export default App
