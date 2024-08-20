import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";

const Calendar = forwardRef(({ onEventClick }, ref) => {
  const calendarRef = useRef(null);

  const serverUrl = "192.168.178.112:8080";

  useImperativeHandle(ref, () => ({
    refetchEvents: () => {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.refetchEvents();
    },
    removeAllEvents: () => {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.removeAllEvents();
    },
    addEventSource: (events) => {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.addEventSource(events);
    },
  }));

  return (
    <FullCalendar
      ref={calendarRef}
      plugins={[dayGridPlugin]}
      initialView="dayGridMonth"
      events={`http://${serverUrl}/api/trainings`}
      height="100%"
      eventClick={(info) => onEventClick(info.event.id)}
      eventContent={(arg) => {
        const eventName = arg.event.title;
        const eventType = arg.event.extendedProps.type;

        let color;
        switch (eventType) {
          case "Krafttraining":
            color = "red";
            break;
          case "Schwimmen":
            color = "blue";
            break;
          case "Wettkampf":
            color = "green";
            break;
          default:
            color = "gray";
        }

        const customHtml = `
        <div class="fc-event-dot" style="background-color: ${color};"></div>
        <div class="fc-event-title">${eventName}</div>
      `;
        return { html: customHtml };
      }}
    />
  );
});

export default Calendar;
