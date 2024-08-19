document.addEventListener("DOMContentLoaded", function () {
  const calendarEl = document.getElementById("calendar");
  const detailsEl = document.getElementById("training-details");
  const searchInput = document.getElementById("search-input");
  const typeFilter = document.getElementById("type-filter");
  const newTrainingForm = document.getElementById("new-training-form");
  const modal = document.getElementById("training-modal");
  const closeModalButton = document.querySelector(".close-button");

  const typeSelect = document.getElementById("type");
  const volumeField = document.createElement("div");
  const exercisesContainer = document.getElementById("exercises-container");
  const addExerciseButton = document.getElementById("add-exercise-button");

  // Volume field for swimming
  volumeField.id = "volume-container";
  volumeField.innerHTML = `
    <label for="volume">Umfang (in Metern):</label>
    <input type="number" id="volume" name="volume" />
  `;
  newTrainingForm.insertBefore(volumeField, exercisesContainer);

  function adjustFormFields() {
    const selectedType = typeSelect.value;

    if (selectedType === "Schwimmen") {
      volumeField.style.display = "block";
      exercisesContainer.style.display = "none";
      addExerciseButton.style.display = "none";
      exercisesContainer.innerHTML = ""; // Clear exercise container for Schwimmen
    } else if (selectedType === "Krafttraining") {
      volumeField.style.display = "none";
      exercisesContainer.style.display = "block";
      addExerciseButton.style.display = "block";
    } else if (selectedType === "Wettkampf") {
      volumeField.style.display = "none";
      exercisesContainer.style.display = "none";
      addExerciseButton.style.display = "none";
      exercisesContainer.innerHTML = ""; // Clear exercise container for Wettkampf
    }
  }

  typeSelect.addEventListener("change", adjustFormFields);
  adjustFormFields();

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
      <div class="training-details-trainingname"><p>${training.name}</p> <p> ${training.type} ${new Date(
        training.date
      ).toLocaleDateString()}</p></div>
      <div class="training-details-description">
        <p><strong>Beschreibung</strong></p>
        <p>${training.description}</p>
      </div>
      ${training.type == "Schwimmen" ? (      
        `<p><strong>Umfang:</strong> ${training.volume}m</p>`
      ) : (
        ``
      )}
      <div class="training-details-seperator"></div>
      ${
        training.exercises
          ? training.exercises
              .map(
                (exercise) => `
                <div>
                  <p class="training-details-exercisename"><strong>${exercise.name}</strong></p>
                  <table class="table_component">
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
          await loadTrainingDetails(eventId); 
        }
      });
    });

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
          await loadTrainingDetails(eventId);
        } else {
          alert("Fehler beim Hinzufügen des Sets");
        }
      });
    });

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
          await loadTrainingDetails(eventId);
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

  function createSetInputs(setsContainer) {
    const setContainer = document.createElement("div");
    setContainer.classList.add("set");
    setContainer.innerHTML = `
      <input type="number" name="weight" class="weight" placeholder="Gewicht" required />
      <input type="number" name="reps" class="reps" placeholder="Reps" required />
    `;
    setsContainer.appendChild(setContainer);
  }

  function addExercise() {
    const exerciseContainer = document.createElement("div");
    exerciseContainer.classList.add("exercise");
    exerciseContainer.innerHTML = `
      <label for="exercise-name">Übung:</label>
      <input type="text" name="exercise-name" class="exercise-name" required>
      <div class="sets-container"></div>
      <button type="button" class="add-set">Set hinzufügen</button>
      <button type="button" class="remove-exercise">Übung entfernen</button> <!-- Hinzufügen der Entfernen-Schaltfläche -->
    `;
    
    document.getElementById("exercises-container").appendChild(exerciseContainer);

    const setsContainer = exerciseContainer.querySelector(".sets-container");
    const addSetButton = exerciseContainer.querySelector(".add-set");
    const removeExerciseButton = exerciseContainer.querySelector(".remove-exercise");

    addSetButton.addEventListener("click", () => {
      createSetInputs(setsContainer);
    });

    removeExerciseButton.addEventListener("click", () => {
      exerciseContainer.remove(); // Entfernt die gesamte Übung
    });

    createSetInputs(setsContainer);
  }


  document
    .getElementById("add-exercise-button")
    .addEventListener("click", addExercise);

  newTrainingForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    const formData = new FormData(newTrainingForm);
    const data = {
      date: formData.get("date"),
      name: formData.get("name"),
      type: formData.get("type"),
      description: formData.get("description"),
      volume: formData.get("volume") || null,
      exercises: [],
    };

const volumeInput = document.getElementById("volume");
console.log(volumeInput.value); // Should log the current value in the volume input

const formData2 = new FormData(newTrainingForm);
console.log(formData2.get("volume")); // Should log the value or null

    if (data.type === "Krafttraining") {
      const exercises = document.querySelectorAll(".exercise");
      exercises.forEach((exercise) => {
        const exerciseName = exercise.querySelector(".exercise-name").value;
        const sets = exercise.querySelectorAll(".set");
        const setList = [];
        sets.forEach((set) => {
          const weight = set.querySelector(".weight").value;
          const reps = set.querySelector(".reps").value;
          setList.push({ weight: Number(weight), reps: Number(reps) });
        });
        data.exercises.push({ name: exerciseName, sets: setList });
      });
    }

    const response = await fetch("/api/trainings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      newTrainingForm.reset();
      modal.style.display = "none";
      calendar.refetchEvents();
    } else {
      alert("Fehler beim Speichern des Trainings");
    }
  });

  closeModalButton.addEventListener("click", function () {
    modal.style.display = "none";
  });

  window.addEventListener("click", function (event) {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });

  document
    .getElementById("open-modal-button")
    .addEventListener("click", function () {
      modal.style.display = "block";
      adjustFormFields(); 
    });
});
