import type { TrainingExample, GeneratedResume } from "./types";

function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

async function backend() {
  if (isSupabaseConfigured()) {
    return await import("./storage-supabase");
  }
  return await import("./storage-fs");
}

export async function getTrainingExamples(): Promise<TrainingExample[]> {
  return (await backend()).getTrainingExamples();
}

export async function addTrainingExample(
  example: TrainingExample,
  fileBuffer: Buffer,
): Promise<void> {
  return (await backend()).addTrainingExample(example, fileBuffer);
}

export async function deleteTrainingExample(id: string): Promise<boolean> {
  return (await backend()).deleteTrainingExample(id);
}

export async function getResumes(): Promise<GeneratedResume[]> {
  return (await backend()).getResumes();
}

export async function getResumeById(
  id: string,
): Promise<GeneratedResume | null> {
  return (await backend()).getResumeById(id);
}

export async function addResume(resume: GeneratedResume): Promise<void> {
  return (await backend()).addResume(resume);
}

export async function updateResume(
  id: string,
  updates: Partial<GeneratedResume>,
): Promise<GeneratedResume | null> {
  return (await backend()).updateResume(id, updates);
}

export async function saveDocxFile(
  resumeId: string,
  buffer: Buffer,
): Promise<string> {
  return (await backend()).saveDocxFile(resumeId, buffer);
}

export async function getDocxFile(resumeId: string): Promise<Buffer | null> {
  return (await backend()).getDocxFile(resumeId);
}
