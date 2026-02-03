const mongoose = require("mongoose");

const TranscriptionSchema = new mongoose.Schema(
  {
    originalFileName: { type: String, required: true },
    audioPath: { type: String, required: true },
    transcriptionText: { type: String, required: true },
    provider: { type: String, default: "custom" },
    durationSeconds: { type: Number },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Transcription", TranscriptionSchema);

