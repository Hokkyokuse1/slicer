const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Serve uploaded and sliced files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/output", express.static(path.join(__dirname, "output")));

// Import routes
const sliceRouter = require("./routes/slice");
const uploadRouter = require("./routes/upload");

app.use("/api", sliceRouter);  // ✅ Ensure this is correct
app.use("/api", uploadRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
