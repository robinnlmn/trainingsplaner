const express = require("express");
const router = express.Router();
const Training = require("../models/Training");

// Trainingseinheit erstellen
router.post("/trainings", async (req, res) => {
  const { date, name, type, description, volume, exercises } = req.body;
  console.log(req.body)
  const newTraining = new Training({
    date,
    name,
    type,
    description,
    volume,
    exercises,
  });
  try {
    await newTraining.save();
    res.status(201).json(newTraining);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Alle Trainingseinheiten abrufen (mit Such- und Filterparametern)
router.get("/trainings", async (req, res) => {
  try {
    const { search = "", type = "" } = req.query;
    const query = {};

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    if (type) {
      query.type = type;
    }

    const trainings = await Training.find(query);
    const events = trainings.map((training) => ({
      id: training._id,
      title: training.name,
      start: training.date,
      extendedProps: {
        type: training.type,
        description: training.description,
      },
    }));
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Einzelne Trainingseinheit abrufen
router.get("/trainings/:id", async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (training) {
      res.status(200).json(training);
      console.log(training)
    } else {
      res.status(404).json({ message: "Training not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Einzelne Übung aktualisieren
router.put(
  "/trainings/:trainingId/exercises/:exerciseId/sets/:setIndex",
  async (req, res) => {
    try {
      const { trainingId, exerciseId, setIndex } = req.params;
      const { weight, reps } = req.body;

      const training = await Training.findById(trainingId);
      const exercise = training.exercises.id(exerciseId);
      exercise.sets[setIndex] = { weight, reps };

      await training.save();
      res.status(200).json(training);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Set hinzufügen
router.post(
  "/trainings/:trainingId/exercises/:exerciseId/sets",
  async (req, res) => {
    try {
      const { trainingId, exerciseId } = req.params;
      const { weight, reps } = req.body;

      const training = await Training.findById(trainingId);
      const exercise = training.exercises.id(exerciseId);
      exercise.sets.push({ weight, reps });

      await training.save();
      res.status(201).json(training);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Set entfernen
router.delete(
  "/trainings/:trainingId/exercises/:exerciseId/sets/:setIndex",
  async (req, res) => {
    try {
      const { trainingId, exerciseId, setIndex } = req.params;

      const training = await Training.findById(trainingId);
      const exercise = training.exercises.id(exerciseId);
      exercise.sets.splice(setIndex, 1);

      await training.save();
      res.status(200).json(training);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.post("/trainings/:id/exercises", async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) {
      return res.status(404).json({ message: "Training not found" });
    }

    const { name, setsCount, sets } = req.body;
    training.exercises.push({ name, setsCount, sets });
    await training.save();

    res.status(200).json(training);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
