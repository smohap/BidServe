# BidServe Backend API

Base URL: `http://<host>:3001`

## Authentication
### POST /api/auth/register
Register a new user.
- Body: `{"name", "email", "password", "phone", "role", "latitude", "longitude"}` (role: 'consumer' or 'provider')

### POST /api/auth/login
Login and get JWT token.
- Body: `{"email", "password"}`
- Returns: `{"token", "user"}`

## Service Requests
### GET /api/requests
List all service requests.
- Query: `consumer_id` (optional)
- Auth: Required

### POST /api/requests
Create a new service request.
- Body: `{"title", "description", "budget", "voice_note_url", "latitude", "longitude"}`
- Auth: Required

### GET /api/requests/:id
View a specific request.
- Auth: Required

### PUT /api/requests/:id
Update a request (consumer only).
- Body: `{"title", "description", "budget", "status", "latitude", "longitude"}`
- Auth: Required

### POST /api/requests/:id/offers
Make an offer for a request (provider only).
- Body: `{"price", "message"}`
- Auth: Required

### GET /api/requests/:id/offers
List offers for a request.
- Auth: Required

### POST /api/requests/:id/messages
Send a message in a request thread.
- Body: `{"content"}`
- Auth: Required

### GET /api/requests/:id/messages
Get the message thread for a request.
- Auth: Required

## Offers
### PUT /api/offers/:id
Accept, reject, or counter an offer.
- Body: `{"status", "price", "message"}` (status: 'accepted', 'rejected', 'countered')
- Auth: Required

## Provider Feed
### GET /api/providers/feed
Available requests for providers (status: 'open').
- Auth: Required

## File Uploads
### POST /api/upload/voice
Upload an audio file (voice note).
- Content-Type: `multipart/form-data`
- Body: `audio` (file field)
- Auth: Required
- Returns: `{"url", "filename"}`

## Deployment
### Local with Docker Compose
To run the full stack locally using Docker:
1. Ensure you have Docker and Docker Compose installed.
2. In the root directory (`/home/team/shared/`), run:
   ```bash
   docker-compose up --build
   ```
3. The frontend will be available at `http://localhost` and the backend at `http://localhost:3001`.

### Backend Dockerfile
The backend `Dockerfile` uses Node 20-slim. It installs dependencies and starts the server on port 3001.
**Note**: The current database implementation relies on the `team-db` CLI. For production deployment, you should replace `db.js` with a real Turso/SQLite driver and provide connection details via environment variables.

### Frontend Deployment (Vercel)
A `vercel.json` file is provided in the `frontend` directory. It handles:
- SPA routing (redirecting all non-API requests to `index.html`).
- Proxying `/api` and `/uploads` requests to the backend.
**Note**: Update the destination URLs in `vercel.json` with your actual backend production URL.
