import { readFile } from "node:fs/promises";
import path from "node:path";
import mammoth from "mammoth";

const STYLE_GUIDE_PATHS = [
  "RESUME_STYLE_GUIDE.md",
  "docs/RESUME_STYLE_GUIDE.md",
  "content/RESUME_STYLE_GUIDE.md",
];

const BUSINESS_PLAN_PATHS = [
  "ZF_Resumes_Business_Plan.docx",
  "docs/ZF_Resumes_Business_Plan.docx",
  "content/ZF_Resumes_Business_Plan.docx",
];

const FALLBACK_STYLE_GUIDE = `
ZF Resumes writing standards:
- Every bullet must be specific, measurable, and outcome-oriented.
- Lead with a strong action verb and keep the bullet concise (1-2 lines).
- Quantify impact with metrics, dollars, percentages, or scope whenever possible.
- Prioritize ATS-friendly language and keywords from the target job description.
- Highlight leadership, problem-solving, analytical rigor, and ownership.
- Tailor bullets for elite employers (McKinsey, KPMG, FTI, Fortune 500) with polish and precision.
- No fluff, no generic claims, no weak verbs like "helped" when stronger verbs are possible.
`;

const FALLBACK_BUSINESS_CONTEXT = `
ZF Resumes business positioning:
- Audience: Philadelphia students, recent grads, and early-career professionals.
- Value: personalized coaching, fast turnaround, and interview-driven outcomes.
- Promise: resume quality that earns interviews at firms like McKinsey and KPMG.
- Tone: confident, professional, accessible, and practical.
`;

type PromptSourceSummary = {
  styleGuidePath: string | null;
  businessPlanPath: string | null;
};

function clampContent(content: string, maxLength = 12000): string {
  if (content.length <= maxLength) {
    return content;
  }

  return `${content.slice(0, maxLength)}\n\n[Truncated for prompt length.]`;
}

async function readFirstExistingText(paths: string[]): Promise<{
  content: string;
  pathUsed: string | null;
}> {
  for (const relativePath of paths) {
    const absolutePath = path.join(
      /* turbopackIgnore: true */ process.cwd(),
      relativePath
    );
    try {
      const content = await readFile(absolutePath, "utf8");
      return { content, pathUsed: relativePath };
    } catch {
      // Try next path candidate.
    }
  }

  return { content: "", pathUsed: null };
}

async function readFirstExistingDocx(paths: string[]): Promise<{
  content: string;
  pathUsed: string | null;
}> {
  for (const relativePath of paths) {
    const absolutePath = path.join(
      /* turbopackIgnore: true */ process.cwd(),
      relativePath
    );
    try {
      const buffer = await readFile(absolutePath);
      const { value } = await mammoth.extractRawText({ buffer });
      return { content: value, pathUsed: relativePath };
    } catch {
      // Try next path candidate.
    }
  }

  return { content: "", pathUsed: null };
}

export async function buildZfStyleSystemPrompt(): Promise<{
  prompt: string;
  summary: PromptSourceSummary;
}> {
  const styleGuideResult = await readFirstExistingText(STYLE_GUIDE_PATHS);
  const businessPlanResult = await readFirstExistingDocx(BUSINESS_PLAN_PATHS);

  const styleGuideContent =
    styleGuideResult.content.trim() || FALLBACK_STYLE_GUIDE.trim();
  const businessPlanContent =
    businessPlanResult.content.trim() || FALLBACK_BUSINESS_CONTEXT.trim();

  const prompt = `
You are the ZF Resumes AI Resume Builder.

Mission:
Rewrite resume bullet points so they meet the highest standards used to land interviews at elite firms like McKinsey and KPMG.

Critical rules:
1) Preserve truthfulness. Never fabricate accomplishments.
2) Keep each bullet concise, ATS-friendly, and impact-first.
3) Upgrade weak phrasing into strong ownership/action language.
4) Integrate relevant keywords from the target job description naturally.
5) Emphasize analytical impact, leadership, and business outcomes where supported.
6) Keep professional, polished tone appropriate for consulting, finance, and corporate recruiting.
7) Return only valid JSON.

Reference material (style source):
${clampContent(styleGuideContent)}

Reference material (business context source):
${clampContent(businessPlanContent)}
`.trim();

  return {
    prompt,
    summary: {
      styleGuidePath: styleGuideResult.pathUsed,
      businessPlanPath: businessPlanResult.pathUsed,
    },
  };
}
