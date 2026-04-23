const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

admin.initializeApp();
const db = admin.firestore();
const storage = admin.storage().bucket();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Auth Middleware
const validateFirebaseIdToken = async (req, res, next) => {
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
        return res.status(403).send('Unauthorized');
    }
    const idToken = req.headers.authorization.split('Bearer ')[1];
    try {
        const decodedIdToken = await admin.auth().verifyIdToken(idToken);
        req.user = decodedIdToken;
        next();
    } catch (error) {
        res.status(403).send('Unauthorized');
    }
};

// Memory-based multer for Cloud Functions
const upload = multer({ storage: multer.memoryStorage() });

// Configuration (Should be set via firebase functions:config:set slicer.url="...")
const SLICER_SERVICE_URL = functions.config().slicer?.url || "http://localhost:8080";

/**
 * POST /api/jobs
 * Creates a new slicing job. Handles queuing and limits.
 */
app.post("/jobs", validateFirebaseIdToken, upload.single("file"), async (req, res) => {
    try {
        const userId = req.user.uid;
        const file = req.file;

        if (!file) return res.status(400).send("No file uploaded.");

        // Check user's active jobs (Enforce Free Tier Limits)
        const activeJobs = await db.collection("jobs")
            .where("userId", "==", userId)
            .where("status", "in", ["pending", "slicing"])
            .get();

        if (activeJobs.size >= 2) {
            return res.status(429).json({ error: "Concurrent job limit reached (Free Tier: 2 active jobs max)." });
        }

        const jobId = uuidv4();
        const fileName = `${userId}/${jobId}_${file.originalname}`;
        const blob = storage.file(fileName);

        // Upload to Storage
        await blob.save(file.buffer, { contentType: file.mimetype });
        const [url] = await blob.getSignedUrl({ action: 'read', expires: '03-01-2500' });

        // Create Job Record
        const jobData = {
            id: jobId,
            userId: userId,
            status: "pending",
            fileName: file.originalname,
            stlUrl: url,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            metadata: null,
            gcodeUrl: null
        };

        await db.collection("jobs").doc(jobId).set(jobData);

        // Trigger Slicer (Asynchronously or via Pub/Sub for true queuing, 
        // but for this modular API we'll trigger and update status)
        triggerSlicing(jobId, jobData, file.buffer, file.originalname);

        res.status(201).json({ jobId, status: "pending" });
    } catch (error) {
        console.error("Error creating job:", error);
        res.status(500).send(error.message);
    }
});

async function triggerSlicing(jobId, jobData, fileBuffer, originalName) {
    try {
        await db.collection("jobs").doc(jobId).update({ status: "slicing" });

        // Call Slicer Container (Cloud Run)
        const formData = new URLSearchParams(); 
        // Note: Slicer service expects multipart, using axios with buffer
        const FormData = require('form-data');
        const form = new FormData();
        form.append('file', fileBuffer, { filename: originalName });

        const response = await axios.post(`${SLICER_SERVICE_URL}/slice`, form, {
            headers: form.getHeaders(),
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });

        const { gcode, metadata } = response.data;

        // Upload G-code to storage
        const gcodeFileName = `${jobData.userId}/${jobId}_${originalName.replace('.stl', '.gcode')}`;
        const gcodeBlob = storage.file(gcodeFileName);
        await gcodeBlob.save(gcode, { contentType: 'text/plain' });
        const [gcodeUrl] = await gcodeBlob.getSignedUrl({ action: 'read', expires: '03-01-2500' });

        // Update Job Record
        await db.collection("jobs").doc(jobId).update({
            status: "completed",
            metadata: metadata,
            gcodeUrl: gcodeUrl
        });

    } catch (error) {
        console.error(`[${jobId}] Slicing failed:`, error.message);
        await db.collection("jobs").doc(jobId).update({ status: "failed", error: error.message });
    }
}

/**
 * GET /api/jobs
 * Returns user's job history
 */
app.get("/jobs", validateFirebaseIdToken, async (req, res) => {
    const userId = req.user.uid;
    const snapshot = await db.collection("jobs")
        .where("userId", "==", userId)
        .orderBy("createdAt", "desc")
        .limit(20)
        .get();

    const jobs = [];
    snapshot.forEach(doc => jobs.push(doc.data()));
    res.json(jobs);
});

exports.api = functions.https.onRequest(app);
