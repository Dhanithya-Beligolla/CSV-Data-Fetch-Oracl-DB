# Face Video Backend (Oracle)

A simple Node.js backend for uploading and streaming videos. Switched from MongoDB/GridFS to Oracle DB with disk storage while keeping the same API routes.

## Requirements
- Node.js 18+
- Oracle Database (or Autonomous DB). Install Node-OracleDB driver prerequisites.

## Environment
Create a `.env` file based on `.env.example`:

```
PORT=5000
DB_USER=YOUR_USER
DB_PASSWORD=YOUR_PASSWORD
DB_CONNECT_STRING=host:port/service
```

The app will auto-create the `videos` table on start if it doesn't exist.

## Install and run

```powershell
# Install dependencies
npm install

# Dev mode with auto-reload
npm run dev

# Or start
npm start
```

## API
Base URL: `http://localhost:5000`

- POST `/api/videos/upload` — form-data key `video` (file). Returns stored metadata.
- GET `/api/videos/all` — list all stored videos metadata.
- GET `/api/videos/stream/:filename` — stream the video by stored filename (supports Range requests).

## Storage
- Files saved under `./uploads/` with a prefixed, sanitized filename.
- Metadata saved in Oracle table `VIDEOS`.

## Notes
- If you change `uploads` path, update it in both `server.js` and `routes/videoRoutes.js`.
- Ensure Oracle credentials and client prerequisites are configured before starting.
