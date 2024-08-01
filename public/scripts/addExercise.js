// addExercise.js
function setupAddExercise() {
  const newTrainingForm = document.getElementById("new-training-form");

  function createSetInputs(setsContainer) {
    setsContainer.innerHTML = "";
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
    `;
    document
      .getElementById("exercises-container")
      .appendChild(exerciseContainer);

    const setsContainer = exerciseContainer.querySelector(".sets-container");
    createSetInputs(setsContainer);

    const addSetButton = exerciseContainer.querySelector(".add-set");
    addSetButton.addEventListener("click", () =>
      createSetInputs(setsContainer)
    );
  }

  document
    .getElementById("add-exercise-button")
    .addEventListener("click", addExercise);

  newTrainingForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const name = document.getElementById("training-name").value;
    const date = document.getElementById("training-date").value;
    const type = document.getElementById("training-type").value;
    const description = document.getElementById("training-description").value;

    const exercises = Array.from(document.querySelectorAll(".exercise")).map(
      (exercise) => {
        const name = exercise.querySelector(".exercise-name").value;
        const sets = Array.from(exercise.querySelectorAll(".set")).map(
          (set) => ({
            weight: parseFloat(set.querySelector(".weight").value),
            reps: parseInt(set.querySelector(".reps").value, 10),
          })
        );
        return { name, sets };
      }
    );

    const response = await fetch("/api/trainings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        date,
        type,
        description,
        exercises,
      }),
    });

    if (response.ok) {
      await loadEvents();
      newTrainingForm.reset();
      document.getElementById("training-modal").style.display = "none";
    } else {
      alert("Fehler beim Hinzufügen des Trainings.");
    }
  });
}
