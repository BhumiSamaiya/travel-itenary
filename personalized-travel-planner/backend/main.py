from datetime import date, timedelta
from typing import List
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="Personalized Travel Itinerary Planner", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TripRequest(BaseModel):
    destination: str = Field(min_length=2, max_length=100)
    start_date: date
    end_date: date
    budget: float = Field(gt=0)
    travel_style: str = "Balanced"
    group_size: int = Field(default=1, ge=1, le=20)
    interests: List[str] = []

class Activity(BaseModel):
    time: str
    title: str
    description: str
    estimated_cost: float
    category: str

class ItineraryDay(BaseModel):
    day: int
    date: date
    title: str
    activities: List[Activity]

class TripResponse(BaseModel):
    destination: str
    days: List[ItineraryDay]
    estimated_total: float
    budget: float
    note: str

def build_itinerary(req: TripRequest) -> TripResponse:
    """Illustrative offline generator; swap this function for a validated LLM call."""
    duration = (req.end_date - req.start_date).days + 1
    interests = [x.lower() for x in req.interests]
    destination = req.destination.strip().title()
    templates = [
        ("09:00", "Local breakfast & coffee", "Start slowly at a well-reviewed local café.", 12, "Food"),
        ("10:30", "Historic city walk", "Explore a walkable landmark district and take photos.", 0, "Culture"),
        ("13:00", "Regional lunch spot", "Try a popular local dish; check opening hours before visiting.", 18, "Food"),
        ("15:00", "Museum or scenic viewpoint", "Choose a nearby attraction that fits your interests.", 15, "Sightseeing"),
        ("18:00", "Sunset stroll", "Leave time to relax and enjoy the surroundings.", 0, "Outdoors"),
        ("20:00", "Dinner near your stay", "Pick a convenient dining option and confirm prices locally.", 25, "Food"),
    ]
    if "adventure" in interests:
        templates[3] = ("15:00", "Outdoor adventure", "Choose a reputable local guided activity if available.", 22, "Adventure")
    if "nature" in interests or "scenic" in interests:
        templates[4] = ("18:00", "Scenic park or waterfront", "Enjoy a relaxed walk at a nearby natural spot.", 0, "Nature")
    if req.travel_style.lower() in ("relaxed", "slow"):
        templates = templates[::2] + [templates[-1]]
    per_person = sum(x[3] for x in templates)
    days = []
    for i in range(max(0, duration)):
        current = req.start_date + timedelta(days=i)
        activities = [
            Activity(time=t, title=title, description=f"{description} Suggested for {destination}.",
                     estimated_cost=round(cost * req.group_size, 2), category=category)
            for t, title, description, cost, category in templates
        ]
        days.append(ItineraryDay(day=i+1, date=current, title=f"Day {i+1} · Explore {destination}", activities=activities))
    total = round(per_person * duration * req.group_size, 2)
    return TripResponse(
        destination=destination, days=days, estimated_total=total, budget=req.budget,
        note="Demo estimates only. Verify local prices, transport times, opening hours, and availability before travel."
    )

@app.get("/api/health")
def health():
    return {"status": "ok", "service": "travel-planner-api"}

@app.post("/api/itinerary", response_model=TripResponse)
def generate_itinerary(req: TripRequest):
    if req.end_date < req.start_date:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="End date must be on or after start date.")
    if (req.end_date - req.start_date).days > 13:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Prototype supports trips up to 14 days.")
    return build_itinerary(req)
