// trainingDetails.js
async function loadTrainingDetails(eventId) {
  const response = await fetch(`/api/trainings/${eventId}`);
  const training = await response.json();
  const detailsEl = document.getElementById("training-details");

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
                <p><strong>Übung:</strong> ${exercise.name}</p>
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

  addEventListenersToDetails(eventId);
}

function addEventListenersToDetails(eventId) {
  const detailsEl = document.getElementById("training-details");

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
