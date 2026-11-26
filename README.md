# THETA LIFE — ATLAS AI Starter v0.1

A tiny Node/Express backend and browser test page that sends chat messages to OpenAI Responses API.

## Setup
1. Install Node.js 20+.
2. Copy `.env.example` to `.env` and add your API key. Keep `.env` private; never place the key in browser code.
3. In this folder run:
   ```bash
   npm install
   npm start
   ```
4. Open http://localhost:3000

## API endpoints
- `GET /api/health` — basic server status (reports whether key is configured)
- `POST /api/chat` — body `{ "message": "...", "history": [{"role":"user|assistant","content":"..."}] }`

The browser sends a short recent conversation history. This starter intentionally does not persist chats. Before production, replace the in-memory IP limiter with a shared, robust rate limiter; add authentication, abuse monitoring, request logging that excludes message content, privacy controls, and a reviewed deployment configuration. Set `OPENAI_MODEL` to a model available to your API project.
