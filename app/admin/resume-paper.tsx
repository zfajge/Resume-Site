"use client";

import type { ResumeContent } from "@/lib/types";

export function ResumePaper({ content }: { content: ResumeContent }) {
  return (
    <div className="resume-paper mx-auto">
      <style jsx>{`
        .resume-paper {
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
        .r-name {
          text-align: center;
          font-size: 14pt;
          font-weight: 700;
          color: #111;
          margin: 0 0 1pt 0;
        }
        .r-contact {
          text-align: center;
          font-size: 10pt;
          color: #555;
          margin: 0 0 6pt 0;
        }
        .r-section-heading {
          font-size: 10.5pt;
          font-weight: 700;
          text-transform: uppercase;
          color: #111;
          border-bottom: 2px solid #4a9a9a;
          padding-bottom: 1pt;
          margin: 8pt 0 4pt 0;
        }
        .r-org-line {
          display: flex;
          justify-content: space-between;
          margin: 3pt 0 0 0;
        }
        .r-org {
          font-weight: 700;
          font-size: 10pt;
        }
        .r-location {
          font-weight: 700;
          font-size: 10pt;
          white-space: nowrap;
        }
        .r-title-line {
          display: flex;
          justify-content: space-between;
          margin: 0 0 1pt 0;
        }
        .r-title {
          font-style: italic;
          font-size: 10pt;
        }
        .r-dates {
          font-size: 10pt;
          white-space: nowrap;
        }
        .r-bullets {
          list-style-type: disc;
          padding-left: 14pt;
          margin: 1pt 0 0 0;
        }
        .r-bullets li {
          font-size: 10pt;
          line-height: 1.3;
          margin-bottom: 0.5pt;
        }
      `}</style>

      <div className="r-name">{content.fullName}</div>
      <div className="r-contact">{content.contactLine}</div>

      {content.sections.map((section, si) => (
        <div key={si}>
          <div className="r-section-heading">{section.heading}</div>
          {section.entries.map((entry, ei) => (
            <div key={ei}>
              {(entry.subtitle || entry.location) && (
                <div className="r-org-line">
                  <span className="r-org">{entry.subtitle || ""}</span>
                  {entry.location && <span className="r-location">{entry.location}</span>}
                </div>
              )}
              {(entry.title || entry.dateRange) && (
                <div className="r-title-line">
                  <span className="r-title">{entry.title || ""}</span>
                  {entry.dateRange && <span className="r-dates">{entry.dateRange}</span>}
                </div>
              )}
              {entry.bullets.length > 0 && (
                <ul className="r-bullets">
                  {entry.bullets.map((b, bi) => (
                    <li key={bi}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
