"use client";
import { useState, useRef } from "react";
import styles from "./styles/page.module.css";
import Calendar from "../components/Calendar";
import TopBar from "../components/TopBar";

export default function Home() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentType, setCurrentType] = useState("Schwimmen");

  const calendarRef = useRef(null); // Add a ref for the Calendar component

  const serverUrl = "http://192.168.178.112:8080";

  const handleEventClick = async (eventId) => {
    const response = await fetch(`${serverUrl}/api/trainings/${eventId}`);
    const data = await response.json();
    setSelectedEvent(data);
    console.log(data);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  async function handleFormSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = {
      date: formData.get("date"),
      name: formData.get("name"),
      type: formData.get("type"),
      description: formData.get("description"),
      volume: formData.get("volume") || null,
      exercises: [],
    };

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

    const response = await fetch(`${serverUrl}/api/trainings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      newTrainingForm.reset();
      setIsModalOpen(false);
      calendarRef.current.refetchEvents();
    } else {
      alert("Fehler beim Speichern des Trainings");
    }
  }

  function handleAddExercise() {
    const exerciseContainer = document.createElement("div");
    exerciseContainer.classList.add("exercise");
    exerciseContainer.innerHTML = `
    <label for="exercise-name">Übung:</label>
    <input type="text" name="exercise-name" class="exercise-name" required>
    <div class="sets-container"></div>
    <button type="button" class="add-set">Set hinzufügen</button>
    <button type="button" class="remove-exercise">Übung entfernen</button>
  `;

    document
      .getElementById("exercise-container") // Corrected ID here
      .appendChild(exerciseContainer);

    const setsContainer = exerciseContainer.querySelector(".sets-container");
    const addSetButton = exerciseContainer.querySelector(".add-set");
    const removeExerciseButton =
      exerciseContainer.querySelector(".remove-exercise");

    addSetButton.addEventListener("click", () => {
      createSetInputs(setsContainer);
    });

    removeExerciseButton.addEventListener("click", () => {
      exerciseContainer.remove(); // Entfernt die gesamte Übung
    });

    createSetInputs(setsContainer);
  }

  function createSetInputs(setsContainer) {
    const setContainer = document.createElement("div");
    setContainer.classList.add("set");
    setContainer.innerHTML = `
      <input type="number" name="weight" class="weight" placeholder="Gewicht" required />
      <input type="number" name="reps" class="reps" placeholder="Reps" required />
    `;
    setsContainer.appendChild(setContainer);
  }

  async function deleteTraining(trainingId) {
    if (confirm(`Are you sure you want to delete this Training?`)) {
      const response = await fetch(`${serverUrl}/api/trainings/${trainingId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        calendarRef.current.refetchEvents();
        setSelectedEvent(null);
      } else {
        alert("Fehler beim Entfernen des Trainings");
      }
    }
  }

  return (
    <main className={styles.main}>
      <div className={styles.trainingDetails}>
        {selectedEvent !== null ? (
          <div className={styles.trainingDetailsContent}>
            <h2 className={styles.trainingDetailsContentName}>
              {selectedEvent.name}
            </h2>
            <p className={styles.trainingDetailsContentTypeDate}>
              {selectedEvent.type}{" "}
              {new Date(selectedEvent.date).toLocaleDateString()}
            </p>
            <br />
            <p>{selectedEvent.description}</p>
            <hr></hr>
            {selectedEvent.exercises.length > 0 ? (
              selectedEvent.exercises.map((exercise, index) => {
                return (
                  <div className={styles.trainingDetailsContentExercise}>
                    <h3 className={styles.trainingDetailsContentExerciseName}>
                      {exercise.name}
                    </h3>
                    <table className={styles.table_component}>
                      <thead>
                        <tr>
                          <th>Set</th>
                          <th>Weight</th>
                          <th>Reps</th>
                          {/* <th>Aktion</th> */}
                        </tr>
                      </thead>
                      <tbody>
                        {exercise.sets.map((set, index) => {
                          return (
                            <tr>
                              <td>{index + 1}</td>
                              <td>{set.weight} kg</td>
                              <td>{set.reps}</td>
                              {/* <td>
                                <button
                                  className={styles.deleteSetButton}
                                  data-exercise-id={exercise._id}
                                  data-set-index={index}
                                >
                                  X
                                </button>
                              </td> */}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })
            ) : (
              <p>Umfang: {selectedEvent.volume}m</p>
            )}

            <button
              className={styles.deleteButton}
              onClick={() => deleteTraining(selectedEvent._id)}
            >
              DELETE
            </button>
          </div>
        ) : (
          <>No Training selected</>
        )}
      </div>

      <div className={styles.mainContent}>
        <TopBar ref={calendarRef} newTrainingClick={handleOpenModal} />
        <Calendar ref={calendarRef} onEventClick={handleEventClick} />
      </div>

      {isModalOpen ? (
        <div className={styles.addTrainingModal}>
          <h2>New Training</h2>
          <form id="newTrainingForm" onSubmit={(e) => handleFormSubmit(e)}>
            <input
              type="date"
              id="date"
              name="date"
              required
              defaultValue={new Date().toISOString().substring(0, 10)}
            />
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Training Name"
              required
            />
            <textarea
              id="description"
              name="description"
              placeholder="Description"
            ></textarea>
            <select
              id="type"
              name="type"
              required
              onChange={(e) => setCurrentType(e.target.value)}
            >
              <option value="Schwimmen">Schwimmen</option>
              <option value="Krafttraining">Krafttraing</option>
              <option value="Wettkampf">Wettkampf</option>
            </select>

            {currentType == "Wettkampf" ? (
              <></>
            ) : (
              <>
                {currentType == "Krafttraining" ? (
                  <>
                    <div id="exercise-container"></div>
                    <button type="button" onClick={() => handleAddExercise()}>
                      Add Exercise
                    </button>
                  </>
                ) : (
                  <input
                    type="number"
                    id="volume"
                    name="volume"
                    placeholder="Volume (in m)"
                  />
                )}
              </>
            )}
            <button type="submit">DONE</button>
          </form>
        </div>
      ) : (
        <></>
      )}

      {isModalOpen ? (
        <div
          className={styles.addTrainingModalBackground}
          onClick={() => setIsModalOpen(false)}
        ></div>
      ) : (
        <></>
      )}
    </main>
  );
}
