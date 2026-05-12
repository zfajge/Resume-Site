"use client";

import { Trash2 } from "lucide-react";
import type { ResumeContent } from "@/lib/types";

type Props = {
  content: ResumeContent;
  onChange: (content: ResumeContent) => void;
};

export function ResumeEditor({ content, onChange }: Props) {
  function update(patch: Partial<ResumeContent>) {
    onChange({ ...content, ...patch });
  }

  function updateSection(si: number, heading: string) {
    const next = structuredClone(content);
    next.sections[si].heading = heading;
    onChange(next);
  }

  function updateEntry(si: number, ei: number, field: "title" | "subtitle" | "dateRange", value: string) {
    const next = structuredClone(content);
    next.sections[si].entries[ei][field] = value;
    onChange(next);
  }

  function updateBullet(si: number, ei: number, bi: number, value: string) {
    const next = structuredClone(content);
    next.sections[si].entries[ei].bullets[bi] = value;
    onChange(next);
  }

  function addBullet(si: number, ei: number) {
    const next = structuredClone(content);
    next.sections[si].entries[ei].bullets.push("");
    onChange(next);
  }

  function removeBullet(si: number, ei: number, bi: number) {
    const next = structuredClone(content);
    next.sections[si].entries[ei].bullets.splice(bi, 1);
    onChange(next);
  }

  function addEntry(si: number) {
    const next = structuredClone(content);
    next.sections[si].entries.push({ title: "", subtitle: "", dateRange: "", bullets: [""] });
    onChange(next);
  }

  function removeEntry(si: number, ei: number) {
    const next = structuredClone(content);
    next.sections[si].entries.splice(ei, 1);
    onChange(next);
  }

  function addSection() {
    const next = structuredClone(content);
    next.sections.push({ heading: "NEW SECTION", entries: [{ title: "", subtitle: "", dateRange: "", bullets: [""] }] });
    onChange(next);
  }

  function removeSection(si: number) {
    const next = structuredClone(content);
    next.sections.splice(si, 1);
    onChange(next);
  }

  return (
    <div className="resume-editor mx-auto">
      <style jsx>{`
        .resume-editor {
          width: 8.5in;
          min-height: 11in;
          padding: 0.5in;
          background: #ffffff;
          color: #1a1a1a;
          font-family: "Calibri", "Segoe UI", Arial, sans-serif;
          font-size: 10pt;
          line-height: 1.35;
          box-shadow: 0 4px 40px rgba(0, 0, 0, 0.5);
          position: relative;
        }
        .edit-field {
          border: none;
          outline: none;
          background: transparent;
          font: inherit;
          color: inherit;
          width: 100%;
          padding: 1px 3px;
          border-radius: 3px;
          transition: background 0.15s, box-shadow 0.15s;
        }
        .edit-field:hover {
          background: #f0f4ff;
        }
        .edit-field:focus {
          background: #e8eeff;
          box-shadow: 0 0 0 2px #6366f1;
        }
        .edit-area {
          border: none;
          outline: none;
          background: transparent;
          font: inherit;
          color: inherit;
          width: 100%;
          padding: 1px 3px;
          border-radius: 3px;
          resize: none;
          transition: background 0.15s, box-shadow 0.15s;
        }
        .edit-area:hover {
          background: #f0f4ff;
        }
        .edit-area:focus {
          background: #e8eeff;
          box-shadow: 0 0 0 2px #6366f1;
        }
        .action-btn {
          font-size: 8pt;
          color: #6366f1;
          cursor: pointer;
          background: none;
          border: none;
          padding: 1px 4px;
          border-radius: 3px;
        }
        .action-btn:hover {
          background: #eef2ff;
          color: #4f46e5;
        }
        .delete-btn {
          color: #ef4444;
          cursor: pointer;
          background: none;
          border: none;
          padding: 2px;
          border-radius: 3px;
          opacity: 0.4;
          transition: opacity 0.15s;
        }
        .delete-btn:hover {
          opacity: 1;
          background: #fef2f2;
        }
        .section-wrapper {
          position: relative;
        }
        .section-wrapper:hover > .section-controls {
          opacity: 1;
        }
        .section-controls {
          opacity: 0;
          transition: opacity 0.15s;
          position: absolute;
          right: -28px;
          top: 0;
        }
      `}</style>

      {/* Name */}
      <input
        className="edit-field"
        style={{
          textAlign: "center",
          fontSize: "14pt",
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          marginBottom: "2pt",
          display: "block",
        }}
        value={content.fullName}
        onChange={(e) => update({ fullName: e.target.value })}
      />

      {/* Contact */}
      <input
        className="edit-field"
        style={{
          textAlign: "center",
          fontSize: "9pt",
          color: "#555555",
          marginBottom: "10pt",
          display: "block",
        }}
        value={content.contactLine}
        onChange={(e) => update({ contactLine: e.target.value })}
      />

      {/* Summary */}
      <textarea
        className="edit-area"
        style={{
          fontStyle: "italic",
          fontSize: "10pt",
          color: "#333333",
          marginBottom: "10pt",
          lineHeight: "1.4",
          display: "block",
        }}
        rows={2}
        value={content.summary}
        onChange={(e) => update({ summary: e.target.value })}
      />

      {/* Sections */}
      {content.sections.map((section, si) => (
        <div key={si} className="section-wrapper">
          <div className="section-controls">
            <button className="delete-btn" title="Remove section" onClick={() => removeSection(si)}>
              <Trash2 size={12} />
            </button>
          </div>

          {/* Section heading */}
          <input
            className="edit-field"
            style={{
              fontSize: "11pt",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              borderBottom: "1.5px solid #333333",
              paddingBottom: "2pt",
              marginTop: "12pt",
              marginBottom: "5pt",
              borderRadius: 0,
              display: "block",
            }}
            value={section.heading}
            onChange={(e) => updateSection(si, e.target.value)}
          />

          {section.entries.map((entry, ei) => (
            <div key={ei} style={{ position: "relative", marginBottom: "4pt" }}>
              {/* Entry header row */}
              {(entry.title || entry.subtitle || entry.dateRange || section.entries.length > 0) && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "5pt" }}>
                  <div style={{ flex: 1, display: "flex", gap: "4px", alignItems: "baseline" }}>
                    <input
                      className="edit-field"
                      style={{ fontWeight: 700, fontSize: "10pt", flex: 1 }}
                      value={entry.title}
                      onChange={(e) => updateEntry(si, ei, "title", e.target.value)}
                      placeholder="Title"
                    />
                    <span style={{ color: "#aaa", flexShrink: 0 }}>&mdash;</span>
                    <input
                      className="edit-field"
                      style={{ fontStyle: "italic", color: "#444", flex: 1 }}
                      value={entry.subtitle}
                      onChange={(e) => updateEntry(si, ei, "subtitle", e.target.value)}
                      placeholder="Organization"
                    />
                  </div>
                  <input
                    className="edit-field"
                    style={{ color: "#666", textAlign: "right", width: "140px", flexShrink: 0, marginLeft: "8pt" }}
                    value={entry.dateRange}
                    onChange={(e) => updateEntry(si, ei, "dateRange", e.target.value)}
                    placeholder="Date range"
                  />
                  <button className="delete-btn" style={{ flexShrink: 0, marginLeft: 4 }} title="Remove entry" onClick={() => removeEntry(si, ei)}>
                    <Trash2 size={11} />
                  </button>
                </div>
              )}

              {/* Bullets */}
              <ul style={{ listStyleType: "disc", paddingLeft: "16pt", margin: "2pt 0 0 0" }}>
                {entry.bullets.map((bullet, bi) => (
                  <li key={bi} style={{ display: "flex", alignItems: "start", marginBottom: "1pt" }}>
                    <input
                      className="edit-field"
                      style={{ fontSize: "10pt", flex: 1 }}
                      value={bullet}
                      onChange={(e) => updateBullet(si, ei, bi, e.target.value)}
                      placeholder="Bullet point"
                    />
                    <button className="delete-btn" style={{ flexShrink: 0, marginTop: 2 }} title="Remove bullet" onClick={() => removeBullet(si, ei, bi)}>
                      <Trash2 size={10} />
                    </button>
                  </li>
                ))}
              </ul>
              <button className="action-btn" onClick={() => addBullet(si, ei)}>+ bullet</button>
            </div>
          ))}
          <button className="action-btn" style={{ marginTop: "2pt" }} onClick={() => addEntry(si)}>+ entry</button>
        </div>
      ))}

      <div style={{ marginTop: "12pt" }}>
        <button className="action-btn" onClick={addSection}>+ Add Section</button>
      </div>
    </div>
  );
}
