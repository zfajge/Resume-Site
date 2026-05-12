"use client";

import type { ResumeContent } from "@/lib/types";

export function ResumePaper({ content }: { content: ResumeContent }) {
  return (
    <div className="resume-paper mx-auto">
      <style jsx>{`
        .resume-paper {
          width: 8.5in;
          min-height: 11in;
          padding: 0.5in 0.5in 0.5in 0.5in;
          background: #ffffff;
          color: #1a1a1a;
          font-family: "Calibri", "Segoe UI", Arial, sans-serif;
          font-size: 10pt;
          line-height: 1.35;
          box-shadow: 0 4px 40px rgba(0, 0, 0, 0.5);
          position: relative;
        }

        .resume-name {
          text-align: center;
          font-size: 14pt;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #111111;
          margin: 0 0 2pt 0;
        }

        .resume-contact {
          text-align: center;
          font-size: 9pt;
          color: #555555;
          margin: 0 0 10pt 0;
        }

        .resume-summary {
          font-style: italic;
          font-size: 10pt;
          color: #333333;
          margin: 0 0 10pt 0;
          line-height: 1.4;
        }

        .resume-section-heading {
          font-size: 11pt;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: #111111;
          border-bottom: 1.5px solid #333333;
          padding-bottom: 2pt;
          margin: 12pt 0 5pt 0;
        }

        .resume-entry-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin: 5pt 0 1pt 0;
        }

        .resume-entry-title {
          font-weight: 700;
          font-size: 10pt;
        }

        .resume-entry-subtitle {
          font-style: italic;
          color: #444444;
        }

        .resume-entry-date {
          font-size: 10pt;
          color: #666666;
          white-space: nowrap;
          margin-left: 8pt;
          flex-shrink: 0;
        }

        .resume-bullets {
          list-style-type: disc;
          padding-left: 16pt;
          margin: 2pt 0 0 0;
        }

        .resume-bullets li {
          font-size: 10pt;
          line-height: 1.35;
          margin-bottom: 1pt;
          color: #1a1a1a;
        }
      `}</style>

      <div className="resume-name">{content.fullName}</div>
      <div className="resume-contact">{content.contactLine}</div>

      {content.summary && (
        <div className="resume-summary">{content.summary}</div>
      )}

      {content.sections.map((section, si) => (
        <div key={si}>
          <div className="resume-section-heading">{section.heading}</div>
          {section.entries.map((entry, ei) => (
            <div key={ei}>
              {(entry.title || entry.subtitle) && (
                <div className="resume-entry-header">
                  <div>
                    <span className="resume-entry-title">{entry.title}</span>
                    {entry.subtitle && (
                      <>
                        <span> &mdash; </span>
                        <span className="resume-entry-subtitle">{entry.subtitle}</span>
                      </>
                    )}
                  </div>
                  {entry.dateRange && (
                    <span className="resume-entry-date">{entry.dateRange}</span>
                  )}
                </div>
              )}
              {entry.bullets.length > 0 && (
                <ul className="resume-bullets">
                  {entry.bullets.map((bullet, bi) => (
                    <li key={bi}>{bullet}</li>
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
