# BidServe - Service Marketplace MVP

BidServe is a two-sided marketplace where consumers can post service requests (plumbing, electrical, etc.), set their own budget, and receive offers from providers. The platform supports price negotiation and in-app messaging.

## Project Structure
- `/backend`: Node.js + Express API, SQLite database (Turso).
- `/frontend`: React + Vite + Tailwind CSS web application.
- `/product-design`: Brand identity, wireframes, and UI mockups.

## Features
- **User Authentication**: JWT-based secure login and registration (Consumer/Provider roles).
- **Service Requests**: Consumers can create requests with descriptions, budgets, voice notes, and geolocation.
- **Provider Feed**: Providers can browse open requests nearby.
- **Negotiation System**: Real-time bidding, counter-offers, and acceptance flow.
- **Messaging**: Built-in chat for consumers and providers to discuss details.
- **Voice Notes**: Multi-part audio upload support for hands-free task description.

## Deployment & Local Setup

### Full Stack (Docker Compose)
Run the entire application locally using Docker:
```bash
docker-compose up --build
```
- Frontend: `http://localhost`
- Backend: `http://localhost:3001`

### Backend Deployment
The backend is dockerized and ready for cloud providers (Railway, Render, Fly.io).
1. Navigate to `/backend`.
2. Build the image: `docker build -t bidserve-backend .`
3. Run: `docker run -p 3001:3001 bidserve-backend`

**Environment Variables:**
- `PORT`: Server port (default 3001).
- `JWT_SECRET`: Secret key for authentication.

### Frontend Deployment (Vercel/Netlify)
The frontend is optimized for Vercel deployment.
1. Connect the `/frontend` directory to Vercel.
2. Update `vercel.json` with your production backend URL.
3. Deploy.

## Testing
A comprehensive integration test script is available in the backend folder:
```bash
cd backend
./test-integration.sh
```
This script verifies the full end-to-end flow from registration to transaction completion.
