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
    return {"message": "Welcome to Digital Pet API", "docs": "/docs", "status": "running"}

class PetCreate(BaseModel):
    name: str

class PetState(BaseModel):
    id: str
    name: str
    hunger: float
    mood: float
    energy: float
    status: str

def update_stats(pet: Pet):
    now = datetime.utcnow()
    time_passed_minutes = (now - pet.last_update).total_seconds() / 60
    pet.hunger = max(0, min(100, pet.hunger - time_passed_minutes * 0.5))
    pet.mood = max(0, min(100, pet.mood - time_passed_minutes * 0.3))
    pet.energy = max(0, min(100, pet.energy - time_passed_minutes * 0.3))
    pet.last_update = now

def get_status(pet: Pet) -> str:
    avg = (pet.hunger + pet.mood + pet.energy) / 3
    if avg > 80:
        return "Happy"
    elif avg > 50:
        return "Okay"
    else:
        return "Sad"

@app.get("/pet")
def get_pet(db: Session = Depends(get_db)):
    """Получить первого питомца (для упрощения)"""
    pet = db.query(Pet).first()
    if not pet:
        raise HTTPException(status_code=404, detail="No pet found. Create one first!")
    update_stats(pet)
    db.commit()
    return {
        "id": pet.id,
        "name": pet.name,
        "hunger": pet.hunger,
        "energy": pet.energy,
        "mood": pet.mood,
        "health": pet.health,
        "status": get_status(pet),
        "lastUpdated": pet.last_update.isoformat() if pet.last_update else None,
        "createdAt": pet.created_at.isoformat() if pet.created_at else None
    }

@app.post("/pet")
def create_pet(pet_data: PetCreate, db: Session = Depends(get_db)):
    """Создать нового питомца"""
    # Удаляем старого питомца если есть
    db.query(Pet).delete()
    db.commit()
    
    pet = Pet(
        name=pet_data.name,
        hunger=50,
        energy=100,
        mood=75,
        health=100
    )
    db.add(pet)
    db.commit()
    db.refresh(pet)
    return {
        "id": pet.id,
        "name": pet.name,
        "hunger": pet.hunger,
        "energy": pet.energy,
        "mood": pet.mood,
        "health": pet.health,
        "status": get_status(pet),
        "message": f"Pet {pet.name} created successfully!"
    }

@app.post("/pet/feed")
def feed_pet(db: Session = Depends(get_db)):
    """Покормить питомца"""
    pet = db.query(Pet).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")
    update_stats(pet)
    pet.hunger = max(0, pet.hunger - 30)
    pet.mood = min(100, pet.mood + 10)
    db.commit()
    return {
        "success": True,
        "pet": {
            "id": pet.id,
            "name": pet.name,
            "hunger": pet.hunger,
            "energy": pet.energy,
            "mood": pet.mood,
            "health": pet.health,
            "status": get_status(pet)
        },
        "message": f"{pet.name} has been fed!"
    }

@app.post("/pet/play")
def play_with_pet(db: Session = Depends(get_db)):
    """Поиграть с питомцем"""
    pet = db.query(Pet).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")
    update_stats(pet)
    pet.mood = min(100, pet.mood + 30)
    pet.energy = max(0, pet.energy - 20)
    pet.hunger = max(0, pet.hunger - 10)
    db.commit()
    return {
        "success": True,
        "pet": {
            "id": pet.id,
            "name": pet.name,
            "hunger": pet.hunger,
            "energy": pet.energy,
            "mood": pet.mood,
            "health": pet.health,
            "status": get_status(pet)
        },
        "message": f"{pet.name} is happy!"
    }

@app.post("/pet/sleep")
def sleep_pet(db: Session = Depends(get_db)):
    """Уложить питомца спать"""
    pet = db.query(Pet).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")
    update_stats(pet)
    pet.energy = min(100, pet.energy + 50)
    pet.hunger = max(0, pet.hunger - 5)
    db.commit()
    return {
        "success": True,
        "pet": {
            "id": pet.id,
            "name": pet.name,
            "hunger": pet.hunger,
            "energy": pet.energy,
            "mood": pet.mood,
            "health": pet.health,
            "status": get_status(pet)
        },
        "message": f"{pet.name} is sleeping zzz..."
    }

@app.post("/pet/heal")
def heal_pet(db: Session = Depends(get_db)):
    """Вылечить питомца"""
    pet = db.query(Pet).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")
    update_stats(pet)
    pet.health = min(100, pet.health + 50)
    pet.mood = min(100, pet.mood + 20)
    db.commit()
    return {
        "success": True,
        "pet": {
            "id": pet.id,
            "name": pet.name,
            "hunger": pet.hunger,
            "energy": pet.energy,
            "mood": pet.mood,
            "health": pet.health,
            "status": get_status(pet)
        },
        "message": f"{pet.name} is healthy now!"
    }

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Digital Pet API Server...")
    print("📍 Server: http://localhost:8000")
    print("📚 Docs: http://localhost:8000/docs")
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
