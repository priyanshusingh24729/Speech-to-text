## Speech-to-Text Backend (MongoDB + External API)

This backend is set up to:

- **Accept audio uploads** via `POST /api/transcribe`
- **Send audio to a Speech-to-Text provider** using an **API key**
- **Store transcriptions in MongoDB**
- **Expose transcription history** via `GET /api/transcriptions`

You can plug this into a React frontend (as described in your PDF) to build the full MERN Speech-to-Text project.

---

### 1. Install dependencies

From the `speech` folder:

```bash
npm install
```

---

### 2. Configure environment (.env)

The `.env` file has been created for you and already includes:

- **MongoDB connection URI**
- **Your Speech-to-Text API key**
- **A placeholder for the provider URL**

```bash
PORT=5000
MONGODB_URI=mongodb://localhost:27017/speech_to_text
SPEECH_API_KEY=c72a468f89936e41ba61562f5c192490a7b8bb24
SPEECH_API_URL=https://your-speech-provider-endpoint.com/v1/transcribe
```

- **Update `MONGODB_URI`** with your actual MongoDB connection string (e.g. from MongoDB Atlas).
- **Update `SPEECH_API_URL`** to your real Speech-to-Text provider endpoint.

> The backend uses your API key by sending it as a `Bearer` token in the `Authorization` header when calling the provider.

---

### 3. Start MongoDB

Make sure MongoDB is running locally, or that your Atlas cluster is accessible.

---

### 4. Run the server

```bash
npm run dev
```

The server will start on `http://localhost:5000`.

---

### 5. API Endpoints

- **Health check**
  - `GET /`

- **Upload & transcribe audio**
  - `POST /api/transcribe`
  - Form-data body:
    - `audio`: the audio file (e.g. `.wav`, `.mp3`)

- **Fetch all transcriptions**
  - `GET /api/transcriptions`

---

### 6. Next steps (Frontend)

To complete the MERN project described in your PDF, you can:

- Create a React app (e.g. with Vite)
- Build a UI that:
  - Lets users upload or record audio
  - Sends the file to `POST /api/transcribe`
  - Displays the transcription and history from `GET /api/transcriptions`

