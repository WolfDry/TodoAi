import React from 'react'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import frLocale from '@fullcalendar/core/locales/fr'
import '../styles/CalendarPanel.css'

export function CalendarPanel() {
  return (
    <div className="calendar-panel">
      <div className="calendar-header">
        <h1 className="calendar-title">Mon calendrier</h1>
      </div>
      <FullCalendar
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
        slotMaxTime="22:00:00"
        slotLabelFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
        nowIndicator
        editable
        selectable
      />
    </div>
  )
}
