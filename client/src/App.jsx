import React, { useEffect, useState } from "react";
import axios from "axios";
import Recorder from "./components/Recorder.jsx";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5006";

export default function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [history, setHistory] = useState([]);

  const loadHistory = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/transcriptions`);
      setHistory(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setCurrentTranscript("");
    setError("");
  };

  const handleRecordedAudio = (file) => {
    setSelectedFile(file);
    setCurrentTranscript("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Please choose or record an audio file first.");
      return;
    }

    const formData = new FormData();
    formData.append("audio", selectedFile);

    try {
      setIsUploading(true);
      setError("");
      setCurrentTranscript("");

      const res = await axios.post(`${API_BASE}/api/transcribe`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.transcription?.transcriptionText) {
        setCurrentTranscript(res.data.transcription.transcriptionText);
      }

      await loadHistory();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error ||
          "Something went wrong while transcribing the audio."
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10 md:px-8">
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className=" bg-gradient-to-r from-brand-400 to-emerald-400 bg-clip-text text-3xl font-semibold text-transparent md:text-4xl">
              Speech to Text Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Upload or record audio, send it to your Speech-to-Text API, and
              store the transcriptions in MongoDB.
            </p>
          </div>
          <div className="mt-3 flex items-center gap-2 md:mt-0">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-xs text-slate-400">
              Backend: <code className="text-xs text-slate-300">{API_BASE}</code>
            </span>
          </div>
        </header>

        <main className="grid gap-6 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl shadow-slate-950/50 backdrop-blur">
            <h2 className="text-lg font-medium text-slate-50">
              Upload or Record Audio
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Choose an audio file or use your microphone to record a short
              clip, then send it to the backend for transcription.
            </p>

            <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-3 rounded-xl bg-slate-900/80 p-4">
                <label className="text-xs font-medium text-slate-300">
                  Audio file
                </label>
                <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-dashed border-slate-700 bg-slate-900/60 px-4 py-3 text-sm text-slate-300 hover:border-brand-500 hover:bg-slate-900/80">
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {selectedFile ? selectedFile.name : "Choose audio file"}
                    </span>
                    <span className="mt-0.5 text-xs text-slate-500">
                      Supported types depend on your Speech-to-Text provider
                    </span>
                  </div>
                  <span className="rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-slate-50">
                    Browse
                  </span>
                  <input
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>

                <div className="flex items-center justify-between gap-3">
                  <Recorder
                    disabled={isUploading}
                    onAudioReady={handleRecordedAudio}
                  />
                  {selectedFile && (
                    <p className="truncate text-xs text-emerald-300">
                      Selected: {selectedFile.name}
                    </p>
                  )}
                </div>
              </div>

              {error && (
                <p className="text-sm text-rose-400 bg-rose-950/40 border border-rose-900/60 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isUploading || !selectedFile}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-slate-50 shadow-lg shadow-brand-950/50 transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUploading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-transparent" />
                    Transcribing...
                  </>
                ) : (
                  "Send to Speech-to-Text API"
                )}
              </button>
            </form>

            <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950/40 p-4">
              <h3 className="text-sm font-semibold text-slate-100">
                Current transcription
              </h3>
              <div className="mt-2 min-h-[80px] rounded-lg bg-slate-900/80 p-3 text-sm text-slate-200">
                {currentTranscript
                  ? currentTranscript
                  : "Run a transcription to see the result here."}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl shadow-slate-950/50 backdrop-blur">
            <h2 className="text-lg font-medium text-slate-50">
              Transcription history
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              These entries are loaded from your MongoDB database via the
              backend.
            </p>

            <div className="mt-4 space-y-3 overflow-y-auto rounded-xl bg-slate-950/40 p-3 max-h-[420px]">
              {history.length === 0 && (
                <p className="text-xs text-slate-500">
                  No transcriptions yet. They will appear here after you run
                  them.
                </p>
              )}

              {history.map((item) => (
                <article
                  key={item._id}
                  className="group rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-xs text-slate-200 transition hover:border-brand-500 hover:bg-slate-900"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate font-medium text-slate-100">
                      {item.originalFileName}
                    </p>
                    <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-400">
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-3 text-slate-300">
                    {item.transcriptionText}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

