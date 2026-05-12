import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { parseDocx } from "@/lib/docx-parser";
import { addTrainingExample } from "@/lib/storage";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (
      !file.name.endsWith(".docx") &&
      file.type !==
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      return NextResponse.json(
        { error: "Only .docx files are accepted" },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const parsed = await parseDocx(buffer).catch(() => null);
    if (!parsed) {
      return NextResponse.json(
        { error: "Invalid .docx file contents" },
        { status: 400 },
      );
    }

    const example = {
      id: uuidv4(),
      filename: file.name,
      uploadedAt: new Date().toISOString(),
      extractedText: parsed.rawText,
      sections: parsed.sections,
    };

    await addTrainingExample(example, buffer);

    return NextResponse.json({
      success: true,
      example: {
        id: example.id,
        filename: example.filename,
        uploadedAt: example.uploadedAt,
        sectionCount: example.sections.length,
        textLength: example.extractedText.length,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    const isBadRequest = message.includes("Content-Type was not one of");
    return NextResponse.json(
      { error: message },
      { status: isBadRequest ? 400 : 500 },
    );
  }
}
