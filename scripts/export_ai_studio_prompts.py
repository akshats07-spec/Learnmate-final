import json
import os

OUT_DIR = os.path.abspath("google-ai-studio-prompts")
os.makedirs(OUT_DIR, exist_ok=True)

PROMPTS = [
    {
        "id": "1_grounded_tutor_qa",
        "title": "LearnMate — Grounded AI Tutor with Zero-Hallucination Guardrails",
        "model": "gemini-1.5-flash",
        "temperature": 0.1,
        "responseMimeType": "application/json",
        "systemInstruction": (
            "You are LearnMate Grounded Assistant, an award-winning academic tutor.\n"
            "You have strict, uncompromisable instructions to answer student questions ONLY using facts directly stated in the provided Study Material.\n\n"
            "CRITICAL INSTRUCTIONS:\n"
            "1. Check if the requested answer is explicitly contained in or directly inferred from the provided study material.\n"
            "2. IF NOT CONTAINED: Set is_out_of_scope to true, and explain clearly: '⚠️ This information is not available in your uploaded study material.'\n"
            "3. IF CONTAINED: Set is_out_of_scope to false, provide a concise pedagogical answer, cite the exact page/section, and quote the verbatim evidence.\n"
            "4. Provide 2 to 3 logical follow-up questions to help the student continue active learning."
        ),
        "responseSchema": {
            "type": "object",
            "properties": {
                "is_out_of_scope": {"type": "boolean"},
                "answer": {"type": "string"},
                "page_reference": {"type": "string", "nullable": True},
                "quoted_evidence": {"type": "string", "nullable": True},
                "analogy": {"type": "string", "nullable": True},
                "suggested_questions": {
                    "type": "array",
                    "items": {"type": "string"}
                }
            },
            "required": ["is_out_of_scope", "answer", "suggested_questions"]
        },
        "sampleInput": {
            "study_material": (
                "[Page 1] Newton's First Law: An object remains at rest or in uniform motion in a straight line unless acted on by a net external force.\n"
                "[Page 2] Newton's Second Law: Force equals mass times acceleration (F = ma). Acceleration is directly proportional to force.\n"
                "[Page 3] Newton's Third Law: When one body exerts a force on another, the second body exerts an equal and opposite force."
            ),
            "question": "What is Newton's third law and does it apply to rocket propulsion?"
        }
    },
    {
        "id": "2_chatgpt_prompted_ingestion",
        "title": "LearnMate — ChatGPT-Style Prompted PDF / Document Ingestion",
        "model": "gemini-1.5-flash",
        "temperature": 0.3,
        "responseMimeType": "application/json",
        "systemInstruction": (
            "You are LearnMate Ingestion Engine.\n"
            "When a student uploads a study document along with an optional prompt (e.g. 'Quick Executive Summary', 'Key Formulas', 'Top 5 Exam Questions', 'Explain Like I'm 5'), you parse the document, extract key concept clusters, and synthesize a well-formatted markdown response fulfilling the student's request."
        ),
        "responseSchema": {
            "type": "object",
            "properties": {
                "title": {"type": "string"},
                "customResponse": {"type": "string"},
                "topics": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "id": {"type": "string"},
                            "name": {"type": "string"},
                            "pageRef": {"type": "string"},
                            "summary": {"type": "string"},
                            "formulaOrQuote": {"type": "string"},
                            "analogy": {"type": "string"}
                        },
                        "required": ["id", "name", "pageRef", "summary"]
                    }
                }
            },
            "required": ["title", "customResponse", "topics"]
        },
        "sampleInput": {
            "user_prompt": "Quick Executive Summary",
            "document_text": (
                "Cell Energetics & Respiration. Chapter 7.\n"
                "Mitochondria are double-membraned organelles that produce ATP through oxidative phosphorylation.\n"
                "Glycolysis occurs in the cytoplasm producing 2 net ATP and 2 pyruvate molecules.\n"
                "The Krebs cycle operates in the mitochondrial matrix, reducing NAD+ to NADH."
            )
        }
    },
    {
        "id": "3_diagnostic_quiz_generator",
        "title": "LearnMate — Real-Time Diagnostic Quiz Generator with Source Citations",
        "model": "gemini-1.5-flash",
        "temperature": 0.2,
        "responseMimeType": "application/json",
        "systemInstruction": (
            "You are an expert diagnostic exam designer for LearnMate.\n"
            "Generate high-yield multiple-choice questions covering distinct sub-topics of the provided study material.\n"
            "Questions MUST test deep conceptual reasoning and application rather than trivial rote memorization.\n"
            "Every question MUST cite the specific page/paragraph and provide a detailed explanation of why the correct answer is right and distractors are wrong."
        ),
        "responseSchema": {
            "type": "object",
            "properties": {
                "quiz_title": {"type": "string"},
                "questions": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "id": {"type": "integer"},
                            "question": {"type": "string"},
                            "topic": {"type": "string"},
                            "options": {
                                "type": "array",
                                "items": {"type": "string"}
                            },
                            "correct_answer_index": {"type": "integer"},
                            "explanation": {"type": "string"},
                            "page_reference": {"type": "string"}
                        },
                        "required": ["id", "question", "topic", "options", "correct_answer_index", "explanation", "page_reference"]
                    }
                }
            },
            "required": ["quiz_title", "questions"]
        },
        "sampleInput": {
            "document_text": (
                "Optics & Wave Refraction.\n"
                "Snell's Law: n1 * sin(theta1) = n2 * sin(theta2). When light travels from a rarer to a denser medium, it bends towards the normal.\n"
                "Total Internal Reflection occurs when the angle of incidence exceeds the critical angle (sin c = 1/n)."
            ),
            "num_questions": 3
        }
    },
    {
        "id": "4_adaptive_revision_planner",
        "title": "LearnMate — Closed-Loop Diagnostic Evaluator & Spaced Revision Planner",
        "model": "gemini-1.5-flash",
        "temperature": 0.3,
        "responseMimeType": "application/json",
        "systemInstruction": (
            "You are the adaptive cognitive learning coach for LearnMate.\n"
            "When given a student's diagnostic quiz results, pinpoint their misconceptions and build an actionable 3-day spaced repetition revision plan (SuperMemo SM-2 inspired) along with targeted follow-up practice questions."
        ),
        "responseSchema": {
            "type": "object",
            "properties": {
                "plan_title": {"type": "string"},
                "diagnosis_summary": {"type": "string"},
                "priority_focus_areas": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "priority": {"type": "string", "enum": ["HIGH", "MEDIUM", "LOW"]},
                            "topic": {"type": "string"},
                            "misconception": {"type": "string"},
                            "action_item": {"type": "string"},
                            "pages_to_review": {"type": "string"},
                            "key_rule_to_remember": {"type": "string"}
                        },
                        "required": ["priority", "topic", "action_item", "pages_to_review"]
                    }
                },
                "spaced_schedule": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "day": {"type": "string"},
                            "focus": {"type": "string"},
                            "duration_minutes": {"type": "integer"},
                            "checklist": {
                                "type": "array",
                                "items": {"type": "string"}
                            }
                        },
                        "required": ["day", "focus", "duration_minutes", "checklist"]
                    }
                }
            },
            "required": ["plan_title", "diagnosis_summary", "priority_focus_areas", "spaced_schedule"]
        },
        "sampleInput": {
            "weak_topics": [
                {
                    "topic": "Total Internal Reflection",
                    "question": "When does light undergo total internal reflection?",
                    "student_answer": "When moving from rarer to denser medium",
                    "correct_answer": "When moving from denser to rarer medium exceeding critical angle",
                    "page_reference": "Page 4, Section 2.1"
                }
            ]
        }
    },
    {
        "id": "5_spatial_3d_engine_synthesizer",
        "title": "LearnMate — Dual-Coding 3D Spatial Vector Synthesizer",
        "model": "gemini-1.5-flash",
        "temperature": 0.2,
        "responseMimeType": "application/json",
        "systemInstruction": (
            "You are the 3D Spatial Cognition Engine of LearnMate.\n"
            "Your job is to translate abstract academic concepts (optics, hardware registers, cellular organelles, chemical lattices) into 3D vector spatial models for an HTML5 Canvas engine.\n"
            "Output normalized 3D node coordinates [x, y, z] between -70 and +70, component labels, semantic colors, and inter-node vector connections."
        ),
        "responseSchema": {
            "type": "object",
            "properties": {
                "conceptTitle": {"type": "string"},
                "visualType": {"type": "string", "enum": ["tech", "optics", "cell", "molecule"]},
                "explanation": {"type": "string"},
                "analogy": {"type": "string"},
                "breakdown": {
                    "type": "array",
                    "items": {"type": "string"}
                },
                "nodes": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "label": {"type": "string"},
                            "color": {"type": "string"},
                            "x": {"type": "number"},
                            "y": {"type": "number"},
                            "z": {"type": "number"}
                        },
                        "required": ["label", "color", "x", "y", "z"]
                    }
                },
                "connections": {
                    "type": "array",
                    "items": {
                        "type": "array",
                        "items": {"type": "integer"}
                    }
                }
            },
            "required": ["conceptTitle", "visualType", "explanation", "analogy", "breakdown", "nodes", "connections"]
        },
        "sampleInput": {
            "topic": "Convex Lens Optical Ray Convergence",
            "context": "Focal length f = 15cm, real inverted image formation at 2F."
        }
    },
    {
        "id": "6_notebooklm_audio_overview",
        "title": "LearnMate — Spoken Audio Overview & 2-Minute Podcast Script",
        "model": "gemini-1.5-flash",
        "temperature": 0.4,
        "responseMimeType": "application/json",
        "systemInstruction": (
            "You are the host of LearnMate Audio Overview, an interactive audio learning companion inspired by Google NotebookLM.\n"
            "Transform dense academic notes into a conversational, highly engaging 2-minute spoken dialogue between two mentors (Alex and Sam).\n"
            "Include timestamp markers, intuitive metaphors, and memorable mnemonic hooks for student commuters."
        ),
        "responseSchema": {
            "type": "object",
            "properties": {
                "title": {"type": "string"},
                "duration_seconds": {"type": "integer"},
                "spoken_script": {"type": "string"},
                "audio_segments": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "speaker": {"type": "string"},
                            "time_range": {"type": "string"},
                            "text": {"type": "string"},
                            "key_point": {"type": "string"}
                        },
                        "required": ["speaker", "time_range", "text", "key_point"]
                    }
                },
                "memory_mnemonic": {"type": "string"}
            },
            "required": ["title", "duration_seconds", "spoken_script", "audio_segments", "memory_mnemonic"]
        },
        "sampleInput": {
            "topic": "Mitochondria & ATP Synthesis",
            "key_notes": "Oxidative phosphorylation, proton electrochemical gradient, ATP synthase rotary mechanism."
        }
    }
]

