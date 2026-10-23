import io
import json
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pypdf import PdfReader

import config
import database
import gemini_service

app = FastAPI(
    title="LearnMate API - Google AI Hackathon",
    description="Adaptive AI-powered learning companion using Gemini 3.8 Flash",
    version="1.0.0"
)

# CORS middleware for local Vite frontend or remote hosting
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for hackathon demo flexibility
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Models
class AuthRegisterRequest(BaseModel):
    email: str
    password: str
    name: Optional[str] = ""

class AuthLoginRequest(BaseModel):
    email: str
    password: str

class AuthUpdateProfileRequest(BaseModel):
    email: str
    name: str

class TextUploadRequest(BaseModel):
    title: str
    content: str

class ExplainRequest(BaseModel):
    material_id: Optional[str] = None
    material_text: Optional[str] = None
    concept: Optional[str] = None
    language: str = "english"

class QuizGenerateRequest(BaseModel):
    material_id: Optional[str] = None
    material_text: Optional[str] = None
    num_questions: int = 5

class QuizEvaluateRequest(BaseModel):
    quiz_id: Optional[str] = None
    material_id: Optional[str] = None
    material_text: Optional[str] = None
    questions: List[dict]
    user_answers: List[int]

class RevisionPlanRequest(BaseModel):
    material_id: Optional[str] = None
    material_text: Optional[str] = None
    weak_topics: List[dict]
    language: str = "english"

class AudioSummaryRequest(BaseModel):
    material_id: Optional[str] = None
    material_text: Optional[str] = None
    weak_topics: Optional[List[str]] = None
    language: str = "english"

class ChatRequest(BaseModel):
    material_id: Optional[str] = None
    material_text: Optional[str] = None
    question: str
    language: str = "english"

# Root Health Check
@app.get("/")
def health_check():
    return {
        "status": "online",
        "service": "LearnMate API",
        "model": "gemini-3.8-flash",
        "endpoints": [
            "/api/upload-pdf",
            "/api/upload-text",
            "/api/explain",
            "/api/quiz/generate",
            "/api/quiz/evaluate",
            "/api/revision-plan",
            "/api/audio-summary",
            "/api/chat",
            "/api/progress/{material_id}"
        ]
    }

# Authentication Endpoints (Persistent SQLite Backend)
@app.post("/api/auth/register")
def register_user(req: AuthRegisterRequest):
    if not req.email or "@" not in req.email:
        raise HTTPException(status_code=400, detail="Please enter a valid email address.")
    if len(req.password) < 4:
        raise HTTPException(status_code=400, detail="Password must be at least 4 characters.")
    try:
        user = database.create_user(req.email, req.password, req.name or "")
        return {"success": True, "user": user}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/auth/login")
