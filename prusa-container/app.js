const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = process.env.PORT || 8080;

const upload = multer({ dest: '/tmp/uploads/' });
const SLIC3R_BIN = "/Slic3r/slic3r-dist/slic3r";
const CONFIG_FILE = "/slicer/config.ini";

app.use(express.json());

app.post('/slice', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No STL file uploaded' });
    }

    const jobId = uuidv4();
    const stlPath = req.file.path;
    const gcodePath = `/tmp/${jobId}.gcode`;

    console.log(`[${jobId}] Starting slicing: ${req.file.originalname}`);

    const cmd = `"${SLIC3R_BIN}" --load "${CONFIG_FILE}" -o "${gcodePath}" "${stlPath}"`;

    exec(cmd, (error, stdout, stderr) => {
        // Cleanup STL
        fs.unlinkSync(stlPath);

        if (error) {
            console.error(`[${jobId}] Slicing error:`, stderr);
            return res.status(500).json({ error: 'Slicing failed', details: stderr });
        }

        if (!fs.existsSync(gcodePath)) {
            return res.status(500).json({ error: 'G-code was not generated' });
        }

        const gcode = fs.readFileSync(gcodePath, 'utf8');
        
        // Extract metadata from G-code (Time, Filament)
        const metadata = extractMetadata(gcode);

        // Cleanup G-code
        fs.unlinkSync(gcodePath);

        console.log(`[${jobId}] Slicing completed successfully`);
        res.json({
            jobId,
            filename: req.file.originalname.replace('.stl', '.gcode'),
            metadata,
            gcode: gcode // For smaller files, we can send content. For larger, we'd use Storage. 
                         // But since we're making an API, sending the G-code content is fine for now.
        });
    });
});

function extractMetadata(data) {
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

    const filamentMatch = data.match(/; filament used = ([\d.]+)mm/);
    const filamentUsed = filamentMatch ? parseFloat(filamentMatch[1]) : 0;
    const weight = calculateFilamentWeight(filamentUsed);

    return {
        printTimeMinutes: totalMinutes.toFixed(1),
        filamentWeightGrams: weight.toFixed(2)
    };
}

function calculateFilamentWeight(length, diameter = 1.75, density = 1.24) {
    const radius = diameter / 2;
    const crossSectionalArea = Math.PI * radius * radius;
    const volume = (length * crossSectionalArea) / 1000;
    return volume * density;
}

app.listen(port, () => {
    console.log(`Slicer API listening at http://localhost:${port}`);
});
