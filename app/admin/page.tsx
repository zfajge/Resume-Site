"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  Eye,
  Loader2,
  Pencil,
  Trash2,
  Upload,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import type { GeneratedResume, ResumeContent } from "@/lib/types";
import { ResumePaper } from "./resume-paper";
import { ResumeEditor } from "./resume-editor";

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
  const [mode, setMode] = useState<"preview" | "edit">("preview");
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [showIntake, setShowIntake] = useState(false);

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
      setMode("preview");
      setShowIntake(false);
    }
  }

  async function updateResumeStatus(id: string, status: string) {
    setSaving(true);
    await fetch(`/api/resumes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
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
    const res = await fetch(`/api/resumes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: editingContent }),
    });
    if (res.ok) {
      const updated: GeneratedResume = await res.json();
      setSelectedResume(updated);
      setMode("preview");
      setStatusMessage("Resume saved & .docx regenerated.");
    }
    setSaving(false);
    await fetchResumes();
  }

  const statusColor: Record<string, string> = {
    pending: "text-amber-300 bg-amber-400/10 border-amber-400/30",
    approved: "text-emerald-300 bg-emerald-400/10 border-emerald-400/30",
    denied: "text-rose-300 bg-rose-400/10 border-rose-400/30",
    edited: "text-cyan-300 bg-cyan-400/10 border-cyan-400/30",
  };

  /* ─────────────────────── RESUME REVIEW VIEW ─────────────────────── */
  if (selectedResume && editingContent) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        {/* Top bar */}
        <div className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
          <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-3">
            <button
              onClick={() => { setSelectedResume(null); setEditingContent(null); }}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-300"
            >
              <ArrowLeft className="h-4 w-4" /> Dashboard
            </button>

            <div className="flex items-center gap-2">
              <span className="mr-2 text-sm text-slate-400">
                {selectedResume.intakeData.fullName}
              </span>
              <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusColor[selectedResume.status] ?? ""}`}>
                {selectedResume.status}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Preview / Edit toggle */}
              <div className="flex rounded-lg border border-slate-700 text-xs font-medium">
                <button
                  onClick={() => setMode("preview")}
                  className={`flex items-center gap-1.5 rounded-l-lg px-3 py-1.5 transition ${
                    mode === "preview" ? "bg-cyan-400 text-slate-950" : "text-slate-300 hover:text-white"
                  }`}
                >
                  <Eye className="h-3.5 w-3.5" /> Preview
                </button>
                <button
                  onClick={() => setMode("edit")}
                  className={`flex items-center gap-1.5 rounded-r-lg px-3 py-1.5 transition ${
                    mode === "edit" ? "bg-cyan-400 text-slate-950" : "text-slate-300 hover:text-white"
                  }`}
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
              </div>

              <button
                onClick={() => setShowIntake(!showIntake)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                  showIntake
                    ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-300"
                    : "border-slate-700 text-slate-400 hover:text-white"
                }`}
              >
                Client Info
              </button>
            </div>
          </div>
        </div>

        {/* Status message */}
        {statusMessage && (
          <div className="mx-auto max-w-[1200px] px-6 pt-3">
            <div className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-200">
              {statusMessage}
              <button onClick={() => setStatusMessage("")} className="ml-3 text-cyan-400 hover:text-white">✕</button>
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="mx-auto flex max-w-[1200px] gap-6 px-6 py-6">
          {/* Paper area */}
          <div className="flex-1 overflow-auto">
            <div className="py-4" style={{ background: "repeating-conic-gradient(#1e293b 0% 25%, #0f172a 0% 50%) 0 0 / 20px 20px" }}>
              <div className="mx-auto" style={{ width: "8.5in" }}>
                {mode === "preview" ? (
                  <ResumePaper content={editingContent} />
                ) : (
                  <ResumeEditor content={editingContent} onChange={setEditingContent} />
                )}
              </div>
            </div>
          </div>

          {/* Side panel (Client intake info) */}
          {showIntake && (
            <div className="w-80 flex-shrink-0">
              <div className="sticky top-16 rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
                <h3 className="mb-3 text-sm font-semibold text-white">Client Intake</h3>
                <div className="space-y-2 text-xs">
                  {Object.entries(selectedResume.intakeData).map(([key, val]) => (
                    <p key={key}>
                      <span className="font-medium text-slate-400">{formatLabel(key)}</span>
                      <br />
                      <span className="text-slate-300">{val || "—"}</span>
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom action bar */}
        <div className="sticky bottom-0 border-t border-slate-800 bg-slate-950/95 backdrop-blur">
          <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-3">
            <div className="flex gap-2">
              <button
                onClick={() => updateResumeStatus(selectedResume.id, "approved")}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-5 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-300 disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" /> Approve
              </button>
              <button
                onClick={() => updateResumeStatus(selectedResume.id, "denied")}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-5 py-2 text-sm font-semibold text-white hover:bg-rose-400 disabled:opacity-50"
              >
                <XCircle className="h-4 w-4" /> Deny
              </button>
            </div>

            <div className="flex gap-2">
              {mode === "edit" && (
                <button
                  onClick={() => saveEditedResume(selectedResume.id)}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-5 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-300 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Pencil className="h-4 w-4" />}
                  Save &amp; Regenerate .docx
                </button>
              )}
              <a
                href={`/api/resumes/${selectedResume.id}/download`}
                className="inline-flex items-center gap-2 rounded-full border border-slate-600 px-5 py-2 text-sm font-semibold text-slate-200 hover:border-cyan-300 hover:text-cyan-200"
              >
                <Download className="h-4 w-4" /> Download .docx
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ─────────────────────── DASHBOARD VIEW ─────────────────────── */
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-white">ZF Resumes Admin</h1>
            <p className="text-sm text-slate-400">Manage training data &amp; review AI-generated resumes</p>
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
