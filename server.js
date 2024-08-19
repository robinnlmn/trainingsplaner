const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();


// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB Verbindung
mongoose.connect("mongodb://localhost/trainingsplaner");

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

// Statische Dateien servieren
app.use(express.static(path.join(__dirname, "public")));

// Routen importieren
const trainingRoutes = require("./routes/trainingRoutes");

// Routen verwenden
app.use("/api", trainingRoutes);

// Grundroute
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Server starten
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
