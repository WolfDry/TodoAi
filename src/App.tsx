import { TodoPanel } from './components/TodoPanel'
import { CalendarPanel } from './components/CalendarPanel'
import './styles/App.css'

function App() {
  return (
    <div className="app-root">
      <TodoPanel />
      <CalendarPanel />
    </div>
  )
}

export default App
