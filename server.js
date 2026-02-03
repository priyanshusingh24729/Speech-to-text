require("dotenv").config({ override: true });
const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const axios = require("axios");

const connectDB = require("./config/db");
const Transcription = require("./models/Transcription");

const app = express();
const BASE_PORT = Number(process.env.PORT || 5000);

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Multer storage for audio uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
});

// Health check
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Speech-to-Text API is running" });
});

/**
 * Helper: call external Speech-to-Text API using your API key.
 *
 * NOTE:
 * - This is written to be provider-agnostic.
 * - Set SPEECH_API_URL in .env to your provider's endpoint.
 * - The API key you provided is used as a Bearer token.
 */
async function callSpeechToTextAPI(audioFilePath) {
  const apiKey = process.env.SPEECH_API_KEY;
  // Default to Deepgram listen endpoint if not set
  const apiUrl =
    process.env.SPEECH_API_URL || "https://api.deepgram.com/v1/listen";

  if (!apiKey) {
    throw new Error("SPEECH_API_KEY is not set in .env");
  }

  const audioStream = fs.createReadStream(audioFilePath);

  const response = await axios.post(apiUrl, audioStream, {
    headers: {
      Authorization: `Token ${apiKey}`, // Deepgram expects "Token" scheme
      "Content-Type": "application/octet-stream",
    },
    params: {
      model: "nova-2", // Deepgram model (can be adjusted)
      smart_format: true,
    },
    maxBodyLength: Infinity,
  });

  // Deepgram format: results.channels[0].alternatives[0].transcript
  const dg = response.data;
  const text =
    dg?.results?.channels?.[0]?.alternatives?.[0]?.transcript ||
    JSON.stringify(dg);

  return {
    text,
    raw: response.data,
  };
}

// POST /api/transcribe - upload audio, send to STT API, store in MongoDB
app.post("/api/transcribe", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file uploaded" });
    }

    const filePath = req.file.path;
    const originalFileName = req.file.originalname;

    // Call external STT provider
    const { text } = await callSpeechToTextAPI(filePath);

    // Save transcription in MongoDB
    const doc = await Transcription.create({
      originalFileName,
      audioPath: filePath,
      transcriptionText: text,
    });

    res.status(201).json({
      message: "Transcription created successfully",
      transcription: doc,
    });
  } catch (error) {
    console.error("Error in /api/transcribe:", error.message);
    res.status(500).json({
      error: "Failed to transcribe audio",
      details: error.message,
    });
  }
});

// GET /api/transcriptions - fetch history from MongoDB
app.get("/api/transcriptions", async (req, res) => {
  try {
    const docs = await Transcription.find().sort({ createdAt: -1 }).lean();
    res.json(docs);
  } catch (error) {
    console.error("Error in /api/transcriptions:", error.message);
    res.status(500).json({ error: "Failed to fetch transcriptions" });
  }
});

function startServer(port, attemptsLeft = 10) {
  const server = app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE" && attemptsLeft > 0) {
      console.warn(
        `Port ${port} is already in use. Trying ${port + 1}... (${attemptsLeft} attempts left)`
      );
      startServer(port + 1, attemptsLeft - 1);
      return;
    }

    console.error("Server failed to start:", err);
    process.exit(1);
  });
}

startServer(BASE_PORT);

