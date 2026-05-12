import {
  Document,
  Paragraph,
  TextRun,
  AlignmentType,
  BorderStyle,
  Packer,
  TabStopPosition,
  TabStopType,
} from "docx";
import type { ResumeContent } from "./types";

const FONT = "Times New Roman";
const ACCENT = "4A9A9A";
const NAME_SIZE = 28;       // 14pt
const CONTACT_SIZE = 20;    // 10pt
const HEADING_SIZE = 21;    // 10.5pt
const BODY_SIZE = 20;       // 10pt

function safe(val: unknown): string {
  if (typeof val === "string") return val;
  if (val == null) return "";
  return String(val);
}

function nameParagraph(name: string): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 20 },
    children: [
      new TextRun({
        text: name,
        bold: true,
        font: FONT,
        size: NAME_SIZE,
      }),
    ],
  });
}

function contactParagraph(contactLine: string): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 80 },
    children: [
      new TextRun({
        text: contactLine,
        font: FONT,
        size: CONTACT_SIZE,
        color: "555555",
      }),
    ],
  });
}

function sectionHeading(heading: string): Paragraph {
  return new Paragraph({
    spacing: { before: 120, after: 40 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 8, color: ACCENT },
    },
    children: [
      new TextRun({
        text: heading.toUpperCase(),
        bold: true,
        font: FONT,
        size: HEADING_SIZE,
      }),
    ],
  });
}

function orgLocationLine(org: string, location: string): Paragraph {
  return new Paragraph({
    tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
    spacing: { before: 40, after: 0 },
    children: [
      new TextRun({ text: safe(org), bold: true, font: FONT, size: BODY_SIZE }),
      ...(location
        ? [
            new TextRun({ text: "\t", font: FONT, size: BODY_SIZE }),
            new TextRun({ text: safe(location), bold: true, font: FONT, size: BODY_SIZE }),
          ]
        : []),
    ],
  });
}

function titleDateLine(title: string, dateRange: string): Paragraph {
  return new Paragraph({
    tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
    spacing: { before: 0, after: 20 },
    children: [
      new TextRun({ text: safe(title), italics: true, font: FONT, size: BODY_SIZE }),
      ...(dateRange
        ? [
            new TextRun({ text: "\t", font: FONT, size: BODY_SIZE }),
            new TextRun({ text: safe(dateRange), font: FONT, size: BODY_SIZE }),
          ]
        : []),
    ],
  });
}

function bulletParagraph(text: string): Paragraph {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 10 },
    children: [
      new TextRun({ text: safe(text), font: FONT, size: BODY_SIZE }),
    ],
  });
}

export async function generateDocx(content: ResumeContent): Promise<Buffer> {
  const children: Paragraph[] = [];

  children.push(nameParagraph(safe(content.fullName)));
  children.push(contactParagraph(safe(content.contactLine)));

  for (const section of content.sections ?? []) {
    children.push(sectionHeading(safe(section.heading)));
    for (const entry of section.entries ?? []) {
      const org = safe(entry.subtitle);
      const loc = safe(entry.location);
      const title = safe(entry.title);
      const dates = safe(entry.dateRange);

      if (org) {
        children.push(orgLocationLine(org, loc));
      }
      if (title) {
        children.push(titleDateLine(title, dates));
      }
      for (const bullet of entry.bullets ?? []) {
        children.push(bulletParagraph(safe(bullet)));
      }
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 540,    // 0.375 inch
              bottom: 540,
              left: 620,   // ~0.43 inch
              right: 620,
            },
          },
        },
        children,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return Buffer.from(buffer);
}
