import mammoth from "mammoth";
import type { ResumeSection } from "./types";

export type ParsedTrainingDoc = {
  rawText: string;
  sections: ResumeSection[];
};

export async function parseDocx(buffer: Buffer): Promise<ParsedTrainingDoc> {
  const { value: html } = await mammoth.convertToHtml({ buffer });
  const rawText = await mammoth
    .extractRawText({ buffer })
    .then((r) => r.value);

  const sections = extractSections(html, rawText);
  return { rawText, sections };
}

function extractSections(html: string, rawText: string): ResumeSection[] {
  const sections: ResumeSection[] = [];
  const headingRegex = /<h[1-3][^>]*>(.*?)<\/h[1-3]>/gi;
  const matches = [...html.matchAll(headingRegex)];

  if (matches.length === 0) {
    return extractSectionsFromText(rawText);
  }

  for (let i = 0; i < matches.length; i++) {
    const heading = stripHtml(matches[i][1]);
    const startIdx = matches[i].index! + matches[i][0].length;
    const endIdx = i + 1 < matches.length ? matches[i + 1].index! : html.length;
    const sectionHtml = html.slice(startIdx, endIdx);

    const bullets: string[] = [];
    const liRegex = /<li[^>]*>(.*?)<\/li>/gi;
    for (const li of sectionHtml.matchAll(liRegex)) {
      bullets.push(stripHtml(li[1]).trim());
    }

    const content = stripHtml(sectionHtml).trim();
    sections.push({ heading, content, bulletPoints: bullets });
  }

  return sections;
}

function extractSectionsFromText(rawText: string): ResumeSection[] {
  const lines = rawText.split("\n").filter((l) => l.trim());
  const sections: ResumeSection[] = [];
  let currentSection: ResumeSection | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === trimmed.toUpperCase() && trimmed.length > 2 && trimmed.length < 60) {
      if (currentSection) sections.push(currentSection);
      currentSection = { heading: trimmed, content: "", bulletPoints: [] };
    } else if (currentSection) {
      if (trimmed.startsWith("•") || trimmed.startsWith("-") || trimmed.startsWith("●")) {
        currentSection.bulletPoints.push(trimmed.replace(/^[•\-●]\s*/, ""));
      } else {
        currentSection.content += (currentSection.content ? "\n" : "") + trimmed;
      }
    }
  }

  if (currentSection) sections.push(currentSection);
  return sections;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&");
}
