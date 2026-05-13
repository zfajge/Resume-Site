import { NextResponse } from "next/server";
import { getResumeById, getDocxFile } from "@/lib/storage";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const resume = await getResumeById(id);
  if (!resume) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const buffer = await getDocxFile(id);
  if (!buffer) {
    return NextResponse.json({ error: "Docx file not found" }, { status: 404 });
  }

  const sanitizedName = resume.intakeData.fullName
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .replace(/\s+/g, "_");

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${sanitizedName}_Resume.docx"`,
    },
  });
}
