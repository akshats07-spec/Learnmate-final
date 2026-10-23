import sqlite3
import json
import uuid
import hashlib
from typing import Dict, Any, List, Optional
from datetime import datetime, date
from config import DB_PATH

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def hash_password(password: str) -> str:
    salt = "learnmate_salt_2026"
    return hashlib.sha256((password + salt).encode('utf-8')).hexdigest()

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    
    # Users table for real credential storage and per-user streak
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        streak_days INTEGER DEFAULT 1,
        study_minutes INTEGER DEFAULT 0,
        last_active_date TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Alter table if existing without columns
    for col, ctype in [
        ("streak_days", "INTEGER DEFAULT 1"),
        ("study_minutes", "INTEGER DEFAULT 0"),
        ("last_active_date", "TEXT"),
    ]:
        try:
            cursor.execute(f"ALTER TABLE users ADD COLUMN {col} {ctype}")
        except Exception:
            pass
    
    # Study materials table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS materials (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        raw_text TEXT NOT NULL,
        pages_json TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # Quizzes table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS quizzes (
        id TEXT PRIMARY KEY,
        material_id TEXT NOT NULL,
        title TEXT NOT NULL,
        questions_json TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (material_id) REFERENCES materials (id)
    )
    """)
    
    # Quiz attempts table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS quiz_attempts (
        id TEXT PRIMARY KEY,
        quiz_id TEXT NOT NULL,
        material_id TEXT NOT NULL,
        score INTEGER NOT NULL,
        total_questions INTEGER NOT NULL,
        weak_topics_json TEXT NOT NULL,
        answers_json TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (quiz_id) REFERENCES quizzes (id),
        FOREIGN KEY (material_id) REFERENCES materials (id)
    )
    """)
    
    # Revision plans table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS revision_plans (
        id TEXT PRIMARY KEY,
        material_id TEXT NOT NULL UNIQUE,
        plan_json TEXT NOT NULL,
        weak_topics_json TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (material_id) REFERENCES materials (id)
    )
    """)
    
    conn.commit()
    conn.close()

# Database Helper Functions
def save_material(title: str, raw_text: str, pages: List[Dict[str, Any]]) -> str:
    conn = get_connection()
    cursor = conn.cursor()
    material_id = str(uuid.uuid4())
    cursor.execute(
        "INSERT INTO materials (id, title, raw_text, pages_json) VALUES (?, ?, ?, ?)",
        (material_id, title, raw_text, json.dumps(pages))
    )
    conn.commit()
    conn.close()
    return material_id

def get_material(material_id: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM materials WHERE id = ?", (material_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    return {
        "id": row["id"],
        "title": row["title"],
        "raw_text": row["raw_text"],
        "pages": json.loads(row["pages_json"]),
        "created_at": row["created_at"]
    }

def save_quiz(material_id: str, title: str, questions: List[Dict[str, Any]]) -> str:
    conn = get_connection()
    cursor = conn.cursor()
    quiz_id = str(uuid.uuid4())
    cursor.execute(
        "INSERT INTO quizzes (id, material_id, title, questions_json) VALUES (?, ?, ?, ?)",
        (quiz_id, material_id, title, json.dumps(questions))
    )
    conn.commit()
    conn.close()
    return quiz_id

def get_quiz(quiz_id: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM quizzes WHERE id = ?", (quiz_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    return {
        "id": row["id"],
        "material_id": row["material_id"],
        "title": row["title"],
        "questions": json.loads(row["questions_json"]),
        "created_at": row["created_at"]
    }

def record_quiz_attempt(quiz_id: str, material_id: str, score: int, total_questions: int, weak_topics: List[str], answers: List[int]) -> str:
    conn = get_connection()
    cursor = conn.cursor()
    attempt_id = str(uuid.uuid4())
    cursor.execute(
        "INSERT INTO quiz_attempts (id, quiz_id, material_id, score, total_questions, weak_topics_json, answers_json) VALUES (?, ?, ?, ?, ?, ?, ?)",
        (attempt_id, quiz_id, material_id, score, total_questions, json.dumps(weak_topics), json.dumps(answers))
    )
    conn.commit()
    conn.close()
    return attempt_id

def get_material_attempts(material_id: str) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM quiz_attempts WHERE material_id = ? ORDER BY created_at ASC", (material_id,))
    rows = cursor.fetchall()
    conn.close()
    attempts = []
    for r in rows:
        attempts.append({
            "id": r["id"],
            "score": r["score"],
            "total_questions": r["total_questions"],
            "weak_topics": json.loads(r["weak_topics_json"]),
            "answers": json.loads(r["answers_json"]),
            "created_at": r["created_at"]
        })
    return attempts

def save_revision_plan(material_id: str, plan_data: Dict[str, Any], weak_topics: List[str]) -> str:
    conn = get_connection()
    cursor = conn.cursor()
    plan_id = str(uuid.uuid4())
    cursor.execute("""
        INSERT INTO revision_plans (id, material_id, plan_json, weak_topics_json, updated_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(material_id) DO UPDATE SET
            plan_json = excluded.plan_json,
            weak_topics_json = excluded.weak_topics_json,
            updated_at = CURRENT_TIMESTAMP
    """, (plan_id, material_id, json.dumps(plan_data), json.dumps(weak_topics)))
    conn.commit()
    conn.close()
    return plan_id

def get_revision_plan(material_id: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM revision_plans WHERE material_id = ?", (material_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    return {
        "id": row["id"],
        "material_id": row["material_id"],
        "plan": json.loads(row["plan_json"]),
        "weak_topics": json.loads(row["weak_topics_json"]),
        "updated_at": row["updated_at"]
    }

def create_user(email: str, password: str, name: str) -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM users WHERE email = ?", (email.lower().strip(),))
    if cursor.fetchone():
        conn.close()
        raise ValueError("An account with this email already exists.")
    user_id = str(uuid.uuid4())
    pw_hash = hash_password(password)
    display_name = name.strip() if name and name.strip() else email.split('@')[0]
    today_str = date.today().isoformat()
    # New user starts with exactly 1 day streak and 0 study minutes
    cursor.execute(
        "INSERT INTO users (id, email, password_hash, name, streak_days, study_minutes, last_active_date) VALUES (?, ?, ?, ?, 1, 0, ?)",
        (user_id, email.lower().strip(), pw_hash, display_name, today_str)
    )
    conn.commit()
    conn.close()
    return {
        "id": user_id,
        "email": email.lower().strip(),
        "name": display_name,
        "streak_days": 1,
        "study_minutes": 0,
        "last_active_date": today_str
    }

def authenticate_user(email: str, password: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    pw_hash = hash_password(password)
    cursor.execute(
        "SELECT id, email, name, streak_days, study_minutes, last_active_date FROM users WHERE email = ? AND password_hash = ?",
        (email.lower().strip(), pw_hash)
    )
    row = cursor.fetchone()
    if not row:
        conn.close()
        return None

    user_id = row["id"]
    current_streak = row["streak_days"] or 1
    current_minutes = row["study_minutes"] or 0
    last_active = row["last_active_date"]
    today_str = date.today().isoformat()

    # Calculate real consecutive days streak
    if last_active != today_str:
        if last_active:
            try:
                last_d = date.fromisoformat(last_active)
                diff = (date.today() - last_d).days
                if diff == 1:
                    current_streak += 1  # Consecutive day login!
                elif diff > 1:
                    current_streak = 1  # Streak reset
            except Exception:
                current_streak = 1
        else:
            current_streak = 1

        cursor.execute(
            "UPDATE users SET streak_days = ?, last_active_date = ? WHERE id = ?",
            (current_streak, today_str, user_id)
        )
        conn.commit()

    conn.close()
    return {
        "id": user_id,
        "email": row["email"],
        "name": row["name"],
        "streak_days": current_streak,
        "study_minutes": current_minutes,
        "last_active_date": today_str
    }

def update_user_profile(email: str, name: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE users SET name = ? WHERE email = ?",
        (name.strip(), email.lower().strip())
    )
    conn.commit()
    cursor.execute(
        "SELECT id, email, name, streak_days, study_minutes, last_active_date FROM users WHERE email = ?",
        (email.lower().strip(),)
    )
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    return {
        "id": row["id"],
        "email": row["email"],
        "name": row["name"],
        "streak_days": row["streak_days"],
        "study_minutes": row["study_minutes"],
        "last_active_date": row["last_active_date"]
    }

# Initialize tables when imported
init_db()
