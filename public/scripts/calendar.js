// calendar.js
function initializeCalendar() {
  const calendarEl = document.getElementById("calendar");
  return new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    events: "/api/trainings",
    eventClick: async function (info) {
      const eventId = info.event.id;
      await import("./trainingDetails.js").then((module) => {
        module.loadTrainingDetails(eventId);
      });
    },
    eventContent: function (arg) {
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
    },
  });
}
