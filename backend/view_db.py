import sqlite3
import os
import json

db_path = os.path.abspath("backend/learnmate.db")
print("=" * 60)
print("LEARNMATE BACKEND DATABASE INSPECTOR")
print("=" * 60)
print(f"Database Path : {db_path}")
print(f"File Exists   : {os.path.exists(db_path)}")
if os.path.exists(db_path):
    print(f"File Size     : {os.path.getsize(db_path):,} bytes")

conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row
cur = conn.cursor()

# 1. Tables overview
cur.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
tables = [r["name"] for r in cur.fetchall()]
print(f"\nDiscovered Tables ({len(tables)}):")
for t in tables:
    cur.execute(f"SELECT COUNT(*) as c FROM {t}")
    count = cur.fetchone()["c"]
    print(f"  • {t:<20} -> {count} records")

# 2. Schema for quiz tables
print("\n" + "=" * 60)
print("QUIZ-RELATED TABLE SCHEMAS")
print("=" * 60)
for t in ["quizzes", "quiz_attempts", "revision_plans"]:
    cur.execute(f"SELECT sql FROM sqlite_master WHERE type='table' AND name='{t}'")
    row = cur.fetchone()
    if row:
        print(f"\n--- Table: {t} ---")
        print(row["sql"])

# 3. Quizzes Table Sample
print("\n" + "=" * 60)
print("QUIZZES STORED IN BACKEND (`quizzes` table)")
print("=" * 60)
cur.execute("SELECT id, material_id, title, length(questions_json) as bytes, created_at FROM quizzes ORDER BY created_at DESC LIMIT 5")
rows = cur.fetchall()
if rows:
    for r in rows:
        print(f"ID          : {r['id']}")
        print(f"Material ID : {r['material_id']}")
        print(f"Title       : {r['title']}")
        print(f"Created At  : {r['created_at']}")
        print(f"Data Size   : {r['bytes']} bytes")
        print("-" * 40)
else:
    print("No quizzes saved in `quizzes` table yet.")

# 4. Quiz Attempts Sample
print("\n" + "=" * 60)
print("STUDENT QUIZ ATTEMPTS (`quiz_attempts` table)")
print("=" * 60)
cur.execute("SELECT id, quiz_id, material_id, score, total_questions, weak_topics_json, created_at FROM quiz_attempts ORDER BY created_at DESC LIMIT 5")
rows = cur.fetchall()
if rows:
    for r in rows:
        print(f"Attempt ID  : {r['id']}")
        print(f"Quiz ID     : {r['quiz_id']}")
        print(f"Score       : {r['score']} / {r['total_questions']}")
        print(f"Weak Topics : {r['weak_topics_json']}")
        print(f"Timestamp   : {r['created_at']}")
        print("-" * 40)
else:
    print("No quiz attempts recorded in `quiz_attempts` yet.")

conn.close()
