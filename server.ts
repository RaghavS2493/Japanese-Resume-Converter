/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Set up large JSON payload handling for CV documents and PDFs
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));

// Lazy integration client for Google Gemini
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing. Please add it via Settings > Secrets panel.");
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

// ----------------- API ENDPOINTS -----------------

// API: Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", mode: process.env.NODE_ENV || "development" });
});

// JSON Schema for Shokumukeirekisho Structure
const shokumukeirekishoSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Descriptive title of the Japanese job history, e.g., '職務経歴書_システムエンジニア'" },
    personalInfo: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: "Candidate name. If english name, translate phonetically to Katakana or Japanese characters, or keep English Name if it sounds professional" },
        nameEn: { type: Type.STRING, description: "Original candidate name in English" },
        kana: { type: Type.STRING, description: "Furigana/Katakana name pronunciation if easily inferable, else empty string" },
        email: { type: Type.STRING },
        phone: { type: Type.STRING },
        address: { type: Type.STRING },
        birthDate: { type: Type.STRING, description: "Birthdate formatted in Japanese standard if possible, else original" },
        desiredJob: { type: Type.STRING, description: "Target/Desired job title in Japanese (e.g. シニアソフトウェアエンジニア)" },
        currentTitle: { type: Type.STRING, description: "Current professional title translated to Japanese" }
      },
      required: ["name", "email"]
    },
    jobSummary: { type: Type.STRING, description: "職務要約: Professional executive summary of candidate's career in elegant, polite corporate Japanese. Strictly 200 to 350 characters using business grammar." },
    competencies: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "活かせる経験・知識・技術: Array of core competencies, outstanding achievements, or major skills represented as bullet points in Japanese (approx 3-6 items)"
    },
    workHistory: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          companyName: { type: Type.STRING, description: "Company name in elegant Japanese (e.g. Google合同会社 or 株式会社ABC) or original English name" },
          companyNameEn: { type: Type.STRING, description: "Original company name in English" },
          periodStart: { type: Type.STRING, description: "Employment start date, e.g. '2021年4月' or YYYY年MM月" },
          periodEnd: { type: Type.STRING, description: "Employment end date, e.g. '2024年3月' or YYYY年MM月 or '現在'" },
          employmentType: { type: Type.STRING, description: "Employment mechanism, like 正社員, 契約社員, 派遣社員, 業務委託, etc." },
          businessDescription: { type: Type.STRING, description: "事業内容: Elegant description of what the company does (e.g., 'クラウドインフラ構築およびSaaS開発・運用')" },
          employeesCount: { type: Type.STRING, description: "従業員数: formatted with '名' if easily inferable, e.g. '150名'" },
          capital: { type: Type.STRING, description: "資本金: Capital formatted elegantly, e.g., '1億円'" },
          jobTitle: { type: Type.STRING, description: "Job title translated to formal Japanese HR vocabulary (e.g., プロジェクトマネージャー)" },
          jobSummaries: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "担当業務: Detailed items representing duties, tasks, scoped architectures in polite Keigo (e.g., 'マイクロサービス移行プロジェクトのシステム設計・リード')"
          },
          achievements: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "主な実績: Quantifiability is absolutely crucial! Translate achievements, metrics, budget/team scales into highly scannable results in Japanese"
          },
          technologies: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Technologies, frameworks, databases, tools, or patterns utilized during tenure"
          }
        },
        required: ["companyName", "periodStart", "periodEnd", "jobTitle", "jobSummaries"]
      }
    },
    qualifications: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "The qualification or license in formal Japanese translation (e.g., TOEIC 850点, 基本情報技術者)" },
          date: { type: Type.STRING, description: "Date of award, e.g. YYYY年MM月" }
        },
        required: ["name", "date"]
      }
    },
    skills: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          categoryName: { type: Type.STRING, description: "Category of skills (e.g., バックエンド開発, 言語能力, クラウド技術)" },
          skills: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["categoryName", "skills"]
      }
    },
    selfPR: { type: Type.STRING, description: "自己PR: Standard Japanese Self-PR section showing drive, problem-solving abilities, and fit. Written in standard business Keigo 'です/ます' format." }
  },
  required: ["title", "personalInfo", "jobSummary", "competencies", "workHistory", "qualifications", "skills", "selfPR"]
};

