const express = require("express");
const router = express.Router();
const Training = require("../models/Training");

// Combined route to get trainings of a specified type
router.get("/statistic/volumeOverTime", async (req, res) => {
  const type = req.query.type || "Schwimmen"; // Default to "Schwimmen" if no type is specified
  const limit = req.body.limit || null; // Default to 3 if no limit is specified

  try {
    // Query to find the last trainings of the specified type, sorted by date in ascending order
    const trainings = await Training.find({ type })
      .sort({ date: 1 }) // Sort by date in ascending order
      .limit(limit); // Limit the result to the specified number of documents

    res.json(trainings);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching the data" });
  }
});

module.exports = router;
