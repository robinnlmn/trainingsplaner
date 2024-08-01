const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Definition des Training-Schemas
const TrainingSchema = new Schema({
  date: { type: Date, required: true }, // Datum des Trainings
  name: { type: String, required: true }, // Name des Trainings
  type: {
    type: String,
    required: true,
    enum: ["Krafttraining", "Schwimmen", "Wettkampf"], // Erlaubte Werte für den Typ
  }, // Typ des Trainings (z.B. Schwimmen, Krafttraining, Wettkampf)
  description: String, // Beschreibung des Trainings
  exercises: [
    {
      name: { type: String }, // Name der Übung
      setsCount: { type: Number }, // Anzahl der Sets (Sätze)
      sets: [
        {
          weight: { type: Number }, // Gewicht der Übung
          reps: { type: Number }, // Wiederholungen der Übung
        },
      ],
    },
  ],
});

// Export des Modells
module.exports = mongoose.model("Training", TrainingSchema);
