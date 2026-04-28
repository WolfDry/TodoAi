import { useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import { EventClickArg } from '@fullcalendar/core'
import frLocale from '@fullcalendar/core/locales/fr'
import '../styles/CalendarPanel.css'
import { CalendarEvent, CalendarEventDetail } from '../types/calendar.types'

const PRIORITY_LABEL: Record<string, string> = { high: 'Haute', medium: 'Moyenne', low: 'Basse' }
const PRIORITY_COLOR: Record<string, string> = { high: '#e05252', medium: '#e09a52', low: '#52a0e0' }

type Props = { events: CalendarEvent[]; calendarKey: number }

export function CalendarPanel({ events, calendarKey }: Props) {
  const [detail, setDetail] = useState<CalendarEventDetail & { eventTitle: string } | null>(null)

  function handleEventClick(arg: EventClickArg) {
    const props = arg.event.extendedProps as CalendarEventDetail | undefined
    if (!props) return
    setDetail({ ...props, eventTitle: arg.event.title })
  }

  return (
    <div className="calendar-panel">
      <div className="calendar-header">
        <h1 className="calendar-title">Mon calendrier</h1>
      </div>
      <FullCalendar
        key={calendarKey}
        plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        locale={frLocale}
        firstDay={1}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: '',
        }}
        height="100%"
        allDaySlot={false}
        slotMinTime="07:00:00"
        slotMaxTime="24:00:00"
        slotLabelFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
        nowIndicator
        editable
        selectable
        events={events}
        eventClick={handleEventClick}
      />

      {detail && (
        <div className="event-modal-overlay" onClick={() => setDetail(null)}>
          <div className="event-modal" onClick={e => e.stopPropagation()}>
            <button className="event-modal__close" onClick={() => setDetail(null)}>✕</button>
            <div
              className="event-modal__color-bar"
              style={{ backgroundColor: detail.categoryColor }}
            />
            <div className="event-modal__body">
              <p className="event-modal__category">{detail.categoryName}</p>
              <h2 className="event-modal__task">{detail.taskTitle}</h2>
              {detail.subtaskTitle && (
                <p className="event-modal__subtask">↳ {detail.subtaskTitle}</p>
              )}
              <div className="event-modal__meta">
                <span
                  className="event-modal__priority"
                  style={{ color: PRIORITY_COLOR[detail.priority] }}
                >
                  ● {PRIORITY_LABEL[detail.priority]}
                </span>
                {detail.duration != null && (
                  <span className="event-modal__duration">
                    {detail.duration >= 60
                      ? `${Math.floor(detail.duration / 60)}h${detail.duration % 60 > 0 ? String(detail.duration % 60).padStart(2, '0') : ''}`
                      : `${detail.duration} min`}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
