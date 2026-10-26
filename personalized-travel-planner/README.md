# Personalized Travel Itinerary Planner

A full-stack starter prototype for personalized day-by-day trip planning.

## Stack
- Frontend: React + Vite
- Backend: FastAPI
- Optional persistence: Supabase (environment variables are included as placeholders)
- Itinerary generation: deterministic demo generator, with a clear place to connect a generative-AI provider

> This is a runnable prototype, not a production travel booking service. Recommendations, prices, and travel times are illustrative. It does not book hotels, reserve restaurants, or verify live availability.

## Requirements
- Python 3.10+
- Node.js 18+
- Optional: Supabase project and API credentials

## Run the backend
```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```
API docs: http://127.0.0.1:8000/docs

## Run the frontend
Open a second terminal:
```bash
cd frontend
npm install
npm run dev
```
Visit the URL shown by Vite (usually http://localhost:5173).

## Supabase setup (optional)
Create a Supabase project and add `SUPABASE_URL` and `SUPABASE_KEY` to `backend/.env`. The current prototype works without Supabase; persistence is local to the browser for saved trips. Connect Supabase in `backend/main.py` before using this for multi-user deployment.

## AI integration
The demo generator in `backend/main.py` creates structured example itineraries without an external API key. To connect an LLM, replace `build_itinerary()` with a provider call and validate its output against the Pydantic response models. Never put secret API keys in frontend code.

## Included features
- Trip form: destination, dates, budget, travel style, group size, interests
- Day-wise itinerary generation
- Estimated cost breakdown
- Save trips in browser local storage
- Responsive dashboard and regenerate action
- FastAPI health endpoint and itinerary API
