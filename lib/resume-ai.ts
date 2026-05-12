import OpenAI from "openai";
import type {
  IntakeData,
  ResumeContent,
  TrainingExample,
} from "./types";

let _client: OpenAI | null = null;
function getClient(): OpenAI {
  if (!_client) {
    _client = new OpenAI({
      apiKey: process.env.GEMINI_API_KEY ?? "",
      baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    });
  }
  return _client;
}

function buildTrainingContext(examples: TrainingExample[]): string {
  if (examples.length === 0) {
    return "No training resumes have been uploaded yet. Use professional resume best practices.";
  }

  const summaries = examples.slice(0, 5).map((ex, i) => {
    const sectionList = ex.sections
      .map((s) => `  - ${s.heading}: ${s.bulletPoints.length} bullets`)
      .join("\n");
    return `--- Example Resume ${i + 1} (${ex.filename}) ---\n${ex.extractedText.slice(0, 1500)}\n\nStructure:\n${sectionList}`;
  });

  return `Here are ${examples.length} example resumes showing the preferred style, format, and sentence structure:\n\n${summaries.join("\n\n")}`;
}

function buildPrompt(intake: IntakeData, trainingContext: string): string {
  return `You are an expert resume writer for ZF Resumes, a Philadelphia-based career coaching studio that helps students and early-career professionals land interviews at elite firms like McKinsey, KPMG, FTI Consulting, and others.

${trainingContext}

Based on the above examples and best practices, generate a ONE-PAGE professional resume for the following client. Match the formatting patterns, sentence structure, and bullet point style from the example resumes.

CLIENT INFORMATION:
- Name: ${intake.fullName}
- Email: ${intake.email}
- Phone: ${intake.phone}
- Student Status: ${intake.studentStatus}
- School: ${intake.school || "Not provided"}
- Graduation Year: ${intake.graduationYear || "Not provided"}
- Current Status: ${intake.currentStatus}
- Experience: ${intake.experienceSummary}
- Key Achievements: ${intake.keyAchievements || "Not provided"}
- Target Roles: ${intake.targetRoles}
- Target Industries: ${intake.targetIndustries || "Not provided"}
- Additional Details: ${intake.additionalDetails || "None"}

FORMATTING RULES:
1. Keep it to ONE page (concise, impactful)
2. Use strong action verbs to begin each bullet point
3. Include quantifiable metrics wherever possible
4. Tailor content toward the target roles and industries
5. Do NOT include a summary paragraph — go straight into sections
6. Use these section headings: EDUCATION, PROFESSIONAL EXPERIENCE, LEADERSHIP EXPERIENCE, SKILLS AND INTERESTS
7. Each entry has an organization (bold) with location on the right, and a title (italic) with dates on the right
8. For SKILLS AND INTERESTS, use entries where subtitle is the category label (e.g. "Technical", "Interests", "Volunteering") and bullets contain a single comma-separated string of items

Return a JSON object with this exact structure (no markdown, just raw JSON):
{
  "fullName": "Client's full name",
  "contactLine": "City, ST | phone | email",
  "summary": "",
  "sections": [
    {
      "heading": "EDUCATION",
      "entries": [
        {
          "title": "Degree name",
          "subtitle": "University Name",
          "location": "City, ST",
          "dateRange": "Graduated: Month Year",
          "bullets": ["Major: X | Minor: Y | GPA: X.XX / 4.00", "Honors: ..."]
        }
      ]
    },
    {
      "heading": "PROFESSIONAL EXPERIENCE",
      "entries": [
        {
          "title": "Job Title",
          "subtitle": "Company Name",
          "location": "City, ST",
          "dateRange": "Mon Year – Mon Year",
          "bullets": ["Action verb + achievement with metric...", "..."]
        }
      ]
    },
    {
      "heading": "LEADERSHIP EXPERIENCE",
      "entries": [
        {
          "title": "Role",
          "subtitle": "Organization",
          "location": "City, ST",
          "dateRange": "Mon Year – Mon Year",
          "bullets": ["..."]
        }
      ]
    },
    {
      "heading": "SKILLS AND INTERESTS",
      "entries": [
        {
          "title": "",
          "subtitle": "Technical",
          "location": "",
          "dateRange": "",
          "bullets": ["Excel, Python, SQL, Tableau, PowerPoint, ..."]
        },
        {
          "title": "",
          "subtitle": "Interests",
          "location": "",
          "dateRange": "",
          "bullets": ["..."]
        }
      ]
    }
  ]
}

Generate a professional resume matching this exact structure. Infer reasonable details from the provided context.`;
}

export async function generateResumeContent(
  intake: IntakeData,
  trainingExamples: TrainingExample[],
): Promise<ResumeContent> {
  const trainingContext = buildTrainingContext(trainingExamples);
  const prompt = buildPrompt(intake, trainingContext);

  const completion = await getClient().chat.completions.create({
    model: "gemini-2.5-flash",
    messages: [
      {
        role: "system",
        content:
          "You are an expert resume writer. Always respond with valid JSON only, no markdown formatting or code blocks.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 8000,
  });

  const raw = completion.choices[0]?.message?.content ?? "";
  const cleaned = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

  try {
    const parsed = JSON.parse(cleaned) as ResumeContent;
    return sanitizeContent(parsed);
  } catch {
    throw new Error(
      `Failed to parse AI response as JSON. Raw response: ${raw.slice(0, 500)}`,
    );
  }
}

function stripMarkdown(s: string): string {
  return s.replace(/\*\*/g, "").replace(/\*/g, "").replace(/__/g, "").replace(/_/g, "");
}

function sanitizeContent(c: ResumeContent): ResumeContent {
  return {
    fullName: stripMarkdown(c.fullName ?? ""),
    contactLine: stripMarkdown(c.contactLine ?? ""),
    summary: stripMarkdown(c.summary ?? ""),
    sections: (c.sections ?? []).map((s) => ({
      heading: stripMarkdown(s.heading ?? ""),
      entries: (s.entries ?? []).map((e) => ({
        title: stripMarkdown(e.title ?? ""),
        subtitle: stripMarkdown(e.subtitle ?? ""),
        location: stripMarkdown(e.location ?? ""),
        dateRange: stripMarkdown(e.dateRange ?? ""),
        bullets: (e.bullets ?? []).map((b) => stripMarkdown(b ?? "")),
      })),
    })),
  };
}
