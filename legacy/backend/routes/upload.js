const express = require("express");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// routes/upload.js
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../uploads"));
    },
    filename: (req, file, cb) => {
        // Remove timestamp prefix
        cb(null, file.originalname); // Now keeps original filename
    }
});

const upload = multer({ storage });

// Upload Route
router.post("/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }
    
    const filePath = `/uploads/${req.file.filename}`;
    
    res.status(200).json({ 
        message: "File uploaded successfully", 
        filename: req.file.filename, 
        filePath 
    });
});

module.exports = router;
