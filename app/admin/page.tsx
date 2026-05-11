"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  Eye,
  FileText,
  Loader2,
  Trash2,
  Upload,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import type { GeneratedResume, ResumeContent } from "@/lib/types";

type TrainingSummary = {
  id: string;
  filename: string;
  uploadedAt: string;
  sectionCount: number;
  textPreview: string;
};

type ResumeSummary = {
  id: string;
  fullName: string;
  email: string;
  selectedService: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  adminNotes: string;
};

export default function AdminPage() {
  const [tab, setTab] = useState<"training" | "resumes">("resumes");
  const [trainingExamples, setTrainingExamples] = useState<TrainingSummary[]>([]);
  const [resumes, setResumes] = useState<ResumeSummary[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loadingTraining, setLoadingTraining] = useState(true);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [selectedResume, setSelectedResume] = useState<GeneratedResume | null>(null);
  const [editingContent, setEditingContent] = useState<ResumeContent | null>(null);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const fetchTraining = useCallback(async () => {
    setLoadingTraining(true);
    const res = await fetch("/api/training");
    if (res.ok) setTrainingExamples(await res.json());
    setLoadingTraining(false);
  }, []);

  const fetchResumes = useCallback(async () => {
    setLoadingResumes(true);
    const res = await fetch("/api/resumes");
    if (res.ok) setResumes(await res.json());
    setLoadingResumes(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [trainingRes, resumesRes] = await Promise.all([
        fetch("/api/training"),
        fetch("/api/resumes"),
      ]);
      if (cancelled) return;
      if (trainingRes.ok) setTrainingExamples(await trainingRes.json());
      setLoadingTraining(false);
      if (resumesRes.ok) setResumes(await resumesRes.json());
      setLoadingResumes(false);
    })();
    return () => { cancelled = true; };
  }, []);

  async function uploadTrainingFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/training/upload", { method: "POST", body: formData });
    if (res.ok) {
      await fetchTraining();
      setStatusMessage(`Uploaded "${file.name}" successfully.`);
    } else {
      const data = await res.json();
      setStatusMessage(`Upload failed: ${data.error}`);
    }
    setUploading(false);
    e.target.value = "";
  }

  async function deleteTraining(id: string) {
    await fetch("/api/training", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await fetchTraining();
  }

  async function viewResume(id: string) {
    const res = await fetch(`/api/resumes/${id}`);
    if (res.ok) {
      const data: GeneratedResume = await res.json();
      setSelectedResume(data);
      setEditingContent(structuredClone(data.content));
    }
  }

  async function updateResumeStatus(id: string, status: string, adminNotes?: string) {
    setSaving(true);
    await fetch(`/api/resumes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, adminNotes }),
    });
    setSaving(false);
    setSelectedResume(null);
    setEditingContent(null);
    await fetchResumes();
    setStatusMessage(`Resume ${status}.`);
  }

  async function saveEditedResume(id: string) {
    if (!editingContent) return;
    setSaving(true);
    await fetch(`/api/resumes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: editingContent }),
    });
    setSaving(false);
    setSelectedResume(null);
    setEditingContent(null);
    await fetchResumes();
    setStatusMessage("Resume updated and regenerated.");
  }

  const statusColor: Record<string, string> = {
    pending: "text-amber-300 bg-amber-400/10 border-amber-400/30",
    approved: "text-emerald-300 bg-emerald-400/10 border-emerald-400/30",
    denied: "text-rose-300 bg-rose-400/10 border-rose-400/30",
    edited: "text-cyan-300 bg-cyan-400/10 border-cyan-400/30",
  };

  if (selectedResume && editingContent) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <button
            onClick={() => { setSelectedResume(null); setEditingContent(null); }}
            className="mb-6 flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-300"
          >
            <ArrowLeft className="h-4 w-4" /> Back to dashboard
          </button>

          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-white">
                {selectedResume.intakeData.fullName}
              </h1>
              <p className="text-sm text-slate-400">
                {selectedResume.intakeData.email} &middot; {selectedResume.intakeData.selectedService}
              </p>
            </div>
            <span className={`rounded-full border px-3 py-1 text-xs font-medium ${statusColor[selectedResume.status] ?? ""}`}>
              {selectedResume.status}
            </span>
          </div>

          <div className="mb-6 rounded-2xl border border-slate-700 bg-slate-900/80 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">Client Intake Data</h2>
            <div className="grid gap-2 text-sm md:grid-cols-2">
              {Object.entries(selectedResume.intakeData).map(([key, val]) => (
                <p key={key}>
                  <span className="font-medium text-slate-300">{formatLabel(key)}:</span>{" "}
                  <span className="text-slate-400">{val || "—"}</span>
                </p>
              ))}
            </div>
          </div>

          <div className="mb-6 rounded-2xl border border-slate-700 bg-slate-900/80 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">Generated Resume Content</h2>
            <p className="mb-2 text-xs text-slate-500">Edit any field below. Changes will regenerate the docx.</p>

            <label className="mb-3 block text-sm">
              <span className="font-medium text-slate-300">Summary</span>
              <textarea
                value={editingContent.summary}
                onChange={(e) => setEditingContent({ ...editingContent, summary: e.target.value })}
                rows={3}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-cyan-300"
              />
            </label>

            {editingContent.sections.map((section, si) => (
              <div key={si} className="mb-4 rounded-xl border border-slate-800 p-4">
                <input
                  value={section.heading}
                  onChange={(e) => {
                    const next = structuredClone(editingContent);
                    next.sections[si].heading = e.target.value;
                    setEditingContent(next);
                  }}
                  className="mb-2 w-full border-b border-slate-700 bg-transparent text-sm font-semibold text-white outline-none focus:border-cyan-300"
                />
                {section.entries.map((entry, ei) => (
                  <div key={ei} className="mb-3 ml-2 border-l-2 border-slate-800 pl-3">
                    <div className="flex gap-2 text-sm">
                      <input
                        value={entry.title}
                        onChange={(e) => {
                          const next = structuredClone(editingContent);
                          next.sections[si].entries[ei].title = e.target.value;
                          setEditingContent(next);
                        }}
                        className="flex-1 bg-transparent font-medium text-slate-200 outline-none focus:text-cyan-200"
                        placeholder="Title"
                      />
                      <input
                        value={entry.dateRange}
                        onChange={(e) => {
                          const next = structuredClone(editingContent);
                          next.sections[si].entries[ei].dateRange = e.target.value;
                          setEditingContent(next);
                        }}
                        className="w-40 bg-transparent text-right text-slate-400 outline-none focus:text-cyan-200"
                        placeholder="Date range"
                      />
                    </div>
                    <input
                      value={entry.subtitle}
                      onChange={(e) => {
                        const next = structuredClone(editingContent);
                        next.sections[si].entries[ei].subtitle = e.target.value;
                        setEditingContent(next);
                      }}
                      className="w-full bg-transparent text-sm italic text-slate-400 outline-none focus:text-cyan-200"
                      placeholder="Subtitle"
                    />
                    {entry.bullets.map((bullet, bi) => (
                      <div key={bi} className="mt-1 flex items-start gap-1 text-sm">
                        <span className="mt-0.5 text-slate-600">•</span>
                        <input
                          value={bullet}
                          onChange={(e) => {
                            const next = structuredClone(editingContent);
                            next.sections[si].entries[ei].bullets[bi] = e.target.value;
                            setEditingContent(next);
                          }}
                          className="flex-1 bg-transparent text-slate-300 outline-none focus:text-cyan-200"
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const next = structuredClone(editingContent);
                        next.sections[si].entries[ei].bullets.push("");
                        setEditingContent(next);
                      }}
                      className="mt-1 text-xs text-cyan-400 hover:text-cyan-300"
                    >
                      + Add bullet
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => updateResumeStatus(selectedResume.id, "approved")}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-300 disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" /> Approve
            </button>
            <button
              onClick={() => saveEditedResume(selectedResume.id)}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-300 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
              Save Edits & Regenerate
            </button>
            <button
              onClick={() => updateResumeStatus(selectedResume.id, "denied")}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-400 disabled:opacity-50"
            >
              <XCircle className="h-4 w-4" /> Deny
            </button>
            <a
              href={`/api/resumes/${selectedResume.id}/download`}
              className="inline-flex items-center gap-2 rounded-full border border-slate-600 px-5 py-2.5 text-sm font-semibold text-slate-200 hover:border-cyan-300 hover:text-cyan-200"
            >
              <Download className="h-4 w-4" /> Download .docx
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-white">ZF Resumes Admin</h1>
            <p className="text-sm text-slate-400">Manage training data & review AI-generated resumes</p>
          </div>
          <Link href="/" className="text-sm text-slate-400 hover:text-cyan-300">
            &larr; Back to site
          </Link>
        </div>

        {statusMessage && (
          <div className="mb-6 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-200">
            {statusMessage}
            <button onClick={() => setStatusMessage("")} className="ml-3 text-cyan-400 hover:text-white">✕</button>
          </div>
        )}

        <div className="mb-8 flex gap-2">
          <button
            onClick={() => setTab("resumes")}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              tab === "resumes"
                ? "bg-cyan-400 text-slate-950"
                : "border border-slate-700 text-slate-300 hover:border-cyan-300"
            }`}
          >
            Generated Resumes
          </button>
          <button
            onClick={() => setTab("training")}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              tab === "training"
                ? "bg-cyan-400 text-slate-950"
                : "border border-slate-700 text-slate-300 hover:border-cyan-300"
            }`}
          >
            Training Data
          </button>
        </div>

        {tab === "training" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
              <h2 className="mb-3 text-lg font-semibold text-white">Upload Training Resume</h2>
              <p className="mb-4 text-sm text-slate-400">
                Upload .docx resume files to teach the AI your preferred formatting,
                sentence structure, and layout patterns.
              </p>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {uploading ? "Uploading..." : "Choose .docx file"}
                <input
                  type="file"
                  accept=".docx"
                  onChange={uploadTrainingFile}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>

            {loadingTraining ? (
              <p className="text-sm text-slate-400">Loading...</p>
            ) : trainingExamples.length === 0 ? (
              <p className="text-sm text-slate-500">No training resumes uploaded yet.</p>
            ) : (
              <div className="space-y-3">
                {trainingExamples.map((ex) => (
                  <div key={ex.id} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/80 p-4">
                    <div>
                      <p className="font-medium text-white">{ex.filename}</p>
                      <p className="text-xs text-slate-400">
                        {ex.sectionCount} sections &middot; Uploaded {new Date(ex.uploadedAt).toLocaleDateString()}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">{ex.textPreview}...</p>
                    </div>
                    <button
                      onClick={() => deleteTraining(ex.id)}
                      className="rounded-full p-2 text-slate-400 hover:bg-rose-500/20 hover:text-rose-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "resumes" && (
          <div className="space-y-3">
            {loadingResumes ? (
              <p className="text-sm text-slate-400">Loading...</p>
            ) : resumes.length === 0 ? (
              <p className="text-sm text-slate-500">No resumes generated yet. Clients can submit intakes from the main site.</p>
            ) : (
              resumes.map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/80 p-4">
                  <div>
                    <p className="font-medium text-white">{r.fullName}</p>
                    <p className="text-xs text-slate-400">
                      {r.email} &middot; {r.selectedService} &middot;{" "}
                      {new Date(r.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full border px-3 py-1 text-xs font-medium ${statusColor[r.status] ?? ""}`}>
                      {r.status}
                    </span>
                    <button
                      onClick={() => viewResume(r.id)}
                      className="inline-flex items-center gap-1 rounded-full border border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-cyan-300 hover:text-cyan-200"
                    >
                      <Eye className="h-3 w-3" /> Review
                    </button>
                    <a
                      href={`/api/resumes/${r.id}/download`}
                      className="inline-flex items-center gap-1 rounded-full border border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-cyan-300 hover:text-cyan-200"
                    >
                      <Download className="h-3 w-3" /> Download
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function formatLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}
