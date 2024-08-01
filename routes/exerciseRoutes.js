const express = require("express");
const router = express.Router();
const Exercise = require("../models/Exercise");

// Neue Übung hinzufügen
router.post("/exercises", async (req, res) => {
  const { name, description } = req.body;
  try {
    const newExercise = new Exercise({ name, description });
    await newExercise.save();
    res.status(201).json(newExercise);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Alle Übungen abrufen
router.get("/exercises", async (req, res) => {
  try {
    const exercises = await Exercise.find();
    res.status(200).json(exercises);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
