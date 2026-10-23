# LearnMate — Google AI Studio Deployment & Import Guide

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
