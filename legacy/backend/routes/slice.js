const express = require("express");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const router = express.Router();

// Directories inside the Docker container
const INPUT_DIR = "/uploads";   // Volume mapped to container's input folder
const OUTPUT_DIR = "/output"; // Volume mapped to container's output folder
const CHECK_INTERVAL = 1000;  // Check every second for G-code file
// Pricing configuration
const COST_PER_GRAM_KES = 15.75; // 0.025 USD/gram * 150 KES/USD

router.post("/slice", async (req, res) => {
    console.log("Received slicing request:", req.body);

    const { filePath } = req.body;
    if (!filePath) {
        return res.status(400).json({ error: "filePath is required" });
    }

    // Extract original filename without timestamp
    const originalName = path.basename(filePath).replace(/^\d+-/, '');
    const gcodeFile = path.join(OUTPUT_DIR, originalName.replace('.stl', '.gcode'));

    console.log("Expecting G-code file:", gcodeFile);

    let attempts = 0;
    const checkFile = () => {
        if (fs.existsSync(gcodeFile)) {
            console.log(`Found G-code file: ${gcodeFile}`);
            extractSlicingData(gcodeFile, res);
        } else if (attempts < 20) { // Increased timeout
            attempts++;
            setTimeout(checkFile, 1500);
        } else {
            console.error("Timeout: G-code file not generated");
            res.status(500).json({ error: "Slicing timeout - file not generated" });
        }
    };

    checkFile();
});

// Function to wait until the G-code file is created
function waitForFile(filePath, callback, attempts = 30) {
    if (fs.existsSync(filePath)) {
        return callback(null);
    }
    if (attempts <= 0) {
        return callback(new Error("Timeout: G-code file not found."));
    }

    setTimeout(() => waitForFile(filePath, callback, attempts - 1), CHECK_INTERVAL);
}

// Function to extract print time and filament usage from G-code
function extractSlicingData(gcodePath, res) {
    if (!fs.existsSync(gcodePath)) {
        return res.status(500).json({ error: "G-code file not found." });
    }

    fs.readFile(gcodePath, "utf8", (err, data) => {
        if (err) {
            console.error("Error reading G-code:", err);
            return res.status(500).json({ error: "Failed to read G-code." });
        }

        // Time parsing remains the same
        let totalMinutes = 0;
        const timeLine = data.split('\n').find(line => line.toLowerCase().includes('printing time'));
        
        if (timeLine) {
            const timeString = timeLine.split('=')[1]?.trim() || '';
            const timeParts = timeString.match(/(\d+h)? ?(\d+m)? ?(\d+s)?/);
            
            if (timeParts) {
                const hours = parseInt(timeParts[1]) || 0;
                const minutes = parseInt(timeParts[2]) || 0;
                const seconds = parseInt(timeParts[3]) || 0;
                totalMinutes = (hours * 60) + minutes + (seconds / 60);
            }
        }

        // Filament calculation
        const filamentMatch = data.match(/; filament used = ([\d.]+)mm/);
        const filamentUsed = filamentMatch ? parseFloat(filamentMatch[1]) : 0;
        const weight = calculateFilamentWeight(filamentUsed);
        
        // Updated KES cost calculation
        const costEstimateKES = weight * COST_PER_GRAM_KES;

        console.log(`Print time: ${totalMinutes.toFixed(1)} min, Filament: ${weight.toFixed(2)}g, Cost: KES${costEstimateKES.toFixed(2)}`);

        res.json({
            printTime: totalMinutes.toFixed(1),
            filamentUsed: weight.toFixed(2),
            costEstimate: parseFloat(costEstimateKES.toFixed(2))
        });
    });
}

// Moved outside the extractSlicingData function
function calculateFilamentWeight(length, diameter = 1.75, density = 1.24) {
    const radius = diameter / 2;
    const crossSectionalArea = Math.PI * radius * radius;
    const volume = (length * crossSectionalArea) / 1000;
    return volume * density;
}

module.exports = router;
