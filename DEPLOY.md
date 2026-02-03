# Deploy Speech-to-Text on Vercel (and Render)

Your app has two parts:

- **Frontend** (React + Vite in `client/`) → deploy on **Vercel**
- **Backend** (Node + Express in project root) → deploy on **Render** (or Railway / Fly.io), because Vercel runs serverless functions, not a long-running server with file uploads

Use **MongoDB Atlas** (cloud) for the database so both frontend and backend can reach it.

---

## 1. Backend on Render (free tier)

1. **Push your code to GitHub** (if you haven’t already).
   - Do **not** commit `.env`. Use Render’s environment variables instead.

2. **MongoDB Atlas**
   - Create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
   - Create a database user and get the connection string (e.g. `mongodb+srv://user:pass@cluster.mongodb.net/speech_to_text`).
   - Add your IP (or `0.0.0.0/0` for “allow from anywhere”) in Network Access.

3. **Render**
   - Go to [render.com](https://render.com) and sign in with GitHub.
   - **New → Web Service**.
   - Connect the repo (e.g. `your-username/speech`).
   - Settings:
     - **Root Directory**: leave empty (backend is at repo root).
     - **Runtime**: Node.
     - **Build Command**: `npm install`
     - **Start Command**: `node server.js` or `npm start`
     - **Instance Type**: Free (or paid if you need more).
   - **Environment** (in Render dashboard):
     - `PORT` = `5000` (Render sets this; you can leave it or override.)
     - `MONGODB_URI` = your Atlas connection string.
     - `SPEECH_API_KEY` = your Deepgram API key.
     - `SPEECH_API_URL` = leave empty or `https://api.deepgram.com/v1/listen`
   - Deploy. Note the URL, e.g. `https://your-app-name.onrender.com`.

4. **CORS**
   - Your backend already uses `cors()`. If your Vercel domain is different (e.g. `https://speech-xxx.vercel.app`), you can restrict origins in `server.js` later; for now the default allows all.

---

## 2. Frontend on Vercel

1. **Vercel**
   - Go to [vercel.com](https://vercel.com) and sign in with GitHub.

2. **Import project**
   - **Add New → Project** and select the same repo.
   - **Root Directory**: set to **`client`** (so Vercel builds the React app).
   - **Framework Preset**: Vite (should be auto-detected).
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

3. **Environment variable**
   - In the project’s **Settings → Environment Variables**, add:
     - **Name**: `VITE_API_URL`
     - **Value**: `https://your-app-name.onrender.com` (the Render URL from step 1, **no** trailing slash)
   - Redeploy so the new env is used (Deployments → … → Redeploy).

4. **Deploy**
   - Click Deploy. Your app will be at e.g. `https://speech-xxx.vercel.app`.

---

## 3. Check

- Open the Vercel URL. Upload or record audio and transcribe; it should call the Render backend and store results in MongoDB Atlas.
- If you get **CORS** or **network** errors, confirm:
  - `VITE_API_URL` is exactly the Render URL (no trailing slash).
  - Backend is live: open `https://your-app-name.onrender.com/` in the browser; you should see `{"status":"ok",...}`.

---

## 4. Optional: backend only on Render, no Vercel

If you only want the backend on the cloud and will run the frontend locally:

- Deploy the backend to Render as above.
- Locally in `client/`, create `.env` with:
  - `VITE_API_URL=https://your-app-name.onrender.com`
- Run `npm run dev` in `client/` and use the app against the Render API.

---

## Summary

| Part      | Where    | URL / Env |
|----------|----------|-----------|
| Frontend | Vercel   | Set `VITE_API_URL` = Render URL |
| Backend  | Render   | Set `MONGODB_URI`, `SPEECH_API_KEY` (and optional `SPEECH_API_URL`) |
| Database | MongoDB Atlas | Use Atlas URI in `MONGODB_URI` on Render |
