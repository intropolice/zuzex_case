#!/usr/bin/env python
"""
Simple HTTP Backend Server for Digital Pet
Runs without FastAPI/Uvicorn dependencies
"""
import json
import random
import sqlite3
from datetime import datetime
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse
import os

# Ensure we're in the right directory
os.chdir(os.path.dirname(os.path.abspath(__file__)))

DATABASE = '../digital_pet.db'
DECAY_INTERVAL_SECONDS = 20


def _parse_dt(value):
    if not value:
        return datetime.now()
    try:
        return datetime.fromisoformat(value)
    except ValueError:
        return datetime.now()


def _get_latest_pet_id(cursor):
    cursor.execute('SELECT MAX(id) FROM pet')
    row = cursor.fetchone()
    return row[0] if row and row[0] is not None else None


def update_pet_stats(pet_id):
    """Автоматически обновляет показатели питомца с учетом времени."""
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()

    cursor.execute(
        'SELECT hunger, energy, mood, health, status, last_update FROM pet WHERE id = ?',
        (pet_id,),
    )
    row = cursor.fetchone()

    if not row:
        conn.close()
        return

    hunger, energy, mood, health, status, last_update = row

    if status == 'dead' or health <= 0:
        cursor.execute(
            """
            UPDATE pet
            SET health = 0, status = 'dead', last_update = ?
            WHERE id = ?
            """,
            (datetime.now().isoformat(), pet_id),
        )
        conn.commit()
        conn.close()
        return

    now = datetime.now()
    last_dt = _parse_dt(last_update)
    ticks = int((now - last_dt).total_seconds() // DECAY_INTERVAL_SECONDS)

    if ticks <= 0:
        conn.close()
        return

    for _ in range(ticks):
        # Все шкалы кроме здоровья убывают сами по себе на 1-2 единицы.
        hunger = min(100, hunger + random.randint(1, 2))
        energy = max(0, energy - random.randint(1, 2))
        mood = max(0, mood - random.randint(1, 2))

    # Если любая из шкал достигла критического значения, здоровье медленно падает.
    if hunger >= 100 or energy <= 0 or mood <= 0:
        health = max(0, health - ticks)

    status = 'dead' if health <= 0 else 'healthy'

    cursor.execute(
        """
        UPDATE pet
        SET hunger = ?, energy = ?, mood = ?, health = ?, status = ?, last_update = ?
        WHERE id = ?
        """,
        (hunger, energy, mood, health, status, now.isoformat(), pet_id),
    )

    conn.commit()
    conn.close()


def init_db():
    """Initialize database if it doesn't exist"""
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS pet (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            hunger INTEGER DEFAULT 50,
            energy INTEGER DEFAULT 100,
            mood INTEGER DEFAULT 50,
            health INTEGER DEFAULT 100,
            status TEXT DEFAULT 'healthy',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            last_update TEXT DEFAULT CURRENT_TIMESTAMP
        )
        """
    )

    cursor.execute('PRAGMA table_info(pet)')
    columns = {row[1] for row in cursor.fetchall()}
    if 'last_update' not in columns:
        cursor.execute("ALTER TABLE pet ADD COLUMN last_update TEXT")
        cursor.execute(
            "UPDATE pet SET last_update = ? WHERE last_update IS NULL",
            (datetime.now().isoformat(),),
        )
    if 'status' not in columns:
        cursor.execute("ALTER TABLE pet ADD COLUMN status TEXT DEFAULT 'healthy'")

    conn.commit()
    conn.close()


class PetRequestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed_path = urlparse(self.path)

        # CORS headers
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

        if parsed_path.path == '/':
            response = {'message': 'Digital Pet API', 'status': 'running'}
        elif parsed_path.path == '/pet':
            response = self.get_pet()
        else:
            response = {'error': 'Not found'}

        self.wfile.write(json.dumps(response).encode())

    def do_POST(self):
        parsed_path = urlparse(self.path)
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode()
        data = {}
        if body:
            try:
                data = json.loads(body)
            except Exception:
                data = {}

        # CORS headers
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()

        if parsed_path.path == '/pet':
            try:
                response = self.create_pet(data.get('name', 'Pet'))
            except Exception:
                response = {'error': 'Invalid JSON'}
        elif parsed_path.path == '/pet/feed':
            response = self.feed_pet(data.get('amount', 30))
        elif parsed_path.path == '/pet/play':
            response = self.play_pet()
        elif parsed_path.path == '/pet/sleep':
            response = self.sleep_pet()
        elif parsed_path.path == '/pet/heal':
            response = self.heal_pet()
        else:
            response = {'error': 'Not found'}

        self.wfile.write(json.dumps(response).encode())

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def get_pet(self):
        conn = sqlite3.connect(DATABASE)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        pet_id = _get_latest_pet_id(cursor)
        if pet_id is not None:
            update_pet_stats(pet_id)

        cursor.execute('SELECT * FROM pet ORDER BY id DESC LIMIT 1')
        row = cursor.fetchone()
        conn.close()

        if row:
            return {
                'id': row['id'],
                'name': row['name'],
                'hunger': int(row['hunger']),
                'energy': int(row['energy']),
                'mood': int(row['mood']),
                'health': int(row['health']),
                'status': row['status'],
                'created_at': row['created_at'],
            }
        return {
            'error': 'No pet found',
            'hunger': 50,
            'energy': 100,
            'mood': 50,
            'health': 100,
            'status': 'healthy',
        }

    def create_pet(self, name):
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        now = datetime.now().isoformat()
        cursor.execute(
            """
            INSERT INTO pet (name, hunger, energy, mood, health, status, created_at, last_update)
            VALUES (?, 50, 100, 50, 100, 'healthy', ?, ?)
            """,
            (name, now, now),
        )
        conn.commit()
        pet_id = cursor.lastrowid
        conn.close()
        return {
            'id': pet_id,
            'name': name,
            'hunger': 50,
            'energy': 100,
            'mood': 50,
            'health': 100,
            'status': 'healthy',
        }

    def feed_pet(self, amount=30):
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        pet_id = _get_latest_pet_id(cursor)

        if pet_id is None:
            conn.close()
            return {'error': 'No pet found'}

        update_pet_stats(pet_id)
        cursor.execute('SELECT status FROM pet WHERE id = ?', (pet_id,))
        row = cursor.fetchone()
        if row and row[0] == 'dead':
            conn.close()
            return self.get_pet()

        try:
            safe_amount = int(amount)
        except (TypeError, ValueError):
            safe_amount = 30
        safe_amount = max(1, min(100, safe_amount))

        cursor.execute(
            """
            UPDATE pet
            SET hunger = MAX(0, hunger - ?), last_update = ?
            WHERE id = ?
            """,
            (safe_amount, datetime.now().isoformat(), pet_id),
        )
        conn.commit()
        conn.close()
        return self.get_pet()

    def play_pet(self):
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        pet_id = _get_latest_pet_id(cursor)

        if pet_id is None:
            conn.close()
            return {'error': 'No pet found'}

        update_pet_stats(pet_id)
        cursor.execute('SELECT status FROM pet WHERE id = ?', (pet_id,))
        row = cursor.fetchone()
        if row and row[0] == 'dead':
            conn.close()
            return self.get_pet()

        cursor.execute(
            """
            UPDATE pet
            SET energy = MAX(0, energy - 20),
                mood = MIN(100, mood + 20),
                hunger = MIN(100, hunger + 10),
                last_update = ?
            WHERE id = ?
            """,
            (datetime.now().isoformat(), pet_id),
        )
        conn.commit()
        conn.close()
        return self.get_pet()

    def sleep_pet(self):
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        pet_id = _get_latest_pet_id(cursor)

        if pet_id is None:
            conn.close()
            return {'error': 'No pet found'}

        update_pet_stats(pet_id)
        cursor.execute('SELECT status FROM pet WHERE id = ?', (pet_id,))
        row = cursor.fetchone()
        if row and row[0] == 'dead':
            conn.close()
            return self.get_pet()

        cursor.execute(
            """
            UPDATE pet
            SET energy = MIN(100, energy + 50),
                hunger = MIN(100, hunger + 8),
                last_update = ?
            WHERE id = ?
            """,
            (datetime.now().isoformat(), pet_id),
        )
        conn.commit()
        conn.close()
        return self.get_pet()

    def heal_pet(self):
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        pet_id = _get_latest_pet_id(cursor)

        if pet_id is None:
            conn.close()
            return {'error': 'No pet found'}

        update_pet_stats(pet_id)
        cursor.execute('SELECT status FROM pet WHERE id = ?', (pet_id,))
        row = cursor.fetchone()
        if row and row[0] == 'dead':
            conn.close()
            return self.get_pet()

        cursor.execute(
            """
            UPDATE pet
            SET health = MIN(100, health + 30), last_update = ?
            WHERE id = ?
            """,
            (datetime.now().isoformat(), pet_id),
        )
        conn.commit()
        conn.close()
        return self.get_pet()

    def log_message(self, format, *args):
        # Suppress default logging
        pass


if __name__ == '__main__':
    init_db()
    server = HTTPServer(('0.0.0.0', 8000), PetRequestHandler)
    print('✓ Digital Pet Backend Server running on http://localhost:8000')
    print('✓ Endpoints: GET /pet, POST /pet, POST /pet/feed, POST /pet/play, POST /pet/sleep, POST /pet/heal')
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\n✓ Server stopped')
