import React, { useEffect, useRef, useState } from "react";

export default function Recorder({ onAudioReady, disabled }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    if (!("MediaRecorder" in window) || !navigator.mediaDevices) {
      setIsSupported(false);
    }
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const file = new File([blob], `recording-${Date.now()}.webm`, {
          type: "audio/webm",
        });
        onAudioReady(file);
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setIsSupported(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  if (!isSupported) {
    return (
      <p className="text-sm text-rose-400">
        Microphone recording is not supported in this browser.
      </p>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={isRecording ? stopRecording : startRecording}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
        isRecording
          ? "bg-rose-600 hover:bg-rose-500 text-white"
          : "bg-emerald-600 hover:bg-emerald-500 text-white"
      } disabled:opacity-60 disabled:cursor-not-allowed`}
    >
      <span
        className={`h-2.5 w-2.5 rounded-full ${
          isRecording ? "bg-rose-300 animate-pulse" : "bg-emerald-300"
        }`}
      />
      {isRecording ? "Stop Recording" : "Record Audio"}
    </button>
  );
}

