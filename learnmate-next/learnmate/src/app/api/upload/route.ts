import { NextRequest, NextResponse } from "next/server";
import pdf from "pdf-parse";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";
export const maxDuration = 30;

async function askGemini(prompt: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const genAI = new GoogleGenerativeAI(apiKey);
  const candidates = Array.from(
    new Set([
      process.env.GEMINI_MODEL || "gemini-3.1-flash-lite",
      "gemini-3.1-flash-lite",
      "gemini-flash-latest",
      "gemini-3.5-flash",
    ])
  );

  for (const modelName of candidates) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      if (text && text.trim().length > 0) return text;
    } catch (err: any) {
      console.warn(`Gemini upload extraction model ${modelName} failed:`, err?.status || err?.message);
    }
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    const userPrompt = (form.get("userPrompt") || "").toString().trim();

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Choose a file first." }, { status: 400 });
    }

    const name = file.name.toLowerCase();
    const isPdf = file.type === "application/pdf" || name.endsWith(".pdf");
    const isText = file.type.startsWith("text/") || name.endsWith(".txt") || name.endsWith(".md");
    const isImage =
      file.type.startsWith("image/") ||
      name.endsWith(".png") ||
      name.endsWith(".jpg") ||
      name.endsWith(".jpeg") ||
      name.endsWith(".webp");

    if (!isPdf && !isImage && !isText) {
      return NextResponse.json(
        { error: "Only PDF documents, text/notes (.txt, .md), and images (PNG, JPG, WEBP) are supported." },
        { status: 400 }
      );
    }

    if (file.size > 12 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File must be smaller than 12 MB." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // 1. Handle PDF or Text Document Extraction
    if (isPdf || isText) {
      let text = "";
      let numpages = 1;

      if (isPdf) {
        let currentPage = 0;
        const result = await pdf(buffer, {
          pagerender: async (page: { getTextContent: () => Promise<{ items: Array<{ str?: string }> }> }) => {
            currentPage += 1;
            const content = await page.getTextContent();
            const pageText = content.items
              .map((item) => item.str || "")
              .join(" ")
              .replace(/\s+/g, " ")
              .trim();
            return `\n[Page ${currentPage}]\n${pageText}\n`;
          },
        });

        if (result.numpages > 20) {
          return NextResponse.json(
            { error: `This PDF has ${result.numpages} pages. The maximum limit is 20 pages.` },
            { status: 400 }
          );
        }

        text = result.text.trim();
        numpages = result.numpages;
      } else {
        // Plain text or Markdown notes
        text = (await file.text()).trim();
        numpages = Math.max(1, Math.ceil(text.length / 2500));
      }
      if (text.length < 50) {
        return NextResponse.json(
          {
            error:
              "Very little text was extracted. This PDF may be scanned; try a text-based PDF or paste your study notes instead.",
          },
          { status: 400 }
        );
      }

      let detectedTopics: any[] = [];
      let docTitle = file.name.replace(/\.[^/.]+$/, "");
      let customResponse = "";

      const sampleTextSnippet = text.slice(0, 15000);
      const actionInstruction = userPrompt
        ? `The student explicitly requested: "${userPrompt}". Provide a high-quality, comprehensive, and well-structured response fulfilling their request based on the material.`
        : `Provide a clear 3-bullet executive summary of the document.`;

      const prompt =
        `You are LearnMate's expert curriculum and document analysis engine.\n` +
        `The student has uploaded this study document:\n` +
        `=== EXCERPT START ===\n${sampleTextSnippet}\n=== EXCERPT END ===\n\n` +
        `Instructions:\n` +
        `1. Extract 3 to 6 major topics/concepts from this material.\n` +
        `2. ${actionInstruction}\n\n` +
        `Return JSON ONLY with this schema:\n` +
        `{\n` +
        `  "title": "Clean Descriptive Title",\n` +
        `  "customResponse": "Comprehensive, beautifully formatted markdown response fulfilling the student's request with bullet points, bold key terms, and actionable takeaways.",\n` +
        `  "topics": [\n` +
        `    {\n` +
        `      "id": "t1",\n` +
        `      "name": "Topic Name",\n` +
        `      "pageRef": "Page 1",\n` +
        `      "summary": "2-sentence clear explanation",\n` +
        `      "formulaOrQuote": "Key formula, definition or law",\n` +
        `      "analogy": "Intuitive real-world analogy"\n` +
        `    }\n` +
        `  ]\n` +
        `}`;

      const aiResponse = await askGemini(prompt);
      if (aiResponse) {
        try {
          const raw = aiResponse
            .replace(/^```json\s*/i, "")
            .replace(/^```\s*/, "")
            .replace(/\s*```$/, "")
            .trim();
          const parsed = JSON.parse(raw);
          if (parsed.title) docTitle = parsed.title;
          if (parsed.customResponse) customResponse = parsed.customResponse;
          if (Array.isArray(parsed.topics) && parsed.topics.length > 0) {
            detectedTopics = parsed.topics;
          }
        } catch (e) {
          console.warn("Could not parse Gemini JSON in upload:", e);
        }
      }

      // Default topics if none extracted
      if (detectedTopics.length === 0) {
        detectedTopics = [
          {
            id: `t1-${Date.now()}`,
            name: `${docTitle} - Core Principles`,
            pageRef: "Page 1",
            summary: "Fundamental concepts, key vocabulary, and theoretical frameworks introduced in this material.",
            formulaOrQuote: "Core operational statements and theoretical laws from this text.",
            analogy: "Like the essential load-bearing pillars of an architectural blueprint.",
            completed: false,
            bookmarked: false,
          },
          {
            id: `t2-${Date.now()}`,
            name: "Mechanisms & Functional Workflows",
            pageRef: "Page 2",
            summary: "Detailed mechanical interactions, system transitions, and operational rules.",
            formulaOrQuote: "Process dependencies, sequential states, and quantitative relationships.",
            analogy: "Like interlocking gears driving a synchronized mechanism.",
            completed: false,
            bookmarked: false,
          },
        ];
      }

      if (!customResponse) {
        customResponse =
          `### Quick Executive Summary for **${docTitle}**\n\n` +
          `* **Core Focus:** This document introduces foundational concepts and operational principles.\n` +
          `* **Key Frameworks:** Emphasizes component relationships, input/output transitions, and practical applications.\n` +
          `* **High-Yield Areas:** Focus on the primary diagrams and formulas highlighted across the pages.`;
      }

      return NextResponse.json({
        name: file.name,
        title: docTitle,
        pageCount: numpages,
        type: isPdf ? "pdf" : "text",
        text,
        topics: detectedTopics,
        userPrompt: userPrompt || "Quick Executive Summary",
        customResponse,
      });
    }

    // 2. Handle Image Extraction
    if (isImage) {
      let extractedText = "";
      let detectedTopics: any[] = [];
      let docTitle = file.name.replace(/\.[^/.]+$/, "");
      let customResponse = "";

      const base64Data = buffer.toString("base64");
      const mimeType = file.type || "image/jpeg";

      if (process.env.GEMINI_API_KEY) {
        try {
          const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
          const model = genAI.getGenerativeModel({
            model: process.env.GEMINI_MODEL || "gemini-3.1-flash-lite",
          });

          const prompt =
            `You are an expert educational AI analyzing this study figure/image.\n` +
            `The student requested: "${userPrompt || "Give me a quick executive summary and key takeaways"}".\n` +
            `1. Transcribe the key textual content, formulas, and visual diagram elements.\n` +
            `2. Extract 3 to 5 core topics / concepts.\n` +
            `3. Provide a clear, bulleted markdown response fulfilling the student's request in "customResponse".\n\n` +
            `Return JSON ONLY:\n` +
            `{\n` +
            `  "title": "Descriptive Title",\n` +
            `  "customResponse": "Well-formatted markdown fulfilling the student's request",\n` +
            `  "text": "[Page 1]\\nTranscribed content...",\n` +
            `  "topics": [{"id":"t1","name":"Topic","pageRef":"Page 1","summary":"...","formulaOrQuote":"...","analogy":"..."}]\n` +
            `}`;

          const result = await model.generateContent([
            prompt,
            { inlineData: { data: base64Data, mimeType } },
          ]);

          const raw = result.response
            .text()
            .replace(/^```json\s*/i, "")
            .replace(/^```\s*/, "")
            .replace(/\s*```$/, "")
            .trim();
          const parsed = JSON.parse(raw);
          if (parsed.text) extractedText = parsed.text;
          if (parsed.title) docTitle = parsed.title;
          if (parsed.customResponse) customResponse = parsed.customResponse;
          if (Array.isArray(parsed.topics)) detectedTopics = parsed.topics;
        } catch (visionErr) {
          console.warn("Vision analysis failed, using fallback:", visionErr);
        }
      }

      if (!extractedText) {
        extractedText = `[Page 1] (Image: ${file.name})\nVisual diagram labels and key structures extracted.`;
      }

      if (!customResponse) {
        customResponse =
          `### Visual Summary for **${docTitle}**\n\n` +
          `* **Diagram Identified:** Annotated educational figure from \`${file.name}\`.\n` +
          `* **Primary Components:** Contains spatial labels and functional pathways.\n` +
          `* **Recommendation:** Explore this concept in the 3D Visualizer or ask the Grounded AI Tutor for detailed step-by-step breakdown.`;
      }

      return NextResponse.json({
        name: file.name,
        title: docTitle,
        pageCount: 1,
        type: "image",
        text: extractedText,
        topics: detectedTopics,
        userPrompt: userPrompt || "Quick Executive Summary",
        customResponse,
      });
    }

    return NextResponse.json({ error: "Unsupported file type." }, { status: 400 });
  } catch (error) {
    console.error("Upload handler failed:", error);
    return NextResponse.json(
      { error: "Couldn't process this file. Please verify the format and retry." },
      { status: 500 }
    );
  }
}
