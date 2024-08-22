const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TrainingSchema = new Schema({
  date: { type: Date, required: true },
  name: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: ["Krafttraining", "Schwimmen", "Wettkampf"],
  },
  description: String,
  exercises: [
    {
      name: { type: String },
      setsCount: { type: Number },
      sets: [
        {
          weight: { type: Number },
          reps: { type: Number },
        },
      ],
    },
  ],
  volume: { type: Number },
  intensity: { type: Number },
});

module.exports = mongoose.model("Training", TrainingSchema);