// API: Parse and translate Resume text or PDF directly into structured Shokumukeirekisho
app.post("/api/convert", async (req, res) => {
  try {
    const { text, fileBase64, fileMimeType, targetJob, experienceLevel, tone } = req.body;
    const ai = getGeminiClient();

    let contentParts: any[] = [];

    // System instruction defining the personality and constraints
    const systemInstruction = `You are an elite Japanese HR Recruiter and career adviser specializing in translating English resumes/CVs into standard, executive-level Japanese Shokumukeirekisho (職務経歴書) documents.
Your output must be structurally, contextually, and linguistically accurate to satisfy Japanese HR standards.

Adhere to the following rules:
1. Translating English experiences must follow professional business Keigo (敬体 'です/ます' style for Job Summary (職務要約) and Self PR (自己PR); Deitai 'である/だ' style for lists and items is standard).
2. DO NOT translate technical terminology literally if standard Japanese tech jargon is standard (e.g., 'container orchestration' -> 'コンテナオーケストレーション', 'CI/CD pipeline' -> 'CI/CDパイプライン').
3. Date formatting MUST always follow Japanese HR dates (e.g. 'June 2021' -> '2021年6月', 'Present' -> '現在').
4. The 'jobSummary' (職務要約) must be extremely polite and state the career history comprehensively in 200-350 Japanese characters.
5. In 'workHistory', extract and highlight QUALITATIVE and QUANTITATIVE details (e.g. increase in performance, cost savings, team size) precisely.
6. The 'selfPR' (自己PR) must summarize candidate strengths, work stance, and value proposition into a beautifully written native Japanese self-promotion paragraph of about 400-600 characters using business manners.
7. Customize the terminology and skills toward the Target Job: "${targetJob || 'Same as default'}" with Experience Level: "${experienceLevel || 'Mid-Career'}" and Tone: "${tone || 'Professional & Confident'}".`;

    if (fileBase64 && fileMimeType === "application/pdf") {
      // Direct PDF processing via Gemini
      contentParts.push({
        inlineData: {
          mimeType: "application/pdf",
          data: fileBase64
        }
      });
      contentParts.push({
        text: `Please parse the attached PDF English CV and convert it into a professional-grade Shokumukeirekisho conforming exactly to the requested JSON schema.`
      });
    } else {
      // Text-based processor
      if (!text || text.trim() === "") {
        return res.status(400).json({ error: "No CV text or PDF was provided for translation." });
      }
      contentParts.push({
        text: `Here is the English Resume/CV text below:\n\n${text}\n\nPlease parse, translate, and reformat this text into a professional Shokumukeirekisho conforming exactly to the requested JSON schema.`
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contentParts,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: shokumukeirekishoSchema,
        temperature: 0.15 // Low temperature for high translation accuracy and literal data conformance
      }
    });

    const jsonText = response.text;
    if (!jsonText) {
      throw new Error("Empty response returned from the Gemini AI model.");
    }

    const parsedData = JSON.parse(jsonText.trim());
    return res.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error("Gemini Conversion Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to process translation with Gemini AI."
    });
  }
});

// API: Tweak section on the fly
app.post("/api/tweak", async (req, res) => {
  try {
    const { sectionName, currentText, instruction } = req.body;
    if (!currentText || !instruction) {
      return res.status(400).json({ error: "Missing current text or modification instructions." });
    }

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `You are an expert Japanese professional CV editors.
We are tweaking a specific section of a Shokumukeirekisho (職務経歴書).
Section Name: "${sectionName}"
Current text (Japanese):
"""
${currentText}
"""

User instruction for modification:
"${instruction}"

Please revise the Japanese text to follow this instruction accurately. Keep the tone highly professional, natural native Japanese, and business Keigo if editing summaries/self-PR. Maintain all factual details and parameters.
Return ONLY the modified Japanese text. Do not include markdown banners, tags, or extra chat preambles. Just the edited wording.`,
      config: {
        temperature: 0.3
      }
    });

    const tweakedText = response.text?.trim() || currentText;
    return res.json({ success: true, tweakedText });
  } catch (error: any) {
    console.error("AI Tweak Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to edit section text using Gemini AI."
    });
  }
});

// ----------------- VITE MIDDLEWARE CONFIG -----------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development Mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    // Use Vite middlewares
    app.use(vite.middlewares);
  } else {
    // Production Mode
    const distPath = path.join(process.cwd(), 'dist');
    // Serve static files
    app.use(express.static(distPath));
    // Serve single-page index.html on wildcard routes
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Shokumukeirekisho Builder server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
