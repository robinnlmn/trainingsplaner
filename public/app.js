document.addEventListener("DOMContentLoaded", function () {
  const calendarEl = document.getElementById("calendar");
  const detailsEl = document.getElementById("training-details");
  const searchInput = document.getElementById("search-input");
  const typeFilter = document.getElementById("type-filter");
  const newTrainingForm = document.getElementById("new-training-form");

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    events: "/api/trainings",
    eventClick: async function (info) {
      const eventId = info.event.id;
      await loadTrainingDetails(eventId);
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

  async function loadTrainingDetails(eventId) {
    const response = await fetch(`/api/trainings/${eventId}`);
    const training = await response.json();
    detailsEl.innerHTML = `
      <h3>${training.name}</h3>
      <p><strong>Datum:</strong> ${new Date(
        training.date
      ).toLocaleDateString()}</p>
      <p><strong>Typ:</strong> ${training.type}</p>
      <p><strong>Beschreibung:</strong> ${training.description}</p>
      ${
        training.exercises
          ? training.exercises
              .map(
                (exercise) => `
                <div>
                  <p><strong>Übung:</strong> ${exercise.name} : ${
                  exercise.setsCount
                }</p>
                  <table>
                    <thead>
                      <tr>
                        <th>Set</th>
                        <th>Gewicht</th>
                        <th>Reps</th>
                        <th>Aktion</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${exercise.sets
                        .map(
                          (set, index) => `
                          <tr data-exercise-id="${
                            exercise._id
                          }" data-set-index="${index}">
                            <td>${index + 1}</td>
                            <td contenteditable="true" data-column="weight">${
                              set.weight
                            }</td>
                            <td contenteditable="true" data-column="reps">${
                              set.reps
                            }</td>
                            <td><button class="delete-set-button" data-exercise-id="${
                              exercise._id
                            }" data-set-index="${index}">X</button></td>
                          </tr>`
                        )
                        .join("")}
                    </tbody>
                  </table>
                  <button data-exercise-id="${
                    exercise._id
                  }" class="add-set-button">Set hinzufügen</button>
                </div>`
              )
              .join("")
          : ""
      }`;

    // Add event listeners for contenteditable cells
    const editableCells = detailsEl.querySelectorAll(
      'td[contenteditable="true"]'
    );
    editableCells.forEach((cell) => {
      cell.addEventListener("blur", async function () {
        const row = cell.parentElement;
        const exerciseId = row.getAttribute("data-exercise-id");
        const setIndex = row.getAttribute("data-set-index");

        const weightCell = row.querySelector('td[data-column="weight"]');
        const repsCell = row.querySelector('td[data-column="reps"]');

        const weight = parseInt(weightCell.textContent.trim(), 10);
        const reps = parseInt(repsCell.textContent.trim(), 10);

        // Send the update to the server
        const updateResponse = await fetch(
          `/api/trainings/${eventId}/exercises/${exerciseId}/sets/${setIndex}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ weight, reps }),
          }
        );

        if (!updateResponse.ok) {
          alert("Fehler beim Speichern der Änderungen");
        } else {
          await loadTrainingDetails(eventId); // Reload the training details to reflect the changes
        }
      });
    });

    // Add event listeners for add set buttons
    const addSetButtons = detailsEl.querySelectorAll(".add-set-button");
    addSetButtons.forEach((button) => {
      button.addEventListener("click", async function () {
        const exerciseId = button.getAttribute("data-exercise-id");

        const newSet = {
          weight: 0,
          reps: 0,
        };

        const addSetResponse = await fetch(
          `/api/trainings/${eventId}/exercises/${exerciseId}/sets`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(newSet),
          }
        );

        if (addSetResponse.ok) {
          await loadTrainingDetails(eventId); // Reload the training details to reflect the changes
        } else {
          alert("Fehler beim Hinzufügen des Sets");
        }
      });
    });

    // Add event listeners for delete set buttons
    const deleteSetButtons = detailsEl.querySelectorAll(".delete-set-button");
    deleteSetButtons.forEach((button) => {
      button.addEventListener("click", async function () {
        const exerciseId = button.getAttribute("data-exercise-id");
        const setIndex = button.getAttribute("data-set-index");

        const deleteSetResponse = await fetch(
          `/api/trainings/${eventId}/exercises/${exerciseId}/sets/${setIndex}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (deleteSetResponse.ok) {
          await loadTrainingDetails(eventId); // Reload the training details to reflect the changes
        } else {
          alert("Fehler beim Entfernen des Sets");
        }
      });
    });
  }

  async function loadEvents() {
    const searchQuery = searchInput.value.toLowerCase();
    const type = typeFilter.value;
    const response = await fetch(
      `/api/trainings?search=${searchQuery}&type=${type}`
    );
    const events = await response.json();
    calendar.removeAllEvents();
    calendar.addEventSource(events);
  }

  searchInput.addEventListener("input", loadEvents);
  typeFilter.addEventListener("change", loadEvents);

  calendar.render();

  function createSetInputs(numberOfSets, setsContainer) {
    setsContainer.innerHTML = "";
    for (let i = 0; i < numberOfSets; i++) {
      const setContainer = document.createElement("div");
      setContainer.classList.add("set");
      setContainer.innerHTML = `
        <label>Set ${i + 1}:</label>
        <input type="number" name="weight" class="weight" placeholder="Gewicht" required />
        <input type="number" name="reps" class="reps" placeholder="Reps" required />
      `;
      setsContainer.appendChild(setContainer);
    }
  }

  function addExercise() {
    const exerciseContainer = document.createElement("div");
    exerciseContainer.classList.add("exercise");
    exerciseContainer.innerHTML = `
      <label for="exercise-name">Übung:</label>
      <input type="text" name="exercise-name" class="exercise-name" required>
      <label for="setsCount">Anzahl der Sets:</label>
      <input type="number" name="setsCount" class="setsCount" min="1" value="1" required>
      <div class="sets-container"></div>
    `;
    document
      .getElementById("exercises-container")
      .appendChild(exerciseContainer);

    const setsCountInput = exerciseContainer.querySelector(".setsCount");
    const setsContainer = exerciseContainer.querySelector(".sets-container");
    setsCountInput.addEventListener("input", () => {
      const numberOfSets = parseInt(setsCountInput.value, 10);
      createSetInputs(numberOfSets, setsContainer);
    });
    setsCountInput.dispatchEvent(new Event("input"));
  }

  document
    .getElementById("add-exercise-button")
    .addEventListener("click", addExercise);

  newTrainingForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const date = document.getElementById("date").value;
    const name = document.getElementById("name").value;
    const type = document.getElementById("type").value;
    const description = document.getElementById("description").value;

    const exercises = Array.from(document.querySelectorAll(".exercise")).map(
      (exercise) => {
        const exerciseName = exercise.querySelector(".exercise-name").value;
        const setsCount = parseInt(
          exercise.querySelector(".setsCount").value,
          10
        );
        const sets = Array.from(exercise.querySelectorAll(".set")).map(
          (set) => ({
            weight: parseInt(set.querySelector(".weight").value, 10),
            reps: parseInt(set.querySelector(".reps").value, 10),
          })
        );
        return {
          name: exerciseName,
          setsCount,
          sets,
        };
      }
    );

    const response = await fetch("/api/trainings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ date, name, type, description, exercises }),
    });

    const training = await response.json();
    console.log("Training added:", training);

    calendar.addEvent({
      id: training._id,
      title: name,
      start: date,
      extendedProps: {
        type: type,
        description: description,
      },
    });

    newTrainingForm.reset();
    document.getElementById("exercises-container").innerHTML = "";
    loadEvents();
  });
});