def login_user(req: AuthLoginRequest):
    user = database.authenticate_user(req.email, req.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    return {"success": True, "user": user}

@app.post("/api/auth/profile")
def update_profile(req: AuthUpdateProfileRequest):
    if not req.email:
        raise HTTPException(status_code=400, detail="Email is required.")
    user = database.update_user_profile(req.email, req.name)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return {"success": True, "user": user}

# 1. Upload Material (PDF)
@app.post("/api/upload-pdf")
async def upload_pdf(file: UploadFile = File(...), title: Optional[str] = Form(None)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    contents = await file.read()
    reader = PdfReader(io.BytesIO(contents))
    
    pages = []
    full_text_parts = []
    for idx, page in enumerate(reader.pages):
        page_num = idx + 1
        page_text = page.extract_text() or ""
        pages.append({
            "page_number": page_num,
            "text": page_text
        })
        full_text_parts.append(f"--- [Page {page_num}] ---\n{page_text}")
        
    full_text = "\n\n".join(full_text_parts)
    doc_title = title or file.filename.replace(".pdf", "")
    
    material_id = database.save_material(doc_title, full_text, pages)
    
    return {
        "material_id": material_id,
        "title": doc_title,
        "page_count": len(pages),
        "total_characters": len(full_text),
        "pages": pages
    }

# 2. Upload Material (Pasted Text)
@app.post("/api/upload-text")
def upload_text(payload: TextUploadRequest):
    if not payload.content.strip():
        raise HTTPException(status_code=400, detail="Study material text cannot be empty.")
        
    # Synthesize page sections (approx 350 words per page)
    words = payload.content.split()
    page_size = 350
    pages = []
    for i in range(0, max(len(words), 1), page_size):
        chunk = " ".join(words[i:i + page_size])
        page_num = (i // page_size) + 1
        pages.append({
            "page_number": page_num,
            "text": chunk
        })
        
    material_id = database.save_material(payload.title, payload.content, pages)
    return {
        "material_id": material_id,
        "title": payload.title,
        "page_count": len(pages),
        "total_characters": len(payload.content),
        "pages": pages
    }

# 3. Simple Concept Explanations with Page References & Hindi Toggle
@app.post("/api/explain")
def explain(payload: ExplainRequest):
    text = payload.material_text
    if payload.material_id:
        mat = database.get_material(payload.material_id)
        if mat:
            text = mat["raw_text"]
            
    if not text:
        raise HTTPException(status_code=400, detail="Either material_id or material_text is required.")
        
    explanation = gemini_service.explain_concept(text, payload.concept, payload.language)
    return explanation

# 4. Generate Diagnostic Quiz
@app.post("/api/quiz/generate")
def create_quiz(payload: QuizGenerateRequest):
    text = payload.material_text
    mat_id = payload.material_id or "inline"
    if payload.material_id:
        mat = database.get_material(payload.material_id)
        if mat:
            text = mat["raw_text"]
            
    if not text:
        raise HTTPException(status_code=400, detail="Either material_id or material_text is required.")
        
    quiz_data = gemini_service.generate_quiz(text, payload.num_questions)
    quiz_id = database.save_quiz(mat_id, quiz_data.get("quiz_title", "Diagnostic Quiz"), quiz_data["questions"])
    quiz_data["quiz_id"] = quiz_id
    return quiz_data

# 5. Evaluate Quiz & Diagnose Weak Topics
@app.post("/api/quiz/evaluate")
def evaluate_quiz(payload: QuizEvaluateRequest):
    text = payload.material_text
    mat_id = payload.material_id or "inline"
    if payload.material_id:
        mat = database.get_material(payload.material_id)
        if mat:
            text = mat["raw_text"]
            
    if not text:
        raise HTTPException(status_code=400, detail="Either material_id or material_text is required.")
        
    evaluation = gemini_service.evaluate_quiz(text, payload.questions, payload.user_answers)
    
    # Save attempt in database for progress tracking
    attempt_id = database.save_quiz_attempt(
        quiz_id=payload.quiz_id or "adhoc",
        material_id=mat_id,
        score=evaluation["score"],
        total_questions=evaluation["total"],
        weak_topics=evaluation["weak_topics_analysis"],
        answers=[{"q_idx": i, "selected": a} for i, a in enumerate(payload.user_answers)]
    )
    evaluation["attempt_id"] = attempt_id
    return evaluation

# 6. Generate Personalized Revision Plan & Targeted Practice
@app.post("/api/revision-plan")
def create_revision_plan(payload: RevisionPlanRequest):
    text = payload.material_text
    mat_id = payload.material_id or "inline"
    if payload.material_id:
        mat = database.get_material(payload.material_id)
        if mat:
            text = mat["raw_text"]
            
    if not text:
        raise HTTPException(status_code=400, detail="Either material_id or material_text is required.")
        
    plan = gemini_service.generate_personalized_revision_plan(text, payload.weak_topics, payload.language)
    
    # Save plan in database
    if mat_id != "inline":
        weak_topic_names = [wt.get("topic", "") for wt in payload.weak_topics]
        database.save_revision_plan(mat_id, plan, weak_topic_names)
        
    return plan

# 7. Audio / Spoken Revision Summary (NotebookLM style)
@app.post("/api/audio-summary")
def get_audio_summary(payload: AudioSummaryRequest):
    text = payload.material_text
    if payload.material_id:
        mat = database.get_material(payload.material_id)
        if mat:
            text = mat["raw_text"]
            
    if not text:
        raise HTTPException(status_code=400, detail="Either material_id or material_text is required.")
        
    summary = gemini_service.generate_spoken_summary(text, payload.weak_topics, payload.language)
    return summary

# 8. Grounded Q&A Chat with Hallucination Guard
@app.post("/api/chat")
def chat_grounded(payload: ChatRequest):
    text = payload.material_text
    if payload.material_id:
        mat = database.get_material(payload.material_id)
        if mat:
            text = mat["raw_text"]
            
    if not text:
        raise HTTPException(status_code=400, detail="Either material_id or material_text is required.")
        
    answer = gemini_service.answer_grounded_question(text, payload.question, payload.language)
    return answer

# 9. Get Progress & Quiz Attempt History Across Attempts
@app.get("/api/progress/{material_id}")
def get_progress(material_id: str):
    attempts = database.get_material_attempts(material_id)
    plan_data = database.get_revision_plan(material_id)
    return {
        "material_id": material_id,
        "total_attempts": len(attempts),
        "attempts": attempts,
        "latest_revision_plan": plan_data["plan"] if plan_data else None,
        "latest_weak_topics": plan_data["weak_topics"] if plan_data else []
    }
