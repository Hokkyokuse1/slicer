const fs = require("fs");
const path = require("path");

const fetchGcode = async () => {
  const gcodePath = path.join(__dirname, "../prusa-container/output/output.gcode"); // Adjust if needed

  if (!fs.existsSync(gcodePath)) {
    console.error("G-code file not found:", gcodePath);
    return null;
  }

  console.log("✅ G-code found at:", gcodePath);
  return gcodePath;
};

module.exports = { fetchGcode };
