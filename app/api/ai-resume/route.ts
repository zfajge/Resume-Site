import { NextResponse } from "next/server";
import { buildZfStyleSystemPrompt } from "@/lib/zfStylePrompt";

export const runtime = "nodejs";

type RewriteRequest = {
  workHistory: string;
  skills: string;
  targetJobDescription: string;
};

type RewriteResponse = {
  optimizedBullets: Array<{ before: string; after: string }>;
  styleNotes: string[];
  provider: "openai" | "anthropic" | "local-fallback";
  sourceSummary: {
    styleGuidePath: string | null;
    businessPlanPath: string | null;
  };
};

function parseBullets(workHistory: string): string[] {
  return workHistory
    .split("\n")
    .map((line) => line.replace(/^[\s\-*•]+/, "").trim())
    .filter(Boolean);
}

function parseKeywords(input: string): string[] {
  return input
    .split(/[\n,]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function extractJsonObject(content: string): unknown {
  const codeFenceMatch = content.match(/```json\s*([\s\S]*?)\s*```/i);
  const candidate = codeFenceMatch ? codeFenceMatch[1] : content;
  return JSON.parse(candidate);
}

function normalizeResult(
  payload: unknown,
  originalBullets: string[]
): Array<{ before: string; after: string }> {
  if (!payload || typeof payload !== "object") {
    throw new Error("AI response was not a JSON object.");
  }

  const maybeBullets = (payload as { optimizedBullets?: unknown }).optimizedBullets;
  if (!Array.isArray(maybeBullets)) {
    throw new Error("AI response missing optimizedBullets array.");
  }

  return originalBullets.map((before, index) => {
    const entry = maybeBullets[index];
    if (entry && typeof entry === "object" && "after" in entry) {
      const maybeAfter = (entry as { after?: unknown }).after;
      if (typeof maybeAfter === "string" && maybeAfter.trim() !== "") {
        return { before, after: maybeAfter.trim() };
      }
    }

    return { before, after: before };
  });
}

function localFallbackRewrite(
  bullets: string[],
  skills: string[],
  targetJobDescription: string
): RewriteResponse {
  const normalizedSkills = skills.slice(0, 3).join(", ");
  const jobKeywords = parseKeywords(targetJobDescription).slice(0, 6).join(", ");

  const optimizedBullets = bullets.map((before, index) => {
    const prefix = index % 2 === 0 ? "Drove" : "Executed";
    const withPeriod = before.endsWith(".") ? before : `${before}.`;
    const after = `${prefix} measurable impact by ${withPeriod} Aligned deliverables with ${jobKeywords || "target-role priorities"} while applying ${normalizedSkills || "core analytical and communication skills"}.`;
    return { before, after };
  });

  return {
    optimizedBullets,
    styleNotes: [
      "Using a local fallback rewrite because no LLM API key was configured.",
      "Set OPENAI_API_KEY or ANTHROPIC_API_KEY to enable model-grade rewrites.",
    ],
    provider: "local-fallback",
    sourceSummary: {
      styleGuidePath: null,
      businessPlanPath: null,
    },
  };
}

async function callOpenAiModel(
  systemPrompt: string,
  userPrompt: string,
  bullets: string[]
): Promise<{
  optimizedBullets: Array<{ before: string; after: string }>;
  styleNotes: string[];
}> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`OpenAI request failed: ${JSON.stringify(data)}`);
  }

  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    throw new Error("OpenAI returned an unexpected response format.");
  }

  const parsed = extractJsonObject(content);
  const optimizedBullets = normalizeResult(parsed, bullets);
  const styleNotesRaw = (parsed as { styleNotes?: unknown }).styleNotes;
  const styleNotes = Array.isArray(styleNotesRaw)
    ? styleNotesRaw.filter((note): note is string => typeof note === "string")
    : [];

  return { optimizedBullets, styleNotes };
}

async function callAnthropicModel(
  systemPrompt: string,
  userPrompt: string,
  bullets: string[]
): Promise<{
  optimizedBullets: Array<{ before: string; after: string }>;
  styleNotes: string[];
}> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL ?? "claude-3-5-sonnet-latest",
      max_tokens: 1400,
      temperature: 0.2,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Anthropic request failed: ${JSON.stringify(data)}`);
  }

  const content = data?.content?.[0]?.text;
  if (typeof content !== "string") {
    throw new Error("Anthropic returned an unexpected response format.");
  }

  const parsed = extractJsonObject(content);
  const optimizedBullets = normalizeResult(parsed, bullets);
  const styleNotesRaw = (parsed as { styleNotes?: unknown }).styleNotes;
  const styleNotes = Array.isArray(styleNotesRaw)
    ? styleNotesRaw.filter((note): note is string => typeof note === "string")
    : [];

  return { optimizedBullets, styleNotes };
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<RewriteRequest>;
  const workHistory = body.workHistory?.trim() ?? "";
  const skills = body.skills?.trim() ?? "";
  const targetJobDescription = body.targetJobDescription?.trim() ?? "";

  if (!workHistory || !skills || !targetJobDescription) {
    return NextResponse.json(
      {
        error:
          "workHistory, skills, and targetJobDescription are required fields.",
      },
      { status: 400 }
    );
  }

  const bullets = parseBullets(workHistory);
  if (bullets.length === 0) {
    return NextResponse.json(
      { error: "Work history must include at least one bullet point." },
      { status: 400 }
    );
  }

  const { prompt: systemPrompt, summary: sourceSummary } =
    await buildZfStyleSystemPrompt();
  const userPrompt = `
Target job description:
${targetJobDescription}

Candidate skills:
${skills}

Original resume bullets:
${bullets.map((bullet, index) => `${index + 1}. ${bullet}`).join("\n")}

Rewrite instructions:
- Rewrite each bullet in order. Preserve factual meaning and chronology.
- Improve clarity, executive polish, quantification, and keyword alignment for consulting/finance recruiting.
- Match the ZF standard that aims to earn interviews at McKinsey and KPMG.
- Return ONLY valid JSON in this shape:
{
  "optimizedBullets": [{"after": "..."}, {"after": "..."}],
  "styleNotes": ["short note 1", "short note 2"]
}
`.trim();

  try {
    if (process.env.OPENAI_API_KEY) {
      const result = await callOpenAiModel(systemPrompt, userPrompt, bullets);
      return NextResponse.json<RewriteResponse>({
        ...result,
        provider: "openai",
        sourceSummary,
      });
    }

    if (process.env.ANTHROPIC_API_KEY) {
      const result = await callAnthropicModel(systemPrompt, userPrompt, bullets);
      return NextResponse.json<RewriteResponse>({
        ...result,
        provider: "anthropic",
        sourceSummary,
      });
    }

    const fallbackResult = localFallbackRewrite(
      bullets,
      parseKeywords(skills),
      targetJobDescription
    );

    return NextResponse.json<RewriteResponse>({
      ...fallbackResult,
      sourceSummary,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to optimize bullets with the AI service.",
      },
      { status: 500 }
    );
  }
}
