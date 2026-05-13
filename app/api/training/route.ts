import { NextResponse } from "next/server";
import { getTrainingExamples, deleteTrainingExample } from "@/lib/storage";

export async function GET() {
  const examples = await getTrainingExamples();
  return NextResponse.json(
    examples.map((e) => ({
      id: e.id,
      filename: e.filename,
      uploadedAt: e.uploadedAt,
      sectionCount: e.sections.length,
      textPreview: e.extractedText.slice(0, 200),
    })),
  );
}

export async function DELETE(request: Request) {
  const { id } = await request.json();
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }
  const deleted = await deleteTrainingExample(id);
  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
