"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Download,
  FileText,
  Sparkles,
} from "lucide-react";

type StepId = 0 | 1 | 2 | 3;

type OptimizationResult = {
  optimizedBullets: Array<{ before: string; after: string }>;
  styleNotes: string[];
  provider: "openai" | "anthropic" | "local-fallback";
  sourceSummary: {
    styleGuidePath: string | null;
    businessPlanPath: string | null;
  };
};

const STEPS = [
  "Work History",
  "Skills",
  "Target Job",
  "Live Preview",
] as const;

function parseBulletLines(input: string): string[] {
  return input
    .split("\n")
    .map((line) => line.replace(/^[\s\-*•]+/, "").trim())
    .filter(Boolean);
}

export default function AiCreatorPage() {
  const [step, setStep] = useState<StepId>(0);
  const [workHistory, setWorkHistory] = useState("");
  const [skills, setSkills] = useState("");
  const [targetJobDescription, setTargetJobDescription] = useState("");
  const [optimizationResult, setOptimizationResult] =
    useState<OptimizationResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const previewRef = useRef<HTMLDivElement>(null);

  const beforeBullets = useMemo(
    () => parseBulletLines(workHistory),
    [workHistory]
  );

  const canProceed = useMemo(() => {
    if (step === 0) {
      return beforeBullets.length > 0;
    }
    if (step === 1) {
      return skills.trim() !== "";
    }
    if (step === 2) {
      return targetJobDescription.trim() !== "";
    }
    return true;
  }, [beforeBullets.length, skills, step, targetJobDescription]);

  const canGenerate =
    beforeBullets.length > 0 &&
    skills.trim() !== "" &&
    targetJobDescription.trim() !== "";

  const generatePreview = useCallback(async () => {
    if (!canGenerate) {
      return;
    }

    setErrorMessage("");
    setIsGenerating(true);

    try {
      const response = await fetch("/api/ai-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workHistory,
          skills,
          targetJobDescription,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? "Could not generate AI preview.");
      }

      setOptimizationResult(data as OptimizationResult);
    } catch (error) {
      setOptimizationResult(null);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to generate preview."
      );
    } finally {
      setIsGenerating(false);
    }
  }, [canGenerate, skills, targetJobDescription, workHistory]);

  useEffect(() => {
    if (step !== 3 || !canGenerate) {
      return;
    }

    const timer = window.setTimeout(() => {
      void generatePreview();
    }, 750);

    return () => {
      window.clearTimeout(timer);
    };
  }, [canGenerate, generatePreview, step, workHistory, skills, targetJobDescription]);

  const nextStep = () => {
    if (!canProceed) {
      setErrorMessage("Please complete the required fields before continuing.");
      return;
    }
    setErrorMessage("");
    setStep((current) => Math.min(current + 1, 3) as StepId);
  };

  const previousStep = () => {
    setErrorMessage("");
    setStep((current) => Math.max(current - 1, 0) as StepId);
  };

  const downloadPdf = async () => {
    if (!previewRef.current) {
      return;
    }

    const html2pdf = (await import("html2pdf.js")).default;

    await html2pdf()
      .set({
        margin: 0.5,
        filename: "zf-resume-optimized-preview.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
      })
      .from(previewRef.current)
      .save();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto max-w-6xl px-6 py-14 md:py-20">
        <section className="mb-10 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/60 p-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
            <Bot className="h-4 w-4" />
            AI Resume Builder
          </div>
          <h1 className="mb-3 text-3xl font-semibold text-white sm:text-4xl">
            Build McKinsey/KPMG-Level Bullets with ZF AI
          </h1>
          <p className="max-w-3xl text-slate-300">
            Enter your background, skills, and target role. The builder applies
            ZF style logic to rewrite your bullets with stronger impact,
            sharper keywords, and interview-ready polish.
          </p>
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 md:p-8">
          <div className="mb-8 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm font-medium text-slate-300">
                Step {step + 1} of {STEPS.length}: {STEPS[step]}
              </p>
              <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-cyan-300">
                <Sparkles className="h-4 w-4" />
                Live Optimization
              </p>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-cyan-400 transition-all duration-300"
                style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
              />
            </div>
          </div>

          {step === 0 && (
            <div className="space-y-3">
              <Label>Work History Bullet Points *</Label>
              <textarea
                value={workHistory}
                onChange={(event) => setWorkHistory(event.target.value)}
                rows={10}
                placeholder="- Built weekly KPI dashboard for 4 teams
- Helped prepare financial analysis for leadership
- Managed campus recruiting logistics"
                className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-400/20"
              />
              <p className="text-xs text-slate-400">
                Add one bullet per line. Start with your current wording so you
                can compare before vs. after.
              </p>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-3">
              <Label>Core Skills *</Label>
              <textarea
                value={skills}
                onChange={(event) => setSkills(event.target.value)}
                rows={7}
                placeholder="Excel, Financial Modeling, PowerPoint, SQL, Stakeholder Communication"
                className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-400/20"
              />
              <p className="text-xs text-slate-400">
                Use commas or new lines. The AI uses these to align your bullets
                to recruiter keyword searches.
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <Label>Target Job Description *</Label>
              <textarea
                value={targetJobDescription}
                onChange={(event) => setTargetJobDescription(event.target.value)}
                rows={10}
                placeholder="Paste the job description you are applying for..."
                className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-400/20"
              />
              <p className="text-xs text-slate-400">
                Include responsibilities and requirements for best results.
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-white">
                  Live Before vs. After Preview
                </h2>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void generatePreview()}
                    disabled={isGenerating || !canGenerate}
                    className="inline-flex items-center gap-2 rounded-full border border-cyan-400/50 px-4 py-2 text-sm font-semibold text-cyan-200 transition hover:border-cyan-300 hover:text-cyan-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Sparkles className="h-4 w-4" />
                    {isGenerating ? "Optimizing..." : "Regenerate"}
                  </button>
                  <button
                    type="button"
                    onClick={downloadPdf}
                    disabled={!optimizationResult}
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Download className="h-4 w-4" />
                    Download as PDF
                  </button>
                </div>
              </div>

              <div
                ref={previewRef}
                className="space-y-4 rounded-2xl border border-slate-700 bg-slate-950/80 p-5"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <PreviewColumn
                    title="Before"
                    icon={<FileText className="h-4 w-4" />}
                    tone="text-amber-200"
                    bullets={
                      optimizationResult?.optimizedBullets.map((item) => item.before) ??
                      beforeBullets
                    }
                  />
                  <PreviewColumn
                    title="After (ZF Optimized)"
                    icon={<CheckCircle2 className="h-4 w-4" />}
                    tone="text-emerald-200"
                    bullets={
                      optimizationResult?.optimizedBullets.map((item) => item.after) ??
                      []
                    }
                    isLoading={isGenerating}
                  />
                </div>

                {optimizationResult && (
                  <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4 text-sm">
                    <p className="mb-2 font-medium text-slate-200">
                      Style notes ({optimizationResult.provider})
                    </p>
                    <ul className="space-y-1 text-slate-300">
                      {optimizationResult.styleNotes.length > 0 ? (
                        optimizationResult.styleNotes.map((note) => (
                          <li key={note}>• {note}</li>
                        ))
                      ) : (
                        <li>• Optimized using ZF style logic and job alignment.</li>
                      )}
                    </ul>
                    <p className="mt-3 text-xs text-slate-500">
                      Prompt sources: style guide{" "}
                      {optimizationResult.sourceSummary.styleGuidePath ?? "fallback"};{" "}
                      business plan{" "}
                      {optimizationResult.sourceSummary.businessPlanPath ?? "fallback"}.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {errorMessage && (
            <p className="mt-5 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {errorMessage}
            </p>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={previousStep}
              disabled={step === 0}
              className="rounded-full border border-slate-600 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-cyan-300 hover:text-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Back
            </button>
            <button
              type="button"
              onClick={nextStep}
              disabled={step === 3}
              className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-sm font-medium text-slate-200">{children}</label>;
}

function PreviewColumn({
  title,
  icon,
  tone,
  bullets,
  isLoading = false,
}: {
  title: string;
  icon: React.ReactNode;
  tone: string;
  bullets: string[];
  isLoading?: boolean;
}) {
  return (
    <article className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
      <h3 className={`mb-3 flex items-center gap-2 text-sm font-semibold ${tone}`}>
        {icon}
        {title}
      </h3>
      <ul className="space-y-2 text-sm text-slate-200">
        {isLoading ? (
          <>
            <li className="animate-pulse rounded bg-slate-700/60 p-2">
              Optimizing bullet...
            </li>
            <li className="animate-pulse rounded bg-slate-700/60 p-2">
              Optimizing bullet...
            </li>
          </>
        ) : bullets.length > 0 ? (
          bullets.map((bullet, index) => (
            <li key={`${title}-${index}`} className="rounded bg-slate-800/70 p-2">
              • {bullet}
            </li>
          ))
        ) : (
          <li className="text-slate-400">No bullet points available yet.</li>
        )}
      </ul>
    </article>
  );
}
