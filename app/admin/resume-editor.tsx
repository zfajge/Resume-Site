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

  function updateEntry(si: number, ei: number, field: "title" | "subtitle" | "location" | "dateRange", value: string) {
    const next = structuredClone(content);
    (next.sections[si].entries[ei] as Record<string, unknown>)[field] = value;
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
    next.sections[si].entries.push({ title: "", subtitle: "", location: "", dateRange: "", bullets: [""] });
    onChange(next);
  }

  function removeEntry(si: number, ei: number) {
    const next = structuredClone(content);
    next.sections[si].entries.splice(ei, 1);
    onChange(next);
  }

  function addSection() {
    const next = structuredClone(content);
    next.sections.push({ heading: "NEW SECTION", entries: [{ title: "", subtitle: "", location: "", dateRange: "", bullets: [""] }] });
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
          padding: 0.375in 0.43in;
          background: #ffffff;
          color: #1a1a1a;
          font-family: "Times New Roman", "Georgia", serif;
          font-size: 10pt;
          line-height: 1.3;
          box-shadow: 0 4px 40px rgba(0, 0, 0, 0.5);
        }
        .ef {
          border: none;
          outline: none;
          background: transparent;
          font: inherit;
          color: inherit;
          width: 100%;
          padding: 0 2px;
          border-radius: 2px;
          transition: background 0.15s;
        }
        .ef:hover { background: #f0f4ff; }
        .ef:focus { background: #e8eeff; box-shadow: 0 0 0 2px #6366f1; }
        .ea {
          border: none;
          outline: none;
          background: transparent;
          font: inherit;
          color: inherit;
          width: 100%;
          padding: 0 2px;
          border-radius: 2px;
          resize: none;
          transition: background 0.15s;
        }
        .ea:hover { background: #f0f4ff; }
        .ea:focus { background: #e8eeff; box-shadow: 0 0 0 2px #6366f1; }
        .act {
          font-size: 8pt;
          color: #4a9a9a;
          cursor: pointer;
          background: none;
          border: none;
          padding: 1px 4px;
          border-radius: 3px;
        }
        .act:hover { background: #eef2ff; }
        .del {
          color: #ef4444;
          cursor: pointer;
          background: none;
          border: none;
          padding: 2px;
          border-radius: 3px;
          opacity: 0.3;
          transition: opacity 0.15s;
        }
        .del:hover { opacity: 1; background: #fef2f2; }
        .sw { position: relative; }
        .sw:hover > .sc { opacity: 1; }
        .sc {
          opacity: 0;
          transition: opacity 0.15s;
          position: absolute;
          right: -26px;
          top: 0;
        }
      `}</style>

      {/* Name */}
      <input
        className="ef"
        style={{ textAlign: "center", fontSize: "14pt", fontWeight: 700, display: "block", marginBottom: "1pt" }}
        value={content.fullName}
        onChange={(e) => update({ fullName: e.target.value })}
      />
      {/* Contact */}
      <input
        className="ef"
        style={{ textAlign: "center", fontSize: "10pt", color: "#555", display: "block", marginBottom: "6pt" }}
        value={content.contactLine}
        onChange={(e) => update({ contactLine: e.target.value })}
      />

      {/* Sections */}
      {content.sections.map((section, si) => (
        <div key={si} className="sw">
          <div className="sc">
            <button className="del" title="Remove section" onClick={() => removeSection(si)}>
              <Trash2 size={12} />
            </button>
          </div>

          <input
            className="ef"
            style={{
              fontSize: "10.5pt",
              fontWeight: 700,
              textTransform: "uppercase",
              borderBottom: "2px solid #4a9a9a",
              paddingBottom: "1pt",
              marginTop: "8pt",
              marginBottom: "4pt",
              borderRadius: 0,
              display: "block",
            }}
            value={section.heading}
            onChange={(e) => updateSection(si, e.target.value)}
          />

          {section.entries.map((entry, ei) => (
            <div key={ei} style={{ position: "relative", marginBottom: "2pt" }}>
              {/* Org + Location row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "3pt" }}>
                <input
                  className="ef"
                  style={{ fontWeight: 700, fontSize: "10pt", flex: 1 }}
                  value={entry.subtitle}
                  onChange={(e) => updateEntry(si, ei, "subtitle", e.target.value)}
                  placeholder="Organization"
                />
                <input
                  className="ef"
                  style={{ fontWeight: 700, fontSize: "10pt", textAlign: "right", width: "160px", flexShrink: 0 }}
                  value={entry.location ?? ""}
                  onChange={(e) => updateEntry(si, ei, "location", e.target.value)}
                  placeholder="City, State"
                />
                <button className="del" style={{ flexShrink: 0, marginLeft: 2 }} title="Remove entry" onClick={() => removeEntry(si, ei)}>
                  <Trash2 size={11} />
                </button>
              </div>
              {/* Title + Dates row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <input
                  className="ef"
                  style={{ fontStyle: "italic", fontSize: "10pt", flex: 1 }}
                  value={entry.title}
                  onChange={(e) => updateEntry(si, ei, "title", e.target.value)}
                  placeholder="Title / Role"
                />
                <input
                  className="ef"
                  style={{ fontSize: "10pt", textAlign: "right", width: "160px", flexShrink: 0 }}
                  value={entry.dateRange}
                  onChange={(e) => updateEntry(si, ei, "dateRange", e.target.value)}
                  placeholder="Date range"
                />
              </div>
              {/* Bullets */}
              <ul style={{ listStyleType: "disc", paddingLeft: "14pt", margin: "1pt 0 0 0" }}>
                {entry.bullets.map((bullet, bi) => (
                  <li key={bi} style={{ display: "flex", alignItems: "start", marginBottom: "0.5pt" }}>
                    <input
                      className="ef"
                      style={{ fontSize: "10pt", flex: 1 }}
                      value={bullet}
                      onChange={(e) => updateBullet(si, ei, bi, e.target.value)}
                      placeholder="Bullet point"
                    />
                    <button className="del" style={{ flexShrink: 0, marginTop: 2 }} title="Remove" onClick={() => removeBullet(si, ei, bi)}>
                      <Trash2 size={10} />
                    </button>
                  </li>
                ))}
              </ul>
              <button className="act" onClick={() => addBullet(si, ei)}>+ bullet</button>
            </div>
          ))}
          <button className="act" style={{ marginTop: "2pt" }} onClick={() => addEntry(si)}>+ entry</button>
        </div>
      ))}

      <div style={{ marginTop: "8pt" }}>
        <button className="act" onClick={addSection}>+ Add Section</button>
      </div>
    </div>
  );
}
