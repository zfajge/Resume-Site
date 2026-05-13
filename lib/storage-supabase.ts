import type { TrainingExample, GeneratedResume } from "./types";
import { getSupabase } from "./supabase";

const BUCKET = "docx-files";

// ─── Training Examples ───────────────────────────────────────────────

export async function getTrainingExamples(): Promise<TrainingExample[]> {
  const { data, error } = await getSupabase()
    .from("training_examples")
    .select("*")
    .order("uploaded_at", { ascending: false });

  if (error) throw new Error(`Failed to fetch training examples: ${error.message}`);

  return (data ?? []).map((row) => ({
    id: row.id,
    filename: row.filename,
    uploadedAt: row.uploaded_at,
    extractedText: row.extracted_text,
    sections: row.sections as TrainingExample["sections"],
  }));
}

export async function addTrainingExample(
  example: TrainingExample,
  fileBuffer: Buffer,
): Promise<void> {
  const { error: dbError } = await getSupabase()
    .from("training_examples")
    .insert({
      id: example.id,
      filename: example.filename,
      uploaded_at: example.uploadedAt,
      extracted_text: example.extractedText,
      sections: example.sections,
    });

  if (dbError) throw new Error(`Failed to save training example: ${dbError.message}`);

  const { error: storageError } = await getSupabase()
    .storage.from(BUCKET)
    .upload(`training/${example.id}.docx`, fileBuffer, {
      contentType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      upsert: true,
    });

  if (storageError) throw new Error(`Failed to upload training file: ${storageError.message}`);
}

export async function deleteTrainingExample(id: string): Promise<boolean> {
  const { error: dbError, count } = await getSupabase()
    .from("training_examples")
    .delete({ count: "exact" })
    .eq("id", id);

  if (dbError) throw new Error(`Failed to delete training example: ${dbError.message}`);
  if (!count) return false;

  await getSupabase().storage.from(BUCKET).remove([`training/${id}.docx`]);
  return true;
}

// ─── Generated Resumes ───────────────────────────────────────────────

export async function getResumes(): Promise<GeneratedResume[]> {
  const { data, error } = await getSupabase()
    .from("resumes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to fetch resumes: ${error.message}`);

  return (data ?? []).map(rowToResume);
}

export async function getResumeById(
  id: string,
): Promise<GeneratedResume | null> {
  const { data, error } = await getSupabase()
    .from("resumes")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Failed to fetch resume: ${error.message}`);
  if (!data) return null;
  return rowToResume(data);
}

export async function addResume(resume: GeneratedResume): Promise<void> {
  const { error } = await getSupabase()
    .from("resumes")
    .insert({
      id: resume.id,
      intake_data: resume.intakeData,
      status: resume.status,
      created_at: resume.createdAt,
      updated_at: resume.updatedAt,
      admin_notes: resume.adminNotes,
      content: resume.content,
    });

  if (error) throw new Error(`Failed to save resume: ${error.message}`);
}

export async function updateResume(
  id: string,
  updates: Partial<GeneratedResume>,
): Promise<GeneratedResume | null> {
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (updates.status !== undefined) patch.status = updates.status;
  if (updates.adminNotes !== undefined) patch.admin_notes = updates.adminNotes;
  if (updates.content !== undefined) patch.content = updates.content;

  const { data, error } = await getSupabase()
    .from("resumes")
    .update(patch)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) throw new Error(`Failed to update resume: ${error.message}`);
  if (!data) return null;
  return rowToResume(data);
}

// ─── DOCX file storage ──────────────────────────────────────────────

export async function saveDocxFile(
  resumeId: string,
  buffer: Buffer,
): Promise<string> {
  const filePath = `resumes/${resumeId}.docx`;

  const { error } = await getSupabase()
    .storage.from(BUCKET)
    .upload(filePath, buffer, {
      contentType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      upsert: true,
    });

  if (error) throw new Error(`Failed to upload docx: ${error.message}`);
  return filePath;
}

export async function getDocxFile(resumeId: string): Promise<Buffer | null> {
  const { data, error } = await getSupabase()
    .storage.from(BUCKET)
    .download(`resumes/${resumeId}.docx`);

  if (error || !data) return null;

  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// ─── Helpers ─────────────────────────────────────────────────────────

function rowToResume(row: Record<string, unknown>): GeneratedResume {
  return {
    id: row.id as string,
    intakeData: row.intake_data as GeneratedResume["intakeData"],
    status: row.status as GeneratedResume["status"],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    adminNotes: (row.admin_notes as string) ?? "",
    content: row.content as GeneratedResume["content"],
    docxPath: null,
  };
}
