import { NextResponse } from "next/server";
import { getResumeById, updateResume, saveDocxFile } from "@/lib/storage";
import { generateDocx } from "@/lib/docx-generator";
import type { ResumeStatus, ResumeContent } from "@/lib/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const resume = await getResumeById(id);
  if (!resume) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(resume);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const resume = await getResumeById(id);
  if (!resume) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const updates: Partial<{
    status: ResumeStatus;
    adminNotes: string;
    content: ResumeContent;
  }> = {};

  if (body.status && ["approved", "denied", "pending", "edited"].includes(body.status)) {
    updates.status = body.status;
  }

  if (typeof body.adminNotes === "string") {
    updates.adminNotes = body.adminNotes;
  }

  if (body.content) {
    updates.content = body.content;
    const docxBuffer = await generateDocx(body.content);
    await saveDocxFile(id, docxBuffer);
    updates.status = "edited";
  }

  const updated = await updateResume(id, updates);
  return NextResponse.json(updated);
}
