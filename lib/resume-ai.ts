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

RULES:
1. Keep it to ONE page of content (concise, impactful)
2. Use strong action verbs to begin each bullet point
3. Include quantifiable metrics wherever possible
4. Tailor the content toward the target roles and industries
5. Use ATS-friendly formatting (clear section headings, no tables/graphics)
6. Include a professional summary (2-3 lines max)

Return a JSON object with this exact structure (no markdown, just raw JSON):
{
  "fullName": "Client's full name",
  "contactLine": "email | phone | location",
  "summary": "2-3 sentence professional summary",
  "sections": [
    {
      "heading": "SECTION NAME",
      "entries": [
        {
          "title": "Role or Degree Title",
          "subtitle": "Organization or School Name",
          "dateRange": "Start - End",
          "bullets": ["Achievement bullet 1", "Achievement bullet 2"]
        }
      ]
    }
  ]
}

Generate appropriate sections like EDUCATION, EXPERIENCE, SKILLS, LEADERSHIP, etc. based on the client's information. Infer reasonable details from the provided context to create a complete, professional resume.`;
}

export async function generateResumeContent(
  intake: IntakeData,
  trainingExamples: TrainingExample[],
): Promise<ResumeContent> {
  const trainingContext = buildTrainingContext(trainingExamples);
  const prompt = buildPrompt(intake, trainingContext);

  const completion = await getClient().chat.completions.create({
    model: "gemini-2.0-flash",
    messages: [
      {
        role: "system",
        content:
          "You are an expert resume writer. Always respond with valid JSON only, no markdown formatting or code blocks.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 2000,
  });

  const raw = completion.choices[0]?.message?.content ?? "";
  const cleaned = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

  try {
    return JSON.parse(cleaned) as ResumeContent;
  } catch {
    throw new Error(
      `Failed to parse AI response as JSON. Raw response: ${raw.slice(0, 500)}`,
    );
  }
}
