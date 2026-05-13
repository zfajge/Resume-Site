import { promises as fs } from "fs";
import path from "path";
import type { TrainingExample, GeneratedResume } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const TRAINING_DIR = path.join(DATA_DIR, "training");
const RESUMES_DIR = path.join(DATA_DIR, "resumes");
const TRAINING_META = path.join(DATA_DIR, "training-meta.json");
const RESUMES_META = path.join(DATA_DIR, "resumes-meta.json");

async function ensureDirs() {
  await fs.mkdir(TRAINING_DIR, { recursive: true });
  await fs.mkdir(RESUMES_DIR, { recursive: true });
}

async function readJson<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson<T>(filePath: string, data: T): Promise<void> {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export async function getTrainingExamples(): Promise<TrainingExample[]> {
  await ensureDirs();
  return readJson<TrainingExample[]>(TRAINING_META, []);
}

export async function addTrainingExample(
  example: TrainingExample,
  fileBuffer: Buffer,
): Promise<void> {
  await ensureDirs();
  const examples = await getTrainingExamples();
  examples.push(example);
  await writeJson(TRAINING_META, examples);
  await fs.writeFile(
    path.join(TRAINING_DIR, `${example.id}.docx`),
    fileBuffer,
  );
}

export async function deleteTrainingExample(id: string): Promise<boolean> {
  await ensureDirs();
  const examples = await getTrainingExamples();
  const idx = examples.findIndex((e) => e.id === id);
  if (idx === -1) return false;
  examples.splice(idx, 1);
  await writeJson(TRAINING_META, examples);
  try {
    await fs.unlink(path.join(TRAINING_DIR, `${id}.docx`));
  } catch {
    /* file may already be gone */
  }
  return true;
}

export async function getResumes(): Promise<GeneratedResume[]> {
  await ensureDirs();
  return readJson<GeneratedResume[]>(RESUMES_META, []);
}

export async function getResumeById(
  id: string,
): Promise<GeneratedResume | null> {
  const resumes = await getResumes();
  return resumes.find((r) => r.id === id) ?? null;
}

export async function addResume(resume: GeneratedResume): Promise<void> {
  await ensureDirs();
  const resumes = await getResumes();
  resumes.push(resume);
  await writeJson(RESUMES_META, resumes);
}

export async function updateResume(
  id: string,
  updates: Partial<GeneratedResume>,
): Promise<GeneratedResume | null> {
  await ensureDirs();
  const resumes = await getResumes();
  const idx = resumes.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  resumes[idx] = { ...resumes[idx], ...updates, updatedAt: new Date().toISOString() };
  await writeJson(RESUMES_META, resumes);
  return resumes[idx];
}

export async function saveDocxFile(
  resumeId: string,
  buffer: Buffer,
): Promise<string> {
  await ensureDirs();
  const filePath = path.join(RESUMES_DIR, `${resumeId}.docx`);
  await fs.writeFile(filePath, buffer);
  return filePath;
}

export async function getDocxFile(resumeId: string): Promise<Buffer | null> {
  try {
    return await fs.readFile(path.join(RESUMES_DIR, `${resumeId}.docx`));
  } catch {
    return null;
  }
}
