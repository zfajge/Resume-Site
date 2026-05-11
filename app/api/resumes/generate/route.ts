import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import type { IntakeData, GeneratedResume } from "@/lib/types";
import { getTrainingExamples, addResume, saveDocxFile, updateResume } from "@/lib/storage";
import { generateResumeContent } from "@/lib/resume-ai";
import { generateDocx } from "@/lib/docx-generator";

export async function POST(request: Request) {
  try {
    const intake: IntakeData = await request.json();

    if (!intake.fullName || !intake.email || !intake.currentStatus) {
      return NextResponse.json(
        { error: "Missing required intake fields (fullName, email, currentStatus)" },
        { status: 400 },
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured. Please set it in your environment." },
        { status: 500 },
      );
    }

    const trainingExamples = await getTrainingExamples();
    const content = await generateResumeContent(intake, trainingExamples);
    const docxBuffer = await generateDocx(content);

    const id = uuidv4();
    const resume: GeneratedResume = {
      id,
      intakeData: intake,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      adminNotes: "",
      content,
      docxPath: null,
    };

    await addResume(resume);
    const docxPath = await saveDocxFile(id, docxBuffer);
    await updateResume(id, { docxPath });

    return NextResponse.json({
      success: true,
      resumeId: id,
      status: "pending",
      message: "Resume generated and awaiting admin review.",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
