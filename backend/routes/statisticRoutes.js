const express = require("express");
const router = express.Router();
const Training = require("../models/Training");

// Get the last 3 trainings of type "Schwimmen"
router.get("/statistic", async (req, res) => {
  try {
    // Query to find the last 3 "Schwimmen" trainings, sorted by date in descending order
    const trainings = await Training.find({ type: "Schwimmen" })
      .sort({ date: 1 }) // Sort by date in descending order (latest first)
      .limit(req.body.limit); // Limit the result to 3 documents

    res.json(trainings);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching the data" });
  }
});

router.get("/statistic/competitions", async (req, res) => {
  try {
    // Query to find the last 3 "Schwimmen" trainings, sorted by date in descending order
    const trainings = await Training.find({ type: "Wettkampf" })
      .sort({ date: 1 }) // Sort by date in descending order (latest first)
      .limit(req.body.limit); // Limit the result to 3 documents

    res.json(trainings);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching the data" });
  }
});

module.exports = router;
