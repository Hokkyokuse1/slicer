const express = require("express");
const { triggerSlicing } = require("../github/triggerSlicing");
const { fetchGcode } = require("../github/fetchGcode");

const router = express.Router();

// Endpoint to trigger slicing
router.post("/slice", async (req, res) => {
  const { stlPath } = req.body;
  if (!stlPath) return res.status(400).json({ error: "STL path is required" });

  const status = await triggerSlicing(stlPath);
  if (status === 204) {
    res.json({ message: "Slicing job started" });
  } else {
    res.status(500).json({ error: "Failed to trigger slicing job" });
  }
});

// Endpoint to retrieve the sliced G-code
router.get("/gcode", async (req, res) => {
  const gcodePath = await fetchGcode();
  if (!gcodePath) return res.status(404).json({ error: "G-code not found" });

  res.download(gcodePath);
});

module.exports = router;
