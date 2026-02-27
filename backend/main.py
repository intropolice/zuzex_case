from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))
try:
    from database import get_db, Base, engine
    from models import Pet
except ImportError:
    from .database import get_db, Base, engine
    from .models import Pet
from pydantic import BaseModel
from datetime import datetime

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Digital Pet API")

# Добавляем CORS для фронтенда
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to Digital Pet API", "docs": "/docs"}

class PetCreate(BaseModel):
    name: str

class PetState(BaseModel):
    name: str
    hunger: float
    mood: float
    energy: float
    status: str

def update_stats(pet: Pet):
    now = datetime.utcnow()
    time_passed_minutes = (now - pet.last_update).total_seconds() / 60
    pet.hunger = max(0, pet.hunger - time_passed_minutes * 0.5)
    pet.mood = max(0, pet.mood - time_passed_minutes * 0.3)
    pet.energy = max(0, pet.energy - time_passed_minutes * 0.3)
    pet.last_update = now

def get_status(pet: Pet) -> str:
    avg = (pet.hunger + pet.mood + pet.energy) / 3
    if avg > 80:
        return "Happy"
    elif avg > 50:
        return "Okay"
    else:
        return "Sad"

@app.post("/pet/create")
def create_pet(pet_data: PetCreate, user_id: str = None, db: Session = Depends(get_db)):
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id query parameter is required")
    pet = db.query(Pet).filter(Pet.user_id == user_id).first()
    if pet:
        raise HTTPException(status_code=400, detail="Pet already exists")
    pet = Pet(user_id=user_id, name=pet_data.name)
    db.add(pet)
    db.commit()
    db.refresh(pet)
    return PetState(
        name=pet.name,
        hunger=round(pet.hunger, 1),
        mood=round(pet.mood, 1),
        energy=round(pet.energy, 1),
        status=get_status(pet)
    )

@app.get("/pet/state", response_model=PetState)
def get_pet_state(user_id: str = None, db: Session = Depends(get_db)):
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id query parameter is required")
    pet = db.query(Pet).filter(Pet.user_id == user_id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")
    update_stats(pet)
    db.commit()
    return PetState(
        name=pet.name,
        hunger=round(pet.hunger, 1),
        mood=round(pet.mood, 1),
        energy=round(pet.energy, 1),
        status=get_status(pet)
    )

@app.post("/pet/feed")
def feed_pet(user_id: str = None, db: Session = Depends(get_db)):
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id query parameter is required")
    pet = db.query(Pet).filter(Pet.user_id == user_id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")
    update_stats(pet)
    pet.hunger = min(100, pet.hunger + 30)
    pet.mood = min(100, pet.mood + 10)
    db.commit()
    db.refresh(pet)
    return PetState(
        name=pet.name,
        hunger=round(pet.hunger, 1),
        mood=round(pet.mood, 1),
        energy=round(pet.energy, 1),
        status=get_status(pet)
    )

@app.post("/pet/play")
def play_with_pet(user_id: str = None, db: Session = Depends(get_db)):
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id query parameter is required")
    pet = db.query(Pet).filter(Pet.user_id == user_id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")
    update_stats(pet)
    pet.mood = min(100, pet.mood + 30)
    pet.energy = max(0, pet.energy - 10)
    db.commit()
    db.refresh(pet)
    return PetState(
        name=pet.name,
        hunger=round(pet.hunger, 1),
        mood=round(pet.mood, 1),
        energy=round(pet.energy, 1),
        status=get_status(pet)
    )

@app.post("/pet/sleep")
def put_pet_to_sleep(user_id: str = None, db: Session = Depends(get_db)):
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id query parameter is required")
    pet = db.query(Pet).filter(Pet.user_id == user_id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")
    update_stats(pet)
    pet.energy = min(100, pet.energy + 50)
    pet.hunger = max(0, pet.hunger - 5)
    db.commit()
    db.refresh(pet)
    return PetState(
        name=pet.name,
        hunger=round(pet.hunger, 1),
        mood=round(pet.mood, 1),
        energy=round(pet.energy, 1),
        status=get_status(pet)
    )

@app.post("/pet/heal")
def heal_pet(user_id: str = None, db: Session = Depends(get_db)):
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id query parameter is required")
    pet = db.query(Pet).filter(Pet.user_id == user_id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")
    update_stats(pet)
    pet.hunger = 100
    pet.mood = 100
    pet.energy = 100
    db.commit()
    db.refresh(pet)
    return PetState(
        name=pet.name,
        hunger=round(pet.hunger, 1),
        mood=round(pet.mood, 1),
        energy=round(pet.energy, 1),
        status=get_status(pet)
    )