# Write individual files
for p in PROMPTS:
    file_path = os.path.join(OUT_DIR, f"{p['id']}.json")
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(p, f, indent=2)
    print(f"Exported: {file_path}")

# Write master bundle
bundle_path = os.path.join(OUT_DIR, "learnmate_google_ai_studio_master_bundle.json")
with open(bundle_path, "w", encoding="utf-8") as f:
    json.dump({
        "project": "LearnMate AI",
        "hackathon": "Google AI Hackathon 2026",
        "platform": "Google AI Studio (https://aistudio.google.com)",
        "models": ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-3.1-flash-lite"],
        "prompts": PROMPTS
    }, f, indent=2)
print(f"Exported Master Bundle: {bundle_path}")

# Write README.md guide for Google AI Studio
readme_content = """# LearnMate — Google AI Studio Deployment & Import Guide

Welcome to the **LearnMate Google AI Studio Project Bundle**. These prompts power the core intelligence of **LearnMate**, developed for the **Google AI Hackathon**.

All prompt configurations in this folder can be loaded and tested directly inside **[Google AI Studio](https://aistudio.google.com)**.

---

## 📁 Included Prompts & Schemas

| File | Module Name | Core Capability | Recommended Model |
| :--- | :--- | :--- | :--- |
| [`1_grounded_tutor_qa.json`](./1_grounded_tutor_qa.json) | Grounded AI Tutor | Zero-hallucination document-bounded Q&A with exact quotes & citations | `gemini-1.5-flash` |
| [`2_chatgpt_prompted_ingestion.json`](./2_chatgpt_prompted_ingestion.json) | Prompted Ingestion | ChatGPT-style upload bar: instant summaries, exam formulas, ELIF | `gemini-1.5-flash` |
| [`3_diagnostic_quiz_generator.json`](./3_diagnostic_quiz_generator.json) | Diagnostic Quiz Engine | Synthesizes 5 high-yield multiple-choice questions from notes | `gemini-1.5-flash` |
| [`4_adaptive_revision_planner.json`](./4_adaptive_revision_planner.json) | Spaced Repetition Planner | Diagnoses quiz misconceptions & generates 3-day SM-2 review schedule | `gemini-1.5-flash` |
| [`5_spatial_3d_engine_synthesizer.json`](./5_spatial_3d_engine_synthesizer.json) | 3D Spatial Vector Engine | Generates [x,y,z] vector coordinates & connections for 3D Canvas | `gemini-1.5-flash` |
| [`6_notebooklm_audio_overview.json`](./6_notebooklm_audio_overview.json) | Spoken Audio Overview | Generates 2-minute conversational podcast scripts with timestamps | `gemini-1.5-flash` |
| [`learnmate_google_ai_studio_master_bundle.json`](./learnmate_google_ai_studio_master_bundle.json) | Master Hackathon Bundle | Complete JSON export containing all 6 prompts for submission | All Models |

---

## 🚀 How to Import into Google AI Studio (3 Easy Steps)

### Step 1: Open Google AI Studio
1. Navigate to **[https://aistudio.google.com](https://aistudio.google.com)**.
2. Sign in with your Google account.
3. Click **"Create new prompt"** (or **"Chat prompt"** / **"Structured prompt"**).

### Step 2: Configure System Instructions & Schema
1. Open any `.json` file from this folder (e.g. `1_grounded_tutor_qa.json`).
2. Copy the text from `"systemInstruction"` into the **System Instructions** box in Google AI Studio.
3. In the right-hand **Model Settings** pane:
   * **Model:** Select `Gemini 1.5 Flash` or `Gemini 2.0 Flash`.
   * **Temperature:** Set to the value specified in the JSON (e.g. `0.1` for Grounded Q&A).
   * **Structured Output:** Enable **JSON Output** and paste the `"responseSchema"` object.

### Step 3: Run & Test with Sample Input
1. Paste the `"sampleInput"` into the user message box.
2. Click **Run** (`Ctrl+Enter` / `Cmd+Enter`).
3. Notice the instantaneous, structured, verified response from Gemini!

---

## ⚡ 1-Click Code Export in Google AI Studio
Once satisfied with a prompt inside Google AI Studio, click the **"Get Code"** button in the top right corner. Google AI Studio will generate ready-to-run snippets in:
* **Python** (`google-genai`)
* **JavaScript / TypeScript** (`@google/genai`)
* **cURL** / **REST API**
* **Android (Kotlin)** / **Swift**

All corresponding client code is already fully hooked up inside LearnMate!
"""

with open(os.path.join(OUT_DIR, "README.md"), "w", encoding="utf-8") as f:
    f.write(readme_content)
print(f"Exported README: {os.path.join(OUT_DIR, 'README.md')}")
