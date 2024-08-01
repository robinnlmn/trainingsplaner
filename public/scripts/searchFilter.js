// searchFilter.js
function setupSearchAndFilter() {
  const searchInput = document.getElementById("search-input");
  const typeFilter = document.getElementById("type-filter");

  async function loadEvents() {
    const searchQuery = searchInput.value.toLowerCase();
    const type = typeFilter.value;
    const response = await fetch(
      `/api/trainings?search=${searchQuery}&type=${type}`
    );
    const events = await response.json();
    const calendar = document.getElementById("calendar").calendar;
    calendar.removeAllEvents();
    calendar.addEventSource(events);
  }

  searchInput.addEventListener("input", loadEvents);
  typeFilter.addEventListener("change", loadEvents);
}
