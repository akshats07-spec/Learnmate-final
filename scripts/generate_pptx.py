import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def build_presentation():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Color Palette (Modern Dark Slate / Cyber Executive)
    BG_DARK = RGBColor(15, 23, 42)       # Slate 900
    BG_CARD = RGBColor(30, 41, 59)       # Slate 800
    CARD_BORDER = RGBColor(51, 65, 85)   # Slate 700
    PRIMARY = RGBColor(99, 102, 241)     # Indigo 500
    CYAN = RGBColor(6, 182, 212)         # Cyan 500
    EMERALD = RGBColor(16, 185, 129)     # Emerald 500
    AMBER = RGBColor(245, 158, 11)       # Amber 500
    TEXT_LIGHT = RGBColor(248, 250, 252) # Slate 50
    TEXT_MUTED = RGBColor(148, 163, 184) # Slate 400

    def add_bg(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
        bg.fill.solid()
        bg.fill.fore_color.rgb = BG_DARK
        bg.line.fill.background() # no line
        return bg

    def add_header(slide, title_text, category="LEARNMATE AI PRESENTATION", speaker=None):
        add_bg(slide)

        # Category pill
        cat_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.45), Inches(8), Inches(0.4))
        tf_cat = cat_box.text_frame
        tf_cat.word_wrap = True
        p_cat = tf_cat.paragraphs[0]
        p_cat.text = category.upper()
        p_cat.font.size = Pt(11)
        p_cat.font.bold = True
        p_cat.font.color.rgb = CYAN

        # Title
        t_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.75), Inches(11.5), Inches(0.8))
        tf = t_box.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title_text
        p.font.size = Pt(28)
        p.font.bold = True
        p.font.color.rgb = TEXT_LIGHT

        # Speaker badge (if provided)
        if speaker:
            badge = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(9.8), Inches(0.45), Inches(2.7), Inches(0.5))
            badge.fill.solid()
            badge.fill.fore_color.rgb = PRIMARY
            badge.line.color.rgb = PRIMARY
            btf = badge.text_frame
            bp = btf.paragraphs[0]
            bp.text = f"🎤 {speaker}"
            bp.font.size = Pt(11)
            bp.font.bold = True
            bp.font.color.rgb = TEXT_LIGHT
            bp.alignment = PP_ALIGN.CENTER

    def add_card(slide, left, top, width, height, title, items, badge_text=None, border_color=CARD_BORDER):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = BG_CARD
        card.line.color.rgb = border_color
        card.line.width = Pt(1.5)

        tf = card.text_frame
        tf.word_wrap = True
        tf.margin_left = Inches(0.3)
        tf.margin_right = Inches(0.3)
        tf.margin_top = Inches(0.3)
        tf.margin_bottom = Inches(0.3)

        if badge_text:
            p_badge = tf.paragraphs[0]
            p_badge.text = badge_text.upper()
            p_badge.font.size = Pt(10)
            p_badge.font.bold = True
            p_badge.font.color.rgb = CYAN
            p_title = tf.add_paragraph()
        else:
            p_title = tf.paragraphs[0]

        p_title.text = title
        p_title.font.size = Pt(16)
        p_title.font.bold = True
        p_title.font.color.rgb = TEXT_LIGHT
        p_title.space_after = Pt(10)

        for item in items:
            p_item = tf.add_paragraph()
            p_item.text = f"•  {item}"
            p_item.font.size = Pt(12)
            p_item.font.color.rgb = TEXT_MUTED
            p_item.space_after = Pt(6)

    # ==========================================
    # SLIDE 1: TITLE SLIDE
    # ==========================================
    s1 = prs.slides.add_slide(blank_layout)
    add_bg(s1)

    # Accent decorative bar
    bar = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.5), Inches(0.15), Inches(3.2))
    bar.fill.solid()
    bar.fill.fore_color.rgb = PRIMARY
    bar.line.fill.background()

    # Title box
    t1_box = s1.shapes.add_textbox(Inches(1.2), Inches(1.3), Inches(11), Inches(2.2))
    tf1 = t1_box.text_frame
    tf1.word_wrap = True
    
    p1 = tf1.paragraphs[0]
    p1.text = "LEARNMATE"
    p1.font.size = Pt(46)
    p1.font.bold = True
    p1.font.color.rgb = TEXT_LIGHT

    p2 = tf1.add_paragraph()
    p2.text = "Grounded AI Study Companion & 3D Spatial Knowledge Engine"
    p2.font.size = Pt(22)
    p2.font.bold = True
    p2.font.color.rgb = CYAN
    p2.space_before = Pt(8)

    p3 = tf1.add_paragraph()
    p3.text = "An interactive, multi-sensory learning system with ChatGPT-style document ingestion, dual-coding 3D visualizers, and closed-loop spaced repetition."
    p3.font.size = Pt(14)
    p3.font.color.rgb = TEXT_MUTED
    p3.space_before = Pt(14)

    # 4-Member Badge Grid at Bottom
    members = [
        ("Member 1", "Product & Document Ingestion"),
        ("Member 2", "AI Tutor & Voice UX"),
        ("Member 3", "3D Canvas & Adaptive Quizzes"),
        ("Member 4", "FastAPI, Security & Cloud")
    ]
    for i, (m_name, m_role) in enumerate(members):
        col_left = Inches(0.8 + i * 2.95)
        m_card = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, col_left, Inches(5.2), Inches(2.8), Inches(1.5))
        m_card.fill.solid()
        m_card.fill.fore_color.rgb = BG_CARD
        m_card.line.color.rgb = CARD_BORDER
        mtf = m_card.text_frame
        mtf.margin_top = Inches(0.2)
        mtf.margin_left = Inches(0.2)
        mp1 = mtf.paragraphs[0]
        mp1.text = m_name
        mp1.font.size = Pt(14)
        mp1.font.bold = True
        mp1.font.color.rgb = TEXT_LIGHT
        mp2 = mtf.add_paragraph()
        mp2.text = m_role
        mp2.font.size = Pt(11)
        mp2.font.color.rgb = CYAN
        mp2.space_before = Pt(4)

    # ==========================================
    # SLIDE 2: THE PROBLEM & STUDENT STRUGGLE
    # ==========================================
    s2 = prs.slides.add_slide(blank_layout)
    add_header(s2, "The Learning Crisis: Why Traditional Studying Fails", "PROBLEM STATEMENT", "Member 1 (0:00 - 0:45)")
    add_card(s2, Inches(0.8), Inches(1.8), Inches(3.6), Inches(4.8), 
             "Dense Information Overload", 
             [
                 "Students drown in 100+ page PDFs, technical slides, and manuals before exams.",
                 "Passive highlighting leads to the 'Illusion of Competence' without real recall.",
                 "Reading line-by-line is painfully time-consuming with near-zero long-term retention."
             ], 
             "PAIN POINT 1", RGBColor(239, 68, 68))

    add_card(s2, Inches(4.8), Inches(1.8), Inches(3.6), Inches(4.8), 
             "Generic AI Hallucinations", 
             [
                 "Standard chatbots fabricate facts, equations, and page numbers.",
                 "Students cannot verify where AI answers originated in their course syllabus.",
                 "No pedagogical pacing or conversational sensitivity for struggling learners."
             ], 
             "PAIN POINT 2", RGBColor(239, 68, 68))

    add_card(s2, Inches(8.8), Inches(1.8), Inches(3.6), Inches(4.8), 
             "Zero Spatial Intuition", 
             [
                 "Abstract topics (optics, hardware registers, biochemistry) cannot be mastered by text alone.",
                 "Heavy 3D game engines require GPU installations and are completely inaccessible on student laptops.",
                 "No feedback loop connecting wrong practice answers to a revision schedule."
             ], 
             "PAIN POINT 3", RGBColor(239, 68, 68))

    # ==========================================
    # SLIDE 3: THE LEARNMATE SOLUTION
    # ==========================================
    s3 = prs.slides.add_slide(blank_layout)
    add_header(s3, "The Solution: LearnMate 4-Pillar Learning Ecosystem", "VALUE PROPOSITION", "Member 1 (0:45 - 1:45)")

    add_card(s3, Inches(0.8), Inches(1.8), Inches(2.75), Inches(4.8),
             "1. ChatGPT Ingestion",
             [
                 "Upload PDF/notes with natural language requests.",
                 "Instant executive summaries, formula sheets, or ELIF breakdowns.",
                 "Direct 1-click action buttons."
             ],
             "INGESTION", PRIMARY)

    add_card(s3, Inches(3.85), Inches(1.8), Inches(2.75), Inches(4.8),
             "2. Grounded AI Tutor",
             [
                 "Strict document boundaries backed by Gemini 3.1 Flash.",
                 "Verified page citations and exact verbatim quotes.",
                 "Integrated Web Speech API for voice dictation."
             ],
             "TUTORING", CYAN)

    add_card(s3, Inches(6.9), Inches(1.8), Inches(2.75), Inches(4.8),
             "3. 3D Spatial Vector",
             [
                 "HTML5 Canvas 3D vector engine (<15KB bundle).",
                 "Isometric rotation & zoom for hardware, optics, and cells.",
                 "Rooted in Dual-Coding Theory (+65% retention)."
             ],
             "SPATIAL 3D", EMERALD)

    add_card(s3, Inches(9.95), Inches(1.8), Inches(2.75), Inches(4.8),
             "4. Closed-Loop Mastery",
             [
                 "Real-time diagnostic quizzes compiled from user notes.",
                 "Weak-topic tracker logs mistakes automatically.",
                 "Builds a personalized 3-Day Spaced Repetition plan."
             ],
             "REVISION", AMBER)

    # ==========================================
    # SLIDE 4: CHATGPT-STYLE INGESTION & PER-USER STATS
    # ==========================================
    s4 = prs.slides.add_slide(blank_layout)
    add_header(s4, "Feature 1: ChatGPT-Style Ingestion & Per-User Telemetry", "INGESTION & ONBOARDING", "Member 1 (1:00 - 1:45)")

    add_card(s4, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.8),
             "ChatGPT-Style Prompted Upload",
             [
                 "Interactive Prompt Input Bar directly embedded in Library.",
                 "One-Click Prompt Chips:",
                 "  • ⚡ Quick Executive Summary",
                 "  • 🔑 Key Formulas & Definitions",
                 "  • ❓ Top 5 Likely Exam Questions",
                 "  • 💡 Explain Like I'm 5 (ELIF)",
                 "  • 🎯 5-Question Diagnostic Quiz",
                 "  • 🧊 Create 3D Spatial Model",
                 "Instant Drawer Card: delivers structured markdown with 1-click copy, 'Ask Tutor', 'Take Quiz', or 'Open 3D'."
             ],
             "PROMPT-DRIVEN UPLOAD", PRIMARY)

    add_card(s4, Inches(6.8), Inches(1.8), Inches(5.6), Inches(4.8),
             "Independent Per-User Telemetry",
             [
                 "Eliminated generic static counters: every account starts with authentic stats.",
                 "New User Initialization: strictly 1 Day Streak & 0m Study Time.",
                 "Scoped Local & SQLite Persistence: stats are isolated per account ID.",
                 "Dynamic Course Mastery: tracks completed topics, retention scores, and upcoming spaced review sessions.",
                 "Fully responsive across mobile, tablet, and desktop viewports."
             ],
             "PERSONALIZED TELEMETRY", CYAN)

    # ==========================================
    # SLIDE 5: GROUNDED AI TUTOR & VOICE TYPING
    # ==========================================
    s5 = prs.slides.add_slide(blank_layout)
    add_header(s5, "Feature 2: Grounded AI Tutor & Multimodal Voice Typing", "AI & CONVERSATIONAL UX", "Member 2 (1:45 - 3:30)")

    add_card(s5, Inches(0.8), Inches(1.8), Inches(3.6), Inches(4.8),
             "Zero-Hallucination Guardrails",
             [
                 "Constrained knowledge boundary prompt via Gemini 3.1 Flash Lite.",
                 "Prohibits unsupported assertions.",
                 "Flags missing syllabus content explicitly."
             ],
             "INTELLIGENCE", PRIMARY)

    add_card(s5, Inches(4.8), Inches(1.8), Inches(3.6), Inches(4.8),
             "3-Part Transparent Output",
             [
                 "1. Intuitive Explanation: Plain language conceptual synthesis.",
                 "2. Verified Page Citation: Direct badge linking to the source page.",
                 "3. Direct Quoted Evidence: Verbatim text excerpts for instant fact verification."
             ],
             "EVIDENCE-BASED", CYAN)

    add_card(s5, Inches(8.8), Inches(1.8), Inches(3.6), Inches(4.8),
             "Hands-Free Voice Typing",
             [
                 "Browser Web Speech API (webkitSpeechRecognition) integration.",
                 "Animated pulsating microphone status indicator.",
                 "Conversational Warmth: Handles greetings ('hello', 'how are you?') without rigid error states."
             ],
             "SPEECH UX", EMERALD)

    # ==========================================
    # SLIDE 6: 3D SPATIAL KNOWLEDGE ENGINE
    # ==========================================
    s6 = prs.slides.add_slide(blank_layout)
    add_header(s6, "Feature 3: 3D Spatial Knowledge Engine & Dual Coding", "3D GRAPHICS & COGNITIVE SCIENCE", "Member 3 (3:30 - 4:20)")

    add_card(s6, Inches(0.8), Inches(1.8), Inches(3.6), Inches(4.8),
             "Dual-Coding Science",
             [
                 "Allan Paivio's Dual-Coding Theory proves visual + verbal models boost retention by 65%.",
                 "Converts abstract text into spatial structures students can mentally explore.",
                 "Integrated analogies and instant spatial recall tests."
             ],
             "COGNITIVE SCIENCE", PRIMARY)

    add_card(s6, Inches(4.8), Inches(1.8), Inches(3.6), Inches(4.8),
             "Procedural 3D Canvas",
             [
                 "Ultra-lightweight HTML5 Canvas vector engine (<15KB).",
                 "Zero GPU overhead: runs at 60 FPS on any laptop or phone.",
                 "Full 360° mouse drag orbit, zoom, and dynamic perspective matrices."
             ],
             "VECTOR GRAPHICS", CYAN)

    add_card(s6, Inches(8.8), Inches(1.8), Inches(3.6), Inches(4.8),
             "Topic-Specific Spatial Models",
             [
                 "Computer Hardware: Cybernetic logic grid with illuminated bus lines & registers.",
                 "Optics: Biconvex refraction lens with converging focal rays.",
                 "Biochemistry: Cellular envelopes, cristae folds, and organelle coordinates."
             ],
             "DYNAMIC GENERATION", EMERALD)

    # ==========================================
    # SLIDE 7: REAL-TIME QUIZZES & SPACED REPETITION
    # ==========================================
    s7 = prs.slides.add_slide(blank_layout)
    add_header(s7, "Feature 4: Real-Time Diagnostic Quizzes & Spaced Planner", "ASSESSMENT & REVISION", "Member 3 (4:20 - 5:15)")

    add_card(s7, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.8),
             "Dynamic Document-Specific Quizzes",
             [
                 "No static questions: quizzes are generated in real-time from the uploaded PDF/text.",
                 "High-yield 5-question diagnostic assessments targeting core concepts.",
                 "Instant answer feedback with comprehensive rationales and page references.",
                 "Confidence-weighted scoring to separate lucky guesses from genuine mastery."
             ],
             "ACTIVE RECALL", PRIMARY)

    add_card(s7, Inches(6.8), Inches(1.8), Inches(5.6), Inches(4.8),
             "Closed-Loop Spaced Repetition",
             [
                 "Weak-Topic Matrix: Missed quiz questions are automatically tagged and saved.",
                 "SuperMemo SM-2 Cognitive Algorithm: Computes personalized optimal revision intervals.",
                 "Dynamic 3-Day Micro-Schedule: Focuses study time on verified weak zones.",
                 "Continuous Mastery Loop: Retaking quizzes updates mastery status from 'Needs Review' to 'Mastered'."
             ],
             "RETENTION LOOP", AMBER)

    # ==========================================
    # SLIDE 8: SYSTEM ARCHITECTURE
    # ==========================================
    s8 = prs.slides.add_slide(blank_layout)
    add_header(s8, "Technical Architecture & Data Pipeline", "SYSTEM ARCHITECTURE", "Member 4 (5:15 - 6:00)")

    add_card(s8, Inches(0.8), Inches(1.8), Inches(3.6), Inches(4.8),
             "Frontend & Edge Layer",
             [
                 "Next.js 14 App Router with React Server Components.",
                 "Tailwind CSS + Lucide Icons for responsive UI.",
                 "Internal Reverse Proxy (/api/py/*) mapping directly to FastAPI without CORS issues.",
                 "Web Speech API for audio transcription."
             ],
             "FRONTEND", PRIMARY)

    add_card(s8, Inches(4.8), Inches(1.8), Inches(3.6), Inches(4.8),
             "Compute & AI Engine",
             [
                 "High-throughput asynchronous FastAPI Python backend.",
                 "Google Gemini 3.1 Flash Lite API with sub-second inference.",
                 "Cascading Fallback: routes to gemini-flash or deterministic procedural parser on rate limits."
             ],
             "BACKEND & AI", CYAN)

    add_card(s8, Inches(8.8), Inches(1.8), Inches(3.6), Inches(4.8),
             "Database & Security",
             [
                 "ACID-compliant SQLite database (learnmate.db).",
                 "Salted SHA-256 cryptographic password hashing.",
                 "Session persistence via React AuthProvider.",
                 "Isolated per-user metrics and streak storage."
             ],
             "SECURITY & DATA", EMERALD)

    # ==========================================
    # SLIDE 9: SECURITY, DEPLOYMENT & MONETIZATION
    # ==========================================
    s9 = prs.slides.add_slide(blank_layout)
    add_header(s9, "Deployment, Security & Business Model", "PRODUCTION & ROADMAP", "Member 4 (6:00 - 7:00)")

    add_card(s9, Inches(0.8), Inches(1.8), Inches(3.6), Inches(4.8),
             "Enterprise Security",
             [
                 "Passwords never stored in plaintext — cryptographically salted SHA-256.",
                 "Document uploads stay sandboxed with zero training on proprietary user files.",
                 "Secure local SQLite with parameterized queries preventing SQL injection."
             ],
             "SECURITY", PRIMARY)

    add_card(s9, Inches(4.8), Inches(1.8), Inches(3.6), Inches(4.8),
             "Production Deployment",
             [
                 "Live SSL public deployment via authenticated ngrok v3 reverse tunnel.",
                 "Single unified domain hosting both Next.js and FastAPI services.",
                 "Version-controlled on GitHub: akshats07-spec/Learnmate-final across main and Master."
             ],
             "DEPLOYMENT", CYAN)

    add_card(s9, Inches(8.8), Inches(1.8), Inches(3.6), Inches(4.8),
             "Tiered Monetization",
             [
                 "Freemium Model: Free tier for basic notes; Pro tier for unlimited 3D and quizzes.",
                 "Institutional / Campus Licenses for university cohorts.",
                 "Ready checkout flow integrated for Razorpay and PhonePe gateways."
             ],
             "BUSINESS MODEL", EMERALD)

    # ==========================================
    # SLIDE 10: 4-MEMBER STAGE CHOREOGRAPHY
    # ==========================================
    s10 = prs.slides.add_slide(blank_layout)
    add_header(s10, "4-Member Live Presentation Choreography", "EXECUTION PLAYBOOK", "All Members")

    add_card(s10, Inches(0.8), Inches(1.8), Inches(2.75), Inches(4.8),
             "Member 1 (0:00-1:45)",
             [
                 "Role: Team Lead",
                 "Focus: Problem & Hook",
                 "Screen: /dashboard & /library",
                 "Demo: Prompted PDF upload, 1-click executive summary generation.",
                 "Handoff: 'Over to Member 2 for our Grounded AI Tutor.'"
             ],
             "SPEAKER 1", PRIMARY)

    add_card(s10, Inches(3.85), Inches(1.8), Inches(2.75), Inches(4.8),
             "Member 2 (1:45-3:30)",
             [
                 "Role: AI Lead",
                 "Focus: Tutor & Voice",
                 "Screen: /tutor",
                 "Demo: Voice input, 3-part citation response, conversational greeting.",
                 "Handoff: 'Take it away Member 3 for 3D spatial models.'"
             ],
             "SPEAKER 2", CYAN)

    add_card(s10, Inches(6.9), Inches(1.8), Inches(2.75), Inches(4.8),
             "Member 3 (3:30-5:15)",
             [
                 "Role: 3D & Learning",
                 "Focus: Dual-Coding & Quiz",
                 "Screen: /visuals & /practice",
                 "Demo: 360° 3D orbit, dynamic PDF quiz, weak-topic review schedule.",
                 "Handoff: 'Member 4, walk us through architecture.'"
             ],
             "SPEAKER 3", EMERALD)

    add_card(s10, Inches(9.95), Inches(1.8), Inches(2.75), Inches(4.8),
             "Member 4 (5:15-7:00)",
             [
                 "Role: DevOps Lead",
                 "Focus: Systems & Pitch",
                 "Screen: GitHub & /pricing",
                 "Demo: FastAPI, salted auth, ngrok SSL tunnel, monetization.",
                 "Handoff: 'Thank you, we are ready for Q&A!'"
             ],
             "SPEAKER 4", AMBER)

    # ==========================================
    # SLIDE 11: JUDGE Q&A BATTLECARD
    # ==========================================
    s11 = prs.slides.add_slide(blank_layout)
    add_header(s11, "Judge Q&A Technical Defense Battlecard", "EVALUATION DEFENSE", "All Members")

    add_card(s11, Inches(0.8), Inches(1.8), Inches(5.6), Inches(2.3),
             "Q: How do you prevent AI hallucinations?",
             [
                 "A (Member 2): Two-tier grounding constraints. Gemini is forbidden from using outside world data for factual claims without direct source quotes. Exact page citations and quotes are required."
             ],
             "HALLUCINATIONS", PRIMARY)

    add_card(s11, Inches(6.8), Inches(1.8), Inches(5.6), Inches(2.3),
             "Q: How are 3D models rendered without lag?",
             [
                 "A (Member 3): Lightweight HTML5 Canvas vector engine (<15KB). Uses vector algebra and depth-sorting to achieve 60 FPS on any laptop without heavy WebGL engines."
             ],
             "PERFORMANCE", CYAN)

    add_card(s11, Inches(0.8), Inches(4.3), Inches(5.6), Inches(2.3),
             "Q: What if the Gemini API hits rate limits?",
             [
                 "A (Member 1/4): Automated cascading fallback: routes from gemini-3.1-flash-lite to gemini-flash, and falls back to deterministic local heuristic parsing so users are never blocked."
             ],
                 "RESILIENCE", EMERALD)

    add_card(s11, Inches(6.8), Inches(4.3), Inches(5.6), Inches(2.3),
             "Q: How is user data and auth secured?",
             [
                 "A (Member 4): Passwords use salted SHA-256 hashes in an ACID-compliant SQLite backend. Document text is processed in memory without training public AI models."
             ],
             "SECURITY", AMBER)

    # ==========================================
    # SLIDE 12: CONCLUSION & LIVE LINKS
    # ==========================================
    s12 = prs.slides.add_slide(blank_layout)
    add_bg(s12)

    bar12 = s12.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.8), Inches(0.15), Inches(3.6))
    bar12.fill.solid()
    bar12.fill.fore_color.rgb = EMERALD
    bar12.line.fill.background()

    t12_box = s12.shapes.add_textbox(Inches(1.2), Inches(1.6), Inches(11), Inches(3.8))
    tf12 = t12_box.text_frame
    tf12.word_wrap = True

    p12_1 = tf12.paragraphs[0]
    p12_1.text = "LEARNMATE — REVOLUTIONIZING HOW STUDENTS LEARN"
    p12_1.font.size = Pt(32)
    p12_1.font.bold = True
    p12_1.font.color.rgb = TEXT_LIGHT

    p12_2 = tf12.add_paragraph()
    p12_2.text = "Grounded Intelligence  •  Dual-Coding 3D Models  •  Closed-Loop Spaced Mastery"
    p12_2.font.size = Pt(18)
    p12_2.font.bold = True
    p12_2.font.color.rgb = CYAN
    p12_2.space_before = Pt(8)

    p12_3 = tf12.add_paragraph()
    p12_3.text = "🔗 Live Deployment: https://countless-crystal-lunchtime.ngrok-free.dev\n" \
                 "📂 GitHub Repository: https://github.com/akshats07-spec/Learnmate-final.git\n" \
                 "⚡ Tech Stack: Next.js 14, Python FastAPI, Gemini 3.1 Flash Lite, SQLite, Canvas 3D"
    p12_3.font.size = Pt(15)
    p12_3.font.color.rgb = TEXT_MUTED
    p12_3.space_before = Pt(18)

    p12_4 = tf12.add_paragraph()
    p12_4.text = "Thank you! We look forward to your questions."
    p12_4.font.size = Pt(22)
    p12_4.font.bold = True
    p12_4.font.color.rgb = PRIMARY
    p12_4.space_before = Pt(16)

    # Save presentation
    output_path = os.path.abspath("LearnMate_Hackathon_Presentation.pptx")
    prs.save(output_path)
    print(f"SUCCESS: PowerPoint saved to {output_path}")

if __name__ == "__main__":
    build_presentation()
