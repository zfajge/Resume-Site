import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  Packer,
  TabStopPosition,
  TabStopType,
} from "docx";
import type { ResumeContent } from "./types";

const FONT = "Calibri";
const FONT_SIZE_NAME = 24;      // half-points → 12pt
const FONT_SIZE_CONTACT = 18;   // 9pt
const FONT_SIZE_HEADING = 22;   // 11pt
const FONT_SIZE_BODY = 20;      // 10pt

function nameParagraph(name: string): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 40 },
    children: [
      new TextRun({
        text: name.toUpperCase(),
        bold: true,
        font: FONT,
        size: FONT_SIZE_NAME,
      }),
    ],
  });
}

function contactParagraph(contactLine: string): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 120 },
    children: [
      new TextRun({
        text: contactLine,
        font: FONT,
        size: FONT_SIZE_CONTACT,
        color: "555555",
      }),
    ],
  });
}

function summaryParagraph(summary: string): Paragraph {
  return new Paragraph({
    spacing: { after: 120 },
    children: [
      new TextRun({
        text: summary,
        font: FONT,
        size: FONT_SIZE_BODY,
        italics: true,
      }),
    ],
  });
}

function sectionHeading(heading: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 160, after: 60 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 6, color: "333333" },
    },
    children: [
      new TextRun({
        text: heading.toUpperCase(),
        bold: true,
        font: FONT,
        size: FONT_SIZE_HEADING,
      }),
    ],
  });
}

function entryHeader(
  title: string,
  subtitle: string,
  dateRange: string,
): Paragraph {
  return new Paragraph({
    tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
    spacing: { before: 60, after: 20 },
    children: [
      new TextRun({ text: title, bold: true, font: FONT, size: FONT_SIZE_BODY }),
      ...(subtitle
        ? [
            new TextRun({ text: " — ", font: FONT, size: FONT_SIZE_BODY }),
            new TextRun({
              text: subtitle,
              italics: true,
              font: FONT,
              size: FONT_SIZE_BODY,
            }),
          ]
        : []),
      ...(dateRange
        ? [
            new TextRun({ text: "\t", font: FONT, size: FONT_SIZE_BODY }),
            new TextRun({
              text: dateRange,
              font: FONT,
              size: FONT_SIZE_BODY,
              color: "666666",
            }),
          ]
        : []),
    ],
  });
}

function bulletParagraph(text: string): Paragraph {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 20 },
    children: [
      new TextRun({ text, font: FONT, size: FONT_SIZE_BODY }),
    ],
  });
}

export async function generateDocx(content: ResumeContent): Promise<Buffer> {
  const children: Paragraph[] = [];

  children.push(nameParagraph(content.fullName));
  children.push(contactParagraph(content.contactLine));

  if (content.summary) {
    children.push(summaryParagraph(content.summary));
  }

  for (const section of content.sections) {
    children.push(sectionHeading(section.heading));
    for (const entry of section.entries) {
      children.push(entryHeader(entry.title, entry.subtitle, entry.dateRange));
      for (const bullet of entry.bullets) {
        children.push(bulletParagraph(bullet));
      }
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,    // 0.5 inch
              bottom: 720,
              left: 720,
              right: 720,
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
