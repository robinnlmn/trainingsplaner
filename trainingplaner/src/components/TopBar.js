import React, { forwardRef, useImperativeHandle } from "react";
import styles from "../app/styles/TopBar.module.css";

const TopBar = forwardRef(({ newTrainingClick }, ref) => {
  const serverUrl = "http://192.168.178.112:8080";

  useImperativeHandle(ref, () => ({
    refreshCalendar: () => {
      if (ref.current && ref.current.refetchEvents) {
        ref.current.refetchEvents();
      }
    },
    removeAllEvents: () => {
      if (ref.current) {
        ref.current.removeAllEvents();
      }
    },
    addEventSource: (events) => {
      if (ref.current) {
        ref.current.addEventSource(events);
      }
    },
  }));

  async function loadEvents() {
    const searchInput = document.getElementById("search-input");
    const typeFilter = document.getElementById("type-filter");

    const searchQuery = searchInput.value.toLowerCase();
    const type = typeFilter.value;

    const response = await fetch(
      `${serverUrl}/api/trainings?search=${searchQuery}&type=${type}`
    );
    const events = await response.json();

    // Calling the methods exposed via useImperativeHandle
    ref.current.removeAllEvents(); // This is safe because it does not cause a recursion
    ref.current.addEventSource(events);
  }

  return (
    <div className={styles.topBar}>
      <button onClick={newTrainingClick}>New Training</button>

      <input
        type="text"
        id="search-input"
        placeholder="Suche nach Name..."
        onInput={() => loadEvents()}
      />
      <select id="type-filter" onChange={() => loadEvents()}>
        <option value="">Alle Typen</option>
        <option value="Schwimmen">Schwimmen</option>
        <option value="Krafttraining">Krafttraining</option>
        <option value="Wettkampf">Wettkampf</option>
      </select>
    </div>
  );
});

export default TopBar;
